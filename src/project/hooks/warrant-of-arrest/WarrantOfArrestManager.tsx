import { useCallback, useContext, useEffect, useState } from "react";
import {
    Court,
    CourtResult,
    GenerateWarrantOfArrestRequest,
    GenerateWarrantOfArrestResponse,
    InitialiseCourtDocumentsResponse,
    ProvideWarrantOfArrestByCourtDetailsApiArg,
    ProvideWarrantOfArrestByNoticeNumberApiArg,
    ProvideWarrantOfArrestByWarrantNumberApiArg,
    ProvideWarrantOfArrestResponse,
    RetrieveTransgressionDetailsApiResponse,
    useGenerateWarrantOfArrestMutation,
    useInitialiseCourtDocumentsMutation,
    useProvideCourtResultMutation,
    useProvideWarrantOfArrestByCourtDetailsMutation,
    ScannedWarrantOfArrest,
    useDeleteSignedWarrantOfArrestMutation,
    useProvideWarrantOfArrestByNoticeNumberMutation,
    useProvideWarrantOfArrestByWarrantNumberMutation,
    useProvideWarrantOfArrestDocumentsMutation,
    useUploadSignedWarrantOfArrestMutation,
    WarrantOfArrest,
    useRetrieveTransgressionDetailsMutation,
    OverloadTransgressionDto,
    RtqsTransgressionDto
} from "../../redux/api/transgressionsApi";
import dayjs, { Dayjs } from "dayjs";
import { SearchByOptions } from "../../components/warrant-of-arrest/WarrantOfArrestSearchBy";
import { t } from "i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import { CourtDocumentsListTable } from "../../components/court-documents/CourtDocumentsListTable";
import { ROUTE_NAMES } from "../../Routing";
import { PrintDocumentsState } from "../printing/PrintDocumentsManager";
import useSupervisorAuthorizationManager from "../SupervisorAuthorizationManager";

export type SearchWarrantsOfArrestDetails = {
    searchBy: string,
    noticeNo?: string,
    warrantNo?: string,
    courtDetails?: {
        courtName: string,
        courtRoom: string,
        courtDate: string
    }
}

