import { Box, Dialog, DialogActions, DialogContent, Grid, Stack, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import SubmissionDetailItem from "./SubmissionDetailItem";
import TmTextArea from "../../../framework/components/textfield/TmTextArea";
import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import TmButton from "../../../framework/components/button/TmButton";
import { OverloadTransgressionDto, RegisterSubmissionApiArg, RtqsTransgressionDto, SubmissionOutcomeDto, TransgressionConfiguration, useRegisterSubmissionMutation } from "../../redux/api/transgressionsApi";
import dayjs from "dayjs";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import TransgressionView from "./TransgressionView";
import { useHotkeys } from "react-hotkeys-hook";
import { removeUnderscores, titleCaseWord } from "../../../framework/utils";
import { CalendarTodayOutlined } from "@mui/icons-material";
import { ConfigContext } from "../../../framework/config/ConfigContext";

export interface SubmissionDetailsData {
    submissionAlreadyExists: boolean;
    submissionDeadline: string;
    noticeNumber: string;
    transgressionDate: string;
    offenderName?: string;
    transgressionStatus: string;
    submissionDate: dayjs.Dayjs;
    submissionDateValid: boolean;
    submissionReason: string;
    submissionStatus?: string;
    submissionRegistrationDate?: string;
    submissionOutcome?: SubmissionOutcomeDto[];
    transgression: OverloadTransgressionDto | RtqsTransgressionDto;
    transgressionConfig: TransgressionConfiguration;
};

type Props = {
    componentData: SubmissionDetailsData;
    onSubmissionReasonChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onResetSearch: () => void;
    onResetFields: () => void;
};

const SubmissionDetails = ({ componentData,
    onSubmissionReasonChange, onResetSearch, onResetFields }: Props) => {

    const { t } = useTranslation();
    const theme = useTheme();
    const configContext = useContext(ConfigContext);

    const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
    const [openFeedbackDialog, setOpenFeedbackDialog] = useState<boolean>(false);
    const [viewTransgression, setViewTransgression] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);

    const [registerSubmissionMutation, { isLoading: loadingRegisteringSubmission }] = useRegisterSubmissionMutation();

    const handleSubmissionReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        onSubmissionReasonChange(event);
    }

    const handleRegisterSubmission = () => {
        setOpenConfirmDialog(true);
    };

    const handleCancelSubmission = () => {
        setOpenConfirmDialog(false);
    };

    const handleCloseFeedbackDialog = () => {
        onResetSearch();
        onResetFields();
        setOpenFeedbackDialog(false);
    }

    const handleCloseTransgressionView = () => {
        setViewTransgression(false);
    }

    const handleConfirmSubmission = useCallback(() => {
        if (componentData.submissionDateValid) {
            const registerSubmissionRequest: RegisterSubmissionApiArg = {
                registerSubmissionRequest: {
                    submissionReason: componentData.submissionReason,
                    submissionDate: componentData.submissionDate.format('YYYY-MM-DD'),
                    submissionDeadline: dayjs(componentData.submissionDeadline, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                    noticeNumber: componentData.transgression.noticeNumber.number,
                }
            };
            registerSubmissionMutation(registerSubmissionRequest)
                .then(() => {
                    setOpenConfirmDialog(false);
                    setOpenFeedbackDialog(true);
                }).catch(() => {
                    setOpenConfirmDialog(false);
                });
        } else {
            setOpenConfirmDialog(false);
        }
    }, [componentData, registerSubmissionMutation]);

    useHotkeys(
        'ALT+V',
        () => setViewTransgression(true),
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: t("viewTransgression"),
        }
    );

    useEffect(() => {
        setIsLoading(loadingRegisteringSubmission)
    }, [loadingRegisteringSubmission])

    return (
        <Box mt={2} paddingX={5} paddingY={4} border={1} borderColor={theme.palette.grey[500]} borderRadius={3} width={'100%'}>
            <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={2}>
                        <SubmissionDetailItem
                            testId='noticeNo'
                            label={t('noticeNo')}
                            values={[componentData.noticeNumber]}
                        />
                        <SubmissionDetailItem
                            testId='transgressionDate'
                            label={t('transgressionDate')}
                            values={[componentData.transgressionDate]}
                            icon={<CalendarTodayOutlined fontSize={'small'} sx={{ fontSize: '1rem' }} />}
                        />
                        <SubmissionDetailItem
                            testId='offenderName'
                            label={t('offenderName')}
                            values={[componentData.offenderName ?? '']}
                        />
                        <SubmissionDetailItem
                            testId='transgressionStatus'
                            label={t('transgressionStatus')}
                            values={[`${t(removeUnderscores(componentData.transgressionStatus ?? '')).split(' ').map((word) => titleCaseWord(word)).join(' ')}`]}
                        />
                        <SubmissionDetailItem
                            testId='transgressionCourtName'
                            label={t('courtName')}
                            values={[componentData.transgression?.courtName ?? '']}
                        />
                        <SubmissionDetailItem
                            testId='transgressionCourtDate'
                            label={t('courtDate')}
                            values={[componentData.transgression?.courtAppearanceDate
                                ? dayjs(componentData.transgression.courtAppearanceDate).format(configContext.dateTime.dateFormat)
                                : '']}
                        />
                        <SubmissionDetailItem
                            testId='submissionDeadline'
                            label={t('submissionDeadline')}
                            values={[componentData.submissionDeadline]}
                            icon={<CalendarTodayOutlined fontSize={'small'} sx={{ fontSize: '1rem' }} />}
                        />

                        {componentData.submissionStatus ? (
                            <SubmissionDetailItem
                                testId='submissionStatus'
                                label={t('submissionStatus')}
                                values={[` ${t(removeUnderscores(componentData.submissionStatus ?? '')).split(' ').map((word) => titleCaseWord(word)).join(' ')}`]}
                            />
                        ) : null}

                        {componentData.submissionRegistrationDate ? (
                            <SubmissionDetailItem
                                testId='submissionRegistrationDate'
                                label={t('submissionRegistrationDate')}
                                values={[componentData.submissionRegistrationDate ?? '']}
                            />
                        ) : null}

                        {
                            (componentData.submissionOutcome && componentData.submissionOutcome.length > 0) &&
                            <SubmissionDetailItem
                                testId='submissionOutcome'
                                label={t('submissionOutcome')}
                                values={componentData.submissionOutcome && componentData.submissionOutcome.length > 0 ? componentData.submissionOutcome?.map((outcome, index) => {
                                    return `${t('charge')} ${index + 1}: ${outcome.snapshotCharge?.chargeCode}
                                    ${removeUnderscores(outcome.submissionResult).split(' ').map((word) => titleCaseWord(word)).join(' ')}`
                                }) : ['']}
                            />
                        }
                        <TmButton
                            testid={"viewTransgression"}
                            onClick={() => { setViewTransgression(true) }}
                            color={"primary"}
                            variant={"contained"}
                            size={"medium"}
                            sx={{ width: 'fit-content', marginLeft: 'auto !important', marginTop: 2 }}
                        >
                            {t('view')}
                        </TmButton>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack>
                        <Typography variant='h6'>{t('submissionReason')}</Typography>
                        <TmTextArea
                            testId={"submissionReason"}
                            placeholder={componentData.submissionAlreadyExists ? t('noReasonProvided') : t('submissionReasonPlaceholder')}
                            value={componentData.submissionReason}
                            onChange={handleSubmissionReasonChange}
                            readOnly={componentData.submissionAlreadyExists}
                            style={{ fontSize: 'inherit' }}
                        />
                        {!componentData.submissionAlreadyExists &&
                            <TmButton
                                testid={"registerSubmission"}
                                onClick={handleRegisterSubmission}
                                color={"primary"}
                                variant={"contained"}
                                size={"medium"}
                                sx={{ width: 'fit-content', marginLeft: 'auto', marginTop: 2 }}
                                disabled={componentData.submissionAlreadyExists || !componentData.submissionDateValid}
                            >
                                {t('registerSubmission')}
                            </TmButton>
                        }
                    </Stack>
                </Grid>
            </Grid>

            <TmDialog
                testid={'confirmSubmissionDialog'}
                message={t('confirmSubmissionDialogMessage')}
                title={t('confirmSubmission')}
                isOpen={openConfirmDialog}
                showConfirmButton={true}
                confirmLabel={t("confirm") ?? undefined}
                confirmIcon={<CheckIcon />}
                cancelLabel={t("cancel") ?? undefined}
                cancelIcon={<CancelIcon />}
                onCancel={handleCancelSubmission}
                onConfirm={handleConfirmSubmission}
                isLoading={isLoading}
            />

            <TmDialog
                testid={'feedbackDialog'}
                message={t('successfulSubmissionMessage')}
                title={t('submissionRegistered')}
                isOpen={openFeedbackDialog}
                showConfirmButton={true}
                cancelLabel={t("close") ?? undefined}
                cancelIcon={<CancelIcon />}
                onCancel={handleCloseFeedbackDialog}
            />

            <Dialog
                id={'transgressionViewDialog'}
                open={viewTransgression}
                PaperProps={{ sx: { borderRadius: '10px', maxHeight: '710px' } }}
                sx={{ margin: 'auto', maxWidth: '1280px', padding: 10 }}
                onClose={handleCloseTransgressionView}
                fullScreen
            >
                <DialogContent>
                    <TransgressionView transgression={componentData.transgression} transgressionConfig={componentData.transgressionConfig} />
                </DialogContent>
                <DialogActions>
                    <TmButton
                        testid='closeButton'
                        startIcon={<CancelIcon />}
                        size="large"
                        onClick={handleCloseTransgressionView}
                        sx={{ float: 'right' }}
                    >
                        {t("close")}
                    </TmButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SubmissionDetails;
