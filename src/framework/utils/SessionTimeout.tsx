import { LogoutOutlined } from '@mui/icons-material';
import {LinearProgress, useTheme} from '@mui/material';
import { Stack } from "@mui/system";
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tinycolor from "tinycolor2";
import { coreApi } from '../../project/redux/api/coreApi';
import AuthService from '../auth/authService';
import TmDialog from '../components/dialog/TmDialog';
import TmTypography from "../components/typography/TmTypography.tsx";
import { ConfigContext } from '../config/ConfigContext';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectAuthToken } from '../auth/authSlice';

const getTimeoutFromToken = (): number => {
    const refreshToken = sessionStorage.getItem('authRefreshToken');
    if (refreshToken != null) {
        const payload = JSON.parse(atob(refreshToken.split('.')[1]));
        return (payload.exp * 1000) - Date.now();
    }
    return 600000; // Default 10 minutes
};

const useSessionTimeout = () => {
    const {warningTime} = useContext(ConfigContext);

    const dispatch = useAppDispatch();
    const authToken = useAppSelector(selectAuthToken);
    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const timeoutRef = useRef<number>(undefined);
    const warningRef = useRef<number>(undefined);
    const countdownRef = useRef<number>(undefined);

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) globalThis.clearTimeout(timeoutRef.current);
        if (warningRef.current) globalThis.clearTimeout(warningRef.current);
        if (countdownRef.current) globalThis.clearInterval(countdownRef.current);
    }, []);

    const resetTimeout = useCallback(() => {
        clearTimers();
        setShowWarning(false);

        // Read timeout from the CURRENT refresh token in sessionStorage
        const currentTimeout = getTimeoutFromToken();

        if (currentTimeout <= 0) {
            AuthService.doLogout();
            return;
        }

        const updateRemainingTime = (prev: number) => {
            if (prev <= 1) {
                globalThis.clearInterval(countdownRef.current);
                return 0;
            }
            return prev - 1;
        };

        // Set warning timer
        const warningDelay = currentTimeout - warningTime;
        if (warningDelay > 0) {
            warningRef.current = globalThis.setTimeout(() => {
                if (AuthService.isLoggedIn()) {
                    setShowWarning(true);
                    setRemainingTime(Math.round(warningTime / 1000));

                    countdownRef.current = globalThis.setInterval(() => {
                        setRemainingTime(updateRemainingTime);
                    }, 1000);
                }
            }, warningDelay);
        } else if (AuthService.isLoggedIn()) {
            // Token expires in less than warningTime — show warning immediately
            setShowWarning(true);
            setRemainingTime(Math.max(Math.round(currentTimeout / 1000), 0));

            countdownRef.current = globalThis.setInterval(() => {
                setRemainingTime(updateRemainingTime);
            }, 1000);
        }

        // Set final timeout — logout when refresh token expires
        timeoutRef.current = globalThis.setTimeout(() => {
            if (AuthService.isLoggedIn()) {
                setShowWarning(false);
                AuthService.doLogout();
            }
        }, currentTimeout);
    }, [warningTime, clearTimers]);

    const handleStayLoggedIn = useCallback(async () => {
        setShowWarning(false);
        clearTimers();

        const refreshToken = sessionStorage.getItem('authRefreshToken');
        if (refreshToken) {
            try {
                const result = await dispatch(
                    coreApi.endpoints.refreshAccessToken.initiate({body: refreshToken})
                ).unwrap();

                if (result.accessToken) {
                    AuthService.setAuthToken(result.accessToken);
                    if (result.refreshToken) {
                        sessionStorage.setItem('authRefreshToken', result.refreshToken);
                    }
                    resetTimeout();
                    return;
                }
            } catch (error) {
                console.error('Failed to refresh token:', error);
                AuthService.doLogout();
                return;
            }
        }

        AuthService.doLogout();
    }, [dispatch, resetTimeout, clearTimers]);

    const handleLogout = () => {
        setShowWarning(false);
        AuthService.doLogout();
    };

    useEffect(() => {
        if (authToken) {
            // useEffect is only triggered when authToken changes, it is not a hot path so should not continuously trigger
            // eslint-disable-next-line react-hooks/set-state-in-effect
            resetTimeout();
        }
        return clearTimers;
    }, [authToken, resetTimeout, clearTimers]);

    return {
        showWarning,
        remainingTime,
        handleStayLoggedIn,
        handleLogout
    };
};

export const SessionTimeoutDialog = () => {
    const {showWarning, remainingTime, handleStayLoggedIn, handleLogout} = useSessionTimeout();
    const {t} = useTranslation();
    const theme = useTheme();
    const {warningTime} = useContext(ConfigContext);

    const maxTime = Math.round(warningTime / 1000); // Convert warningTime to seconds
    const normalise = (value: number) => (value * 100) / maxTime;

    const testId = 'sessionTimeoutWarningDialog';

    return (
        <TmDialog
            testid={testId}
            isOpen={showWarning}
            title={t('sessionTimeoutWarning')}
            message=''
            showConfirmButton={true}
            confirmLabel={t('stayLoggedIn')}
            cancelLabel={t('logout') ?? undefined}
            cancelIcon={<LogoutOutlined/>}
            onConfirm={handleStayLoggedIn}
            onCancel={handleLogout}
            medium
            contentComponent={
                <Stack gap={10} mt={5}>
                    <TmTypography variant='body2' testid={`${testId}ExpireMessage`} maxWidth='35vw'>
                        {t('sessionExpireWarningMessage')}
                    </TmTypography>
                    <TmTypography variant='h3' testid={`${testId}RemainingTime`} color='primary' sx={{textAlign: 'center'}}>
                        {remainingTime}
                    </TmTypography>
                    <LinearProgress
                        variant="determinate"
                        color="primary"
                        value={normalise(remainingTime)}
                        sx={{
                            marginTop: '15px',
                            transform: 'scaleX(-1)',
                            backgroundColor: tinycolor(theme.palette.error.light).setAlpha(0.2).toRgbString(),
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette.primary.main
                            }
                        }}
                    />
                </Stack>
            }
        />
    );
};
