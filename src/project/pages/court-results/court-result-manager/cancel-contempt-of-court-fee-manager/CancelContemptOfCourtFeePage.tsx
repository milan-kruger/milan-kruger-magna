import { t } from "i18next";
import { TmCourtDocumentsSearchBy } from "../../../../components/court-results/CourtDocumentsSearchBy";
import useCancelContemptOfCourtFeeManager from "../../../../hooks/court-results/CancelContemptOfCourtFeeManager";
import SecuredContent from "../../../../../framework/auth/components/SecuredContent";
import { ChangeEvent, useMemo } from "react";
import TmLoadingSpinner from "../../../../../framework/components/progress/TmLoadingSpinner";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Theme, useMediaQuery, useTheme } from "@mui/material";
import TmTypography from "../../../../../framework/components/typography/TmTypography";
import CaptureCourtResultsForm from "../../../../components/court-results/CaptureCourtResultsForm";
import { selectForm } from "../../../../redux/capture-court-result/CaptureCourtResultSlice";
import { useAppSelector } from "../../../../../framework/redux/hooks";
import TmButton from "../../../../../framework/components/button/TmButton";
import { CancelOutlined } from "@mui/icons-material";
import CaptureCourtResultsDetails from "../../../../components/court-results/CaptureCourtResultsDetails";
import BlockIcon from '@mui/icons-material/Block';
import TmAuthenticationDialog from "../../../../../framework/components/dialog/TmAuthenticationDialog";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckIcon from "@mui/icons-material/Check";
import TmDialog from "../../../../../framework/components/dialog/TmDialog";

