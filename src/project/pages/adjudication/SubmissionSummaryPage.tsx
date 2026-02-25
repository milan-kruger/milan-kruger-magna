import { Box, Paper, styled, Theme, useMediaQuery, Grid } from "@mui/material";
import { memo, useCallback, useEffect, useMemo } from "react";
import SubmissionSummaryTable from "../../components/adjudication/submission-summary/SubmissionSummaryTable";
import TmButton from "../../../framework/components/button/TmButton";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import AuthService from "../../../framework/auth/authService";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import { SubmissionStatus } from "../../enum/SubmissionStatus";
import dayjs from "dayjs";
import TmTypography from "../../../framework/components/typography/TmTypography";
import useAdjudicationManager from "../../hooks/adjudication/AdjudicationManager";

const SubmissionSummaryPage = () => {
    const { t } = useTranslation();
    const { submissionSummaries, checkDisplayBlockResult, handleCourtsSubmissions, handleNextSubmission } = useAdjudicationManager();

    const handleAdjudicateClick = useCallback(() => {
        handleNextSubmission();
    }, [handleNextSubmission]);

    useEffect(() => {
        handleCourtsSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const Border = styled(Paper)(() => ({
        border: '1px solid #a6a6a6',
        borderRadius: '5px',
        padding: '20px',
        width: '90%',
        margin: '15px auto 15px auto',
        flexGrow: 1
    }));

    const isMiniMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

    useHotkeys("CTRL+A", () => handleAdjudicateClick(), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: AuthService.hasRole('ADJUDICATION_MAINTAIN'),
        description: t("adjudicate") ?? undefined
    });

    return (
        <SecuredContent
            accessRoles={useMemo(() => ['ADJUDICATION_MAINTAIN'], [])}
        >
            <Border>
                <Grid container direction="column" spacing={1}>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{
                            marginBottom: 10,
                            display: isMiniMobile ? 'grid' : 'flex',
                            alignItems: 'center',
                        }} gap={5}>
                            <TmTypography testid="submissionSummaryTitle">
                                {t('adjudicateSubmissionLabel')}
                            </TmTypography>
                            <TmButton
                                sx={{ marginLeft: isMiniMobile ? 0 : 10 }}
                                testid={"adjudicateSubmissionButton"}
                                onClick={handleAdjudicateClick}
                                color={"primary"}
                                variant={"contained"}
                                size={"medium"}
                                disabled={
                                    submissionSummaries?.length === 0 ||
                                    submissionSummaries?.every(submission =>
                                        submission.submissionStatus !== SubmissionStatus.REGISTERED) ||
                                    submissionSummaries?.every(submission =>
                                        checkDisplayBlockResult(
                                            submission.courtResult,
                                            dayjs(),
                                            dayjs(submission.courtDate)
                                        ) === t('courtResultsRequired'))
                                }
                            >
                                {t('adjudicate')}
                            </TmButton>
                        </Box>
                    </Grid>
                    <SubmissionSummaryTable
                        submissionSummaries={submissionSummaries} />
                </Grid>
            </Border>
        </SecuredContent>
    );
};

export default memo(SubmissionSummaryPage);
