import { useCallback, useContext, useMemo, useState } from "react";
import { Court, SubmissionSummaryDto, useInitialiseAdjudicationQuery, useProvideSubmissionSummaryMutation, useStartNextAdjudicationMutation } from "../../redux/api/transgressionsApi";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FormState } from "react-hook-form";
import { SubmissionStatus } from "../../enum/SubmissionStatus";
import dayjs, { Dayjs } from "dayjs";
import { AdjudicateSubmissionContext } from "../../pages/adjudication/AdjudicateSubmissionContext";

const useAdjudicationManager = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const location = useLocation();
    const courtNames = useMemo(() => {
        return location.state?.courtNames ?? null;
    }, [location]);

    const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
    const [courts, setCourts] = useState<Court[]>();
    const initialiseAdjudication = useInitialiseAdjudicationQuery();
    const [provideSubmissionSummary] = useProvideSubmissionSummaryMutation();
    const [startNextAdjudication] = useStartNextAdjudicationMutation();
    const {
        sessionId,
        submissionSummaries,
        setSubmissionSummaries
    } = useContext(AdjudicateSubmissionContext);

    const resetCourtSelection = () => {
        setSelectedCourts([]);
    }

    const handleCourtSelection = (value: string[]) => {
        if (value.includes(t("All Courts"))) {
            setSelectedCourts(getCourtNames().filter(court => court !== t("All Courts")));
        } else {
            setSelectedCourts(value);
        }
    };

    const getCourtNames = (): string[] => {
        const courtNames: string[] = [t("All Courts")];
        if (courts && Array.isArray(courts)) {
            for (const court of courts) {
                if (court.courtName) {
                    courtNames.push((court.courtName)!);
                }
            }
        }
        return courtNames;
    }

    const handleFindCourts = useCallback((formState: FormState<{ courtNames: string[] }>) => {
        if (!formState.errors?.courtNames) {
            navigate('/submission-adjudication/submission-summary',
            {
                replace: true,
                state:
                {
                    courtNames: selectedCourts
                }
            });
        }
    }, [navigate, selectedCourts]);

    const getSubmissionStatusList = (): SubmissionStatus[] => {
        return [SubmissionStatus.PENDING_ADJUDICATION, SubmissionStatus.REGISTERED];
    };

    const hasMissingCourtResult = (courtResult: boolean): boolean => !courtResult;

    const isCourtDateInPast = (currentDate: Dayjs, courtDate: Dayjs): boolean => currentDate.isAfter(courtDate);

    const checkDisplayBlockResult = useCallback((courtResult: boolean, currentDate: Dayjs, courtDate: Dayjs) => {
        const shouldBlock = hasMissingCourtResult(courtResult) && isCourtDateInPast(currentDate, courtDate);
        return shouldBlock ? t('courtResultsRequired') : '';
    }, [t]);

    const sortSubmissionSummaries = useCallback((summaries: SubmissionSummaryDto[]) => {
        // Filter submissions to only include those with 'Registered' status
        const registeredSubmissions = summaries.filter(submission => submission.submissionStatus === SubmissionStatus.REGISTERED);

        // Filter submissions to not include those with block 'Court results required'
        const courtResultsRequiredSubmissions = registeredSubmissions.filter(submission => {
            const courtResultsAvailable = submission.courtResult;
            const displayBlockResult = checkDisplayBlockResult(courtResultsAvailable, dayjs(), dayjs(submission.courtDate));
            return displayBlockResult !== t('courtResultsRequired');
        });

        // Ensure registeredSubmissions is not empty
        if (!courtResultsRequiredSubmissions.length) return;

        // Sort registered submissions by nearest court date and notice number (ascending for same dates)
        const sortedSubmissions: SubmissionSummaryDto[] = [];

        // Insert submissions into the sorted array
        for (const submission of courtResultsRequiredSubmissions) {
            let inserted = false;
            const submissionDate = new Date(submission.courtDate).setHours(0, 0, 0, 0); // Ignore time

            for (let i = 0; i < sortedSubmissions.length; i++) {
                const existingDate = new Date(sortedSubmissions[i].courtDate).setHours(0, 0, 0, 0); // Ignore time

                // Compare by court date (earliest first), if dates are the same, sort by notice number (ascending)
                if (submissionDate < existingDate ||
                    (submissionDate === existingDate && submission.noticeNumber < sortedSubmissions[i].noticeNumber)) {
                    sortedSubmissions.splice(i, 0, submission);
                    inserted = true;
                    break;
                }
            }

            if (!inserted) {
                sortedSubmissions.push(submission);
            }
        }

        return sortedSubmissions;
    }, [checkDisplayBlockResult, t]);

    const handleCourtsSubmissions = useCallback(() => {
        provideSubmissionSummary({
            provideSubmissionSummaryRequest: {
                submissionStatuses: getSubmissionStatusList(),
                courtNames: courtNames,
                currentDate: new Date().toISOString(),
            }
        }).unwrap().then((response) => {
            if (submissionSummaries.length === 0 && response.submissionSummaries) {
                setSubmissionSummaries(response.submissionSummaries);
            }
        })
    }, [provideSubmissionSummary, courtNames, submissionSummaries, setSubmissionSummaries]);

    const handleNextSubmission = useCallback(() => {
        return startNextAdjudication({
            startNextAdjudicationRequest: {
                courtNames: courtNames,
                sessionId: sessionId as string
            }
        }).unwrap().then((response) => {
            if (response) {
                navigate(`/submission-adjudication/adjudicate-submission/${response.submissionSummary.noticeNumber}`, {
                    replace: true,
                    state: {
                        submissions: response.submissionSummary,
                        transgressionDetails: response.transgression,
                        submissionDetails: response.submission,
                        courtNames: courtNames
                    }
                });
            }
        });
    }, [courtNames, navigate, sessionId, startNextAdjudication]);

    return {
        t,
        selectedCourts,
        setSelectedCourts,
        setCourts,
        initialiseAdjudication,
        submissionSummaries,
        sortSubmissionSummaries,
        checkDisplayBlockResult,
        handleNextSubmission,
        handleCourtsSubmissions,
        resetCourtSelection,
        handleCourtSelection,
        handleFindCourts,
        getCourtNames
    }
};

export default useAdjudicationManager;
