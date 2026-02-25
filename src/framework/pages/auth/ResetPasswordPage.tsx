/* eslint-disable @typescript-eslint/no-explicit-any */
import LockResetIcon from '@mui/icons-material/LockReset';
import GppBadTwoToneIcon from '@mui/icons-material/GppBadTwoTone';
import { Box, CircularProgress, Stack, useMediaQuery, useTheme, Grid, Fade } from '@mui/material';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useChangeAccountPasswordMutation } from '../../../project/redux/api/coreApi';
import AuthLayout from '../../components/auth-layout/AuthLayout';
import TmButton from '../../components/button/TmButton';
import TmPasswordTextfield from '../../components/textfield/emailPassword/TmPasswordTextfield';
import { getPasswordValidationRules } from '../../components/textfield/emailPassword/PasswordValidationList';
import TmSnackbar from '../../components/snackbar/TmSnackbar';
import TmTypography from '../../components/typography/TmTypography';
import PasswordRequirements from './PasswordRequirements';
import AuthService from '../../auth/authService';
import { useHotkeys } from 'react-hotkeys-hook';

interface ResetPasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

function ResetPasswordPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [lastSubmittedData, setLastSubmittedData] = useState<ResetPasswordFormData | null>(null);
    const [calledChangePasswordApi, setCalledChangePasswordApi] = useState(false);
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

    const userAccountId = location.state?.userAccountId as string;

    const [changePassword, { isLoading: isChanging, isSuccess: isChanged, error: changeError }] = useChangeAccountPasswordMutation();

    const { control, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm<ResetPasswordFormData>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const watchedValues = watch();

    const username = useMemo(() => {
        return AuthService.getUserName() || '';
    }, []);

    const passwordValidations = useMemo(() => {
        const rules = getPasswordValidationRules(username);
        return rules.map(rule => ({
            label: t(rule.translationKey),
            regex: rule.regex
        }));
    }, [username, t]);

    const hasValidAccess = location.state?.fromLogin === true;

    useEffect(() => {
        if (!isChanged && hasValidAccess) {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                return true;
            };

            const handleUnload = () => {
                if (!isChanged) {
                    AuthService.doLogout(true);
                }
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('unload', handleUnload);

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
                window.removeEventListener('unload', handleUnload);
            };
        }
    }, [isChanged, hasValidAccess]);

    useEffect(() => {
        if (errorMessage && lastSubmittedData) {
            if (watchedValues.currentPassword !== lastSubmittedData.currentPassword ||
                watchedValues.newPassword !== lastSubmittedData.newPassword ||
                watchedValues.confirmPassword !== lastSubmittedData.confirmPassword) {
                setErrorMessage(null);
                clearErrors();
            }
        }
    }, [watchedValues, errorMessage, lastSubmittedData, clearErrors]);

    useEffect(() => {
        if (watchedValues.newPassword) {
            clearErrors('newPassword');

            for (const validation of passwordValidations) {
                if (!validation.regex.test(watchedValues.newPassword)) {
                    const isLengthValidation = validation.label === t('minimum8Characters');
                    const isUsernameValidation = validation.label === t('notSameAsUsername');
                    const isSameAsCurrentPassword = validation.label === t('notSameAsCurrentPassword')
                    let message = validation.label;
                    if (!isLengthValidation && !isUsernameValidation && !isSameAsCurrentPassword) {
                        message = `${t('passwordMustContainAtLeast')}: ${validation.label}`;
                    }
                    setError('newPassword', {
                        type: 'manual',
                        message
                    });
                    return;
                }
            }

            if (watchedValues.currentPassword && watchedValues.newPassword === watchedValues.currentPassword) {
                setError('newPassword', {
                    type: 'manual',
                    message: t('newPasswordSameAsOld')
                });
                return;
            }
        }
    }, [watchedValues.newPassword, watchedValues.currentPassword, setError, clearErrors, t, passwordValidations]);

    useEffect(() => {
        if (watchedValues.confirmPassword && watchedValues.newPassword) {
            if (watchedValues.newPassword !== watchedValues.confirmPassword) {
                setError('confirmPassword', {
                    type: 'manual',
                    message: t('passwordsDoNotMatch')
                });
            } else {
                clearErrors('confirmPassword');
            }
        }
    }, [watchedValues.newPassword, watchedValues.confirmPassword, setError, clearErrors, t]);

    const validatePasswords = useCallback((data: ResetPasswordFormData) => {
        if (data.newPassword !== data.confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: t('passwordsDoNotMatch')
            });
            return false;
        }

        if (data.currentPassword === data.newPassword) {
            setError('newPassword', {
                type: 'manual',
                message: t('newPasswordSameAsOld')
            });
            return false;
        }

        for (const validation of passwordValidations) {
            if (!validation.regex.test(data.newPassword)) {
                const isLengthValidation = validation.label === t('minimum8Characters');
                const isUsernameValidation = validation.label === t('notSameAsUsername');
                const isSameAsCurrentPassword = validation.label === t('notSameAsCurrentPassword')
                let message = validation.label;
                if (!isLengthValidation && !isUsernameValidation && !isSameAsCurrentPassword) {
                    message = `${t('passwordMustContainAtLeast')}: ${validation.label}`;
                }
                setError('newPassword', {
                    type: 'manual',
                    message
                });
                return false;
            }
        }

        return true;
    }, [setError, t, passwordValidations]);

    useEffect(() => {
        if (isChanging) {
            setCalledChangePasswordApi(true);
        }
    }, [isChanging]);

    useEffect(() => {
        if (isChanged && calledChangePasswordApi) {
            setSuccessMessage(t('passwordResetSuccess'));
            setShowSuccessSnackbar(true);
            setCalledChangePasswordApi(false);

            setTimeout(() => {
                AuthService.doLogout(true);
            }, 500);
        }
    }, [isChanged, calledChangePasswordApi, t]);

    useEffect(() => {
        if (changeError && calledChangePasswordApi) {
            const error = changeError as any;
            const errorMsg = error?.data?.errors?.[0]?.message ||
                error?.data?.message ||
                t('passwordResetFailed');
            setErrorMessage(errorMsg);
            setCalledChangePasswordApi(false);
        }
    }, [changeError, calledChangePasswordApi, t]);

    const handleResetPassword = useCallback((data: ResetPasswordFormData) => {
        if (!validatePasswords(data) || !userAccountId) {
            return;
        }

        setLastSubmittedData(data);
        setErrorMessage(null);
        setSuccessMessage(null);

        changePassword({
            userAccountPasswordChangeRequest: {
                userAccountId: userAccountId,
                oldPassword: data.currentPassword,
                newPassword: data.newPassword
            }
        });
    }, [ validatePasswords, changePassword ]);

    const onSubmit: SubmitHandler<ResetPasswordFormData> = (data) => {
        handleResetPassword(data);
    };

    const handleCloseSuccessSnackbar = useCallback(() => {
        setShowSuccessSnackbar(false);
    }, []);

    const isButtonDisabled = useMemo(() => {
        if (!watchedValues.currentPassword || !watchedValues.newPassword || !watchedValues.confirmPassword) {
            return true;
        }

        if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
            return true;
        }

        if (isChanging) {
            return true;
        }

        if (errorMessage && lastSubmittedData) {
            return (
                watchedValues.currentPassword === lastSubmittedData.currentPassword &&
                watchedValues.newPassword === lastSubmittedData.newPassword &&
                watchedValues.confirmPassword === lastSubmittedData.confirmPassword
            );
        }

        return false;
    }, [ isChanging, errorMessage, lastSubmittedData, watchedValues.currentPassword, watchedValues.newPassword, watchedValues.confirmPassword, errors.currentPassword, errors.newPassword, errors.confirmPassword ]);

    useHotkeys('ENTER', () => {
        handleSubmit(onSubmit)();
    }, {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: !isButtonDisabled
    });

    if (!hasValidAccess) {
        return (
            <Box marginTop={10} textAlign='center'>
                <GppBadTwoToneIcon color='error' fontSize='large' />
                <TmTypography testid={'securedContentAccessDenied'} variant='h4' color='error' textAlign='center'>
                    {t('accessDenied')}
                </TmTypography>
            </Box>
        );
    }

    return (
        <>
            <TmSnackbar
                testid="resetPasswordSuccess"
                snackbarType="success"
                message={successMessage || t('passwordResetSuccess')}
                isOpen={showSuccessSnackbar}
                onClose={handleCloseSuccessSnackbar}
            />

            <AuthLayout wide>
                <Box
                    component='form'
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{
                        px: isMobile ? 4 : 6,
                        pb: isMobile ? 5 : 6,
                        mt: 10
                    }}
                >
                    <Grid container spacing={3}>
                        <Grid size={{ xs: isMobile ? 12 : 6, md: isMobile ? 12 : 6 }}>
                            <Stack>
                                <Controller
                                    name='currentPassword'
                                    control={control}
                                    rules={{ required: t('currentPasswordRequired') }}
                                    render={({ field }) => (
                                        <TmPasswordTextfield
                                            testid='resetPasswordCurrentPassword'
                                            label={t('currentPassword')}
                                            password={field.value}
                                            setPasswordValue={field.onChange}
                                            passwordError={!!errorMessage}
                                            setPasswordError={() => { }}
                                            helperText={' '}
                                            autoFocus
                                        />
                                    )}
                                />
                                <Controller
                                    name='newPassword'
                                    control={control}
                                    rules={{ required: t('newPasswordRequired') }}
                                    render={({ field, fieldState }) => (
                                        <TmPasswordTextfield
                                            testid='resetPasswordNewPassword'
                                            label={t('newPassword')}
                                            password={field.value}
                                            setPasswordValue={field.onChange}
                                            passwordError={!!fieldState.error}
                                            setPasswordError={() => { }}
                                            helperText={' '}
                                        />
                                    )}
                                />
                                <Controller
                                    name='confirmPassword'
                                    control={control}
                                    rules={{ required: t('confirmPasswordRequired') }}
                                    render={({ field, fieldState }) => (
                                        <TmPasswordTextfield
                                            testid='resetPasswordConfirmPassword'
                                            label={t('confirmPassword')}
                                            password={field.value}
                                            setPasswordValue={field.onChange}
                                            passwordError={!!fieldState.error}
                                            setPasswordError={() => { }}
                                            helperText={fieldState.error?.message || ' '}
                                        />
                                    )}
                                />
                                {
                                    isMobile &&
                                    <Box sx={{ mt: -3 }}>
                                        <PasswordRequirements
                                            password={watchedValues.newPassword || watchedValues.confirmPassword || ''}
                                            username={username}
                                        />
                                    </Box>
                                }
                                <Box sx={{ minHeight: '24px' }}>
                                    <Fade in={!!errorMessage} timeout={500}>
                                        <TmTypography
                                            color='error'
                                            variant='body2'
                                            testid='resetPasswordPageError'
                                        >
                                            {errorMessage || ''}
                                        </TmTypography>
                                    </Fade>
                                </Box>
                                <TmButton
                                    testid='resetPasswordSubmitButton'
                                    type='submit'
                                    fullWidth
                                    variant='contained'
                                    size='large'
                                    color='primary'
                                    disabled={isButtonDisabled}
                                    sx={{ mt: 5}}
                                    startIcon={isChanging ? <CircularProgress size={20} color='inherit' /> : <LockResetIcon />}
                                >
                                    {t('resetPassword')}
                                </TmButton>
                            </Stack>
                        </Grid>
                        {!isMobile && <Grid size={{ xs: isMobile ? 12 : 6, md: isMobile ? 12 : 6 }}>
                            <PasswordRequirements
                                password={watchedValues.newPassword || ''}
                                currentPassword={watchedValues.currentPassword || ''}
                                username={username}
                            />
                        </Grid>}
                    </Grid>
                </Box>
            </AuthLayout>
        </>
    );
}

export default ResetPasswordPage;
