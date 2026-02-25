import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, SvgIconProps, useTheme } from '@mui/material';
import { ChangeEvent, ReactElement, memo, useEffect, useState, KeyboardEventHandler, useCallback, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router-dom';
import TmButton from '../button/TmButton';
import TmTextField from '../textfield/TmTextField';
import TmPasswordTextfield from '../textfield/emailPassword/TmPasswordTextfield';
import { toCamelCaseWords } from '../../utils';
import AuthService from '../../auth/authService';
import TmLoadingSpinner from '../progress/TmLoadingSpinner';

type TmAuthenticationDialogProps = {
    testid: string;
    title: string;
    message?: string;
    message2?: string;
    field?: JSX.Element | null;
    isOpen: boolean;
    username: string;
    password: string;
    cancelLabel: string;
    cancelIcon: ReactElement<SvgIconProps>;
    confirmLabel: string;
    confirmIcon: ReactElement<SvgIconProps>;
    disableConfirmButton?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    handlePasswordOnChange: (value: string) => void;
    handleUsernameOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
    large?: boolean;
    medium?: boolean;
    isAuthenticationError: boolean;
    isLoading?: boolean;
};

function TmAuthenticationDialog({
    testid,
    username,
    handlePasswordOnChange,
    handleUsernameOnChange,
    password,
    message,
    message2,
    disableConfirmButton,
    field,
    title,
    isOpen,
    cancelLabel,
    cancelIcon,
    confirmLabel,
    confirmIcon,
    onCancel,
    onConfirm,
    large,
    medium,
    isAuthenticationError,
    isLoading
}: Readonly<TmAuthenticationDialogProps>) {
    const { t } = useTranslation();
    const theme = useTheme();
    const [userNameError, setUserNameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const loggedInUserName = AuthService.getUserName();
    const sameUserError = username.toUpperCase() === loggedInUserName.toUpperCase();

    const confirmFields = useCallback(() => {
        return username === '' || sameUserError || password === '';
    }, [username, sameUserError, password]);

    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    onConfirm();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    onCancel();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onCancel, onConfirm]);

    const handleCancelKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onCancel();
        }
    };

    const stopPropagationForTab: KeyboardEventHandler<HTMLDivElement> = (event) => {
        if (event.key === 'Tab' || event.key === 'a' || event.key === 's') {
            event.stopPropagation();
        }
    };

    const [confirmEnabled, setConfirmEnabled] = useState(false);

    useEffect(() => {
        if (username.trim() !== '' && password !== '') {
            setConfirmEnabled(true);
        } else {
            setConfirmEnabled(false);
        }
    }, [username, password]);

    useEffect(() => {
        if (!username || username.trim() === '') {
            setUserNameError(true);
        }
        else {
            setUserNameError(false);
        }
    }, [username]);

    useEffect(() => {
        if (!password || password === '') {
            setPasswordError(true);
        }
        else {
            setPasswordError(false);
        }
    }, [password]);

    return (
        <Dialog
            id={toCamelCaseWords(testid, 'authorizationDialog')}
            open={isOpen}
            onClose={(_event, reason) => {
                if (reason && reason === 'backdropClick') {
                    return;
                }
                onCancel();
            }}
            onKeyDown={stopPropagationForTab}
            maxWidth={large ? 'lg' : medium ? 'md' : undefined}
            fullWidth={large ? true : undefined}
            data-testid={testid}
        >
            <DialogTitle
                id={toCamelCaseWords(testid, 'specialAuthorizationDialogTitle')}
                style={{
                    color: theme.palette.primary.main
                }}
            >
                {`${t('supervisorAuthorization')} ${title && title.length > 0 ? " - " + title : ""}`}
            </DialogTitle>
            <DialogContent>
                {isLoading ?
                    <TmLoadingSpinner testid={"loadingSpinner"} /> :

                    <Stack gap={10}>
                        {message && (
                            <DialogContentText id={toCamelCaseWords(testid, 'specialAuthorizationDialogContent')} whiteSpace='pre-line' color={theme.palette.text.primary}>
                                {message}
                            </DialogContentText>
                        )}
                        {message2 && (
                            <DialogContentText id={toCamelCaseWords(testid, 'specialAuthorizationDialogContent2')} whiteSpace='pre-line' color={theme.palette.text.primary}>
                                {message2}
                            </DialogContentText>
                        )}
                        {field && <Box>{field}</Box>}

                        <Form autoComplete='off' >
                            <Box>
                                <TmTextField
                                    testid='specialAuthorizationUsernameField'
                                    label={t('username')}
                                    autoComplete='off'
                                    required
                                    sx={{ width: '100%' }}
                                    value={username}
                                    error={userNameError || sameUserError || isAuthenticationError}
                                    onChange={handleUsernameOnChange}
                                    helperText={sameUserError ? t('sameUserError') : isAuthenticationError ? t('authenticationError') : t('')}
                                />
                            </Box>
                            <Box>
                                <TmPasswordTextfield
                                    testid='specialAuthorizationPasswordField'
                                    label={t('password')}
                                    password={password}
                                    setPasswordValue={handlePasswordOnChange}
                                    setPasswordError={function (): void {
                                        throw new Error('Function not implemented.');
                                    }}
                                    passwordError={(passwordError || isAuthenticationError) ?? false}
                                    helperText={isAuthenticationError ? t('authenticationError') : ''}
                                />
                            </Box>
                        </Form>
                    </Stack>
                }
            </DialogContent>
            <DialogActions data-testid={toCamelCaseWords(testid, 'authenticationDialogActions')}>
                <TmButton
                    sx={{ color: theme.palette.secondary.main }}
                    testid={toCamelCaseWords(testid, 'authenticationDialogConfirmButton')}
                    startIcon={confirmIcon}
                    onClick={onConfirm}
                    disabled={!confirmEnabled || disableConfirmButton || confirmFields() || isLoading}
                >
                    {confirmLabel}
                </TmButton>
                <TmButton
                    testid={toCamelCaseWords(testid, 'authenticationDialogCloseButton')}
                    startIcon={cancelIcon}
                    onClick={onCancel}
                    onKeyDown={handleCancelKeyDown}
                    disabled={isLoading}
                >
                    {cancelLabel}
                </TmButton>
            </DialogActions>
        </Dialog >
    );
}

export default memo(TmAuthenticationDialog);
