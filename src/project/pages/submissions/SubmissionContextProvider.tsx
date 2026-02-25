import { ReactNode, useCallback, useMemo, useState } from "react";
import { OverloadTransgressionDto, RtqsTransgressionDto, SubmissionDto, TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { SubmissionContext } from "./SubmissionContext";

type Props = {
    children: Readonly<ReactNode>
}

export default function SubmissionContextProvider({ children }: Props) {

    const { t } = useTranslation();

    const [submissionDate, setSubmissionDate] = useState<Dayjs>();
    const [submissionReason, setSubmissionReason] = useState<string>();
    const [searchValue, setSearchValue] = useState<string>('');
    const [transgression, setTransgression] = useState<OverloadTransgressionDto | RtqsTransgressionDto | undefined>();
    const [transgressionConfig, setTransgressionConfig] = useState<TransgressionConfiguration | undefined>();
    const [submission, setSubmission] = useState<SubmissionDto>();
    const [submissionDeadline, setSubmissionDeadline] = useState<string>();
    const [submissionAlreadyExists, setSubmissionAlreadyExists] = useState<boolean>();
    const [submissionDateError, setSubmissionDateError] = useState<string | undefined>(!submissionDate ? t('submissionDateRequired') : undefined);
    const [searchValueError, setSearchValueError] = useState<string>();

    const resetFields = useCallback(() => {
        setTransgression(undefined);
        setTransgressionConfig(undefined);
        setSubmission(undefined);
        setSubmissionDeadline(undefined);
        setSubmissionDate(undefined);
        setSubmissionDateError(t('submissionDateRequired'));
        setSubmissionAlreadyExists(undefined);
        setSubmissionReason(undefined);
    }, [t]);

    const resetSearch = useCallback(() => {
        setSearchValue('');
        setSearchValueError(undefined);
    }, []);

    const checkSubmissionDateValidity = useCallback((date: Dayjs | undefined) => {
        if (!date) {
            setSubmissionDateError(t('submissionDateRequired'));
        }
        else if (!date.isValid()) {
            setSubmissionDateError(t('submissionDateInvalid'));
        }
        else if (submissionDeadline && date.isAfter(dayjs(submissionDeadline))) {
            setSubmissionDateError(t('submissionDateAfterDeadline'));
        }
        else if (transgression && date.isBefore(dayjs(transgression?.transgressionDate).startOf('day'))) {
            setSubmissionDateError(t('submissionDateBeforeTransgressionDate'));
        }
        else {
            setSubmissionDateError(undefined);
        }
    }, [t, submissionDeadline, transgression]);

    const contextValue = useMemo(() => ({
        submissionDate,
        submissionReason,
        searchValue,
        transgression,
        transgressionConfig,
        submission,
        submissionDeadline,
        submissionAlreadyExists,
        submissionDateError,
        searchValueError,
        resetFields,
        resetSearch,
        setSubmissionDate,
        setSubmissionReason,
        setSearchValue,
        setTransgression,
        setTransgressionConfig,
        setSubmission,
        setSubmissionDeadline,
        setSubmissionAlreadyExists,
        setSubmissionDateError,
        setSearchValueError,
        checkSubmissionDateValidity,
    }), [
        submissionDate,
        submissionReason,
        searchValue,
        transgression,
        transgressionConfig,
        submission,
        submissionDeadline,
        submissionAlreadyExists,
        submissionDateError,
        searchValueError,
        resetFields,
        resetSearch,
        setSubmissionDate,
        setSubmissionReason,
        setSearchValue,
        setTransgression,
        setTransgressionConfig,
        setSubmission,
        setSubmissionDeadline,
        setSubmissionAlreadyExists,
        setSubmissionDateError,
        setSearchValueError,
        checkSubmissionDateValidity
    ]);

    return (
        <SubmissionContext.Provider value={contextValue}>
            {children}
        </SubmissionContext.Provider>
    );
}
