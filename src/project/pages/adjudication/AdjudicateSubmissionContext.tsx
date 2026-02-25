import { createContext, Dispatch, SetStateAction } from "react";
import {  OverloadTransgressionDto, RtqsTransgressionDto, SubmissionDto, SubmissionOutcomeDto, SubmissionSummaryDto, TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import { TSubmissionOutcomeDto } from "./AdjudicateSubmissionContextProvider";

export interface AdjudicateSubmissionContextInterface {
    submission: SubmissionDto | undefined;
    outcomes: TSubmissionOutcomeDto[] | SubmissionOutcomeDto[] | undefined;
    transgression: OverloadTransgressionDto | RtqsTransgressionDto | undefined;
    transgressionConfig: TransgressionConfiguration | undefined;
    isLoading: boolean;
    adjudicateSubmission: () => void;
    isAdjudicating: boolean;
    setIsAdjudicating: Dispatch<SetStateAction<boolean>>
    isCaptured: boolean;
    setIsCaptured: Dispatch<SetStateAction<boolean>>;
    cancelAdjudication: () => void;
    updateOutcomes: (outcome: SubmissionOutcomeDto, result: "WITHDRAWN" | "DECLINED" | "ALTERNATIVE_CHARGE" | "DISCOUNTED" | undefined, discountAmount: number) => void;
    isCanceling: boolean;
    setIsCanceling: Dispatch<SetStateAction<boolean>>;
    startAdjudication: (noticeNumber: string) => void;
    initiateNextAdjudication: () => void;
    allSubmissionsAdjudicated: boolean;
    endAdjudication: () => void;
    openCancelDialog: boolean;
    setOpenCancelDialog: Dispatch<SetStateAction<boolean>>;
    submissionSummaries: SubmissionSummaryDto[];
    setSubmissionSummaries: Dispatch<SetStateAction<SubmissionSummaryDto[]>>;
    sessionId: string | undefined;
    setSessionId: Dispatch<SetStateAction<string | undefined>>;
}

export const AdjudicateSubmissionContext = createContext({
} as AdjudicateSubmissionContextInterface);
