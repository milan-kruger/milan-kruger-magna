import { CancelOutlined } from "@mui/icons-material";
import { Box, Stack, Theme, useMediaQuery } from "@mui/material";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Background from "../../../framework/assets/images/tile.png";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import TmButton from "../../../framework/components/button/TmButton";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import TmNumberField from "../../../framework/components/textfield/TmNumberField";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import TmFullscreenInputFrame from "../../../framework/components/fullscreen-input-frame/TmFullscreenInputFrame";
import useManualPaymentsManager from "../../hooks/payments/ManualPaymentsManager";
import {
    RetrieveTransgressionDetailsApiResponse,
    RetrieveTransgressionDetailsRequest,
} from "../../redux/api/transgressionsApi";
import TmDocumentPreview from '../../components/printing/TmDocumentPreview';
import printJS from 'print-js';
import TmLoadingSpinner from '../../../framework/components/progress/TmLoadingSpinner';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TmTypography from '../../../framework/components/typography/TmTypography';

const allSpecialCharactersRegex = /[!"#$%&()*+,./:;<=>?@[\\\]^_`{|}~£¤¥€¢$±×÷≈≠≤≥∑∏∞∂∫©®™§¶†‡•…′″(){}"`«»‹›‘’“”„\-']/;

function ManualPaymentsPage() {
    const { t } = useTranslation();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    
    const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
    const [noticeNumber, setNoticeNumber] = useState<string>("");
    const [noticeNumberHelperText, setNoticeNumberHelperText] =
        useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [amountHelperText, setAmountHelperText] = useState<string>("");
    const [transgressionDetails, setTransgressionDetails] =
        useState<RetrieveTransgressionDetailsApiResponse>();

    const [paymentReceipt, setPaymentReceipt] = useState<string>();

    const [invalidNoticeNumber, setInvalidNoticeNumber] = useState<boolean>(true);
    const [invalidAmount, setInvalidAmount] = useState<boolean>(true);

    const [showConfirmButton, setShowConfirmButton] = useState<boolean>(true);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [dialogMessage, setDialogMessage] = useState<string>("");

    const isFormValid = !invalidNoticeNumber && !invalidAmount;

    const { accessRoles, triggerRetrieveTransgressionDetails, handleProcessManualPayment, processPaymentLoading } =
        useManualPaymentsManager(
            setOpenDialog,
            setDialogTitle,
            setDialogMessage,
            setTransgressionDetails,
            setPaymentReceipt
        );

    const handleNoticeNumberChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value?.toUpperCase().trim();
            setNoticeNumber(value);
            if (value !== "" && !allSpecialCharactersRegex.test(value)) {
                setInvalidNoticeNumber(false);
                setNoticeNumberHelperText("");
            } else {
                setNoticeNumberHelperText(t("invalidNoticeNumber"));
                setInvalidNoticeNumber(true);
            }
        },
        [t]
    );

    const handleAmountChange = useCallback(
        (value: number) => {
            setAmount(value);
            if (value !== null && value !== 0) {
                setInvalidAmount(false);
                setAmountHelperText("");
            } else {
                setAmountHelperText(t("invalidAmount"));
                setInvalidAmount(true);
            }
        },
        [t]
    );

    const onConfirm = useCallback(() => {
        if (!invalidNoticeNumber) {
            const retrieveTransgressionDetailsRequest: RetrieveTransgressionDetailsRequest = {
                noticeNumber
            }
            triggerRetrieveTransgressionDetails({retrieveTransgressionDetailsRequest});
            if (transgressionDetails) {
                setShowConfirmButton(false);
            }
        } else {
            setNoticeNumberHelperText(t("invalidNoticeNumber"));
            setInvalidNoticeNumber(true);
        }
    }, [
        triggerRetrieveTransgressionDetails,
        invalidNoticeNumber,
        noticeNumber,
        t,
        transgressionDetails,
    ]);

    const printReceipt = useCallback(() => {
        if (paymentReceipt) {
            printJS({
                printable: paymentReceipt,
                type: "pdf",
                base64: true,
            });
        }
    }, [paymentReceipt]);

    useEffect(() => {
        if (transgressionDetails != null) {
            setShowConfirmButton(false);
            setInvalidAmount(true);
        }
    }, [transgressionDetails]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(document.documentElement.clientWidth);
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const onSaveAndPrint = useCallback(() => {
        if (isFormValid && transgressionDetails?.transgression) {
            handleProcessManualPayment(
                noticeNumber,
                amount,
                transgressionDetails.transgression.totalAmountPayable.currency
            );
        }
    }, [amount, handleProcessManualPayment, isFormValid, noticeNumber, transgressionDetails]);

    const testid = "manualPayment";

    return (
        <SecuredContent accessRoles={useMemo(() => accessRoles, [accessRoles])}>
            {
                !paymentReceipt ? (
                    <TmFullscreenInputFrame backgroundImage={Background} title={t("Payment")}>
                        <Stack gap={1} tabIndex={-1}>
                            <TmTextField
                                testid={`${testid}NoticeNumber`}
                                required
                                autoComplete="off"
                                label={t("noticeNumber")}
                                onChange={handleNoticeNumberChange}
                                disabled={!showConfirmButton}
                                value={noticeNumber}
                                error={invalidNoticeNumber}
                                helperText={noticeNumberHelperText}
                                sx={{ width: "20rem" }}
                            />

                            {showConfirmButton ? (
                                <TmButton
                                    testid={`${testid}ConfirmButton`}
                                    variant="contained"
                                    style={{
                                        marginTop: 11,
                                        marginBottom: 20,
                                    }}
                                    onClick={onConfirm}
                                >
                                    {t("confirm")}
                                </TmButton>
                            ) : (
                                <>
                                    <TmNumberField
                                        testid={`${testid}Amount`}
                                        required
                                        showEndAdornment={false}
                                        showStartAdornment={transgressionDetails?.transgression?.totalAmountPayable.currency !== undefined}
                                        startAdornment={transgressionDetails?.transgression?.totalAmountPayable.currency}
                                        label={t("amount")}
                                        onChange={handleAmountChange}
                                        value={amount}
                                        error={invalidAmount}
                                        helperText={amountHelperText}
                                        variant='standard'
                                        sx={{
                                            width: "20rem",
                                            marginTop: "20px",
                                        }}
                                    />
                                    <TmButton
                                        testid={`${testid}SaveAndPrint`}
                                        variant="contained"
                                        style={{
                                            marginTop: 11,
                                            marginBottom: 20,
                                        }}
                                        onClick={onSaveAndPrint}
                                        disabled={!isFormValid}
                                        
                                    >
                                        {processPaymentLoading ? 
                                            <TmLoadingSpinner testid={`${testid}Loader`} size={25} sx={{ m: 0, mr: 5, flex: 0 }} />
                                            : <CheckCircleOutlineIcon sx={{ mr: 5 }} />
                                        }
                                        {t("saveAndPrint")}
                                    </TmButton>
                                </>
                            )}
                            <TmDialog
                                testid="noticeNotFoundDialog"
                                cancelIcon={<CancelOutlined />}
                                cancelLabel={t("close")}
                                title={t(dialogTitle)}
                                message={t(dialogMessage)}
                                onCancel={() => setOpenDialog(false)}
                                isOpen={openDialog}
                                showConfirmButton={true}
                            />
                        </Stack>
                    </TmFullscreenInputFrame>
                ) :
                    <Box height='85vh' overflow='auto' id={`${testid}ReceiptPdf`}>
                        <Stack direction={isMobile ? 'column' : 'row'}>
                            <TmTypography
                                testid={`${testid}ReceiptPdfHeading`}
                                variant='h5'
                                fontWeight='bold'
                                sx={{ margin: 8, whiteSpace: 'nowrap' }}
                                color='primary'
                            >
                                {t('printPaymentReceipt')}
                            </TmTypography>
                            <Box sx={{width: '100%'}}>
                                <TmDocumentPreview
                                    testId="renderedPdf"
                                    data={paymentReceipt ?? ''}
                                    printAllCallBack={() => { }}
                                    printCallBack={printReceipt}
                                    showPrintButton={true}
                                    showPrintAllButton={false}
                                    disablePrintButton={false}
                                    exitCallBack={() => location.reload()}
                                    width={windowWidth}
                                    tabletScale={2}
                                />
                            </Box>
                        </Stack>
                    </Box>
            }
        </SecuredContent>
    );
}

export default ManualPaymentsPage;
