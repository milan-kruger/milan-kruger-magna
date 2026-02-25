import { AppBar, Box, Stack, Theme, useMediaQuery } from '@mui/material';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useGeneratedMenuItems from '../../../project/components/app-bar/menuItems';
import WeighbridgeMenu from '../../../project/components/app-bar/sub-components/menus/WeighbridgeMenu';
import { useAppDispatch } from '../../redux/hooks';
import { setThemeMode } from '../../ui/uiSlice';
import { MobileScreenBox } from './styles/MobileScreenBox';
import { DesktopScreenBox } from './styles/NormalScreenBox';
import { DesktopAppBarMenu } from './sub-components/desktop/DesktopAppBarMenu';
import { DesktopLogo } from './sub-components/desktop/DesktopLogo';
import { DesktopLogoIcon } from './sub-components/desktop/DesktopLogoIcon';
import { TenantFilter } from './sub-components/desktop/TenantFilter';
import { AppMenu } from './sub-components/menus/AppMenu';
import { TenantMenu } from './sub-components/menus/TenantMenu';
import UserMenu from './sub-components/menus/UserMenu';
import { MobileAppBarMenu } from './sub-components/mobile/MobileAppBarMenu';
import { MobileLogo } from './sub-components/mobile/MobileLogo';
import { MobileLogoIcon } from './sub-components/mobile/MobileLogoIcon';
import { TerminalMenu } from './sub-components/menus/TerminalMenu';

function ResponsiveAppBar() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    useHotkeys('CTRL+D', () => dispatch(setThemeMode('dark')), { preventDefault: true, description: String(t('darkMode')) });
    useHotkeys('CTRL+L', () => dispatch(setThemeMode('light')), { preventDefault: true, description: String(t('lightMode')) });

    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const menuItems = useGeneratedMenuItems();

    // NOTE: Hooks should not be called in for loops or conditionally, 
    // but since the MenuItems array won't ever change we can 'safely' bypass the warning.
    for (let i = 0; i < menuItems.length; i++) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useHotkeys(`CTRL+SHIFT+F${i + 1}`, () => handleNavigation(i), { preventDefault: true, enableOnFormTags: true, description: String(t('navigateToPage')) + ': ' + t(menuItems[i].title) });
    }
    useHotkeys('CTRL+SHIFT+F12', () => navigate('/'), { preventDefault: true, enableOnFormTags: true, description: String(t('navigateToPage')) + ': ' + String(t('home')) });

    const [openDrawer, setOpenDrawer] = useState(false);

    const handleToggleDrawer = useCallback((open: boolean) => {
        setOpenDrawer(open);
    }, []);

    const navigate = useNavigate();

    function handleNavigation(index: number) {
        const menuItem = menuItems[index];
        if (menuItem.action) {
            menuItem.action();
        }
        navigate(menuItem.url);
    }

    return (
        <AppBar position='sticky'>
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    <DesktopLogoIcon />
                    <DesktopLogo />
                    {isMobile &&
                        <>
                            <MobileAppBarMenu
                                openDrawer={openDrawer}
                                handleToggleDrawer={handleToggleDrawer}
                            />
                            <MobileScreenBox
                                sx={{
                                    flexGrow: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <MobileLogoIcon />
                                <MobileLogo />
                            </MobileScreenBox>
                        </>
                    }
                    <DesktopAppBarMenu />
                    <DesktopScreenBox>
                        <Stack direction='row' gap={5} alignItems='center'>
                            <TenantFilter />
                            <Box marginRight={20} />
                            <TerminalMenu />
                            <WeighbridgeMenu />
                            <TenantMenu />
                            <AppMenu />
                            <UserMenu />
                        </Stack>
                    </DesktopScreenBox>
                    {isMobile &&
                        <MobileScreenBox>
                            <UserMenu />
                        </MobileScreenBox>
                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;
