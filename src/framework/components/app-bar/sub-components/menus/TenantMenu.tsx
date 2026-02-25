import HomeIcon from '@mui/icons-material/Home';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import OtherHousesIcon from '@mui/icons-material/OtherHouses';
import { Grid, Link, Stack, Tooltip, useTheme } from '@mui/material';
import { MouseEvent, ReactElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigContext } from '../../../../config/ConfigContext';
import toCamelCase, { toCamelCaseWords } from '../../../../utils';
import TmIconButton from '../../../button/TmIconButton';
import TmMenu from '../../../menu/TmMenu';
import TmTypography from '../../../typography/TmTypography';
import TmAppMenuButton from '../../styles/TmAppMenuButton';
import { MobileMenuButtons } from './MobileMenuButtons';

type Props = {
    isMobile?: boolean;
}

export function TenantMenu({ isMobile } : Readonly<Props>) {
    const { t } = useTranslation();
    const theme = useTheme();

    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuTransform, setMenuTransform] = useState<string>('translateY(-100px)');
    const config = useContext(ConfigContext);

    const tenants = Object.entries(config.tenancy.tenants).map(([key, value]) => ({
        title: key,
        icon: getIcon(config.tenancy.coreTenant, key, config.tenancy.tenant === key ? 'secondary' : undefined),
        url: value
    }));

    const [anchorElTenantMenu, setAnchorElTenantMenu] = useState<null | HTMLElement>(null);

    const handleOpenTenantMenu = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorElTenantMenu(event.currentTarget);
    }, []);

    const handleCloseTenantMenu = useCallback(() => {
        setAnchorElTenantMenu(null);
    }, []);

    const buttonTestId = 'tenantMenuIcon';
    const buttonText = config.tenancy.tenant.toUpperCase();

    const desktopMenu = useMemo(() => (
        <Stack alignItems='center'>
            <TmIconButton testid={buttonTestId} onClick={handleOpenTenantMenu}>
                <Tooltip title={t('menuTenantsTooltip')}>
                    <HomeWorkOutlinedIcon
                        fontSize='large'
                        style={{ color: theme.palette.primary.contrastText }}
                    />
                </Tooltip>
            </TmIconButton>
            <TmTypography
                testid='tenantActive'
                style={{ marginTop: -10 }}
                variant='caption'
                color={theme.palette.primary.contrastText}
            >
                {buttonText}
            </TmTypography>
        </Stack>
    ), [buttonText, handleOpenTenantMenu, t, theme.palette.primary.contrastText]);

    const mobileMenu = useMemo(() => (
        <MobileMenuButtons
            testid={buttonTestId}
            onClick={handleOpenTenantMenu}
            icon={<HomeWorkOutlinedIcon />}
            label={buttonText}
        />
    ), [buttonText, handleOpenTenantMenu]);

    useEffect(() => {
        if (menuRef.current) {
            const menuHeight = menuRef.current.offsetHeight; // Get menu height
            setMenuTransform(`translateY(-${menuHeight}px)`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuRef.current]); // Recalculate when ref changes

    const menu = useMemo(() => (
        <TmMenu
            testid={'tenantMenu'}
            ref={menuRef}
            sx={{ mt: '47px', transform: !isMobile ? 0 : menuTransform }}
            anchorEl={anchorElTenantMenu}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            open={Boolean(anchorElTenantMenu)}
            onClose={handleCloseTenantMenu}
        >
            <Grid container spacing={2} paddingLeft={5} paddingRight={5}>
                {tenants.map((item) => (
                    <Grid key={item.title} size={{ xs: 6 }}>
                        <TmAppMenuButton
                            testid={toCamelCaseWords('tenantMenuItemButton', toCamelCase(item.title))}
                            onClick={handleCloseTenantMenu}
                        >
                            <Link href={item.url} underline='none' color='inherit'>
                                <Stack>
                                    {item.icon}
                                    <TmTypography
                                        testid={toCamelCaseWords('tenantMenuItemText', toCamelCase(item.title))}
                                        variant='caption'
                                        textAlign='center'
                                        style={{ display: 'block' }}
                                        color={config.tenancy.tenant === item.title ? 'secondary' : undefined}
                                        fontWeight='bold'
                                    >
                                        {item.title.toUpperCase()}
                                    </TmTypography>
                                </Stack>
                            </Link>
                        </TmAppMenuButton>
                    </Grid>
                ))}
            </Grid>
        </TmMenu >
    ), [isMobile, anchorElTenantMenu, handleCloseTenantMenu, tenants, config.tenancy.tenant]);

    return (
        <>
            {isMobile ? mobileMenu : desktopMenu}
            {menu}
        </>
    );
}

function getIcon(coreTenant: string, tenant: string, color?: 'primary' | 'secondary' | 'error'): ReactElement {
    switch (tenant) {
        case coreTenant:
            return <OtherHousesIcon color={color} id='tenantMenuItemCentralIcon' />;
        default:
            return <HomeIcon color={color} id='tenantMenuItemDefaultIcon' />;
    }
}
