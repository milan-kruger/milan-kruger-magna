import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { SubmissionContext } from "../../pages/submissions/SubmissionContext";
import { useRetrieveSubmissionByNoticeNumberMutation } from "../../redux/api/transgressionsApi";

const useSubmissionManager = () => {
    const { t } = useTranslation();
    const {
        searchValue,
        resetFields,
        setSubmissionDate,
        setSubmissionReason,
        setSearchValue,
        setTransgression,
        setTransgressionConfig,
        setSubmission,
        setSubmissionDeadline,
        setSubmissionAlreadyExists,
        setSearchValueError,
        checkSubmissionDateValidity
    } = useContext(SubmissionContext);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [retrieveSubmissionRequest, { isLoading: loadingRetrieveSubmission }] = useRetrieveSubmissionByNoticeNumberMutation();

    useEffect(() => {
        setIsLoading(loadingRetrieveSubmission);
    }, [loadingRetrieveSubmission]);

    const handleSearch = () => {
        retrieveSubmissionRequest({
            retrieveSubmissionRequest: {
                noticeNumber: searchValue
            }
        }).unwrap().then((response) => {
                resetFields();
                setTransgression(response.transgression);
                setTransgressionConfig(response.transgressionConfiguration);
                setSubmission(response.submission);
                setSubmissionDeadline(response.submissionDeadline);
                setSubmissionAlreadyExists(!!response.submission);

                if (response.transgression) {
                    setSearchValueError(undefined);
                }
                else if (response.transgressionStatusIsIssued === false) {
                    setSearchValueError(t('transgressionNotIssuedToRegisterSubmission'));
                }
                else {
                    setSearchValueError(t('transgressionNotFound'));
                }

                if (response.submission) {
                    setSubmissionDate(dayjs(response.submission.submissionDate));
                    setSubmissionDeadline(response.submission.submissionDeadline);
                    setSubmissionReason(response.submission.submissionReason);
                    checkSubmissionDateValidity(dayjs(response.submission.submissionDate));
                }
        }).catch(() => {
            resetFields();
            setTransgression(undefined);
            setTransgressionConfig(undefined);
            setSubmission(undefined);
            setSubmissionDeadline(undefined);
            setSearchValueError(t('findTransgressionError'));
        });
    }

    const handleSearchChange = (searchValue: string) => {
        setSearchValue(searchValue);
    }

    return {
        t,
        searchValue,
        loadingRetrieveSubmission,
        handleSearch,
        handleSearchChange,
        isLoading
    };
};

export default useSubmissionManager;
