import DescriptionIcon from '@mui/icons-material/Description';
import DevicesIcon from '@mui/icons-material/Devices';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import GavelIcon from '@mui/icons-material/Gavel';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
// import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ScaleIcon from '@mui/icons-material/Scale';
// import StartIcon from '@mui/icons-material/Start';
import { Box, Grid, Stack, Tooltip, useTheme } from '@mui/material';
import { MouseEvent, ReactElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PwaContext, TerminalType, terminalTypes } from '../../../../pwa/PwaWrapper';
import { titleCaseWord, toCamelCaseWords } from '../../../../utils';
import TmButton from '../../../button/TmButton';
import TmIconButton from '../../../button/TmIconButton';
import TmMenu from '../../../menu/TmMenu';
import TmTypography from '../../../typography/TmTypography';
import { MobileMenuButtons } from './MobileMenuButtons';

const PREFERRED_TERMINAL: TerminalType = 'scale';

type Props = {
    isMobile?: boolean;
}

export function TerminalMenu({ isMobile } : Readonly<Props>) {
    const { t } = useTranslation();
    const theme = useTheme();

    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuTransform, setMenuTransform] = useState<string>('translateY(-100px)');

    const {
        terminalTypes: fileTerminalTypes
    } = useContext(PwaContext);

    const terminals = terminalTypes.map(terminal => {
        return {
            icon: getIcon(terminal, fileTerminalTypes.includes(terminal) ? 'secondary' : 'disabled', '2em'),
            key: terminal,
            title: t(`terminal${titleCaseWord(terminal)}`),
        };
    });

    const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);

    const handleOpenMenu = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorElMenu(event.currentTarget);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setAnchorElMenu(null);
    }, []);

    const buttonTestId = 'terminalMenuIcon'
    const buttonText = t(`terminal${titleCaseWord(fileTerminalTypes.includes(PREFERRED_TERMINAL) ? PREFERRED_TERMINAL : fileTerminalTypes[0] ?? 'unknown')}`).toUpperCase();

    const desktopMenu = useMemo(() => (
        <Stack alignItems='center'>
            <TmIconButton testid={buttonTestId} onClick={handleOpenMenu}>
                <Tooltip title={t('menuTerminalTooltip')}>
                    <DevicesIcon
                        fontSize='large'
                        style={{ color: theme.palette.primary.contrastText }}
                    />
                </Tooltip>
            </TmIconButton>
            <TmTypography
                testid='terminalActive'
                style={{ marginTop: -10 }}
                variant='caption'
                color={theme.palette.primary.contrastText}
            >
                {buttonText}
            </TmTypography>
        </Stack>
    ), [buttonText, handleOpenMenu, t, theme.palette.primary.contrastText]);

    const mobileMenu = useMemo(() => (
        <MobileMenuButtons
            testid={buttonTestId}
            onClick={handleOpenMenu}
            icon={<DevicesIcon />}
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

    const menu = useMemo(() => (
        <TmMenu
            testid={'terminalMenu'}
            ref={menuRef}
            sx={{ mt: '47px', transform: !isMobile ? 0 : menuTransform }}
            anchorEl={anchorElMenu}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center'
            }}
            open={Boolean(anchorElMenu)}
            onClose={handleCloseMenu}
        >
            <Box>
                <InstallApp />
                <SelectFile />
                <Grid container spacing={2} paddingLeft={5} paddingRight={5}>
                    {terminals.map(terminal => (
                        <Grid key={terminal.key} size={{ xs: 4 }}>
                            <Stack alignItems='center' marginX={6}>
                                {terminal.icon}
                                <TmTypography
                                    testid={toCamelCaseWords('terminalMenuItemText', terminal.key)}
                                    variant='caption'
                                    textAlign='center'
                                    color={fileTerminalTypes.includes(terminal.key) ? 'secondary' : theme.palette.mode === 'light' ? '#555' : '#777'}
                                    fontWeight={fileTerminalTypes.includes(terminal.key) ? 'bold' : undefined}
                                    overflow='hidden'
                                    textOverflow='ellipsis'
                                >
                                    {terminal.title.toUpperCase()}
                                </TmTypography>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </TmMenu >
    ), [isMobile, menuTransform, anchorElMenu, handleCloseMenu, terminals, fileTerminalTypes, theme.palette.mode]);

    return (
        <>
            {isMobile ? mobileMenu : desktopMenu}
            {menu}
        </>
    );
}

function getIcon(terminal: TerminalType, color?: 'primary' | 'secondary' | 'error' | 'disabled', size?: string): ReactElement {
    switch (terminal) {
        case 'scale':
            return <ScaleIcon color={color} sx={{ fontSize: size }} id='terminalMenuItemPortalIcon' />;
        // case 'prestart':
        //     return <StartIcon color={color} sx={{ fontSize: size }} id='terminalMenuItemCoreIcon' />;
        case 'prosecute':
            return <GavelIcon color={color} sx={{ fontSize: size }} id='terminalMenuItemWeighIcon' />;
        // case 'cashier':
        //     return <PointOfSaleIcon color={color} sx={{ fontSize: size }} id='terminalMenuItemTransgressionsIcon' />;
        case 'standard':
            return <DescriptionIcon color={color} sx={{ fontSize: size }} id='terminalMenuItemReportsIcon' />;
        default:
            return <HelpCenterIcon color={color} sx={{ fontSize: size }} id='terminalMenuItemDefaultIcon' />;
    }
}

function InstallApp() {
    const { t } = useTranslation();
    const {
        isPwa,
        showPwaInstallButton,
        handleInstallClick
    } = useContext(PwaContext);
    if (isPwa || !showPwaInstallButton)
        return null;
    return (
        <Stack marginX={12} marginTop={4} marginBottom={8} gap={4}>
            <TmTypography
                testid={'terminalMenuInstallText'}
                fontWeight='bold'
                maxWidth={350}
                sx={{ alignSelf: 'center' }}
                textAlign='center'
            >
                {t('menuTerminalInstallTitle')}
            </TmTypography>
            <TmButton
                testid={'terminalMenuInstallButton'}
                onClick={handleInstallClick}
                variant='contained'
                startIcon={<InstallDesktopIcon />}
                sx={{ alignSelf: 'center' }}
                color='secondary'
            >
                {t('menuTerminalInstallButton')}
            </TmButton>
        </Stack>
    );
}

function SelectFile() {
    const { t } = useTranslation();
    const {
        isLaunchFileProcessed,
        isMacMatch,
        requestFileHandle,
        isPwa,
        showPwaInstallButton
    } = useContext(PwaContext);
    if (showPwaInstallButton)
        return null;
    if (!isPwa && !isLaunchFileProcessed) {
        return (
            <Stack marginX={12} marginTop={4} marginBottom={8} gap={4}>
                <TmTypography
                    testid={'terminalMenuInstallText'}
                    fontWeight='bold'
                    maxWidth={375}
                    sx={{ alignSelf: 'center' }}
                    textAlign='center'
                    color='error'
                >
                    {t('menuTerminalFileNotPWA')}
                </TmTypography>
            </Stack>
        );
    }
    if (isLaunchFileProcessed && !isMacMatch) {
        return (
            <Stack marginX={12} marginTop={4} marginBottom={8} gap={4}>
                <TmTypography
                    testid={'terminalMenuInstallText'}
                    fontWeight='bold'
                    maxWidth={375}
                    sx={{ alignSelf: 'center' }}
                    textAlign='center'
                    color='error'
                >
                    {t('menuTerminalFileInvalidMac')}
                </TmTypography>
                {isPwa &&
                    <TmButton
                        testid={'terminalMenuInstallButton'}
                        onClick={requestFileHandle}
                        variant='outlined'
                        startIcon={<FileOpenIcon />}
                        sx={{ alignSelf: 'center' }}
                        color='error'
                        size='small'
                    >
                        {t('menuTerminalFileButton')}
                    </TmButton>
                }
            </Stack>
        );
    }
    if (isPwa && !isLaunchFileProcessed) {
        return (
            <Stack marginX={12} marginTop={4} marginBottom={8} gap={4}>
                <TmTypography
                    testid={'terminalMenuInstallText'}
                    fontWeight='bold'
                    maxWidth={375}
                    sx={{ alignSelf: 'center' }}
                    textAlign='center'
                >
                    {t('menuTerminalFileTitle')}
                </TmTypography>
                <TmButton
                    testid={'terminalMenuInstallButton'}
                    onClick={requestFileHandle}
                    variant='contained'
                    startIcon={<FileOpenIcon />}
                    sx={{ alignSelf: 'center' }}
                    color='secondary'
                >
                    {t('menuTerminalFileButton')}
                </TmButton>
            </Stack>
        );
    }
    if (isPwa) {
        return (
            <Stack marginX={12} marginTop={4} marginBottom={8} gap={4}>
                <TmButton
                    testid={'terminalMenuInstallButton'}
                    onClick={requestFileHandle}
                    variant='text'
                    startIcon={<FileOpenIcon />}
                    sx={{ alignSelf: 'center' }}
                    color='info'
                    size='small'
                >
                    {t('menuTerminalFileButton')}
                </TmButton>
            </Stack>
        );
    }
    return null;
}
