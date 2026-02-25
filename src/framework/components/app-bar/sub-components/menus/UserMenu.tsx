import KeyboardIcon from '@mui/icons-material/Keyboard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Divider, Stack, Tooltip } from '@mui/material';
import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../../../auth/authService';
import TmIconButton from '../../../button/TmIconButton';
import HotkeysDialog from '../../../help/HotkeysDialog';
import TmMenu from '../../../menu/TmMenu';
import TmMenuItem from '../../../menu/TmMenuItem';
import TmTypography from '../../../typography/TmTypography';
import TmAppBarAvatar from '../../styles/TmAppBarAvatar';
import ThemeToggle from './ThemeToggle';
import { useAppSelector } from '../../../../redux/hooks';
import { selectAuthIsAuthenticated, selectAuthUser } from '../../../../auth/authSlice';

function UserMenu() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const pageTitle = t(location.pathname.split('/').filter(string => string !== '')[0]);

    // Use Redux selectors for authentication state
    const isAuthenticated = useAppSelector(selectAuthIsAuthenticated);
    const user = useAppSelector(selectAuthUser);

    const [openHotkeysDialog, setOpenHotkeysDialog] = useState(false);
    useHotkeys('CTRL+SHIFT+?', () => setOpenHotkeysDialog(true), { preventDefault: true, description: String(t('openHotkeysHelp')) });

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    }, []);

    const handleCloseUserMenu = useCallback(() => {
        setAnchorElUser(null);
    }, []);

    const Avatar = useMemo(
        () => (
            <TmIconButton testid={'avatarButton'} onClick={handleOpenUserMenu}>
                <Tooltip title={user}>
                    <TmAppBarAvatar id='avatarIcon'>
                        {isAuthenticated && user ? user.substring(0, 2).toUpperCase() : undefined}
                    </TmAppBarAvatar>
                </Tooltip>
            </TmIconButton>
        ),
        [handleOpenUserMenu, isAuthenticated, user]
    );

    const UserMenu = useMemo(() => (
        <TmMenu
            testid={'userMenu'}
            sx={{ mt: '47px' }}
            anchorEl={anchorElUser}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
        >
            {isAuthenticated &&
                <Stack>
                    <Stack direction='row' gap={4} marginLeft={5} marginRight={5}>
                        <TmAppBarAvatar id='profileAvatarIcon' style={{ width: 60, height: 60 }}>
                            {isAuthenticated && user
                                ? <TmTypography testid='profileAvatarText' variant='h4'>
                                    {user.substring(0, 2).toUpperCase()}
                                </TmTypography>
                                : undefined}
                        </TmAppBarAvatar>
                        <TmTypography testid='profileUserName' variant='h6' alignSelf='center'>
                            {user ? user.toUpperCase() : ''}
                        </TmTypography>
                    </Stack>
                    <TmMenuItem
                        testid={'profileMenuItem'}
                        onClick={() => {
                            navigate('profile');
                            handleCloseUserMenu();
                        }}
                        style={{ gap: 15, margin: 10 }}
                    >
                        <ManageAccountsIcon id='profileMenuIcon' />
                        <TmTypography testid='profileMenuText' textAlign='center'>
                            {t('editProfile')}
                        </TmTypography>
                    </TmMenuItem>
                    <Divider />
                </Stack>
            }
            <Stack direction='row' gap={10} alignItems='center' marginX={10}>
                <ThemeToggle sx={{'&.MuiFormControlLabel-root': {ml: '-13px'}}} />
            </Stack>
            <Divider />
            <TmMenuItem
                testid={'hotkeysUserMenuItem'}
                onClick={() => {
                    setOpenHotkeysDialog(true);
                    handleCloseUserMenu();
                }}
                style={{ gap: 15, margin: 10 }}
            >
                <KeyboardIcon id='hotkeysIcon' />
                <TmTypography testid={'hotkeysHelp'} textAlign='center'>
                    {t('hotkeysHelp')}
                </TmTypography>
            </TmMenuItem>
            <HotkeysDialog
                isOpen={openHotkeysDialog}
                onClose={() => setOpenHotkeysDialog(false)}
                pageTitle={pageTitle}
            />
            <Divider />
            <TmMenuItem
                testid={'loginLogoutUserMenuItem'}
                style={{ gap: 15, margin: 10, marginBottom: 5 }}
                onClick={() => {
                    handleCloseUserMenu();
                    if (isAuthenticated) {
                        AuthService.doLogout();
                    }
                    else {
                        AuthService.doLogin();
                    }
                }}
            >
                {isAuthenticated ? <LogoutIcon id='logoutIcon' /> : <LoginIcon id='loginIcon' />}
                <TmTypography testid={'loginLogoutText'} textAlign='center' fontWeight='bold'>
                    {isAuthenticated ? t('logout') : t('login')}
                </TmTypography>
            </TmMenuItem>
        </TmMenu>
    ), [anchorElUser, handleCloseUserMenu, navigate, openHotkeysDialog, pageTitle, t, isAuthenticated, user]);

    return (
        <>
            {Avatar}
            {UserMenu}
        </>
    );
}

export default UserMenu;
