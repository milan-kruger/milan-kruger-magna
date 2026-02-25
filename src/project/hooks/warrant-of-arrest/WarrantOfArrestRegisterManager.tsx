import { useContext, useEffect, useState } from "react";
import {
    Court, FindTransgressionParameterApiArg, GenerateWarrantOfArrestRegisterRequest,
    InitialiseCourtDocumentsResponse, OverloadTransgressionDto, ProvideWarrantListApiArg, ProvideWarrantListResponse,
    UpdateWarrantRegisterHistoryApiArg,
    useFindTransgressionParameterQuery, useGenerateWarrantOfArrestRegisterMutation, useInitialiseCourtDocumentsMutation, useProvideWarrantListMutation
} from "../../redux/api/transgressionsApi";
import AuthService from "../../../framework/auth/authService";
import dayjs, { Dayjs } from "dayjs";
import { CourtDocumentsListTable } from "../../components/court-documents/CourtDocumentsListTable";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import { useNavigate } from "react-router-dom";
import { ROUTE_NAMES } from "../../Routing";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { PrintDocumentsState } from "../printing/PrintDocumentsManager";

const useWarrantOfArrestRegisterManager = () => {
    const navigate = useNavigate();
    const configContext = useContext(ConfigContext);
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [courts, setCourts] = useState<Court[]>([]);
    const [adjudicationTimeFence, setAdjudicationTimeFence] = useState<number>(0);
    const [courtNameList, setCourtNameList] = useState<string[]>([]);

    const [initialiseCourtDocuments, { isLoading: initialiseLoader }] = useInitialiseCourtDocumentsMutation();
    const [generateWarrantOfArrestRegister] = useGenerateWarrantOfArrestRegisterMutation();
    const [findTransgressionParameterRequest] = useState<FindTransgressionParameterApiArg>({
        name: "WARRANT_OF_ARREST_GRACE_PERIOD"
    });
    const allowGenerateWarrantOfArrestRegister = useFindTransgressionParameterQuery(findTransgressionParameterRequest)

    const [provideWarrantOfArrestRegisterList, { isLoading: isLoadingWarrantOfArrestRegisterList }] = useProvideWarrantListMutation();

    useEffect(() => {
        setIsLoading(initialiseLoader || isLoadingWarrantOfArrestRegisterList)
    }, [initialiseLoader, isLoadingWarrantOfArrestRegisterList]);

    useEffect(() => {

        initialiseCourtDocuments().unwrap()
            .then((response: InitialiseCourtDocumentsResponse) => {
                setCourts(response.courts);
                setAdjudicationTimeFence(response.adjudicationTimeFence);
                setCourtNameList(response.courts.map((court: Court) => court.courtName));
            });

    }, [initialiseCourtDocuments]);

    const handleGenerateWarrantOfArrestRegister = (courtName: string,
        courtRoom: string,
        courtDate: Dayjs) => {

        let handleWarrantList;

        const resultSummaryRequest: ProvideWarrantListApiArg = {
            provideWarrantListRequest: {
                courtDate: courtDate.format('YYYY-MM-DD'),
                courtName: courtName,
                courtRoom: courtRoom
            }
        }

        provideWarrantOfArrestRegisterList(resultSummaryRequest)
            .unwrap()
            .then((response: ProvideWarrantListResponse) => {
                handleWarrantList = (response.transgressions as OverloadTransgressionDto[])?.map((item) => {
                    return {
                        noticeNo: item.noticeNumber.number,
                        offenderName: ((item.driver?.firstNames || '') + ' ' + (item.driver?.surname || '')).trim(),
                        plateNo: item.vehicle.plateNumber,
                        status: item.status,
                        courtDate: dayjs(item.courtAppearanceDate).format(configContext.dateTime.dateFormat),
                        courtName: item.courtName
                    };
                })

                const generateWarrantOfArrestRegisterRequest: GenerateWarrantOfArrestRegisterRequest = {
                    authorityCode: configContext.tenancy.tenant,
                    courtDate: courtDate.format('YYYY-MM-DD'),
                    courtName: courtName,
                    courtRoom: courtRoom,
                    noticeNumbers: response?.transgressions?.map(t => t?.noticeNumber?.number)
                }

                if ((dayjs().diff(courtDate.add(1, 'days'), 'days')) > Number(allowGenerateWarrantOfArrestRegister.data?.value)) {
                    navigate(`/${ROUTE_NAMES.warrantOfArrestRegisterList}`, {
                        state: {
                            disablePrintButton: false,
                            warrantList: handleWarrantList,
                            warrantOfArrestRequest: generateWarrantOfArrestRegisterRequest
                        }
                    })
                } else {
                    navigate(`/${ROUTE_NAMES.warrantOfArrestRegisterList}`, {
                        state: {
                            disablePrintButton: true,
                            warrantList: handleWarrantList,
                            warrantOfArrestRequest: generateWarrantOfArrestRegisterRequest
                        }
                    })
                }
            })
    }

    const handleSearchCourtCase = (searchValue: string) => {
        setSearchValue(searchValue);
    };

    // TODO:: Update logic for printing each warrant
    const handleWarrantArrestClick = (warrantArrest: CourtDocumentsListTable) => {
        // setNoticeNumber(warrantArrest.noticeNo);
        console.log(warrantArrest.noticeNo)
    };

    const finaliseWarrantOfArrestRegister = (generateWarrantOfArrestRegisterRequest: GenerateWarrantOfArrestRegisterRequest) => {
        setIsLoading(true);
        generateWarrantOfArrestRegister({
            generateWarrantOfArrestRegisterRequest: generateWarrantOfArrestRegisterRequest
        }).unwrap().then((response) => {
            const updateWarrantRegisterHistoryRequest: UpdateWarrantRegisterHistoryApiArg = {
                updateTransgressionHistoryRequest: {
                    documentType: 'WARRANT_OF_ARREST_REGISTER',
                    noticeNumbers: response.noticeNumbers
                }
            };

            navigate(`/${ROUTE_NAMES.printDocuments}`,
                {
                    state: {
                        printDocumentsState: {
                            accessRoles: ['WARRANTOFARRESTREGISTER_MAINTAIN', 'WARRANTOFARRESTREGISTER_VIEW'],
                            printHeader: t('printRegister'),
                            confirmMessage: t("confirmWarrantOfArrestRegisterPrintedMessage"),
                            documents: [
                                {
                                    label: t('warrantOfArrestRegister'),
                                    id: "warrantOfArrestRegister",
                                    type: "WARRANT_OF_ARREST_REGISTER",
                                    base64: response.encodedPdf ? [response.encodedPdf] : [],
                                }
                            ],
                            onSuccessAction: {
                                name: 'updateWarrantRegisterHistory',
                                request: updateWarrantRegisterHistoryRequest
                            },
                            returnPath: `/${ROUTE_NAMES.warrantsOfArrestRegister}`
                        } as PrintDocumentsState
                    }
                }
            );

            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
        })
    }

    const handleOnExit = () => {
        navigate('/warrant-of-arrest-tab/warrants-of-arrest-register', { replace: true });
    }

    //Hotkeys
    useHotkeys(
        "CTRL+E",
        () => {
            handleOnExit();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            enabled: AuthService.hasRole('WARRANTOFARRESTREGISTER_MAINTAIN'),
            description: String(t("closePage")),
        }
    );

    return {
        isLoading,
        courts,
        adjudicationTimeFence,
        courtNameList,
        searchValue,
        handleGenerateWarrantOfArrestRegister,
        handleSearchCourtCase,
        finaliseWarrantOfArrestRegister,
        handleWarrantArrestClick,
        handleOnExit
    };
}

export default useWarrantOfArrestRegisterManager;
