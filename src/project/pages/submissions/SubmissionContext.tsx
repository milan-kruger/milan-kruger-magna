import { createContext} from "react";
import { OverloadTransgressionDto, RtqsTransgressionDto, SubmissionDto, TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import { Dayjs } from "dayjs";

interface SubmissionContextInterface {
    submissionDate: Dayjs | undefined;
    submissionReason: string | undefined;
    searchValue: string;
    transgression: OverloadTransgressionDto | RtqsTransgressionDto | undefined;
    transgressionConfig: TransgressionConfiguration | undefined;
    submission: SubmissionDto | undefined;
    submissionDeadline: string | undefined;
    submissionAlreadyExists: boolean | undefined;
    submissionDateError: string | undefined;
    searchValueError: string | undefined;
    resetFields: () => void;
    resetSearch: () => void;
    setSubmissionDate: (date: Dayjs | undefined) => void;
    setSubmissionReason: (reason: string | undefined) => void;
    setSearchValue: (value: string) => void;
    setTransgression: (transgression: OverloadTransgressionDto | RtqsTransgressionDto | undefined) => void;
    setTransgressionConfig: (config: TransgressionConfiguration | undefined) => void;
    setSubmission: (submission: SubmissionDto | undefined) => void;
    setSubmissionDeadline: (date: string | undefined) => void;
    setSubmissionAlreadyExists: (exists: boolean) => void;
    setSubmissionDateError: (error: string | undefined) => void;
    setSearchValueError: (error: string | undefined) => void;
    checkSubmissionDateValidity: (date: Dayjs | undefined) => void;
}

export const SubmissionContext = createContext({
    submissionDate: undefined,
    submissionReason: undefined,
    searchValue: '',
    transgression: undefined,
    transgressionConfig: undefined,
    submission: undefined,
    submissionDeadline: undefined,
    submissionAlreadyExists: undefined,
    submissionDateError: undefined,
    searchValueError: undefined,
    resetFields: () => { },
    resetSearch: () => { },
    setSubmissionDate: () => { },
    setSubmissionReason: () => { },
    setSearchValue: () => { },
    setTransgression: () => { },
    setTransgressionConfig: () => { },
    setSubmission: () => { },
    setSubmissionDeadline: () => { },
    setSubmissionAlreadyExists: () => { },
    setSubmissionDateError: () => { },
    setSearchValueError: () => { },
    checkSubmissionDateValidity: () => { },
} as SubmissionContextInterface);
