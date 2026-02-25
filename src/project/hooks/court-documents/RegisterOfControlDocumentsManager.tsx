import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Court, FinaliseRegisterOfControlDocumentsRequest, InitialiseCourtDocumentsResponse, UpdateRegisterOfControlDocumentsHistoryApiArg, useFinaliseRegisterOfControlDocumentsMutation, useFindCourtRegisterMutation, useInitialiseCourtDocumentsMutation, useRetrieveTransgressionMutation } from "../../redux/api/transgressionsApi";
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { ROUTE_NAMES } from "../../Routing";
import { selectActiveWeighbridge } from "../../../framework/config/configSlice";
import { useAppSelector } from "../../../framework/redux/hooks";
import { PrintDocumentsState } from "../printing/PrintDocumentsManager";


const useRegisterOfControlDocumentsManager = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showNoCourtRegisterFound, setNoCourtRegisterFound] = useState(false);
    const [courts, setCourts] = useState<Court[]>([]);
    const [adjudicationTimeFence, setAdjudicationTimeFence] = useState<number>(0);
    const [courtNameList, setCourtNameList] = useState<string[]>([]);
    const [showTransgressionsNotFoundDialog, setShowTransgressionsNotFoundDialog] = useState(false);

    const [finaliseRegisterOfControlDocuments, { isLoading: finaliseLoader }] = useFinaliseRegisterOfControlDocumentsMutation();
    const [retrieveTransgression, { isLoading: retrieveTransgressionsLoader }] = useRetrieveTransgressionMutation();
    const [initialiseCourtDocuments, { isLoading: initialiseLoader }] = useInitialiseCourtDocumentsMutation();
    const [findCourtRegister, { isLoading: findCourtRegisterLoader }] = useFindCourtRegisterMutation();

    const activeWeighbridge = useAppSelector(selectActiveWeighbridge);

    useEffect(() => {
        setIsLoading(initialiseLoader || retrieveTransgressionsLoader || finaliseLoader || findCourtRegisterLoader)
    }, [initialiseLoader, retrieveTransgressionsLoader, finaliseLoader, findCourtRegisterLoader]);

    useEffect(() => {
        initialiseCourtDocuments().unwrap()
            .then((response: InitialiseCourtDocumentsResponse) => {
                setCourts(response.courts);
                setAdjudicationTimeFence(response.adjudicationTimeFence);
                setCourtNameList(response.courts.map((court: Court) => court.courtName));
            });

    }, [initialiseCourtDocuments]);

    const generateRegisterOfControlDocuments = (courtName: string, courtRoom: string, courtDate: Dayjs,
        _noticeType?: string, newPagePerOfficer?: boolean,
    ) => {
        findCourtRegister({
            findCourtRegisterRequest: {
                courtDate: courtDate.format('YYYY-MM-DD'),
                courtName: courtName,
                courtRoom: courtRoom
            }
        }).unwrap().then((courtRegisterResponse) => {
            if (!courtRegisterResponse.courtRegister) {
                // Display message
                setNoCourtRegisterFound(true);
            } else {
                setNoCourtRegisterFound(false);
                retrieveTransgression({
                    retrieveTransgressionRequest: {
                        courtName: courtName,
                        courtRoom: courtRoom,
                        courtDate: courtDate.format('YYYY-MM-DD')
                    }
                }).unwrap().then((response) => {
                    const filteredTransgressions = _noticeType && _noticeType !== "All" && ["RTQS", "OVERLOAD"].includes(_noticeType)
                        ? response.transgressions!.filter((transgression) =>
                            (transgression.type === "RtqsTransgressionDto" && _noticeType === "RTQS") ||
                            (transgression.type === "OverloadTransgressionDto" && _noticeType === "OVERLOAD")
                        )
                        : response.transgressions!;

                    const noticeNumbers = filteredTransgressions.map((transgression) => transgression.noticeNumber.number);

                    const noticeTypes = _noticeType === "All"
                        ? ["RTQS", "OVERLOAD"].slice() as ("RTQS" | "OVERLOAD")[]
                        : _noticeType ? [_noticeType as "RTQS" | "OVERLOAD"]
                        : undefined;

                    handleFinaliseRegisterOfControlDocuments({
                        courtName: courtName,
                        courtRoom: courtRoom,
                        courtDate: courtDate.format('YYYY-MM-DD'),
                        noticeNumbers: noticeNumbers,
                        newPagePerOfficer: newPagePerOfficer ?? false,
                        weighbridgeCode: activeWeighbridge,
                        noticeTypes: noticeTypes
                    });

                })
            }

        })
    }

    const handleFinaliseRegisterOfControlDocuments = (request: FinaliseRegisterOfControlDocumentsRequest) => {
        finaliseRegisterOfControlDocuments({
            finaliseRegisterOfControlDocumentsRequest: request
        }).unwrap().then((response) => {
            const updateRegisterOfControlDocumentsHistoryRequest: UpdateRegisterOfControlDocumentsHistoryApiArg = {
                updateTransgressionHistoryRequest: {
                    documentType: 'REGISTER_OF_CONTROL_DOCUMENTS',
                    noticeNumbers: response.noticeNumbers
                }
            };

            // navigate to print page
            navigate(`/${ROUTE_NAMES.printDocuments}`,
                {
                    state: {
                        printDocumentsState: {
                            accessRoles: ['COURTREGISTER_MAINTAIN', 'COURT_VIEW',
                                'REGISTEROFCONTROLDOCUMENTS_MAINTAIN',
                                'REGISTEROFCONTROLDOCUMENTSHISTORY_MAINTAIN}'],
                            printHeader: t('printControlDocuments'),
                            confirmMessage: t("confirmControlDocumentsPrintedMessage"),
                            documents: [
                                {
                                    label: t('printControlDocuments'),
                                    id: "controlDocuments",
                                    type: "CONTROL_DOCUMENT",
                                    base64: response.encodedPdf ? [response.encodedPdf] : response.officerEncodedPdf ?? [],
                                }
                            ],
                            onSuccessAction: {
                                name: 'updateRegisterOfControlDocumentsHistory',
                                request: updateRegisterOfControlDocumentsHistoryRequest
                            }
                        } as PrintDocumentsState
                    }
                });
        })
    }

    return {
        isLoading,
        generateRegisterOfControlDocuments,
        courts,
        adjudicationTimeFence,
        courtNameList,
        showNoCourtRegisterFound,
        showTransgressionsNotFoundDialog,
        setShowTransgressionsNotFoundDialog
    };
}

export default useRegisterOfControlDocumentsManager;
