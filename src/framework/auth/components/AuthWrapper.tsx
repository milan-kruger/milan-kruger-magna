import SecurityTwoToneIcon from '@mui/icons-material/SecurityTwoTone';
import { Box, Container } from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmLoadingSpinner from '../../components/progress/TmLoadingSpinner';
import TmTypography from '../../components/typography/TmTypography';
import { useAppDispatch } from '../../redux/hooks';
import { login } from '../authSlice';
import AuthService from '../authService';

type Props = {
    children: ReactElement;
}

function AuthWrapper({ children }: Readonly<Props>) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [authInitialised, setAuthInitialised] = useState(false);
    useEffect(() => {
        AuthService.setupAuth((authenticated: boolean) => {
            setAuthInitialised(true);
            const token = AuthService.getToken();
            const user = AuthService.getUserName();
            if (authenticated && token) {
                dispatch(login({
                    user: user,
                    token: token,
                    isAuthenticated: true
                }));
            }
        });
    }, [dispatch]);
    if (!authInitialised) {
        return (
            <Container>
                <Box marginTop={10} textAlign='center'>
                    <SecurityTwoToneIcon color='info' fontSize='large' />
                    <TmTypography testid={'authLoad'} variant='h4' color='info' textAlign='center' marginBottom={5}>
                        {t('authLoading')}
                    </TmTypography>
                    <TmLoadingSpinner testid={'authLoadSpinner'} size={40} />
                </Box>
            </Container>
        );
    }
    return children;
}

export default AuthWrapper;
