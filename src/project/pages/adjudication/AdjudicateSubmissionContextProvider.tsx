import { ReactNode, useMemo, useState, useCallback, useEffect } from "react";
import { AdjudicateSubmissionContext } from "./AdjudicateSubmissionContext";
import {
    Money,
    OverloadTransgressionDto,
    RtqsTransgressionDto,
    SnapshotCharge,
    SnapshotRtqsCharge,
    SubmissionDto,
    SubmissionOutcomeDto,
    SubmissionSummaryDto,
    TransgressionConfiguration,
    useAbortAdjudicationMutation,
    useAdjudicateSubmissionMutation,
    useFindTransgressionConfigurationQuery,
    useStartNextAdjudicationMutation,
    useProvideSubmissionSummaryMutation,
} from "../../redux/api/transgressionsApi";
import { useLocation, useNavigate } from "react-router-dom";
import { SubmissionStatus } from "../../enum/SubmissionStatus";
import { ChargebookType } from "../../enum/ChargebookType";
import { JsonObjectType } from "../../enum/JsonObjectType";
import useAdjudicationManager from "../../hooks/adjudication/AdjudicationManager";

type Props = {
    children: Readonly<ReactNode>
}

export interface TSubmissionOutcomeDto {
    submissionResult?:
    | "WITHDRAWN"
    | "DECLINED"
    | "ALTERNATIVE_CHARGE"
    | "DISCOUNTED";
    snapshotCharge?: SnapshotCharge;
    discountAmount?: Money;
}

