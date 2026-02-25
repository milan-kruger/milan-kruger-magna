import dayjs, { Dayjs } from "dayjs";
import {
    Court, CourtRegister, FinaliseCourtRegisterRequest, FindTransgressionParameterApiArg,
    InitialiseCourtDocumentsResponse, OverloadTransgressionDto, SubmissionDto, useFinaliseCourtRegisterMutation,
    useFindCourtRegisterMutation, useFindTransgressionParameterQuery, UpdateCourtRegisterHistoryApiArg, useInitialiseCourtDocumentsMutation, useRetrieveTransgressionMutation,
    RtqsTransgressionDto
} from "../../redux/api/transgressionsApi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import { ROUTE_NAMES } from "../../Routing";
import { PrintDocumentsState } from "../printing/PrintDocumentsManager";
import useSupervisorAuthorizationManager from "../SupervisorAuthorizationManager";
import { getTransgressionType } from "../../utils/TransgressionHelpers";
import { JsonObjectType } from "../../enum/JsonObjectType";

type CourtDetails = {
    courtName: string;
    courtRoom: string;
    courtDate: Dayjs;
}

const AUTHORIZATION_ROLE = 'ROLE_CANCELTRANSGRESSION_OVERRIDE';
const AUTHORIZATION_REASON = 'Withdrawn transgressions - Unadjudicated submissions';