const CancelContemptOfCourtFeePage = () => {
    const { isLoading,
        onSubmit, showCourtResultPopup,
        closeCourtResultPopup, onValueChanges,
        showAuthorizationPopup, setShowAuthorizationPopup,
        onCancelContemptOfCourtFee, courtResults,
        showConfirmationDialog,
        supervisorPassword, setSupervisorPassword,
        supervisorUsername, setSupervisorUsername,
        closeAuthorizationPopup, closeAll, contemptOfCourtFeeCancelled,
        searchByError,
        isErrorAuthentication,
        notApproved
    } = useCancelContemptOfCourtFeeManager();

    const theme = useTheme();
    const isMobile = useMediaQuery<Theme>(theme.breakpoints.down('md'));

    const containerBorderStyle = {
        columnGap: isMobile ? 5 : 10,
        display: 'flex',
        flexFlow: 'wrap',
        flexDirection: isMobile ? 'column' : 'row',
        border: `2px solid ${theme.palette.primary.main}`,
        padding: isMobile ? '5px' : '10px',
        borderRadius: '5px',
        margin: '0 0 10px',
    }

    const containerBorderBox2 = {
        border: `2px solid ${theme.palette.primary.main}`,
        padding: isMobile ? '5px' : '10px',
        borderRadius: '5px',
        marginBottom: '10px'
    }

    const fieldWith = '18em';
    const form = useAppSelector(selectForm);

    return (
        <SecuredContent accessRoles={useMemo(() => ['CANCELCONTEMPTOFCOURT_MAINTAIN'], [])}>
            {isLoading ? <TmLoadingSpinner testid={'cancelContemptOfCourtFeeLoadingSpinner'} /> :
                <Stack>
                    <TmCourtDocumentsSearchBy
                        id="cancelContemptOfCourtFee"
                        heading={t('cancelContemptOfCourtFee')}
                        subHeading={t('cancelContemptOfCourtFeeDescription')}
                        onSubmit={onSubmit}
                        onChange={onValueChanges}
                        searchBy={searchByError?.searchBy}
                        searchText={searchByError?.searchText}
                    ></TmCourtDocumentsSearchBy>

                    <Dialog id="courtResultDialog"
                        open={showCourtResultPopup} onClose={closeCourtResultPopup} fullScreen
                        sx={{ padding: isMobile ? 8 : 30 }}
                        PaperProps={{ sx: { borderRadius: 2 } }}>
                        <DialogTitle>
                            <Stack>
                                <TmTypography testid="dialogTitle" variant="h6" fontWeight={"bold"} color="primary">
                                    {t("courtResult")}
                                </TmTypography>
                            </Stack>
                        </DialogTitle>
                        <DialogContent>
                            <Stack direction="column">
                                {(courtResults) &&
                                    <CaptureCourtResultsDetails
                                        courtResult={courtResults[0]}
                                        sx={containerBorderStyle}
                                        transgressionDetails={{
                                            noticeNumber: courtResults[0]?.noticeNumber,
                                            offenderName: courtResults[0]?.offenderName ?? "",
                                            plateNumber: courtResults[0]?.plateNumber,
                                            identificationNumber: courtResults[0]?.identificationNumber as string
                                        }}
                                    />}
                                {courtResults &&
                                    <CaptureCourtResultsForm
                                        testIdPrefix={'captureCourtResultsHistory'}
                                        sx={containerBorderBox2}
                                        // transgressionDetails={courtResults}
                                        fieldWith={fieldWith}
                                        form={form}
                                        courtResult={courtResults[0]}
                                        readonly={true}
                                        transgressionDetails={{
                                            noticeNumber: courtResults[0]?.noticeNumber,
                                            status: courtResults[0]?.transgressionStatus,
                                            courtAppearanceDate: courtResults[0]?.courtDate,
                                            snapshotCharges: courtResults[0]?.snapshotCharges,
                                            totalAmountPayable: courtResults[0]?.amountPaid?.amount ?? 0,
                                            paymentReference: courtResults[0]?.receiptNumber ?? ''
                                        }}
                                    />}
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <TmButton testid="btnCancelContemptOfCourt"
                                title={t("cancelContemptOfCourt")}
                                onClick={() => { setShowAuthorizationPopup(true) }}
                                disabled={contemptOfCourtFeeCancelled}
                                variant="text"
                                startIcon={<BlockIcon />}>
                                <TmTypography testid="btnCancelContemptOfCourtText">{t("cancelContemptOfCourt")}</TmTypography>
                            </TmButton>

                            <TmButton testid="btnClose"
                                title={t("close")}
                                onClick={closeCourtResultPopup}
                                variant="text"
                                startIcon={<CancelOutlined />}>
                                <TmTypography testid="btnCloseText">{t("close")}</TmTypography>
                            </TmButton>
                        </DialogActions>
                    </Dialog>

                    <TmAuthenticationDialog
                        testid="supervisorAuthorizationDialog"
                        isOpen={showAuthorizationPopup}
                        onCancel={() => { closeAuthorizationPopup() }}
                        title={t('cancelContemptOfCourt')}
                        message={t('cancelContemptOfCourtSupervisorAuthorisation')}
                        message2={""}
                        username={supervisorUsername}
                        password={supervisorPassword}
                        cancelLabel={t('cancel')}
                        confirmLabel={t('confirm')}
                        medium={true}
                        cancelIcon={<CancelOutlinedIcon />}
                        confirmIcon={<CheckIcon />}
                        onConfirm={() => {
                            onCancelContemptOfCourtFee(supervisorUsername, supervisorPassword);
                        }}

                        handlePasswordOnChange={(value: string) => {
                            setSupervisorPassword(value);
                        }}

                        handleUsernameOnChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setSupervisorUsername(event.target.value?.toUpperCase())
                        }}
                        isAuthenticationError={isErrorAuthentication || notApproved}
                    />

                    <TmDialog
                        testid="cancelContemptOfCourtFeeConfirmDialog"
                        isOpen={showConfirmationDialog}
                        onCancel={() => { closeAll() }}
                        title={t('cancelContemptOfCourt')}
                        message={t('cancelContemptOfCourtSuccess')}
                        cancelLabel={t("close")}
                        cancelIcon={<CancelOutlined />}
                    />
                </Stack>}
        </SecuredContent>
    );
}

export default CancelContemptOfCourtFeePage;
