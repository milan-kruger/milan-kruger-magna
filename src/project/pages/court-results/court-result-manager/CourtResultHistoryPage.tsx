import { useMemo, useState } from "react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, Theme, useMediaQuery, useTheme } from "@mui/material";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import { t } from "i18next";
import TmSearch from "../../../../framework/components/list/TmSearch";
import CourtResultHistoryTable from "../../../components/court-results/CourtResultHistoryTable";
import useCourtResultHistoryManager from "../../../hooks/court-results/CourtResultHistoryManager";
import { useLocation } from "react-router-dom";
import { CancelOutlined } from "@mui/icons-material";
import TmButton from "../../../../framework/components/button/TmButton";
import TmLoadingSpinner from "../../../../framework/components/progress/TmLoadingSpinner";
import CaptureCourtResultsDetails from "../../../components/court-results/CaptureCourtResultsDetails";
import CaptureCourtResultsForm from "../../../components/court-results/CaptureCourtResultsForm";
import { useAppSelector } from "../../../../framework/redux/hooks";
import { selectForm } from "../../../redux/capture-court-result/CaptureCourtResultSlice";
import { CourtResult } from "../../../redux/api/transgressionsApi";

const CourtResultHistoryPage = () => {
    const location = useLocation();
    const { courtResultHistory } = useMemo(() => {
        return {
            courtResultHistory: location.state.courtResultHistory || [],
        }
    }, [location]);

    const [courtResults, setCourtResults] = useState<CourtResult[]>([]);

    const { setSearchValue, searchValue, onExit,
        provideCaseResultDetails,
        isLoading,
        captureDialogOpen,
        closeCaptureDialog,
        transgressionDetails
    } = useCourtResultHistoryManager(setCourtResults);

    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const theme = useTheme();

    const containerBorderStyle = {
        columnGap: isMobile ? 5 : 10,
        display: 'flex',
        flexFlow: 'wrap',
        flexDirection: isMobile ? 'column' : 'row',
        border: `2px solid ${theme.palette.primary.main}`,
        padding: '5px',
        borderRadius: '5px',
        margin: '0 0 10px',
    }

    const containerBorderBox2 = {
        border: `2px solid ${theme.palette.primary.main}`,
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '5px'
    }

    const fieldWith = isMobile ? '22em' : '18em';
    const form = useAppSelector(selectForm);

    return (
        <Box margin={15}>
            <SecuredContent
                accessRoles={useMemo(() => ['COURTRESULT_MAINTAIN', 'COURTRESULT_VIEW'], [])}
            >
                <>
                    {
                        isLoading ? <TmLoadingSpinner testid="loadingCourtResultHistory"></TmLoadingSpinner> :
                            <Box>
                                <Grid container rowSpacing={5} marginBottom={10}>
                                    <Grid size={{ xs: 8, sm: 4, md: 4 }}>
                                        <TmTypography testid="courtResultHistory" variant="h6" color='primary' fontWeight={"bold"}>
                                            {t("courtResultHistory")}
                                        </TmTypography>
                                    </Grid>
                                    <Grid size={{ xs: 2, sm: 4, md: 6 }} />
                                    <Grid size={{ xs: 8, sm: 4, md: 2 }}>
                                        <TmSearch
                                            testid={'searchResultHistory'}
                                            searchValue={""}
                                            fullWidth
                                            onDebouncedChange={setSearchValue}
                                        />
                                    </Grid>
                                </Grid>
                                <CourtResultHistoryTable rows={courtResultHistory} searchValue={searchValue} onRowClick={provideCaseResultDetails} />
                                <Stack width={100} justifySelf={"end"} marginTop={20}>
                                    <TmButton startIcon={<CancelOutlined />} testid="btnExit" title={t("exit")}
                                        onClick={() => onExit()} variant="text">
                                        {t("exit")}
                                    </TmButton>
                                </Stack>
                            </Box>
                    }
                    <Dialog id="capturedCourtResultDialog"
                        open={captureDialogOpen} onClose={closeCaptureDialog} fullScreen
                        sx={{ padding: isMobile ? 10 : 30 }}
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
                                {(courtResultHistory && transgressionDetails) &&
                                    <CaptureCourtResultsDetails
                                        courtResult={courtResults[0]}
                                        sx={containerBorderStyle}
                                        transgressionDetails={{
                                            noticeNumber: transgressionDetails.noticeNumber.number ?? '',
                                            offenderName: ((transgressionDetails.driver?.firstNames || '') + ' ' + (transgressionDetails.driver?.surname || '')).trim(),
                                            plateNumber: transgressionDetails.vehicle?.plateNumber,
                                            identificationNumber: transgressionDetails.driver?.identification?.number ?? ''
                                        }}
                                    />}
                                {courtResultHistory &&
                                    <CaptureCourtResultsForm
                                        testIdPrefix={'captureCourtResultsHistory'}
                                        sx={containerBorderBox2}
                                        // transgressionDetails={courtResults}
                                        fieldWith={fieldWith}
                                        form={form}
                                        courtResult={courtResults[0]}
                                        readonly={true}
                                        transgressionDetails={
                                            {
                                                status: transgressionDetails?.status ?? '',
                                                courtAppearanceDate: transgressionDetails?.courtAppearanceDate ?? '',
                                                noticeNumber: transgressionDetails?.noticeNumber.number ?? '',
                                                snapshotCharges: transgressionDetails?.snapshotCharges ?? [],
                                                totalAmountPayable: transgressionDetails?.totalAmountPayable.amount ?? 0,
                                                paymentReference: transgressionDetails?.paymentReference ?? ''
                                            }
                                        }
                                    />}
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <TmButton testid="btnClose"
                                title={t("close")}
                                onClick={closeCaptureDialog}
                                variant="text"
                                startIcon={<CancelOutlined />}>
                                <TmTypography testid="btnCloseText">{t("close")}</TmTypography>
                            </TmButton>
                        </DialogActions>
                    </Dialog>
                </>
            </SecuredContent>
        </Box>
    );
}

export default CourtResultHistoryPage;
