import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CourtCaseEntry,
    useProvideCourtResultSummaryMutation,
    ProvideCourtResultSummaryApiArg,
    ProvideCourtResultSummaryResponse,
    CourtResultSummary,
    Court,
    useRetrieveTransgressionDetailsMutation,
    RetrieveTransgressionDetailsApiArg
} from "../../redux/api/transgressionsApi";
import { useHotkeys } from "react-hotkeys-hook";
import { t } from "i18next";
import { CourtData } from "./CourtResultManager";
import dayjs from "dayjs";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import { CourtDocumentsListTable } from "../../components/court-documents/CourtDocumentsListTable";

const useCourtCaseListManager = (
    courtCaseList: CourtCaseEntry[],
    setSearchValue: (value: string) => void,
    courtData: CourtData,
    setDisableHistoryButton: (value: boolean) => void,
    courts: Court[],
) => {
    const navigate = useNavigate();
    const configContext = useContext(ConfigContext)

    const [provideCourtResultSummary, { isLoading: isLoadingResultSummary }] = useProvideCourtResultSummaryMutation();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [courtResultHistory, setCourtResultHistory] = useState<CourtResultSummary[] | undefined>([]);

    useEffect(() => {
        setIsLoading(isLoadingResultSummary);
    }, [isLoadingResultSummary])

    useEffect(() => {
        const resultSummaryRequest: ProvideCourtResultSummaryApiArg = {
            provideCourtResultSummaryRequest: {
                courtDate: courtData.courtDate,
                courtName: courtData.courtName,
                courtRoom: courtData.courtRoom
            }
        }

        provideCourtResultSummary(resultSummaryRequest).unwrap()
            .then((response: ProvideCourtResultSummaryResponse) => {
                if (response.courtResultSummaries?.length === 0) {
                    setDisableHistoryButton(true)
                } else {
                    setDisableHistoryButton(false)
                    setCourtResultHistory(response.courtResultSummaries);
                }
            })
    }, [courtData, provideCourtResultSummary, setDisableHistoryButton])

    const handleSearchCourtCase = (searchValue: string) => {
        setSearchValue(searchValue);
    };

    const [triggerRetrieveTransgressionDetails] = useRetrieveTransgressionDetailsMutation();

    const handleCourtCaseClick = (courtCase: CourtDocumentsListTable) => {
        const request: RetrieveTransgressionDetailsApiArg = {
            retrieveTransgressionDetailsRequest: {
                noticeNumber: courtCase.noticeNo
            }
        }
        triggerRetrieveTransgressionDetails(request).unwrap().then((response) => {
            if (response.transgression) {
                navigate(`/court-documents/court-results/court-case-list/capture-court-results/${courtCase.noticeNo}`, {
                    replace: true,
                    state: {
                        courtCaseDetails: { ...response.transgression},
                        courtData: courtData,
                        courtCaseList: courtCaseList,
                        courts
                    }
                });
            }
        });
    };

    const provideCourtResultHistory = useCallback(() => {

        const courtResult = courtResultHistory?.map((item) => {
            return {
                noticeNo: item.noticeNumber,
                offenderName: item.offenderName,
                plateNo: item.plateNumber,
                status: item.transgressionStatus,
                courtDate: dayjs(item.courtDate).format('DD/MM/YYYY'),
                courtName: item.courtName,
                courtResult: item.courtOutcome
            }
        });
        navigate("/court-documents/court-results/court-result-history", {
            state: {
                courtResultHistory: courtResult
            }
        });
    }, [navigate, courtResultHistory])

    // Add view history redirect
    const handleOnClickViewHistory = () => {
        provideCourtResultHistory();
    }

    const getRows = useCallback((): CourtDocumentsListTable[] => {
        return courtCaseList.map((courtCase) => {
            return {
                noticeNo: courtCase.noticeNumber,
                offenderName: courtCase.offenderName ?? "",
                plateNo: courtCase.plateNumber,
                status: courtCase.transgressionStatus,
                courtDate: dayjs(courtCase.courtDate).format(configContext.dateTime.dateFormat),
                courtName: courtCase.courtName
            };
        })
    }, [courtCaseList, configContext]);

    const handleOnExit = () => {
        navigate('/court-documents/court-results', { replace: true });
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
            description: String(t("exit")),
        }
    );

    useHotkeys(
        "ALT+H",
        () => {
            handleOnClickViewHistory();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("viewHistory")),
        }
    );

    return {
        getRows,
        handleSearchCourtCase,
        handleCourtCaseClick,
        handleOnClickViewHistory,
        handleOnExit,
        isLoading
    }
};

export default useCourtCaseListManager;
