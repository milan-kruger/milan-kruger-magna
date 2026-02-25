import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningTwoToneIcon from '@mui/icons-material/WarningTwoTone';
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, SvgIconProps, useTheme } from '@mui/material';
import { JSX, ReactElement, memo, useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { selectConfigDevMode } from '../../config/configSlice';
import { useAppSelector } from '../../redux/hooks';
import { toCamelCaseWords } from '../../utils';
import TmButton from '../button/TmButton';
import TmTypography from '../typography/TmTypography';
import TmLoadingSpinner from '../progress/TmLoadingSpinner';

type TmDialogProps = {
    testid: string;
    title: string;
    message: string;
    contentComponent?: JSX.Element;
    details?: string;
    isOpen: boolean;
    showConfirmButton?: boolean;
    cancelLabel: string;
    cancelIcon: ReactElement<SvgIconProps>;
    confirmLabel?: string;
    confirmIcon?: ReactElement<SvgIconProps>;
    showSkip?: boolean;
    showUpdate?: boolean;
    skipLabel?: string;
    updateLabel?: string;
    skipIcon?: ReactElement<SvgIconProps>;
    updateIcon?: ReactElement<SvgIconProps>;
    disableSkip?: boolean;
    disableUpdate?: boolean;
    onSkip?: () => void;
    onUpdate?: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
    disableConfirmButton?: boolean;
    form?: JSX.Element;
    transgressionSummaryList?: JSX.Element;
    personnelDialog?: boolean;
    large?: boolean;
    medium?: boolean;
    isLoading?: boolean;
}

function TmDialog({
    testid,
    title,
    message,
    contentComponent,
    details,
    isOpen,
    showConfirmButton,
    cancelLabel,
    cancelIcon,
    confirmLabel,
    confirmIcon,
    onCancel,
    onConfirm,
    disableConfirmButton,
    showSkip,
    showUpdate,
    skipLabel,
    updateLabel,
    skipIcon,
    updateIcon,
    disableSkip,
    disableUpdate,
    onSkip,
    onUpdate,
    personnelDialog,
    large,
    medium,
    isLoading
}: Readonly<TmDialogProps>) {
    const { t } = useTranslation();
    const theme = useTheme();

    const devMode = useAppSelector(selectConfigDevMode);

    //29-Jul-2024 TTE FIXME: Submit & cancel on a dialog box should not be hotkeys
    useHotkeys('ENTER', () => {
        if (isOpen && onConfirm) {
            onConfirm();
        }
    },
        { enableOnFormTags: true, description: t('confirmDialog') ?? undefined });

    useHotkeys('ESCAPE', () => {
        if (isOpen && onCancel) {
            onCancel()
        }
    }, { preventDefault: true, enableOnFormTags: true, description: t('cancelDialog') ?? undefined });

    const [errorCopied, setErrorCopied] = useState(false);

    const copyToClipboard = useCallback(() => {
        const textToCopy = `${message}\n\n${details}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setErrorCopied(true);
        });
    }, [message, details]);

    const titleStyle = useMemo(() => ({
        color: title === t('error') ? theme.palette.warning.main : theme.palette.primary.main,
        paddingTop: 12,
        paddingBottom: 6,
        fontSize: '1.3rem'
    }), [t, theme.palette.primary.main, theme.palette.warning.main, title]);

    const warningStyle = useMemo(() => ({
        color: theme.palette.warning.main,
        marginRight: '5px'
    }), [theme.palette.warning.main]);

    const contentStyle = useMemo(() => ({
        color: title === t('error') ? theme.palette.error.main : theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.common.black,
        // fontWeight: '600',
        marginBottom: 10
    }), [t, theme.palette.error.main, theme.palette.grey, theme.palette.mode, title, theme.palette.common.black]);

    const confirmButtonStyle = useMemo(() => ({
        color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.main,
        fontSize: '0.92rem'
    }), [theme.palette.mode, theme.palette.secondary.light, theme.palette.secondary.main]);

    const dialogStyle = useMemo(() => ({
        "& .MuiDialog-container": {
            "& .MuiPaper-root": {
                width: "100%",
                maxWidth: personnelDialog ? "600px" : "default",
            },
        }

    }), [personnelDialog])

    return (
        <Dialog
            id={toCamelCaseWords(testid, 'dialog')}
            data-testid={testid}
            open={isOpen}
            onClose={
                (_event, reason) => {
                    if (reason && reason === 'backdropClick') {
                        return;
                    }
                    if (onCancel) {
                        onCancel();
                    }
                }
            }
            sx={dialogStyle}
            maxWidth={large ? 'lg' : medium ? 'md' : undefined}
            fullWidth={large ? true : undefined}
            disableRestoreFocus={true}
        >
            <DialogTitle
                id={toCamelCaseWords(testid, 'dialogTitle')}
                style={titleStyle}
                data-testid={toCamelCaseWords(testid, 'dialogTitle')}
            >
                {title}
            </DialogTitle>
            <DialogContent>
                {isLoading ? <TmLoadingSpinner testid={"loadingSpinner"} /> :
                    <Stack>
                        <Box display='flex' alignItems='center'>
                            <Stack width='100%'>
                                <>
                                    {title === t('error') &&
                                        <WarningTwoToneIcon
                                            fontSize='large'
                                            style={warningStyle}
                                        />
                                    }
                                    <DialogContentText
                                        id={toCamelCaseWords(testid, 'dialogContent')}
                                        whiteSpace='pre-line'
                                        style={contentStyle}
                                    >
                                        {message}
                                    </DialogContentText>
                                </>
                                {contentComponent || null}
                            </Stack>
                        </Box>
                        {details &&
                            <DialogContentText
                                id={toCamelCaseWords(testid, 'dialogDetails')}
                                fontStyle='italic'
                                whiteSpace='pre-line'
                                marginTop='10px'
                            >
                                {details}
                            </DialogContentText>
                        }
                        {devMode && title === t('error') &&
                            <Box display='flex' marginTop='15px' alignItems='center'>
                                <TmButton
                                    testid={toCamelCaseWords(testid, 'errorCopyButton')}
                                    type='submit'
                                    variant='outlined'
                                    color={errorCopied ? 'warning' : 'info'}
                                    size='large'
                                    startIcon={<ContentCopyIcon />}
                                    onClick={copyToClipboard}
                                >
                                    Copy error to clipboard
                                </TmButton>
                                {
                                    errorCopied ?
                                        <TmTypography
                                            testid={toCamelCaseWords(testid, 'errorCopied')}
                                            color={theme.palette.info.main}
                                            ml='10px'
                                        >
                                            Copied!
                                        </TmTypography>
                                        : null
                                }
                            </Box>
                        }
                    </Stack>
                }
            </DialogContent>
            <DialogActions data-testid={toCamelCaseWords(testid, 'dialogActions')}>
                {showSkip &&
                    <TmButton
                        sx={confirmButtonStyle}
                        testid={toCamelCaseWords(testid, 'dialogSkipButton')}
                        startIcon={skipIcon}
                        onClick={onSkip}
                        disabled={disableSkip}
                    >
                        {skipLabel}
                    </TmButton>
                }
                {showUpdate &&
                    <TmButton
                        testid={toCamelCaseWords(testid, 'dialogUpdateButton')}
                        startIcon={updateIcon}
                        onClick={onUpdate}
                        disabled={disableUpdate}
                    >
                        {updateLabel}
                    </TmButton>
                }
                {showConfirmButton &&
                    <TmButton
                        sx={confirmButtonStyle}
                        testid={toCamelCaseWords(testid, 'dialogConfirmButton')}
                        startIcon={confirmIcon}
                        onClick={onConfirm}
                        disabled={disableConfirmButton || isLoading}
                    >
                        {confirmLabel}
                    </TmButton>
                }
                <TmButton
                    testid={toCamelCaseWords(testid, 'dialogCloseButton')}
                    startIcon={cancelIcon}
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    {cancelLabel}
                </TmButton>
            </DialogActions>
        </Dialog>
    );
}

export default memo(TmDialog);
