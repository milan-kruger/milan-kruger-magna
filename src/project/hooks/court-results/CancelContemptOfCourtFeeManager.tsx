import { useCallback, useEffect, useState } from "react";
import {
    CourtResult, Money, ProvideCourtResultsResponse, transgressionsApi, useCancelContemptOfCourtMutation, useProvideCourtResultMutation
} from "../../redux/api/transgressionsApi";
import { useHotkeys } from "react-hotkeys-hook";
import useSupervisorAuthorizationManager from "../SupervisorAuthorizationManager";
import { SearchByOptions } from "../../components/court-results/CourtDocumentsSearchBy";
import { useTranslation } from "react-i18next";

const AUTHORIZATION_ROLE = 'ROLE_CANCELCONTEMPTOFCOURT_OVERRIDE';
const AUTHORIZATION_REASON = 'Cancel contempt of court';
const CANCELLED_CONTEMPT_OF_COURT_FEE_COMMENT = "Cancelled contempt of court fee";

const useCancelContemptOfCourtFeeManager = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [courtResults, setCourtResults] = useState<CourtResult[]>([]);
    const [showCourtResultPopup, setShowCourtResultPopup] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState<{ searchBy: string, searchValue: string, isValid: boolean }>();
    const [showAuthorizationPopup, setShowAuthorizationPopup] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [noticeNumber, setNoticeNumber] = useState<string>("");
    const [supervisorUsername, setSupervisorUsername] = useState<string>('');
    const [supervisorPassword, setSupervisorPassword] = useState<string>('');
    const [notApproved, setNotApproved] = useState(false);
    // const [transgressionDetails, setTransgressionDetails] = useState<RetrieveTransgressionDetailsApiResponse>();
    const [contemptOfCourtFeeCancelled, setContemptOfCourtFeeCancelled] = useState(false);
    const [contemptOfCourtFee, setContemptOfCourtFee] = useState<Money>();
    const [searchByError, setSearchByError] = useState<{ message: string, searchBy: "Notice No" | "Warrant No", searchText: string } | undefined>();

    const [provideCourtResult, { isLoading: isLoadingCourtResult }
    ] = useProvideCourtResultMutation();
    const { onSupervisorAuthorization, isLoading: isLoadingSupervisorAuthorization, isError: isErrorAuthentication } = useSupervisorAuthorizationManager();
    const [cancelContemptOfCourt, { isLoading: isLoadingCancelContemptOfCourt }] = useCancelContemptOfCourtMutation();
    // const [retrieveTransgression, { isLoading: isLoadingRetrieveTransgression }] = transgressionsApi.endpoints.retrieveTransgressionDetails.useLazyQuery();;
    const [retrieveTransgressionHistory, { isLoading: isLoadingRetrieveTransgressionHistory }] = transgressionsApi.endpoints.retrieveTransgressionHistory.useLazyQuery();

    useEffect(() => {
        setIsLoading(isLoadingCourtResult || isLoadingSupervisorAuthorization || isLoadingCancelContemptOfCourt
            || isLoadingRetrieveTransgressionHistory
        );
    }, [isLoadingCourtResult, isLoadingSupervisorAuthorization, isLoadingCancelContemptOfCourt,
        isLoadingRetrieveTransgressionHistory
    ]);

    const fetchTransgressionHistory = useCallback(async (noticeNumber: string) => {
        try {
            const retrieveTransgressionHistoryResponse = await retrieveTransgressionHistory({
                noticeNumber
            }).unwrap();

            const containsCancelledFeeCommentFound = retrieveTransgressionHistoryResponse.transgressionEntries
                .some(entry => entry.comments?.includes(CANCELLED_CONTEMPT_OF_COURT_FEE_COMMENT));

            setContemptOfCourtFeeCancelled(containsCancelledFeeCommentFound);
            setShowCourtResultPopup(true);
        } catch (error) {
            console.error("Error fetching transgression history:", error);
        }
    }, [retrieveTransgressionHistory]);

    const handleCourtResultResponse = useCallback(async (response: ProvideCourtResultsResponse, searchBy: "Notice No" | "Warrant No", searchText: string) => {
        if (response.courtResult) {
            const result = response.courtResult;
            setCourtResults([result]);
            setNoticeNumber(result.noticeNumber);

            if (result?.contemptOfCourtFee) {
                setContemptOfCourtFee(result.contemptOfCourtFee);
            }

            await fetchTransgressionHistory(result.noticeNumber);
        } else {
            setSearchByError({ message: '', searchBy, searchText });
        }
    }, [fetchTransgressionHistory]);

    const provideCaseResultDetails = useCallback(async (noticeNumber: string) => {
        try {
            const response = await provideCourtResult({
                provideCourtResultsRequest: {
                    criteria: {
                        type: "CancelContemptOfCourtNoticeNumberCriteria",
                        noticeNumber,
                        transgressionStatuses: ["WARRANT_OF_ARREST", "PEND_WARRANT_OF_ARREST"]
                    }
                }
            }).unwrap();

            await handleCourtResultResponse(response, 'Notice No', noticeNumber);
        } catch (error) {
            console.error("Error fetching case result details:", error);
        }
    }, [provideCourtResult, handleCourtResultResponse]);

    const onSubmit = useCallback(async (searchBy: string, searchValue: string) => {
        setSearchByError(undefined);

        try {
            if (searchBy === SearchByOptions.noticeNo) {
                await provideCaseResultDetails(searchValue);
            } else if (searchBy === SearchByOptions.warrantNo) {
                const response = await provideCourtResult({
                    provideCourtResultsRequest: {
                        criteria: {
                            type: "CancelContemptOfCourtWarrantNumberCriteria",
                            warrantNumber: searchValue,
                            transgressionStatuses: ["WARRANT_OF_ARREST", "PEND_WARRANT_OF_ARREST"]
                        }
                    }
                }).unwrap();

                await handleCourtResultResponse(response, 'Warrant No', searchValue);
            }
        } catch (error) {
            console.error("Error handling onSubmit:", error);
        }
    }, [provideCaseResultDetails, provideCourtResult, handleCourtResultResponse]);

    const onValueChanges = useCallback((searchBy: string, searchValue: string, isValid: boolean) => {
        setSearchCriteria({ searchBy, searchValue, isValid });
    }, [setSearchCriteria]);

    const closeCourtResultPopup = useCallback(() => {
        setShowCourtResultPopup(false);
    }, []);

    const closeAuthorizationPopup = useCallback(() => {
        setShowAuthorizationPopup(false);
        setSupervisorUsername('');
        setSupervisorPassword('');
    }, []);

    const onCancelContemptOfCourtFee = useCallback((username: string, password: string) => {
        onSupervisorAuthorization(username, password, AUTHORIZATION_ROLE, AUTHORIZATION_REASON)
            .then((response) => {
                if (response) {
                    setNotApproved(false);
                    cancelContemptOfCourt({
                        cancelContemptOfCourtRequest: {
                            supervisorUsername: username,
                            noticeNumber: noticeNumber
                        }
                    }).unwrap().then((response) => {
                        if (response.contemptOfCourtCancelled) {
                            closeAuthorizationPopup();
                            setShowConfirmationDialog(true);
                        }
                    });
                } else {
                    setNotApproved(true);
                }
            });
    }, [onSupervisorAuthorization, cancelContemptOfCourt, noticeNumber, closeAuthorizationPopup]);

    const closeAll = useCallback(() => {
        setShowCourtResultPopup(false);
        closeAuthorizationPopup();
        setShowConfirmationDialog(false);
    }, [closeAuthorizationPopup]);

    //Hotkeys
    useHotkeys(
        "ALT+S",
        () => {
            if (searchCriteria?.searchBy && searchCriteria.searchValue && searchCriteria.isValid) {
                onSubmit(searchCriteria.searchBy, searchCriteria.searchValue);
            }
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("submit")),
        }
    );

    useHotkeys(
        "CTRL+E",
        () => {
            closeAll();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("closePage")),
        }
    );

    useHotkeys(
        "ALT+C",
        () => {
            if (showCourtResultPopup) {
                setShowAuthorizationPopup(true);
            }
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("cancelContemptOfCourtFee")),
        }
    );


    return {
        isLoading, courtResults, onSubmit, showCourtResultPopup,
        closeCourtResultPopup, onValueChanges, showAuthorizationPopup,
        setShowAuthorizationPopup,
        showConfirmationDialog, setShowConfirmationDialog, onCancelContemptOfCourtFee,
        supervisorPassword, setSupervisorPassword, supervisorUsername,
        setSupervisorUsername, closeAuthorizationPopup, closeAll,
        contemptOfCourtFee, contemptOfCourtFeeCancelled,
        searchByError,
        isErrorAuthentication,
        notApproved
    };
};

export default useCancelContemptOfCourtFeeManager;
