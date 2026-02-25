/* eslint-disable @typescript-eslint/no-explicit-any */
import LoginIcon from '@mui/icons-material/Login';
import { Box, CircularProgress, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../auth/authService';
import TmButton from '../../components/button/TmButton';
import TmTextField from '../../components/textfield/TmTextField';
import TmPasswordTextfield from '../../components/textfield/emailPassword/TmPasswordTextfield';
import TmTypography from '../../components/typography/TmTypography';
import { useAppSelector } from '../../redux/hooks';
import { LoginRequest, useLoginMutation, useGetLoggedInUserQuery } from '../../../project/redux/api/coreApi';
import { selectActiveTenant } from '../../config/configSlice';
import AuthLayout from '../../components/auth-layout/AuthLayout';
import { useHotkeys } from 'react-hotkeys-hook';
import { UserRoleInfo } from '../../../project/auth/userRole.types';

function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const activeTenancy = useAppSelector(selectActiveTenant);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string>('');
    const [lastSubmittedData, setLastSubmittedData] = useState<LoginRequest | null>(null);
    const [loginMutation, { isLoading, data: loginData, isSuccess, error: loginError }] = useLoginMutation();
    const [fetchUserRoles, setFetchUserRoles] = useState(false);

    const { data: loggedInUserData } = useGetLoggedInUserQuery(
        { username: currentUsername },
        { skip: !fetchUserRoles || !currentUsername }
    );

    const { control, handleSubmit, watch } = useForm<LoginRequest>({
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const watchedValues = watch();

    useEffect(() => {
        if (errorMessage && lastSubmittedData) {
            if (watchedValues.username !== lastSubmittedData.username ||
                watchedValues.password !== lastSubmittedData.password) {
                setErrorMessage(null);
            }
        }
    }, [watchedValues.username, watchedValues.password, errorMessage, lastSubmittedData]);

    const handleLogin = useCallback((data: LoginRequest) => {
        setCurrentUsername(data.username.toUpperCase());
        setLastSubmittedData(data);
        loginMutation({
            loginRequest: {
                username: data.username.toUpperCase(),
                password: data.password,
                tenant: activeTenancy
            }
        });
    }, [loginMutation, activeTenancy]);

    useEffect(() => {
        if (isSuccess && loginData) {
            const loginResponse = AuthService.handleLoginResponse(loginData, currentUsername);
            if (loginResponse) {
                if (loginResponse.resetCredentials) {
                    navigate('/resetPassword', {
                        replace: true,
                        state: {
                            fromLogin: true,
                            userAccountId: loginResponse.userAccountId
                        }
                    });
                } else {
                    // Trigger fetching user role information
                    setFetchUserRoles(true);
                }
            }
        }
    }, [isSuccess, loginData, navigate, currentUsername, location]);

    useEffect(() => {
        if (loggedInUserData && fetchUserRoles) {
            // Extract roles with enabled status from userAccountGroups
            const rolesInfo: UserRoleInfo[] = [];

            loggedInUserData.userAccountGroups?.forEach(group => {
                if (!group.userGroup?.userRoles || group.userGroup.userRoles.length === 0) {
                    console.error('⚠️ No roles found for user group:', group.userGroup?.userGroupName);
                    console.error('   Roles value:', group.userGroup?.userRoles);
                    return;
                }

                group.userGroup.userRoles.forEach((role: any) => {
                    // Backend returns UserRole objects with { id, role, enabled, description, etc. }
                    if (typeof role === 'object' && role !== null && 'role' in role && 'enabled' in role) {
                        rolesInfo.push({
                            role: role.role,
                            enabled: role.enabled
                        });
                    } else if (typeof role === 'string') {
                        // Fallback for backward compatibility if backend returns strings
                        rolesInfo.push({
                            role: role as string,
                            enabled: true
                        });
                    }
                });
            });

            // Store role information with enabled status
            AuthService.setUserRolesInfo(rolesInfo);

            // Navigate to the original page or home
            const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
            const from = redirectAfterLogin || '/';
            navigate(from, { replace: true });
        }
    }, [loggedInUserData, fetchUserRoles, navigate]);

    useEffect(() => {
        if (loginError) {
            const errorData = (loginError as any)?.data;
            if (errorData?.errors?.[0]?.message) {
                setErrorMessage(errorData.errors[0].message);
            }
        }
    }, [loginError, t]);

    const onSubmit: SubmitHandler<LoginRequest> = (data) => {
        handleLogin(data);
    };

    const isButtonDisabled = useMemo(() => {
        if (!watchedValues.username || !watchedValues.password) {
            return true;
        }

        if (isLoading || (isSuccess && loginData)) {
            return true;
        }

        if (errorMessage && lastSubmittedData) {
            return (
                watchedValues.username === lastSubmittedData.username &&
                watchedValues.password === lastSubmittedData.password
            );
        }

        return false;
    }, [ watchedValues.username, watchedValues.password, isLoading, errorMessage, lastSubmittedData, isSuccess, loginData ]);

    useHotkeys('ENTER', () => {
        handleSubmit(onSubmit)();
    }, {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: !isButtonDisabled
    });

    return (
        <AuthLayout>
            <Box
                component='form'
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    px: isMobile ? 4 : 6,
                    pb: isMobile ? 5 : 6,
                    mt: 10
                }}
            >
                <Stack gap={5}>
                    <Controller
                        name='username'
                        control={control}
                        rules={{ required: t('usernameRequired') }}
                        render={({ field }) => (
                            <TmTextField
                                {...field}
                                onChange={(e) => {
                                    const cursor = e.target.selectionStart;
                                    field.onChange(e.target.value.toUpperCase());
                                    requestAnimationFrame(() => {
                                        e.target.setSelectionRange(cursor, cursor);
                                    });
                                }}
                                testid='loginPageUsername'
                                margin='normal'
                                required
                                fullWidth
                                label={t('username')}
                                autoComplete='off'
                                autoFocus
                                error={!!errorMessage}
                            />
                        )}
                    />
                    <Controller
                        name='password'
                        control={control}
                        rules={{ required: t('passwordRequired') }}
                        render={({ field }) => (
                            <TmPasswordTextfield
                                testid='loginPagePassword'
                                label={t('password')}
                                password={field.value}
                                setPasswordValue={field.onChange}
                                passwordError={!!errorMessage}
                                setPasswordError={() => { } }
                                helperText={''}
                            />
                        )}
                    />
                    <Box sx={{ minHeight: '24px' }}>
                        {errorMessage && (
                            <TmTypography
                                color='error'
                                variant='body2'
                                testid='loginPageError'
                            >
                                {errorMessage}
                            </TmTypography>
                        )}
                    </Box>
                    <TmButton
                        testid='loginPageLoginButton'
                        type='submit'
                        fullWidth
                        variant='contained'
                        size='large'
                        color='primary'
                        disabled={isButtonDisabled}
                        startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> :<LoginIcon />}
                        loading={isLoading || (loginData && isSuccess)}
                    >
                        {t('login')}
                    </TmButton>
                </Stack>
            </Box>
        </AuthLayout>
    );
}

export default LoginPage;