export default function AdjudicateSubmissionContextProvider({ children }: Props) {
    // --- Begin logic from useAdjudicateSubmissionManager ---
    const [noticeNumber, setNoticeNumber] = useState<string>("")
    const [transgression, setTransgression] = useState<OverloadTransgressionDto | RtqsTransgressionDto>();
    const [transgressionConfig, setTransgressionConfig] = useState<TransgressionConfiguration | undefined>();
    const [submission, setSubmission] = useState<SubmissionDto>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAdjudicating, setIsAdjudicating] = useState<boolean>(false);
    const [isCaptured, setIsCaptured] = useState<boolean>(false);
    const [isCanceling, setIsCanceling] = useState<boolean>(false);
    const [allSubmissionsAdjudicated, setAllSubmissionsAdjudicated] = useState<boolean>(false);
    const [outcomes, setOutcomes] = useState<TSubmissionOutcomeDto[]>([]);
    const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
    const [submissionSummaries, setSubmissionSummaries] = useState<SubmissionSummaryDto[]>([]);
    const [sessionId, setSessionId] = useState<string | undefined>();


    const location = useLocation();
    const navigate = useNavigate();

    const courtNames = useMemo(() => {
        return location.state?.courtNames ?? {};
    }, [location]);

    useEffect(() => {
        if (location.state) {
            setTransgression(location.state.transgressionDetails);
            setSubmission(location.state.submissionDetails);
        }
    }, [location]);

    const [ findTransgressionConfigurationRequest, setFindTransgressionConfigurationRequest] = useState<{ authorityCode?: string, chargebookType?: ChargebookType }>();
    const { data: findTransgressionConfigurationResponse, isLoading: isTransgressionConfigLoading } = useFindTransgressionConfigurationQuery(
        findTransgressionConfigurationRequest!, {
            skip: !findTransgressionConfigurationRequest,
            refetchOnMountOrArgChange: true,
        }
    );

    const [adjudicateSubmissionApi, { isLoading: isLoadingAdjudication }] = useAdjudicateSubmissionMutation();

    const { sortSubmissionSummaries } = useAdjudicationManager();
    const [provideSubmissionSummary, { isLoading: loadingSubmissionSummary }] = useProvideSubmissionSummaryMutation();

    const [abortAdjudication, { isLoading: isLoadingAbortAdjudication }] = useAbortAdjudicationMutation();
    const [startNextAdjudication, { isLoading: isLoadingNextAdjudication }] = useStartNextAdjudicationMutation();

    useEffect(() => {
        setIsLoading(isTransgressionConfigLoading || isLoadingAdjudication || loadingSubmissionSummary || isLoadingAbortAdjudication || isLoadingNextAdjudication);
    }, [isTransgressionConfigLoading, isLoadingAdjudication, loadingSubmissionSummary, isLoadingAbortAdjudication, isLoadingNextAdjudication]);

    const startAdjudication = useCallback((noticeNumber: string) => {
        setNoticeNumber(noticeNumber);
    }, []);

    const cancelAdjudication = useCallback(() => {
        abortAdjudication({
            abortAdjudicationRequest: {
                noticeNumber,
                courtNames,
                sessionId: sessionId as string
            }
        }).unwrap().then((response) => {
            setOpenCancelDialog(false);
            if (response.adjudicationAborted) {
                navigate("/submission-adjudication/submission-summary", {
                    replace: true,
                    state: {
                        courtNames: courtNames
                    }
                });
            }
        });

    }, [abortAdjudication, noticeNumber, courtNames, sessionId, navigate]);

    const updateOutcomes = useCallback((updateOutcome: SubmissionOutcomeDto,
        result: "WITHDRAWN" | "DECLINED" | "ALTERNATIVE_CHARGE" | "DISCOUNTED" | undefined,
        discountAmount: number
    ) => {
        const newOutcomes = [...outcomes];
        newOutcomes.forEach((outcome) => {
            if (outcome.snapshotCharge?.snapshotId === updateOutcome.snapshotCharge?.snapshotId) {
                if (result) {
                    outcome.submissionResult = result;
                }

                if (discountAmount && updateOutcome.snapshotCharge?.fineAmount) {
                    outcome.discountAmount = {
                        amount: discountAmount,
                        currency: updateOutcome.snapshotCharge?.fineAmount?.currency
                    };

                }
            }
        });
        setOutcomes(newOutcomes);
    }, [outcomes]);

    useEffect(() => {
        if (noticeNumber && transgression && submission) {
            let chargebookType;
            if (transgression.type === JsonObjectType.OverloadTransgressionDto) {
                chargebookType = ChargebookType.OVERLOAD;
            } else if (transgression.type === JsonObjectType.RtqsTransgressionDto) {
                chargebookType = ChargebookType.RTQS;
            }
            setFindTransgressionConfigurationRequest({
                authorityCode: transgression.authorityCode,
                chargebookType: chargebookType
            });

            let outcomes: TSubmissionOutcomeDto[] = [];
            if (submission.submissionOutcomes?.length === 0 && transgression) {
                outcomes = []
                transgression.snapshotCharges.forEach((charge) => {
                    const isSnapshotRtqsCharge = (c: SnapshotCharge): c is SnapshotRtqsCharge =>
                        c.type === JsonObjectType.SnapshotRtqsCharge;

                    if (isSnapshotRtqsCharge(charge) && charge.alternativeCharge) {
                        return;
                    }

                    const outcome: TSubmissionOutcomeDto = {
                        snapshotCharge: charge,
                        discountAmount: undefined,
                        submissionResult: undefined
                    }
                    outcomes.push(outcome);
                })
            } else {
                outcomes = submission.submissionOutcomes ?? [];
            }

            setOutcomes(outcomes);
        }
    }, [noticeNumber, submission, transgression]);

    useEffect(() => {
        if (findTransgressionConfigurationResponse) {
            setTransgressionConfig(findTransgressionConfigurationResponse.transgressionConfigurations?.[0]);
        }
    }, [findTransgressionConfigurationResponse]);

    const getRegisteredSubmissions = useCallback((): Promise<SubmissionSummaryDto[]> => {
        return new Promise((resolve) => {
            provideSubmissionSummary({
                provideSubmissionSummaryRequest: {
                    submissionStatuses: [SubmissionStatus.REGISTERED],
                    courtNames: courtNames,
                    currentDate: new Date().toISOString(),
                }
            }).unwrap().then((response) => {
                if (response.submissionSummaries) {
                    const summaries = sortSubmissionSummaries(response.submissionSummaries) ?? [];
                    resolve(summaries);
                }
            })
        })

    }, [courtNames, provideSubmissionSummary, sortSubmissionSummaries]);

    const adjudicateSubmission = useCallback(() => {
        setIsAdjudicating(false);

        if (transgression && outcomes.length > 0) {
            adjudicateSubmissionApi({
                adjudicateSubmissionRequest: {
                    noticeNumber,
                    submissionOutcomes: outcomes.map(item => {
                        return item as SubmissionOutcomeDto
                    }),
                    courtNames
                }
            }).then(() => {
                getRegisteredSubmissions().then((submissionList) => {
                    if (submissionList && submissionList.length > 0) {
                        setIsCaptured(true);
                    } else {
                        setAllSubmissionsAdjudicated(true);
                    }
                });
            }).catch(() => {
                setIsAdjudicating(false);
            })
        }

    }, [transgression, outcomes, adjudicateSubmissionApi, noticeNumber, courtNames, getRegisteredSubmissions]);

    const initiateNextAdjudication = useCallback(() => {
        setIsCaptured(false);

        startNextAdjudication({
            startNextAdjudicationRequest: {
                courtNames: courtNames,
                sessionId: sessionId as string
            }
        }).unwrap().then((response) => {
            if (response.submissionSummary) {
                navigate(`/submission-adjudication/adjudicate-submission/${response.submissionSummary.noticeNumber}`, {
                    replace: true,
                    state: {
                        submissions: [response.submissionSummary],
                        transgressionDetails: response.transgression,
                        submissionDetails: response.submission,
                        courtNames: courtNames
                    }
                })
            } else {
                setAllSubmissionsAdjudicated(true);
            }
        });
    }, [startNextAdjudication, courtNames, sessionId, navigate]);

    const endAdjudication = useCallback(() => {
        setAllSubmissionsAdjudicated(false);
        navigate(`/submission-adjudication/find-court`, { replace: true });
    }, [navigate]);

    // --- End logic from useAdjudicateSubmissionManager ---

    const contextValue = useMemo(() => ({
        submission, setSubmission, outcomes, transgression, transgressionConfig, isLoading, updateOutcomes, adjudicateSubmission, cancelAdjudication,
        isAdjudicating, setIsAdjudicating, isCaptured, setIsCaptured, isCanceling, setIsCanceling, startAdjudication, initiateNextAdjudication,
        allSubmissionsAdjudicated, endAdjudication, openCancelDialog, setOpenCancelDialog, submissionSummaries, setSubmissionSummaries,
        sessionId, setSessionId
    }), [
        submission, setSubmission, outcomes, transgression, transgressionConfig, isLoading, updateOutcomes, adjudicateSubmission, cancelAdjudication,
        setIsAdjudicating, isAdjudicating, isCaptured, setIsCaptured, isCanceling, setIsCanceling, startAdjudication, initiateNextAdjudication,
        allSubmissionsAdjudicated, endAdjudication, openCancelDialog, setOpenCancelDialog, submissionSummaries, setSubmissionSummaries,
        sessionId, setSessionId
    ]);

    return (
        <AdjudicateSubmissionContext.Provider value={contextValue}>
            {children}
        </AdjudicateSubmissionContext.Provider>
    );
}
