import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CourtResult,
    OverloadTransgression,
    ProvideCourtResultsResponse,
    RetrieveTransgressionDetailsApiResponse,
    useProvideCourtResultMutation,
    useRetrieveTransgressionDetailsMutation
} from "../../redux/api/transgressionsApi";
import { useHotkeys } from "react-hotkeys-hook";
import { t } from "i18next";

const useCourtResultHistoryManager = (
    setCourtResults: (courtResults: CourtResult[]) => void
) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
    const [transgressionDetails, setTransgressionDetails] = useState<OverloadTransgression>();

    const [provideCourtResults, { isLoading: isLoadingCourtResults }] = useProvideCourtResultMutation();
    const [retrieveTransgressionDetails, { isLoading: isLoadingTransgressions }] = useRetrieveTransgressionDetailsMutation();

    useEffect(() => {
        setIsLoading(isLoadingCourtResults || isLoadingTransgressions)
    }, [isLoadingCourtResults, isLoadingTransgressions])

    const onExit = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const provideCaseResultDetails = useCallback((noticeNumber: string) => {
        retrieveTransgressionDetails({ retrieveTransgressionDetailsRequest: {
                noticeNumber
            }
        }).unwrap().then((response: RetrieveTransgressionDetailsApiResponse) => {
            if (response.transgression) {
                setTransgressionDetails({...response.transgression, type: 'OverloadTransgression'} as OverloadTransgression);
            }

            provideCourtResults({
                provideCourtResultsRequest: {
                    criteria: {
                        type: "CourtResultNoticeNumberCriteria",
                        noticeNumber
                    }
                }
            }).unwrap().then((response: ProvideCourtResultsResponse) => {
                if (response.courtResult) {
                    setCourtResults([response.courtResult]);
                    setCaptureDialogOpen(true);
                }
            })
        })


    }, [provideCourtResults, setCourtResults, retrieveTransgressionDetails])

    const closeCaptureDialog = useCallback(() => {
        setCaptureDialogOpen(false);
    }, [setCaptureDialogOpen]);

    //Hotkeys
    useHotkeys(
        "CTRL+E",
        () => {
            onExit();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("exit")),
        }
    );

    return {
        setSearchValue,
        searchValue,
        onExit,
        provideCaseResultDetails,
        isLoading,
        captureDialogOpen,
        setCaptureDialogOpen,
        closeCaptureDialog,
        transgressionDetails
    }
}

export default useCourtResultHistoryManager;
