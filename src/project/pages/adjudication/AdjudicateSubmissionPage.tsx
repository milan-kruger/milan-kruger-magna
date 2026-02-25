import { useContext, useEffect, useMemo, useState } from "react";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import SubmissionDetails, { SubmissionDetailsData } from "../../components/submission/SubmissionDetails";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import dayjs from "dayjs";
import { Box, Grid } from "@mui/material";
import TmAdjudicationOutcomes from "../../components/adjudication/AdjudicationOutcomes";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import { t } from "i18next";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { CheckCircleOutline } from "@mui/icons-material";
import { useHotkeys } from "react-hotkeys-hook";
import AuthService from "../../../framework/auth/authService";
import { useParams } from "react-router-dom";
import { OverloadTransgressionDto, RtqsTransgressionDto, TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import { AdjudicateSubmissionContext } from "./AdjudicateSubmissionContext";

const Page = () => {
    const configContext = useContext(ConfigContext);
    const adjudicationContext = useContext(AdjudicateSubmissionContext);
    const { noticeNumber } = useParams();

    useEffect(() => {
        if (noticeNumber) {
            adjudicationContext.startAdjudication(noticeNumber);
        }
    }, [adjudicationContext, noticeNumber]);

    useHotkeys("ALT+S", () => adjudicationContext.setIsAdjudicating(true), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: AuthService.hasRole('ADJUDICATION_MAINTAIN'),
        description: t("submitAdjudication") ?? undefined,
    });

    useHotkeys("ALT+C", () => adjudicationContext.setOpenCancelDialog(true), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: AuthService.hasRole('ADJUDICATION_MAINTAIN'),
        description: t("confirmCancelAdjudication") ?? undefined,
    });

    const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetailsData>({} as SubmissionDetailsData);

    useEffect(() => {
        if (adjudicationContext.submission) {
            const submissionDetailsData: SubmissionDetailsData = {
                submissionAlreadyExists: true,
                noticeNumber: adjudicationContext.submission.noticeNumber,
                transgressionDate: dayjs(adjudicationContext.submission.transgressionDate).format(configContext.dateTime.dateFormat),
                offenderName: adjudicationContext.submission.offenderName ?? "",
                transgressionStatus: adjudicationContext.submission.transgressionStatus,
                submissionDeadline: dayjs(adjudicationContext.submission.submissionDeadline).format(configContext.dateTime.dateFormat),
                submissionDate: dayjs(adjudicationContext.submission.submissionDate),
                submissionDateValid: adjudicationContext.submission.transgressionDate !== undefined,
                submissionStatus: adjudicationContext.submission.submissionStatus,
                submissionRegistrationDate: dayjs(adjudicationContext.submission.submissionRegistrationDate).format(configContext.dateTime.dateFormat),
                submissionOutcome: adjudicationContext.submission.submissionOutcomes,
                submissionReason: adjudicationContext.submission.submissionReason ?? "",
                transgression: adjudicationContext.transgression as RtqsTransgressionDto | OverloadTransgressionDto,
                transgressionConfig: adjudicationContext.transgressionConfig as TransgressionConfiguration,
            };
            setSubmissionDetails(submissionDetailsData);
        }
    }, [adjudicationContext, configContext]);

    return (
        <>
            <Box marginBottom={22}>
                {adjudicationContext.isLoading ? <TmLoadingSpinner testid="loadingSpinner" /> :
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, md: 6, lg: 6 }} display={'grid'}>
                            <SubmissionDetails componentData={submissionDetails}
                                onResetFields={() => { }} onResetSearch={() => { }} onSubmissionReasonChange={() => { }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                            <TmAdjudicationOutcomes
                                submission={adjudicationContext.submission}
                                outcomes={adjudicationContext.outcomes}
                                transgression={adjudicationContext.transgression}
                                readonly={adjudicationContext.submission?.submissionStatus === "ADJUDICATED"}
                            />
                        </Grid>
                    </Grid>
                }
            </Box>

            <TmDialog
                testid="dialogConfirmAdjudication"
                title={t("confirmAdjudication")}
                message={t("confirmAdjudicationMessage")}
                isOpen={adjudicationContext.isAdjudicating}
                cancelLabel={t("cancel")}
                cancelIcon={<CancelOutlinedIcon />}
                onCancel={() => { adjudicationContext.setIsAdjudicating(false); }}
                showConfirmButton={true}
                confirmIcon={<CheckCircleOutline />}
                confirmLabel={t("confirm")}
                onConfirm={() => { adjudicationContext.adjudicateSubmission(); }}
            />

            <TmDialog
                testid="dialogAdjudicationCaptured"
                title={t("confirmAdjudicationResultsCaptured")}
                message={t("confirmAdjudicationResultsCapturedMessage")}
                isOpen={adjudicationContext.isCaptured}
                cancelLabel={t("close")}
                cancelIcon={<CancelOutlinedIcon />}
                onCancel={() => { adjudicationContext.initiateNextAdjudication(); }}
            />

            <TmDialog
                testid="dialogSubmissionsAdjudicated"
                title={t("submissionsAdjudicated")}
                message={t("allSubmissionsAdjudicated")}
                isOpen={adjudicationContext.allSubmissionsAdjudicated}
                cancelLabel={t("close")}
                cancelIcon={<CancelOutlinedIcon />}
                onCancel={() => { adjudicationContext.endAdjudication(); }}
            />

            <TmDialog
                testid="dialogConfirmCancel"
                title={t("confirmCancelAdjudication")}
                message={t("confirmCancelAdjudicationMessage")}
                isOpen={adjudicationContext.openCancelDialog}
                cancelLabel={t("close")}
                cancelIcon={<CancelOutlinedIcon />}
                onCancel={() => { adjudicationContext.setOpenCancelDialog(false); }}
                showConfirmButton={true}
                confirmIcon={<CheckCircleOutline />}
                confirmLabel={t("confirm")}
                onConfirm={() => { adjudicationContext.cancelAdjudication(); }}
            />
        </>
    );
}

const AdjudicateSubmissionPage = () => {
    return (
        <SecuredContent
            accessRoles={useMemo(() => ['ADJUDICATION_MAINTAIN'], [])}
        >
            <Page />
        </SecuredContent>
    );
}

export default AdjudicateSubmissionPage;
