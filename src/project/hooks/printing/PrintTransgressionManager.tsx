import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import { DocumentTypeOption, TDocumentType } from "../../components/printing/TmDocumentTypeSelector";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UpdateTransgressionStatusApiArg, useFindTransgressionParameterQuery, useProvideRenderedChargeSheetMutation, useProvideRenderedTransgressionDocumentsMutation, useUpdateTransgressionStatusMutation } from "../../redux/api/transgressionsApi";
import printJS from "print-js";
import { useHotkeys } from "react-hotkeys-hook";
import { t } from "i18next";
import { useAppSelector } from "../../../framework/redux/hooks";
import { selectConfig } from "../../../framework/config/configSlice";
import { RedirectType } from "../../enum/RedirectType";
import AuthService from "../../../framework/auth/authService";

// Constants
const DOCUMENT_PARAMETERS = [
    { name: 'OFFENDER_COPY', label: 'offenderCopy', id: 'OffenderCopy' },
    { name: 'CONTROL_COPY', label: 'controlCopy', id: 'ControlCopy' },
    { name: 'OFFICE_COPY_RED', label: 'officeCopyRed', id: 'OfficeCopyRed' },
    { name: 'OFFICE_COPY_GREEN', label: 'officeCopyGreen', id: 'OfficeCopyGreen' }
] as const;

const PRINT_ALL_STATUSES = [TransgressionStatus.CREATED, TransgressionStatus.ARREST_CASE_CREATED];
const ARREST_CASE_STATUSES = [
    TransgressionStatus.ARREST_CASE_CREATED,
    TransgressionStatus.CHARGE_SHEET_PRINTED,
    TransgressionStatus.ARREST_CASE_CANCELLED
];

const STATUS_TRANSITIONS: Partial<Record<TransgressionStatus, TransgressionStatus>> = {
    [TransgressionStatus.CREATED]: TransgressionStatus.ISSUED,
    [TransgressionStatus.ARREST_CASE_CREATED]: TransgressionStatus.CHARGE_SHEET_PRINTED,
};