const useWarrantOfArrestManager = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const configContext = useContext(ConfigContext);

    const warrantsOfArrest = location.state?.warrantList as WarrantOfArrest[] || null;
    const [isLoading, setIsLoading] = useState(false);
    const [courts, setCourts] = useState<Court[]>([]);
    const [adjudicationTimeFence, setAdjudicationTimeFence] = useState<number>(0);
    const [courtNameList, setCourtNameList] = useState<string[]>([]);
    const [searchCriteria, setSearchCriteria] = useState<{ searchBy: string, searchValue: string, isValid: boolean }>();
    const [searchValue, setSearchValue] = useState<string>('');
    const [searchBy] = useState<string>('');
    const [courtName, setCourtName] = useState<string | null>(null);
    const [courtRoom, setCourtRoom] = useState<string | null>(null);
    const [courtDate, setCourtDate] = useState<Dayjs | null>(null);
    const [courtRoomList, setCourtRoomList] = useState<string[]>([]);
    const [courtDateList, setCourtDateList] = useState<Dayjs[]>([]);
    const [showWarrantDetails, setShowWarrantDetails] = useState<boolean>(false);
    const [courtResult, setCourtResult] = useState<CourtResult | null>(null);
    const [transgressionDetails, setTransgressionDetails] = useState<OverloadTransgressionDto | RtqsTransgressionDto | null>(null);
    const [warrantsToPrint, setWarrantsToPrint] = useState<string[] | null>(null);
    const [files, setFiles] = useState<Map<string, File | null>>(new Map());

    const [showAuthorizationPopup, setShowAuthorizationPopup] = useState(false);
    const [supervisorUsername, setSupervisorUsername] = useState("");
    const [supervisorPassword, setSupervisorPassword] = useState("");
    const [fileToDelete, setFileToDelete] = useState("");
    const [searchByError, setSearchByError] = useState<{ message: string, searchBy: "Notice No" | "Warrant No" | "Court", searchText: string } | undefined>();
    const [warrantNotFoundByCourt, setWarrantNotFoundByCourt] = useState(false);
    const [notApproved, setNotApproved] = useState(false);

    const [initialiseCourtDocuments, { isLoading: initialiseLoader }] = useInitialiseCourtDocumentsMutation();
    const [provideWarrantOfArrestByCourtDetails, { isLoading: isLoadingWarrantOfArrestByCourtDetails }] = useProvideWarrantOfArrestByCourtDetailsMutation();
    const [provideWarrantOfArrestByNoticeNumber, { isLoading: isLoadingWarrantOfArrestByNoticeNumber }] = useProvideWarrantOfArrestByNoticeNumberMutation();
    const [provideWarrantOfArrestByWarrantNumber, { isLoading: isLoadingWarrantOfArrestByWarrantNumber }] = useProvideWarrantOfArrestByWarrantNumberMutation();
    const [provideWarrantOfArrestDocuments, { isLoading: isLoadingProvideWarrantOfArrestDocuments }] = useProvideWarrantOfArrestDocumentsMutation();
    const [generateWarrantOfArrest, { isLoading: isLoadingGenerateWarrantOfArrest }] = useGenerateWarrantOfArrestMutation();
    const [provideCourtResult, { isLoading: isLoadingProvideCourtResult }] = useProvideCourtResultMutation();
    const [retrieveTransgression, { isLoading: isLoadingRetrieveTransgression }] = useRetrieveTransgressionDetailsMutation();
    const [uploadSignedWarrantOfArrest, { isLoading: isLoadingUploadSignedWarrantOfArrest }] = useUploadSignedWarrantOfArrestMutation();
    const [deleteSignedWarrantOfArrest, { isLoading: isLoadingDeleteSignedWarrantOfArrest }] = useDeleteSignedWarrantOfArrestMutation();
    const { onSupervisorAuthorization, isLoading: isLoadingSupervisorAuthorization, isError: isErrorAuthentication } = useSupervisorAuthorizationManager();

    // Validations
    const courtNameError = () => { return !courtName; }
    const courtRoomError = () => { return !courtRoom; }
    const courtDateError = () => {
        return !courtDate ||
            !courtDateList.some((date) => date.isSame(courtDate, 'date')) ||
            courtDate.isAfter(dayjs().add(adjudicationTimeFence!, 'days'));
    }

    const getActiveScannedWarrant = (warrants: ScannedWarrantOfArrest[] | undefined) => {
        const activeWarrant = warrants?.find((warrant) => warrant.active);
        if (activeWarrant) {
            const file: File = new File([], activeWarrant?.filename);
            return file;
        }
        return null;
    }

    const courtDateErrorWarrant = () => {
        return !courtDate || courtDate?.isAfter(dayjs()) ||
            !courtDateList.some((date) => date.isSame(courtDate, 'date'))
    }

    const courtDateErrorWarrantNotFound = () => {
        return warrantNotFoundByCourt
    }

    useEffect(() => {
        setIsLoading(initialiseLoader || isLoadingWarrantOfArrestByCourtDetails || isLoadingWarrantOfArrestByNoticeNumber ||
            isLoadingWarrantOfArrestByWarrantNumber || isLoadingGenerateWarrantOfArrest || isLoadingProvideWarrantOfArrestDocuments ||
            isLoadingUploadSignedWarrantOfArrest || isLoadingDeleteSignedWarrantOfArrest || isLoadingSupervisorAuthorization
            || isLoadingProvideCourtResult || isLoadingRetrieveTransgression);
    }, [initialiseLoader, isLoadingWarrantOfArrestByCourtDetails, isLoadingWarrantOfArrestByNoticeNumber,
        isLoadingWarrantOfArrestByWarrantNumber, isLoadingGenerateWarrantOfArrest, isLoadingProvideWarrantOfArrestDocuments,
        isLoadingUploadSignedWarrantOfArrest, isLoadingDeleteSignedWarrantOfArrest, isLoadingSupervisorAuthorization,
        isLoadingProvideCourtResult, isLoadingRetrieveTransgression]);

    useEffect(() => {

        initialiseCourtDocuments().unwrap()
            .then((response: InitialiseCourtDocumentsResponse) => {
                setCourts(response.courts);
                setAdjudicationTimeFence(response.adjudicationTimeFence);
                setCourtNameList(response.courts.map((court: Court) => court.courtName));
            });

    }, [initialiseCourtDocuments]);

    /**
     * Finalise generating of warrant of arrest
     */
    const finaliseGenerateWarrantOfArrest = useCallback((request: GenerateWarrantOfArrestRequest, warrantList: WarrantOfArrest[],
        searchDetails: SearchWarrantsOfArrestDetails) => {
        generateWarrantOfArrest({ generateWarrantOfArrestRequest: request })
            .unwrap()
            .then((response: GenerateWarrantOfArrestResponse) => {
                if (response.warrantNumbers) {
                    navigate("/warrant-of-arrest-tab/warrants-of-arrest/warrant-of-arrest-list", {
                        state: {
                            disablePrintButton: response.warrantNumbers.length === 0,
                            warrantList: warrantList,
                            searchDetails: searchDetails
                        }
                    });
                }
            });
    },
        [generateWarrantOfArrest, navigate]
    );

    /**
     *
     * @param response provides list of warrant number
     * @param finaliseCallback
     */
    const handleWarrantResponse = (response: ProvideWarrantOfArrestResponse, searchDetails: SearchWarrantsOfArrestDetails,
        finaliseCallback: (request: GenerateWarrantOfArrestRequest, warrantList: WarrantOfArrest[], searchDetails: SearchWarrantsOfArrestDetails) => void,
        searchBy: "Notice No" | "Warrant No" | "Court", searchText: string
    ) => {
        if (response.warrantsOfArrest && response.warrantsOfArrest.length > 0) {
            const warrantNumbers: string[] = response.warrantsOfArrest.map((item) => {
                if (item.warrantNumber) {
                    return item.warrantNumber.number;
                }
                if (item.capturedWarrantNumber) {
                    return item.capturedWarrantNumber;
                }
            }).filter(item => item !== undefined) as string[];

            finaliseCallback({ warrantNumber: warrantNumbers }, response.warrantsOfArrest, searchDetails);

        } else {
            setSearchByError({ message: '', searchBy, searchText });
        }
    }

    /**
     * Provide warrant list using court details
     */
    const provideWarrantByCourtDetails = useCallback(
        (courtName: string, courtRoom: string, courtDate: Dayjs) => {
            const request: ProvideWarrantOfArrestByCourtDetailsApiArg = {
                courtDate: courtDate.format("YYYY-MM-DD"),
                courtName,
                courtRoom,
                withdrawn: false,
            };

            const searchDetails: SearchWarrantsOfArrestDetails = {
                searchBy: SearchByOptions.court,
                courtDetails: { courtName: courtName, courtRoom: courtRoom, courtDate: courtDate.format("YYYY-MM-DD") }
            }

            provideWarrantOfArrestByCourtDetails(request)
                .unwrap()
                .then((response) => {
                    if (response.warrantsOfArrest?.length === 0) {
                        setWarrantNotFoundByCourt(true)
                    }
                    handleWarrantResponse(response, searchDetails, finaliseGenerateWarrantOfArrest, "Court", "Court")
                });
        },
        [finaliseGenerateWarrantOfArrest, provideWarrantOfArrestByCourtDetails]
    );

    /**
     * Provide warrant list using notice number
     */
    const provideWarrantByNoticeNumber = useCallback(
        (noticeNo: string) => {
            const request: ProvideWarrantOfArrestByNoticeNumberApiArg = {
                noticeNumber: noticeNo,
                withdrawn: false,
            };

            const searchDetails: SearchWarrantsOfArrestDetails = {
                searchBy: SearchByOptions.noticeNo,
                noticeNo: noticeNo
            }

            provideWarrantOfArrestByNoticeNumber(request)
                .unwrap()
                .then((response) => handleWarrantResponse(response, searchDetails, finaliseGenerateWarrantOfArrest, "Notice No", noticeNo));
        },
        [finaliseGenerateWarrantOfArrest, provideWarrantOfArrestByNoticeNumber]
    );

    /**
     * Provide warrant list using warrant number
     */
    const provideWarrantByWarrantNumber = useCallback(
        (warrantNumber: string) => {
            const request: ProvideWarrantOfArrestByWarrantNumberApiArg = {
                warrantNumber,
                withdrawn: false,
            };

            const searchDetails: SearchWarrantsOfArrestDetails = {
                searchBy: SearchByOptions.warrantNo,
                warrantNo: warrantNumber
            }

            provideWarrantOfArrestByWarrantNumber(request)
                .unwrap()
                .then((response) => handleWarrantResponse(response, searchDetails, finaliseGenerateWarrantOfArrest, "Warrant No", warrantNumber));
        },
        [finaliseGenerateWarrantOfArrest, provideWarrantOfArrestByWarrantNumber]
    );

    /**
     * Submit: Generate the warrant of arrest
     */
    const onSubmit = useCallback((searchBy: string, searchValue: string) => {
        setSearchByError(undefined);

        switch (searchBy) {
            case SearchByOptions.noticeNo:
                provideWarrantByNoticeNumber(searchValue);
                break;
            case SearchByOptions.warrantNo:
                provideWarrantByWarrantNumber(searchValue);
                break;
            case SearchByOptions.court:
                if (courtName && courtRoom && courtDate) {
                    provideWarrantByCourtDetails(courtName, courtRoom, courtDate);
                }
                break;
        }

    }, [provideWarrantByNoticeNumber, provideWarrantByWarrantNumber, provideWarrantByCourtDetails,
        courtName, courtRoom, courtDate
    ]);

    const handleCourtNameChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
        setCourtName(newValue);
        setCourtRoom(null);
        setCourtDate(null);
        setCourtRoomList(courts.find((court: Court) =>
            court.courtName === newValue
        )?.courtRooms.map((courtRoom) => courtRoom.room) || []);
    }

    const handleCourtRoomChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
        setCourtRoom(newValue);
        setCourtDate(null);
        setCourtDateList(courts.find((court: Court) =>
            court.courtName === courtName
        )?.courtRooms.find((courtRoom) =>
            courtRoom.room === newValue
        )?.courtRoomBookings.map((courtRoomBooking) => dayjs(courtRoomBooking.operatingDate)) || []);
    }

    const handleCourtDateChange = (date: Dayjs | null) => {
        setCourtDate(date);
        setWarrantNotFoundByCourt(false)
    }

    const handleSearchCourtCase = (searchValue: string) => {
        setSearchValue(searchValue);
    };

    const handleWarrantOfArrestClick = useCallback((warrantArrest: CourtDocumentsListTable) => {
        retrieveTransgression({
            retrieveTransgressionDetailsRequest: {
                noticeNumber: warrantArrest.noticeNo
            }
        }).unwrap().then((response: RetrieveTransgressionDetailsApiResponse) => {
            const transgression = response?.transgression;

            if (transgression) {
                setTransgressionDetails(transgression);
            }

            provideCourtResult({
                provideCourtResultsRequest: {
                    criteria: {
                        type: "CourtResultNoticeNumberCriteria",
                        noticeNumber: warrantArrest.noticeNo
                    }
                }
            }).unwrap().then((response) => {
                if (response.courtResult) {
                    setCourtResult(response.courtResult);
                    setShowWarrantDetails(true);
                    if (response.courtResult.warrantNumber) {
                        setWarrantsToPrint([response.courtResult.warrantNumber]);
                    }
                }
            });
        })
    }, [provideCourtResult, retrieveTransgression]);

    const onDeleteFile = (noticeNo: string) => {
        setFileToDelete(noticeNo);
        setShowAuthorizationPopup(true);
    }

    const authoriseDeleteFile = (username: string, password: string) => {
        onSupervisorAuthorization(username, password, "ROLE_DELETESIGNEDWARRANTOFARREST_OVERRIDE", "Delete signed warrant of arrest document")
            .then((response) => {
                if (response) {
                    setNotApproved(false);
                    const warrantByNoticeNumber = warrantsOfArrest.find((warrant) => warrant.transgression.noticeNumber.number === fileToDelete);
                    deleteSignedWarrantOfArrest({
                        deleteSignedWarrantOfArrestRequest: {
                            warrantNumber: (warrantByNoticeNumber?.warrantNumber?.number || warrantByNoticeNumber?.capturedWarrantNumber) as string,
                            supervisorUsername: username,
                        }
                    }).unwrap().then((response) => {
                        if (response.signedWarrantOfArrestDeleted) {
                            setFiles((prevFiles) => {
                                const newFiles = new Map(prevFiles);
                                newFiles.set(fileToDelete, null);
                                return newFiles;
                            });

                            setShowAuthorizationPopup(false);
                            setSupervisorUsername("");
                            setSupervisorPassword("");
                        }
                    });
                } else {
                    setNotApproved(true);
                }
            });
    }

    const getBase64 = (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const onPrint = (warrantNumbers: string[]) => {
        setIsLoading(true);

        provideWarrantOfArrestDocuments({
            provideWarrantOfArrestDocumentsRequest:
            {
                warrantNumbers: warrantNumbers
            }
        })
            .unwrap()
            .then((response) => {
                navigate(`/${ROUTE_NAMES.printDocuments}`, {
                    state: {
                        printDocumentsState: {
                            accessRoles: ['PRINTWARRANTOFARRESTDOCUMENTS_MAINTAIN'],
                            printHeader: t('printWarrantOfArrest'),
                            confirmMessage: t("confirmWarrantOfArrestPrintedMessage"),
                            returnPath: `/${ROUTE_NAMES.warrantsOfArrest}`,
                            documents: [
                                {
                                    label: t('unsignedWarrant'),
                                    type: "UNSIGNED_WARRANT_OF_ARREST",
                                    id: "unsignedWarrant",
                                    base64: response.unsignedWarrantsOfArrestEncodedPdf,
                                    disabled: false
                                },
                                {
                                    label: t('signedWarrant'),
                                    type: "SIGNED_WARRANT_OF_ARREST",
                                    id: "signedWarrant",
                                    base64: response.file,
                                    disabled: !response.file
                                }
                            ],
                            onSuccessAction: {
                                name: "finalisePrintWarrantOfArrest",
                                request: {
                                    warrantOfArrestDocumentInformation: response.warrantOfArrestDocumentInformation
                                }
                            }
                        } as unknown as PrintDocumentsState
                    }
                });

                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    };

    const onFileChange = (noticeNo: string, file: File) => {
        if (file) {
            getBase64(file).then((base64: unknown | string) => {
                const warrantByNoticeNumber = warrantsOfArrest.find((warrant) => warrant.transgression.noticeNumber.number === noticeNo);
                uploadSignedWarrantOfArrest({
                    uploadSignedWarrantOfArrestRequest: {
                        filename: file.name,
                        file: (base64 as string).split(",")[1],
                        warrantNumber: (warrantByNoticeNumber?.warrantNumber?.number || warrantByNoticeNumber?.capturedWarrantNumber) as string
                    }
                })
                .unwrap().then(() => {
                    setFiles((prevFiles) => new Map(prevFiles.set(noticeNo, file)));
                });
            });
        }
    }

    const handleOnExit = () => {
        navigate('/warrant-of-arrest-tab/warrants-of-arrest', { replace: true });
    }

    const onValueChanges = useCallback((searchBy: string, searchValue: string, isValid: boolean) => {
        setSearchCriteria({ searchBy, searchValue, isValid });
    }, [setSearchCriteria]);

    const compiledWarrantTable = (warrants: WarrantOfArrest[]) => {
        return warrants.map((warrant) => {
            return {
                courtDate: dayjs(warrant.transgression.courtAppearanceDate).format(configContext.dateTime.dateFormat),
                courtName: warrant.transgression.courtName as string,
                noticeNo: warrant.transgression.noticeNumber.number,
                plateNo: warrant.transgression.vehicle.plateNumber,
                offenderName: warrant.transgression.driver?.firstNames + " " + warrant.transgression.driver?.surname,
                offenderIdNo: warrant.transgression.driver?.identification?.number,
                status: warrant.transgression.status,
            }
        });
    };
    const [getRows, setRows] = useState(warrantsOfArrest ? compiledWarrantTable(warrantsOfArrest) : []);

    /**
    * Refetch the warrant list based on the search criteria
    * @param searchDetails - search criteria
    */
    const refetchWarrantsOfArrestList = (searchDetails: SearchWarrantsOfArrestDetails) => {

        switch (searchDetails.searchBy) {
            case SearchByOptions.court:
                provideWarrantOfArrestByCourtDetails({
                    courtDate: searchDetails.courtDetails?.courtDate as string,
                    courtName: searchDetails.courtDetails?.courtName as string,
                    courtRoom: searchDetails.courtDetails?.courtRoom as string,
                    withdrawn: false
                }).unwrap().then(response => {
                    if (response) {
                        setRows(compiledWarrantTable(response.warrantsOfArrest || []));
                        setFiles(new Map(response.warrantsOfArrest?.map((warrant: WarrantOfArrest) =>
                            [warrant.transgression.noticeNumber.number, getActiveScannedWarrant(warrant.scannedWarrantsOfArrest)])));
                    }
                })
                break;
            case SearchByOptions.noticeNo:
                provideWarrantOfArrestByNoticeNumber({ noticeNumber: searchDetails.noticeNo as string })
                    .unwrap().then(response => {
                        if (response) {
                            setRows(compiledWarrantTable(response.warrantsOfArrest || []));
                            setFiles(new Map(response.warrantsOfArrest?.map((warrant: WarrantOfArrest) =>
                                [warrant.transgression.noticeNumber.number, getActiveScannedWarrant(warrant.scannedWarrantsOfArrest)])));
                        }
                    });
                break;
            case SearchByOptions.warrantNo:
                provideWarrantOfArrestByWarrantNumber({ warrantNumber: searchDetails.warrantNo as string })
                    .unwrap().then(response => {
                        if (response) {
                            setRows(compiledWarrantTable(response.warrantsOfArrest || []));
                            setFiles(new Map(response.warrantsOfArrest?.map((warrant: WarrantOfArrest) =>
                                [warrant.transgression.noticeNumber.number, getActiveScannedWarrant(warrant.scannedWarrantsOfArrest)])));
                        }
                    });
                break;
        }
    }

    const helperTextMessage = () => {
        if (courtDate && courtDateErrorWarrant()) {
            return t("courtDatePassedMessage")
        }

        if (courtDate && !courtDateErrorWarrant()) {
            if (warrantNotFoundByCourt) {
                return t("warrantNotFound")
            }
        }

    };

    const courtDetails = {
        courtNameList: courtNameList,
        courtName: courtName,
        handleCourtNameChange: handleCourtNameChange,
        courtNameError: courtNameError,
        courtRoomList: courtRoomList,
        courtRoom: courtRoom,
        handleCourtRoomChange: handleCourtRoomChange,
        courtRoomError: courtRoomError,
        handleCourtDateChange: handleCourtDateChange,
        courtDate: courtDate,
        courtDateList: courtDateList,
        courtDateError: courtDateError,
        helperTextMessage: helperTextMessage(),
        warrantNotFound: courtDateErrorWarrantNotFound
    }

    const closeWarrantOfArrestDetails = useCallback(() => {
        setWarrantsToPrint(null);
        setShowWarrantDetails(false);
    }, [])

    return {
        isLoading,
        searchValue,
        searchBy,
        getRows,
        files,
        showAuthorizationPopup,
        supervisorUsername,
        supervisorPassword,
        onDeleteFile,
        setShowAuthorizationPopup,
        setSupervisorPassword,
        setSupervisorUsername,
        authoriseDeleteFile,
        onSubmit,
        onValueChanges,
        handleOnExit,
        handleSearchCourtCase,
        handleWarrantOfArrestClick,
        refetchWarrantsOfArrestList,
        courtDetails,
        provideWarrantByNoticeNumber,
        onPrint,
        showWarrantDetails,
        closeWarrantOfArrestDetails,
        transgressionDetails,
        courtResult,
        onFileChange,
        searchByError,
        searchCriteria,
        courtDate,
        courtName,
        courtRoom,
        warrantsToPrint,
        notApproved,
        isErrorAuthentication
    }

}

export default useWarrantOfArrestManager;