const useCourtRegisterManager = (
    setShowUnadjudicatedSubmissionsDialog: (value: boolean) => void,
    setShowPersonnel: (value: boolean) => void,
    setIsSupervisorAuthDialogOpen: (value: boolean) => void,
) => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [courts, setCourts] = useState<Court[]>([]);
    const [adjudicationTimeFence, setAdjudicationTimeFence] = useState<number>(0);
    const [courtNameList, setCourtNameList] = useState<string[]>([]);

    const [finaliseCourtRegister] = useFinaliseCourtRegisterMutation();
    const [retrieveTransgression] = useRetrieveTransgressionMutation();
    const [retrieveCourtRegister] = useFindCourtRegisterMutation();
    const [findTransgressionParameterRequest] = useState<FindTransgressionParameterApiArg>({
        name: "ALLOW_ADJUDICATION_AFTER_COURT_DATE"
    });
    const allowAdjudication = useFindTransgressionParameterQuery(findTransgressionParameterRequest)

    const [initialiseCourtDocuments] = useInitialiseCourtDocumentsMutation();
    const [existingCourtReg, setExistingCourtReg] = useState<CourtRegister>();
    const [courtDetails, setCourtDetails] = useState<{ courtName: string, courtRoom: string, courtDate: Dayjs }>();
    const [submissionsTransgressions, setSubmissionsTransgressions] = useState<OverloadTransgressionDto[] | RtqsTransgressionDto[]>([]);

    // Personnel Data
    const [transgressionsSummaryList, setTransgressionsSummaryList] = useState<OverloadTransgressionDto[]>();
    const [presidingOfficer, setPresidingOfficer] = useState<string>();
    const [publicProsecutor, setPublicProsecutor] = useState<string>();
    const [clerkOfTheCourt, setClerkOfTheCourt] = useState<string>();
    const [interpreter, setInterpreter] = useState<string>();

    // Personnel fields
    const [disablePersonnelFields, setDisablePersonnelFields] = useState<boolean>(false);
    const allPersonnelFieldsEmpty = !(presidingOfficer || publicProsecutor || clerkOfTheCourt || interpreter) ||
        !(presidingOfficer?.trim() || publicProsecutor?.trim() || clerkOfTheCourt?.trim() || interpreter?.trim());

    // Authorization fields
    const [supervisorUsername, setSupervisorUsername] = useState<string>("");
    const [supervisorPassword, setSupervisorPassword] = useState<string>("");
    const [notApproved, setNotApproved] = useState(false);
    const { onSupervisorAuthorization, isError: isErrorAuthentication } = useSupervisorAuthorizationManager();

    const config = useContext(ConfigContext);

    const [showUpdatePersonnelBtn, setShowUpdatePersonnelBtn] = useState<boolean>(false);

    // Personnel handle change
    const handlePresidingOfficerChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPresidingOfficer(event.target.value)
    }

    const handlePublicProsecutorChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPublicProsecutor(event.target.value)
    }

    const handleClerkOfTheCourtChange = (event: ChangeEvent<HTMLInputElement>) => {
        setClerkOfTheCourt(event.target.value)
    }

    const handleInterpreterChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInterpreter(event.target.value)
    }

    useEffect(() => {
        initialiseCourtDocuments().unwrap()
            .then((response: InitialiseCourtDocumentsResponse) => {
                setCourts(response.courts);
                setAdjudicationTimeFence(response.adjudicationTimeFence);
                setCourtNameList(response.courts.map((court: Court) => court.courtName));
            });

    }, [initialiseCourtDocuments]);

    const handleGenerateCourtRegister = (courtName: string, courtRoom: string, courtDate: Dayjs) => {
        setIsLoading(true);
        setCourtDetails({ courtName, courtRoom, courtDate });

        if (dayjs().isAfter(courtDate)) {
            handleFinalisePastCourtDate({ courtName, courtRoom, courtDate });
        }
        else {
            retrieveCourtRegister({
                findCourtRegisterRequest: {
                    courtDate: courtDate.format('YYYY-MM-DD'),
                    courtName,
                    courtRoom,
                },
            })
                .unwrap().then((response) => {
                    clearPersonnelFields();
                    const courtRegister: CourtRegister | undefined = response.courtRegister;

                    if (courtRegister) {
                        setExistingCourtReg(courtRegister);
                        const personnelKeys: (keyof CourtRegister)[] = [
                            "clerkOfTheCourt",
                            "publicProsecutor",
                            "presidingOfficer",
                            "interpreter",
                        ];

                        const hasPersonnel = personnelKeys.some((key) => courtRegister[key]);
                        setShowUpdatePersonnelBtn(hasPersonnel);

                        personnelKeys.forEach((key) => {
                            if (courtRegister[key]) {
                                switch (key) {
                                    case "clerkOfTheCourt":
                                        setClerkOfTheCourt(courtRegister[key]);
                                        setDisablePersonnelFields(true);
                                        break;
                                    case "publicProsecutor":
                                        setPublicProsecutor(courtRegister[key]);
                                        setDisablePersonnelFields(true);
                                        break;
                                    case "presidingOfficer":
                                        setPresidingOfficer(courtRegister[key]);
                                        setDisablePersonnelFields(true);
                                        break;
                                    case "interpreter":
                                        setInterpreter(courtRegister[key]);
                                        setDisablePersonnelFields(true);
                                        break;
                                }
                            }
                        });
                    } else {
                        setExistingCourtReg(undefined);
                        setShowUpdatePersonnelBtn(false);
                    }

                    setIsLoading(false);
                    setShowPersonnel(true);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleFinalisePastCourtDate = (courtDetails: CourtDetails) => {

        setIsLoading(true);

        retrieveTransgression({
            retrieveTransgressionRequest: {
                courtName: courtDetails.courtName,
                courtRoom: courtDetails.courtRoom,
                courtDate: courtDetails.courtDate.format('YYYY-MM-DD'),
            },
        })
            .unwrap()
            .then((response) => {
                const transgressions = response?.transgressions ?? [];

                const transgressionType = getTransgressionType(transgressions[0]);
                if (transgressionType === JsonObjectType.OverloadTransgressionDto) {
                    setSubmissionsTransgressions(transgressions as OverloadTransgressionDto[]);
                } else if (transgressionType === JsonObjectType.RtqsTransgressionDto) {
                    setSubmissionsTransgressions(transgressions as RtqsTransgressionDto[]);
                }

                handleFinaliseCourtRegister({
                    courtName: courtDetails.courtName,
                    courtRoom: courtDetails.courtRoom,
                    courtDate: courtDetails.courtDate.format('YYYY-MM-DD'),
                    noticeNumbers: transgressions.map(t => t?.noticeNumber?.number).filter(Boolean),
                    authorityCode: config.tenancy.tenant,
                });

                setShowPersonnel(false);
            })
            .catch(() => {
                // Optional: add error handling/logging here
            })
            .finally(() => {
                setIsLoading(false);
            });
    };


    const handleFinalise = (includePersonnel = false) => {
        setIsLoading(true);

        retrieveTransgression({
            retrieveTransgressionRequest: {
                courtName: courtDetails?.courtName ?? '',
                courtRoom: courtDetails?.courtRoom ?? '',
                courtDate: courtDetails?.courtDate.format('YYYY-MM-DD') ?? '',
            },
        })
            .unwrap()
            .then((response) => {
                const transgressions = (response?.transgressions as OverloadTransgressionDto[]) ?? [];

                setSubmissionsTransgressions(transgressions);

                if (response?.errorMessage && allowAdjudication.data?.value === 'FALSE') { // Unadjudicated submissions
                    const responseSubmissions = (response?.submissions as SubmissionDto[]) ?? [];
                    const noticeNumbers = responseSubmissions.map((submission) => submission.noticeNumber);

                    // Filter transgressions by noticeNumbers
                    const matchedTransgressions = transgressions.filter((transgression) =>
                        noticeNumbers.includes(transgression.noticeNumber.number)
                    );

                    setTransgressionsSummaryList(matchedTransgressions);
                    setShowUnadjudicatedSubmissionsDialog(true);
                } else { // No unadjudicated submissions
                    handleFinaliseCourtRegister({
                        courtName: courtDetails?.courtName ?? '',
                        courtRoom: courtDetails?.courtRoom ?? '',
                        courtDate: courtDetails?.courtDate.format('YYYY-MM-DD') ?? '',
                        noticeNumbers: transgressions?.map(t => t?.noticeNumber?.number),
                        ...(includePersonnel ? {
                            presidingOfficer,
                            publicProsecutor,
                            clerkOfTheCourt,
                            interpreter
                        } : {
                            presidingOfficer: existingCourtReg?.presidingOfficer,
                            publicProsecutor: existingCourtReg?.publicProsecutor,
                            clerkOfTheCourt: existingCourtReg?.clerkOfTheCourt,
                            interpreter: existingCourtReg?.interpreter
                        }),
                        authorityCode: config.tenancy.tenant
                    });
                }

                setShowPersonnel(false);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    };

    const handleSupervisorAuthConfirm = () => {
        if (supervisorUsername && supervisorPassword) {
            onSupervisorAuthorization(supervisorUsername, supervisorPassword, AUTHORIZATION_ROLE, AUTHORIZATION_REASON)
                .then((response) => {
                    if (response) {
                        setNotApproved(false);
                        handleFinaliseCourtRegister({
                            courtName: courtDetails?.courtName ?? '',
                            courtRoom: courtDetails?.courtRoom ?? '',
                            courtDate: courtDetails?.courtDate.format('YYYY-MM-DD') ?? '',
                            noticeNumbers: submissionsTransgressions?.map(t => t?.noticeNumber?.number),
                            presidingOfficer,
                            publicProsecutor,
                            clerkOfTheCourt,
                            interpreter,
                            authorityCode: config.tenancy.tenant,
                            supervisorUsername: supervisorUsername
                        });
                        setShowPersonnel(false);
                    } else {
                        setNotApproved(true);
                    }
                });
        }
    };

    const clearPersonnelFields = () => {
        setPresidingOfficer("");
        setPublicProsecutor("");
        setClerkOfTheCourt("");
        setInterpreter("");
    }

    const fieldsUpdated = () => {
        return (presidingOfficer || publicProsecutor || clerkOfTheCourt || interpreter) && (
            presidingOfficer !== existingCourtReg?.presidingOfficer ||
            publicProsecutor !== existingCourtReg?.publicProsecutor ||
            clerkOfTheCourt !== existingCourtReg?.clerkOfTheCourt ||
            interpreter !== existingCourtReg?.interpreter
        );
    }

    const handleOnSkip = () => {
        handleFinalise(false);
    }

    const handleOnSubmit = () => {
        setShowPersonnel(false);
        handleFinalise(true);
    };

    const handleUnadjudicatedConfirm = () => {
        setShowUnadjudicatedSubmissionsDialog(false);
        setIsSupervisorAuthDialogOpen(true);
    }

    const handleOnUpdatePersonnel = () => {
        setDisablePersonnelFields(false);
    }

    const handleFinaliseCourtRegister = (finaliseCourtRegisterRequest: FinaliseCourtRegisterRequest) => {
        setIsLoading(true);
        setShowPersonnel(false);
        setShowUnadjudicatedSubmissionsDialog(false);

        finaliseCourtRegister({
            finaliseCourtRegisterRequest: finaliseCourtRegisterRequest
        }).unwrap().then((response) => {
            const updateTransgressionHistoryRequest: UpdateCourtRegisterHistoryApiArg = {
                updateTransgressionHistoryRequest: {
                    documentType: 'COURT_REGISTER',
                    noticeNumbers: response.noticeNumbers
                }
            }

            // navigate to print page
            navigate(`/${ROUTE_NAMES.printDocuments}`,
                {
                    state:
                    {
                        printDocumentsState: {
                            accessRoles: ['COURTREGISTER_MAINTAIN', 'COURT_VIEW'],
                            printHeader: t('printCourtRegister'),
                            confirmMessage: t("confirmCourtRegisterPrintedMessage"),
                            documents: [
                                {
                                    label: t('courtRegister'),
                                    type: "COURT_REGISTER",
                                    id: "courtRegister",
                                    base64: response.encodedPdf ? [response.encodedPdf] : [],
                                    disabled: false
                                }
                            ],
                            onSuccessAction: {
                                name: 'updateCourtRegisterHistory',
                                request: updateTransgressionHistoryRequest
                            }
                        } as PrintDocumentsState
                    }
                });
            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
        });
    }

    return {
        isLoading,
        handleGenerateCourtRegister,
        handleFinaliseCourtRegister,
        handleOnSkip,
        handleOnSubmit,
        handleOnUpdatePersonnel,
        allPersonnelFieldsEmpty,
        disablePersonnelFields,
        courts,
        adjudicationTimeFence,
        courtNameList,
        transgressionsSummaryList,
        presidingOfficer,
        publicProsecutor,
        clerkOfTheCourt,
        interpreter,
        supervisorUsername,
        setSupervisorUsername,
        supervisorPassword,
        setSupervisorPassword,
        handleUnadjudicatedConfirm,
        handlePresidingOfficerChange,
        handlePublicProsecutorChange,
        handleClerkOfTheCourtChange,
        handleInterpreterChange,
        handleSupervisorAuthConfirm,
        showUpdatePersonnelBtn,
        fieldsUpdated,
        isErrorAuthentication,
        notApproved
    }
}

export default useCourtRegisterManager;
