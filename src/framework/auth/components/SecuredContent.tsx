import GppBadTwoToneIcon from '@mui/icons-material/GppBadTwoTone';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import LoginIcon from '@mui/icons-material/Login';
import { Box, Container } from '@mui/material';
import { ReactElement, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Role } from '../../../project/auth/roles';
import TmButton from '../../components/button/TmButton';
import TmTypography from '../../components/typography/TmTypography';
import { ConfigContext } from '../../config/ConfigContext';
import { selectActiveTenant } from '../../config/configSlice';
import { useAppSelector } from '../../redux/hooks';
import { selectAuthIsAuthenticated } from '../authSlice';
import AuthService from '../authService';

type Props = {
    accessRoles: Role[];
    children: ReactElement;
}

function SecuredContent({ accessRoles, children }: Readonly<Props>) {
    const { t } = useTranslation();

    // Check Auth Login
    const isAuthenticated = useAppSelector(selectAuthIsAuthenticated);

    // Check Tenancy
    const { tenancy: configTenancy } = useContext(ConfigContext);
    const activeTenancy = useAppSelector(selectActiveTenant);
    const allowBasedOnTenancy = activeTenancy === configTenancy.tenant;

    // Callbacks
    const handleLogin = useCallback(() => AuthService.doLogin(), []);

    // RENDER
    // Not correct tenant
    if (!allowBasedOnTenancy) {
        return (
            <Container>
                <Box margin={10} textAlign='center'>
                    <HomeWorkOutlinedIcon color='error' fontSize='large' />
                    <TmTypography testid={'invalidTenant'} variant='h5' color='warning' marginBottom={10}>
                        {t('invalidTenant')}
                    </TmTypography>
                </Box>
            </Container>
        );
    }
    // Not logged in
    if (!isAuthenticated) {
        return (
            <Container>
                <Box margin={10} textAlign='center'>
                    <LockOpenTwoToneIcon color='warning' fontSize='large' />
                    <TmTypography testid={'securedContentLoginRequired'} variant='h5' color='warning' marginBottom={10}>
                        {t('loginNeeded')}
                    </TmTypography>
                    <TmButton
                        testid={'securedContentLoginButton'}
                        type='submit'
                        variant='outlined'
                        color='warning'
                        size='large'
                        startIcon={<LoginIcon />}
                        onClick={handleLogin}
                    >
                        {t('login')}
                    </TmButton>
                </Box>
            </Container>
        );
    }
    // Not allowed access
    const allowView = AuthService.hasRoles(accessRoles);
    if (!allowView) {
        return (
            <Container>
                <Box marginTop={10} textAlign='center'>
                    <GppBadTwoToneIcon color='error' fontSize='large' />
                    <TmTypography testid={'securedContentAccessDenied'} variant='h4' color='error' textAlign='center'>
                        {t('accessDenied')}
                    </TmTypography>
                </Box>
            </Container>
        );
    }
    // Logged in and has access, thus the children can be rendered
    return children;
}

export default SecuredContent;
