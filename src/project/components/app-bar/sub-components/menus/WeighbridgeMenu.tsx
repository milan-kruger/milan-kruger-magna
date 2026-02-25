import EmojiTransportationIcon from '@mui/icons-material/EmojiTransportation';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Grid, Stack, Tooltip, useTheme } from '@mui/material';
import { MouseEvent, ReactElement, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthService from '../../../../../framework/auth/authService';
import TmAppMenuButton from '../../../../../framework/components/app-bar/styles/TmAppMenuButton';
import { MobileMenuButtons } from '../../../../../framework/components/app-bar/sub-components/menus/MobileMenuButtons';
import TmIconButton from '../../../../../framework/components/button/TmIconButton';
import TmMenu from '../../../../../framework/components/menu/TmMenu';
import TmTypography from '../../../../../framework/components/typography/TmTypography';
import { selectActiveAuthority, selectActiveWeighbridge, setActiveWeighbridge } from '../../../../../framework/config/configSlice';
import { useAppDispatch, useAppSelector } from '../../../../../framework/redux/hooks';
import toCamelCase, { toCamelCaseWords } from '../../../../../framework/utils';
import { useFindTrafficControlCentresByAuthorityQuery } from '../../../../redux/api/coreApi';

type Props = {
    isMobile?: boolean;
}

export function WeighbridgeMenu({ isMobile } : Readonly<Props>) {
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuTransform, setMenuTransform] = useState<string>('translateY(-100px)');
    const activeAuthority = useAppSelector(selectActiveAuthority);
    const activeWeighbridge = useAppSelector(selectActiveWeighbridge);

    const { data: weighStations } = useFindTrafficControlCentresByAuthorityQuery({
        authorityCode: activeAuthority
    }, {
        skip: !AuthService.isLoggedIn() || activeAuthority.length === 0
    });

    const weighbridgesPerAuthority = useMemo(() => weighStations?.[0]?.weighbridges ?? [], [weighStations]);

    useEffect(() => {
        if (activeWeighbridge.length === 0) {
            // Select the first (only) weighbridge if none has been selected yet
            const weighbridgeCode = (weighbridgesPerAuthority?.[0]?.weighbridgeCode)
                ? weighbridgesPerAuthority[0].weighbridgeCode : '';
            dispatch(setActiveWeighbridge(weighbridgeCode));
        }
    }, [dispatch, activeWeighbridge.length, weighbridgesPerAuthority]);

    const [anchorMenu, setAnchorMenu] = useState<null | HTMLElement>(null);

    const handleOpenMenu = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorMenu(event.currentTarget);
    }, []);

    const handleCloseMenu = useCallback((code?: string | null) => () => {
        if (code) {
            dispatch(setActiveWeighbridge(code));
        }
        setAnchorMenu(null);
    }, [dispatch]);

    const weighbridges = useMemo(() => {
        const menuItems = [];
        for (const tempWeighbridge of weighbridgesPerAuthority) {
            menuItems.push({
                code: tempWeighbridge.weighbridgeCode,
                title: t(tempWeighbridge.weighbridgeCode!).toUpperCase(),
                icon: getIcon(tempWeighbridge.weighbridgeCode === activeWeighbridge ? 'secondary' : undefined)
            });
        }
        return menuItems;
    }, [activeWeighbridge, t, weighbridgesPerAuthority]);

    const buttonTestId = 'weighbridgeMenuIcon';
    const buttonText = t(activeWeighbridge).toUpperCase();

    const desktopMenu = useMemo(
        () => (
            <Stack alignItems='center'>
                <TmIconButton
                    testid={buttonTestId}
                    onClick={handleOpenMenu}
                >
                    <Tooltip title={t('menuWeighbridgesTooltip')}>
                        <EmojiTransportationIcon
                            fontSize='large'
                            style={{ color: theme.palette.primary.contrastText }}
                        />
                    </Tooltip>
                </TmIconButton>
                <TmTypography
                    testid='weighbridgeActive'
                    style={{ marginTop: -10 }}
                    variant='caption'
                    color={theme.palette.primary.contrastText}
                >
                    {buttonText}
                </TmTypography>
            </Stack>
        ),
        [buttonText, handleOpenMenu, t, theme.palette.primary.contrastText]
    );

    const mobileMenu = useMemo(() => (
        <MobileMenuButtons
            testid={buttonTestId}
            onClick={handleOpenMenu}
            icon={<EmojiTransportationIcon />}
            label={buttonText}
        />
    ), [buttonText, handleOpenMenu]);

    useEffect(() => {
        if (menuRef.current) {
            const menuHeight = menuRef.current.offsetHeight;
            setMenuTransform(`translateY(-${menuHeight}px)`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuRef.current]);

    const menu = useMemo(
        () => (
            <TmMenu
                testid={'weighbridgeMenu'}
                ref={menuRef}
                sx={{ mt: '47px', transform: !isMobile ? 0 : menuTransform }}
                anchorEl={anchorMenu}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={Boolean(anchorMenu)}
                onClose={handleCloseMenu(null)}
            >
                <Grid container spacing={2} paddingLeft={5} paddingRight={5}>
                    {weighbridges.length > 1
                        ? weighbridges.map((item) => (
                            <Grid key={item.title} size={{ xs: 4 }}>
                                <TmAppMenuButton
                                    testid={toCamelCaseWords(
                                        'weighbridgeMenuItemButton',
                                        toCamelCase(item.title)
                                    )}
                                    onClick={handleCloseMenu(item.code)}
                                >
                                    <Stack>
                                        {item.icon}
                                        <TmTypography
                                            testid={toCamelCaseWords(
                                                'weighbridgeMenuItemText',
                                                toCamelCase(item.title)
                                            )}
                                            variant='caption'
                                            textAlign='center'
                                            style={{ display: 'block' }}
                                            color={item.code === activeWeighbridge ? 'secondary' : undefined}
                                            fontWeight={item.code === activeWeighbridge ? 'bold' : undefined}
                                        >
                                            {item.title}
                                        </TmTypography>
                                    </Stack>
                                </TmAppMenuButton>
                            </Grid>
                        ))
                        : weighbridges.map((item) => (
                            <Grid size={{ md: 12, lg: 12 }} key={item.title}>
                                <TmAppMenuButton
                                    testid={toCamelCaseWords(
                                        'weighbridgeMenuItemButton',
                                        toCamelCase(item.title)
                                    )}
                                    onClick={handleCloseMenu(item.code)}
                                >
                                    <Stack>
                                        {item.icon}
                                        <TmTypography
                                            testid={toCamelCaseWords(
                                                'weighbridgeMenuItemText',
                                                toCamelCase(item.title)
                                            )}
                                            variant='caption'
                                            textAlign='center'
                                            style={{ display: 'block' }}
                                            color={item.code === activeWeighbridge ? 'secondary' : undefined}
                                            fontWeight={item.code === activeWeighbridge ? 'bold' : undefined}
                                        >
                                            {item.title}
                                        </TmTypography>
                                    </Stack>
                                </TmAppMenuButton>
                            </Grid>
                        ))}
                </Grid>
            </TmMenu>
        ),
        [activeWeighbridge, anchorMenu, handleCloseMenu, isMobile, menuTransform, weighbridges]
    );

    if (!AuthService.isLoggedIn() || weighbridgesPerAuthority.length === 0) {
        return null;
    }
    return (
        <>
            {isMobile ? mobileMenu : desktopMenu}
            {menu}
        </>
    );
}

export default memo(WeighbridgeMenu);

function getIcon(color?: 'primary' | 'secondary' | 'error'): ReactElement {
    return (
        <LocalShippingIcon
            color={color}
            id='weighbridgeMenuItemCentralIcon'
        />
    );
}