const usePrintTransgressionManager = (
    setOpenDialog: (value: boolean) => void
) => {
    const location = useLocation();
    const navigate = useNavigate();

    const { noticeNumber, redirect } = useParams();

    const transgressionStatus: TransgressionStatus = location.state?.status;
    const sequenceNumber: string = location.state?.sequenceNumber;
    const isPrintAll = location.pathname.includes("/all") || PRINT_ALL_STATUSES.includes(transgressionStatus);
    const isArrestCase = ARREST_CASE_STATUSES.includes(transgressionStatus);
    const [printAllClicked, setPrintAllClicked] = useState(false);
    const { config: { subsystem: { apps: { weigh: weighBaseURL } } } } = useAppSelector(selectConfig);

    // Parameter queries
    const offenderCopy = useFindTransgressionParameterQuery({ name: "PRINT_OFFENDER_COPY" });
    const controlCopy = useFindTransgressionParameterQuery({ name: "PRINT_CONTROL_COPY" });
    const officeCopyRed = useFindTransgressionParameterQuery({ name: "PRINT_OFFICE_COPY_RED" });
    const officeCopyGreen = useFindTransgressionParameterQuery({ name: "PRINT_OFFICE_COPY_GREEN" });

    const parameterQueries = useMemo(() => ({
        offenderCopy,
        controlCopy,
        officeCopyRed,
        officeCopyGreen
    }), [offenderCopy, controlCopy, officeCopyRed, officeCopyGreen]);

    // Loading states
    const parametersLoading = Object.values(parameterQueries).some(query => query.isLoading);

    const allDocumentsRequired = useMemo(() =>
        Object.values(parameterQueries).every(query => query.data?.value === "TRUE"),
        [parameterQueries]
    );

    const chargeSheetDocumentType: DocumentTypeOption = useMemo(() => ({
        label: t('chargeSheetLabel'),
        type: "CHARGE_SHEET",
        id: "ChargeSheet",
    }), []);

    const transgressionDocumentTypeOptions: DocumentTypeOption[] = useMemo(() => {
        const orderedOptions: DocumentTypeOption[] = [];

        // Always maintain this specific order: offender, control, office red, office green
        const documentTypeConfigs = [
            { query: parameterQueries.offenderCopy, ...DOCUMENT_PARAMETERS[0], type: 'OFFENDER_COPY' },
            { query: parameterQueries.controlCopy, ...DOCUMENT_PARAMETERS[1], type: 'CONTROL_COPY' },
            { query: parameterQueries.officeCopyRed, ...DOCUMENT_PARAMETERS[2], type: 'OFFICE_COPY_RED' },
            { query: parameterQueries.officeCopyGreen, ...DOCUMENT_PARAMETERS[3], type: 'OFFICE_COPY_GREEN' }
        ] as const;

        // Process in order to maintain consistent sequence
        documentTypeConfigs.forEach(config => {
            if (config.query.data?.value === "TRUE") {
                orderedOptions.push({
                    label: t(config.label),
                    type: config.type,
                    id: config.id,
                });
            }
        });

        // Ensure we always have at least the charge sheet option available
        return orderedOptions.length > 0 ? orderedOptions : [chargeSheetDocumentType];
    }, [parameterQueries, chargeSheetDocumentType]);

    const getDocumentTypes = useCallback((docTypes?: string[]): TDocumentType[] => {
        return isArrestCase ? [chargeSheetDocumentType.type] as TDocumentType[] : docTypes as TDocumentType[];
    }, [isArrestCase, chargeSheetDocumentType.type]);

    const getDocumentTypeOptions = useCallback((docTypeOptions?: DocumentTypeOption[]): DocumentTypeOption[] => {
        return isArrestCase ? [chargeSheetDocumentType] : docTypeOptions as DocumentTypeOption[];
    }, [isArrestCase, chargeSheetDocumentType]);

    const [base64, setBase64] = useState<string | string[]>("");
    const [previewDocumentType, setPreviewDocumentType] = useState<DocumentTypeOption>(chargeSheetDocumentType);
    const [currentPreviewDocumentType, setCurrentPreviewDocumentType] = useState({
        label: "",
        type: "",
    });

    const [printDocuments, setPrintDocuments] = useState(getDocumentTypes([]));

    // Update preview document type when options are available
    // Always prefer Offender Copy as the initial preview for non-arrest cases
    useEffect(() => {
        const availableOptions = getDocumentTypeOptions(transgressionDocumentTypeOptions);
        if (availableOptions.length === 0) return;

        // For arrest cases, use charge sheet
        if (isArrestCase) {
            if (previewDocumentType.type !== chargeSheetDocumentType.type) {
                setPreviewDocumentType(chargeSheetDocumentType);
            }
            return;
        }

        // For regular transgressions, always prefer Offender Copy as the initial preview
        const offenderCopyOption = availableOptions.find(opt => opt.type === 'OFFENDER_COPY');
        const shouldSetOffenderCopy = offenderCopyOption &&
                                      previewDocumentType.type !== 'OFFENDER_COPY' &&
                                      currentPreviewDocumentType.type === '';

        if (shouldSetOffenderCopy) {
            setPreviewDocumentType(offenderCopyOption);
        } else if (!availableOptions.some(opt => opt.type === previewDocumentType.type)) {
            // Fallback: if current preview type is not available, select first option
            setPreviewDocumentType(availableOptions[0]);
        }
    }, [transgressionDocumentTypeOptions, isArrestCase, previewDocumentType.type, getDocumentTypeOptions, chargeSheetDocumentType, currentPreviewDocumentType.type]);
    const [isLoading, setIsLoading] = useState(false);

    const setSelectedDocuments = (documentType: TDocumentType) => {
        setPrintDocuments(prev =>
            prev.includes(documentType)
                ? prev.filter(doc => doc !== documentType)
                : [...prev, documentType]
        );
    };


    const [printChargeSheetRequest, { isLoading: loadingChargeSheetPrintRequest }] = useProvideRenderedChargeSheetMutation();
    const [printRequest, { isLoading: loadingPrintRequest }] = useProvideRenderedTransgressionDocumentsMutation();
    const [updateTransgressionStatus, { isLoading: isLoadingUpdateStatus }] = useUpdateTransgressionStatusMutation();

    useEffect(() => {
        setIsLoading(loadingChargeSheetPrintRequest || loadingPrintRequest || isLoadingUpdateStatus || parametersLoading)
    }, [loadingChargeSheetPrintRequest, loadingPrintRequest, isLoadingUpdateStatus, parametersLoading])

    const getRenderedDocument = async (documentTypes: TDocumentType[]) => {
        try {
            if (isArrestCase && documentTypes.length > 0 && !loadingChargeSheetPrintRequest) {
                const res = await printChargeSheetRequest({
                    provideRenderedChargeSheetRequest: {
                        noticeNumber: noticeNumber as string,
                        documentType: "CHARGE_SHEET",
                    },
                }).unwrap();

                setOpenDialog(true);
                printJS({
                    printable: res.encodedPdf,
                    type: "pdf",
                    base64: true,
                });
            }
            else if (documentTypes.length > 0 && !loadingPrintRequest) {
                const res = await printRequest({
                    provideRenderedTransgressionDocumentRequest: {
                        noticeNumber: noticeNumber,
                        documentTypes: documentTypes,
                    },
                }).unwrap();

                setOpenDialog(true);
                printJS({
                    printable: res.encodedPdf,
                    type: "pdf",
                    base64: true,
                });
            }
        } catch (error) {
            console.error('Failed to render document:', error);
            // Handle error appropriately - could show user notification
        }
    };

    const print = () => {
        const documentTypes = getDocumentTypes(printDocuments);
        setPrintAllClicked(false);
        getRenderedDocument(documentTypes);
    };

    const printAll = () => {
        const documentTypes = transgressionDocumentTypeOptions.map((d) => d.type as TDocumentType);
        setPrintAllClicked(true);
        getRenderedDocument(documentTypes);
    };

    const [
        provideRenderedChargeSheetDocumentRequest,
        { isSuccess: chargeSheetIsSuccess, isError: chargeSheetIsError, isLoading: chargeSheetIsLoading },
    ] = useProvideRenderedChargeSheetMutation();
    const [
        provideRenderedTransgressionDocumentRequest,
        { isSuccess: transgressionIsSuccess, isError: transgressionIsError, isLoading: transgressionIsLoading },
    ] = useProvideRenderedTransgressionDocumentsMutation();

    useEffect(() => {
        if (isPrintAll || transgressionDocumentTypeOptions.length === 1) {
            setPrintDocuments(transgressionDocumentTypeOptions.map((d) => d.type as TDocumentType));
        } else {
            setPrintDocuments([]);
        }
    }, [isPrintAll, transgressionDocumentTypeOptions]);

    useEffect(() => {
        // Only make API calls when we have valid document options and notice number
        if (!noticeNumber ||
            !previewDocumentType.type ||
            parametersLoading ||
            transgressionDocumentTypeOptions.length === 0 ||
            (previewDocumentType.type === "CHARGE_SHEET" && !isArrestCase)) {
            return;
        }

        // Verify that the preview document type is actually available in the options
        const isValidDocumentType = transgressionDocumentTypeOptions.some(opt => opt.type === previewDocumentType.type) ||
                                   (isArrestCase && previewDocumentType.type === "CHARGE_SHEET");

        if (!isValidDocumentType) {
            return;
        }

        if (!isArrestCase && currentPreviewDocumentType.type !== previewDocumentType.type) {
            provideRenderedTransgressionDocumentRequest({
                provideRenderedTransgressionDocumentRequest: {
                    noticeNumber: noticeNumber,
                    documentTypes: [previewDocumentType.type as TDocumentType],
                },
            }).unwrap().then((res) => {
                if (res.encodedPdf) {
                    setBase64(res.encodedPdf);
                    setCurrentPreviewDocumentType(previewDocumentType);
                }
            }).catch((error) => {
                console.error('Failed to load document preview:', error);
            });
        }
        else if (isArrestCase && currentPreviewDocumentType.type !== previewDocumentType.type) {
            provideRenderedChargeSheetDocumentRequest({
                provideRenderedChargeSheetRequest: {
                    noticeNumber: noticeNumber as string,
                    documentType: previewDocumentType.type as TDocumentType,
                },
            }).unwrap().then((res) => {
                if (res.encodedPdf) {
                    setBase64(res.encodedPdf);
                    setCurrentPreviewDocumentType(previewDocumentType);
                }
            }).catch((error) => {
                console.error('Failed to load charge sheet preview:', error);
            });
        }
    }, [
        isArrestCase,
        previewDocumentType,
        noticeNumber,
        provideRenderedTransgressionDocumentRequest,
        provideRenderedChargeSheetDocumentRequest,
        currentPreviewDocumentType,
        parametersLoading,
        transgressionDocumentTypeOptions
    ]);

    const exit = useCallback(() => {
        if (redirect === RedirectType.PROSECUTE_OVERLOAD) {
            window.location.href = `${weighBaseURL}/weigh/ccv/${sequenceNumber}`;
        } else if (redirect === RedirectType.PROSECUTE_RTQS && AuthService.isFeatureEnabled('RTQS_TRANSGRESSIONS')) {
            navigate(`/transgressions/rtqs-transgression`);
        } else {
            navigate("/transgressions/overload-transgression");
        }
    }, [navigate, redirect, sequenceNumber, weighBaseURL]);

    useHotkeys("ENTER", () => { }, {
        preventDefault: false,
        enableOnFormTags: true,
        description: t("select"),
    });

    useHotkeys(
        "ESCAPE",
        () => {
            exit();
        },
        {
            preventDefault: false,
            enableOnFormTags: true,
            description: t("closePage"),
        }
    );

    const onPrintSuccessful = () => {
        if (noticeNumber) {
            const printedDocuments = getDocumentTypes(printAllClicked ? transgressionDocumentTypeOptions.map((d) => d.type) : printDocuments);
            const newTransgressionStatus = STATUS_TRANSITIONS[transgressionStatus] || transgressionStatus;

            const request: UpdateTransgressionStatusApiArg = {
                updateTransgressionStatusRequest: {
                    noticeNumber: noticeNumber,
                    documentTypes: printedDocuments,
                    newStatus: newTransgressionStatus,
                }
            };
            updateTransgressionStatus(
                request
            ).then(() => {
                setOpenDialog(false);
                exit();
            });
        }
    };

    return {
        base64,
        isPrintAll,
        isArrestCase,
        printDocuments,
        chargeSheetIsLoading,
        transgressionIsLoading,
        chargeSheetIsError,
        transgressionIsError,
        transgressionIsSuccess,
        chargeSheetIsSuccess,
        transgressionDocumentTypeOptions,
        getDocumentTypeOptions,
        onPrintSuccessful,
        setPreviewDocumentType,
        setSelectedDocuments,
        printAll,
        print,
        exit,
        isLoading,
        allDocumentsRequired
    }
}

export default usePrintTransgressionManager;
