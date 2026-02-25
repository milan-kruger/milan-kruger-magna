import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import EditRoadIcon from '@mui/icons-material/EditRoad';
import GavelIcon from '@mui/icons-material/Gavel';
import GridViewIcon from '@mui/icons-material/GridView';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import ScaleIcon from '@mui/icons-material/Scale';
import { Grid, Link, Stack, Tooltip, useTheme } from '@mui/material';
import { MouseEvent, ReactElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthService from '../../../../auth/authService';
import { ConfigContext } from '../../../../config/ConfigContext';
import toCamelCase, { titleCaseWord, toCamelCaseWords } from '../../../../utils';
import TmIconButton from '../../../button/TmIconButton';
import TmMenu from '../../../menu/TmMenu';
import TmTypography from '../../../typography/TmTypography';
import TmAppMenuButton from '../../styles/TmAppMenuButton';
import { MobileMenuButtons } from './MobileMenuButtons';

type Props = {
    isMobile?: boolean;
}

export function AppMenu({ isMobile } : Readonly<Props>) {
    const { t } = useTranslation();
    const theme = useTheme();

    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuTransform, setMenuTransform] = useState<string>('translateY(-100px)');
    const config = useContext(ConfigContext);

    const apps = Object.entries(config.subsystem.apps).map(([key, value]) => {
        const centralApps = ['core', 'reports'];
        const isTargetAppValid = key === 'portal'
            || centralApps.includes(key)
            || (!window.location.host.includes('central') && !centralApps.includes(key));
        const hasAccess = getAppAccess(key) && isTargetAppValid;
        return {
            icon: getAppIcon(key, config.subsystem.currentApp === key ? 'secondary' : (hasAccess ? undefined : 'disabled')),
            key: key,
            title: t(`app${titleCaseWord(key)}`),
            link: hasAccess ? value : undefined,
            access: hasAccess
        };
    });

    const [anchorElAppMenu, setAnchorElAppMenu] = useState<null | HTMLElement>(null);

    const handleOpenAppMenu = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorElAppMenu(event.currentTarget);
    }, []);

    const handleCloseAppMenu = useCallback(() => {
        setAnchorElAppMenu(null);
    }, []);

    const buttonTestId = 'appMenuIcon';
    const buttonText = t(toCamelCaseWords('app', config.subsystem.currentApp)).toUpperCase();

    const desktopMenu = useMemo(() => (
        <Stack alignItems='center'>
            <TmIconButton testid={buttonTestId} onClick={handleOpenAppMenu}>
                <Tooltip title={t('menuAppsTooltip')}>
                    <GridViewIcon
                        fontSize='large'
                        style={{ color: theme.palette.primary.contrastText }}
                    />
                </Tooltip>
            </TmIconButton>
            <TmTypography
                testid='appActive'
                style={{ marginTop: -10 }}
                variant='caption'
                color={theme.palette.primary.contrastText}
            >
                {buttonText}
            </TmTypography>
        </Stack>
    ), [buttonText, handleOpenAppMenu, t, theme.palette.primary.contrastText]);

    const mobileMenu = useMemo(() => (
        <MobileMenuButtons
            testid={buttonTestId}
            onClick={handleOpenAppMenu}
            icon={<GridViewIcon />}
            label={buttonText}
        />
    ), [buttonText, handleOpenAppMenu]);

    useEffect(() => {
        if (menuRef.current) {
            const menuHeight = menuRef.current.offsetHeight;
            setMenuTransform(`translateY(-${menuHeight}px)`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuRef.current]);

    const menu = useMemo(() => (
        <TmMenu
            testid={'appMenu'}
            ref={menuRef}
            sx={{ mt: '47px', transform: !isMobile ? 0 : menuTransform }}
            anchorEl={anchorElAppMenu}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center'
            }}
            open={Boolean(anchorElAppMenu)}
            onClose={handleCloseAppMenu}
        >
            <Grid container spacing={2} paddingLeft={5} paddingRight={5}>
                {apps.map((subSystem) => (
                    <Grid key={subSystem.key} size={{ xs: 4 }}>
                        <TmAppMenuButton
                            testid={toCamelCaseWords('appMenuItemButton', toCamelCase(subSystem.key))}
                            onClick={handleCloseAppMenu}
                            disabled={!subSystem.access}
                        >
                            <Link href={subSystem.link} underline='none' color='inherit'>
                                <Stack>
                                    {subSystem.icon}
                                    <TmTypography
                                        testid={toCamelCaseWords('appMenuItemText', toCamelCase(subSystem.key))}
                                        variant='caption'
                                        textAlign='center'
                                        color={config.subsystem.currentApp === subSystem.key ? 'secondary' : subSystem.access ? undefined : theme.palette.mode === 'light' ? '#555' : '#777'}
                                        fontWeight={config.subsystem.currentApp === subSystem.key || subSystem.access ? 'bold' : undefined}
                                        overflow='hidden'
                                        textOverflow='ellipsis'
                                    >
                                        {subSystem.title.toUpperCase()}
                                    </TmTypography>
                                </Stack>
                            </Link>
                        </TmAppMenuButton>
                    </Grid>
                ))}
            </Grid>
        </TmMenu>
    // ), [anchorElAppMenu, apps, config.subsystem.currentApp, handleCloseAppMenu, isMobile, theme.palette.mode]);
    ), [anchorElAppMenu, apps, config.subsystem.currentApp, handleCloseAppMenu, isMobile, menuTransform, theme.palette.mode]);

    return (
        <>
            { isMobile ? mobileMenu : desktopMenu}
            {menu}
        </>
    );
}

function getAppIcon(app: string, color?: 'primary' | 'secondary' | 'error' | 'disabled', size?: string): ReactElement {
    switch (app) {
        case 'example':
            return <EditRoadIcon color={color} sx={{ fontSize: size }} id='appMenuItemExampleIcon' />;
        case 'portal':
            return <DashboardIcon color={color} sx={{ fontSize: size }} id='appMenuItemPortalIcon' />;
        case 'core':
            return <AdminPanelSettingsIcon color={color} sx={{ fontSize: size }} id='appMenuItemCoreIcon' />;
        case 'weigh':
            return <ScaleIcon color={color} sx={{ fontSize: size }} id='appMenuItemWeighIcon' />;
        case 'transgressions':
            return <GavelIcon color={color} sx={{ fontSize: size }} id='appMenuItemTransgressionsIcon' />;
        case 'reports':
            return <DescriptionIcon color={color} sx={{ fontSize: size }} id='appMenuItemReportsIcon' />;
        default:
            return <HelpCenterIcon color={color} sx={{ fontSize: size }} id='appMenuItemDefaultIcon' />;
    }
}

function getAppAccess(app: string): boolean {
    switch (app) {
        case 'example':
            return true;
        case 'portal':
            return true
        case 'core':
            return AuthService.hasRole('CORE_SUBSYSTEM');
        case 'weigh':
            return AuthService.hasRole('WEIGH_SUBSYSTEM');
        case 'transgressions':
            return AuthService.hasRole('TRANSGRESSIONS_SUBSYSTEM');
        case 'reports':
            return AuthService.hasRole('REPORTS_SUBSYSTEM');
        default:
            return false;
    }
}
