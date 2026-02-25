import { useTranslation } from 'react-i18next';
import { useState, useMemo, useCallback, SyntheticEvent, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { MIN_LOOKUP_PAGE_SIZE } from "../../../framework/components/list/util";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import { GetLookupsApiArg, useGetLookupsQuery, LookupResponse } from "../../redux/api/coreApi";
import { useCancelTransgressionMutation, useCancelRtqsTransgressionMutation, TransgressionDto, OverloadTransgressionDto, RtqsTransgressionDto } from "../../redux/api/transgressionsApi";
import useSupervisorAuthorizationManager from "../SupervisorAuthorizationManager";
import { ROUTE_NAMES } from "../../Routing";
import { JsonObjectType } from "../../enum/JsonObjectType";


const AUTHORIZATION_ROLE = 'ROLE_CANCELTRANSGRESSION_OVERRIDE';
const AUTHORIZATION_REASON = 'Cancel Transgression';
const OVERLOAD_TRANSGRESSION_DTO = JsonObjectType.OverloadTransgressionDto;
const RTQS_TRANSGRESSION_DTO = JsonObjectType.RtqsTransgressionDto;

const useCancelTransgressionManager = (
    transgression: TransgressionDto,
    onCancel: () => void
) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const [cancelOverloadTransgression, { isLoading: cancelOverloadLoader }] = useCancelTransgressionMutation();
    const [cancelRtqsTransgression, { isLoading: cancelRtqsLoader }] = useCancelRtqsTransgressionMutation();

    const [openSupervisorDialog, setOpenSupervisorDialog] = useState(false);
    const [openReturnDocumentsDialog, setOpenReturnDocumentsDialog] = useState(false);
    const [openReweighDialog, setOpenReweighDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState<string>();
    const [supervisorUsername, setSupervisorUsername] = useState<string>('');
    const [supervisorPassword, setSupervisorPassword] = useState<string>('');
    const [invalidReason, setInvalidReason] = useState<boolean>(false);
    const [isIncorrectOverloadPlateNo, setIsIncorrectOverloadPlateNo] = useState<boolean>(false);
    const [newPlateNumber, setNewPlateNumber] = useState<string>();
    const [notApproved, setNotApproved] = useState(false);

    const { onSupervisorAuthorization, isError: isErrorAuthentication, isLoading: loadingAuthentication } = useSupervisorAuthorizationManager();

    // Lookups API Calls
    const cancelTransgressionReasonRequest: GetLookupsApiArg = {
        lookupType: transgression.type === JsonObjectType.OverloadTransgressionDto ? 'TRANSGRESSION_CANCEL_REASON' : 'RTQS_TRANSGRESSION_CANCEL_REASON',
        page: 0,
        pageSize: MIN_LOOKUP_PAGE_SIZE,
        sortDirection: 'ASC',
        sortFields: ['lookupType', 'lookupValue']
    }
    const {
        data: cancelTransgressionReasonResponse
    } = useGetLookupsQuery(cancelTransgressionReasonRequest);

    const transgressionCancelReasons = useMemo(() => {
        return {
            options:
                cancelTransgressionReasonResponse?.content ? cancelTransgressionReasonResponse.content : [],
            getOptionLabel: (option: LookupResponse) => option.lookupCode + ' - ' + t(option.lookupValue),
        };
    }, [cancelTransgressionReasonResponse, t]);

    useEffect(() => {
        setIsLoading(cancelOverloadLoader || cancelRtqsLoader || loadingAuthentication)
    }, [cancelOverloadLoader, cancelRtqsLoader, loadingAuthentication])

    const getTransgressionReasonValue = useCallback((lookupValue: string | undefined) => {
        if (transgressionCancelReasons) {
            return transgressionCancelReasons.options.find((reason: LookupResponse) => {
                return reason.lookupValue.toLowerCase() === lookupValue?.toLowerCase() ? reason : null;
            })
        }
        return null;
    }, [transgressionCancelReasons])

    const handleOnInputChange = useDebouncedCallback((_event: React.SyntheticEvent<Element, Event> | null, value: string) => {
        let searchValue = "";
        if (value.includes(" - ")) {
            searchValue = value.split("-", 2)[1].replace(" ", "");
        }
        else {
            searchValue = value.trim();
        }
        return searchValue;
    }, 500);

    const handleSupervisorAuthDialogClose = () => {
        setOpenSupervisorDialog(false);
    }

    const handleReturnDocumentsDialogClose = (isCancelled: boolean) => {
        if (transgression.type === OVERLOAD_TRANSGRESSION_DTO) {
            setOpenReturnDocumentsDialog(false);
            setOpenReweighDialog(isCancelled);
        }
        else if (transgression.type === RTQS_TRANSGRESSION_DTO) {
            navigate(`/${ROUTE_NAMES.rtqsTransgression}`, {
                replace: true,
            });
        }
    }

    const handleVehicleReweighDialogClose = () => {
        setOpenReweighDialog(false);
        navigate(-1);
    }

    const handleSupervisorAuthConfirm = () => {
        if (!supervisorUsername || !supervisorPassword) return;

        setIsLoading(true);

        const documentsIssuedStatuses = [
            TransgressionStatus.ISSUED,
            TransgressionStatus.CHARGE_SHEET_PRINTED,
        ];

        onSupervisorAuthorization(
            supervisorUsername,
            supervisorPassword,
            AUTHORIZATION_ROLE,
            AUTHORIZATION_REASON
        )
            .then((response) => {
                if (!response) {
                    setNotApproved(true);
                    return;
                }

                setNotApproved(false);

                const status = transgression?.status as TransgressionStatus;
                const type = transgression?.type;

                if (documentsIssuedStatuses.includes(status)) {
                    setOpenReturnDocumentsDialog(true);
                    return;
                }

                if (type === OVERLOAD_TRANSGRESSION_DTO) {
                    return handleCancelOverloadTransgression(
                        [cancellationReason as string],
                        supervisorUsername,
                        supervisorPassword,
                        isIncorrectOverloadPlateNo ? newPlateNumber : undefined
                    ).then(() => {
                        setOpenReweighDialog(true);
                    });
                }

                if (type === RTQS_TRANSGRESSION_DTO) {
                    return handleCancelRtqsTransgression(
                        [cancellationReason as string],
                        supervisorUsername,
                        supervisorPassword
                    ).then(() => {
                        navigate(`/${ROUTE_NAMES.rtqsTransgression}`, { replace: true });
                    });
                }
            })
            .finally(() => {
                setIsLoading(false);
                handleSupervisorAuthDialogClose();
            });
    };

    const handleCancelOverloadTransgression = (
        cancellationReasons: string[],
        supervisorUsername: string,
        supervisorPassword: string,
        newPlateNumber?: string
    ): Promise<boolean> => {

        return new Promise((resolve) => {
            const overloadTransgression: OverloadTransgressionDto = JSON.parse(JSON.stringify(transgression));
            cancelOverloadTransgression({
                cancelTransgressionRequest: {
                    reasons: cancellationReasons,
                    supervisorUsername: supervisorUsername,
                    supervisorPassword: btoa(supervisorPassword),
                    newPlateNumber: newPlateNumber,
                    noticeNumber: overloadTransgression.noticeNumber.number,
                    sequenceNumber: overloadTransgression.sequenceNumber!,
                    authorityCode: overloadTransgression.authorityCode,
                },
            }).unwrap().then((value) => {
                if (value.cancelled) {
                    resolve(true);
                } else if (!value.cancelled) {
                    resolve(false);
                }
            });
        });
    }

    const handleCancelRtqsTransgression = (
        cancellationReasons: string[],
        supervisorUsername: string,
        supervisorPassword: string
    ): Promise<boolean> => {

        return new Promise((resolve) => {
            const rtqsTransgression: RtqsTransgressionDto = JSON.parse(JSON.stringify(transgression));
            cancelRtqsTransgression({
                cancelRtqsTransgressionRequest: {
                    supervisorUsername: supervisorUsername,
                    supervisorPassword: btoa(supervisorPassword),
                    noticeNumber: rtqsTransgression.noticeNumber.number,
                    reasons: cancellationReasons,
                },
            }).unwrap().then((value) => {
                if (value.cancelled) {
                    resolve(true);
                } else if (!value.cancelled) {
                    resolve(false);
                }
            });
        });
    }

    const clearFields = () => {
        setSupervisorUsername('');
        setSupervisorPassword('');
        setCancellationReason(undefined);
        setNewPlateNumber(undefined);
    }

    const handleCloseDialog = () => {
        onCancel();
    };

    // Redirect/Open supervisor dialog
    const handleOnConfirm = () => {
        setOpenSupervisorDialog(true);
        onCancel();
    }

    const onChangeReason = (_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
        setCancellationReason(value ? value.lookupValue : undefined);
        if (transgression.type === OVERLOAD_TRANSGRESSION_DTO && value?.lookupValue === "Incorrect plate number") {
            setIsIncorrectOverloadPlateNo(true);
        }
        else {
            setIsIncorrectOverloadPlateNo(false);
        }
    };

    const onPlateNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNewPlateNumber(event.target.value);
    }

    const invalidDriverPlateNo = (newPlateNumber === '' || !newPlateNumber);

    useEffect(() => {
        setInvalidReason(!cancellationReason || cancellationReason === '');
    }, [cancellationReason]);

    const [cancelAuthErrorDialogVisible, setCancelAuthErrorDialogVisible] = useState(false);

    const handleCloseAuthErrorDialog = useCallback(() => {
        setCancelAuthErrorDialogVisible(false);
    }, []);

    const displayPlateNumbers = () => {
        return `\n${t('oldPlateNumber')}: ${transgression?.vehicle?.plateNumber}\n${t('newPlateNumber')}: ${newPlateNumber?.toLocaleUpperCase()}`;
    }

    return {
        openSupervisorDialog,
        openReturnDocumentsDialog,
        openReweighDialog,
        transgression,
        cancellationReason,
        supervisorUsername,
        supervisorPassword,
        invalidReason,
        isIncorrectOverloadPlateNo,
        isErrorAuthentication,
        newPlateNumber,
        notApproved,
        transgressionCancelReasons,
        invalidDriverPlateNo,
        cancelAuthErrorDialogVisible,
        setSupervisorUsername,
        setSupervisorPassword,
        getTransgressionReasonValue,
        clearFields,
        onChangeReason,
        onPlateNumberChange,
        displayPlateNumbers,
        handleOnInputChange,
        handleSupervisorAuthDialogClose,
        handleReturnDocumentsDialogClose,
        handleVehicleReweighDialogClose,
        handleSupervisorAuthConfirm,
        handleCloseAuthErrorDialog,
        handleOnConfirm,
        handleCloseDialog,
        handleCancelOverloadTransgression,
        handleCancelRtqsTransgression,
        isLoading
    };
}

export default useCancelTransgressionManager;
