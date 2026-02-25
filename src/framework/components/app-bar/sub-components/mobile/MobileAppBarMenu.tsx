import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, ListItem, ListItemButton, ListItemIcon, Stack, SwipeableDrawer, Theme, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import useGeneratedMenuItems, { MenuItemsType } from '../../../../../project/components/app-bar/menuItems';
import { toCamelCaseWords } from '../../../../utils';
import TmIconButton from '../../../button/TmIconButton';
import TmListItemText from '../../../list/TmListItemText';
import { MobileScreenBox } from '../../styles/MobileScreenBox';
import TmAppBarList from '../../styles/TmAppBarList';
import { TenantFilter } from '../desktop/TenantFilter';
import { AppMenu } from '../menus/AppMenu';
import { TenantMenu } from '../menus/TenantMenu';
import { TerminalMenu } from '../menus/TerminalMenu';
import WeighbridgeMenu from '../../../../../project/components/app-bar/sub-components/menus/WeighbridgeMenu';

type MobileAppBarMenuProps = {
    openDrawer: boolean,
    handleToggleDrawer: (open: boolean) => void,
}

export function MobileAppBarMenu({ handleToggleDrawer, openDrawer }: Readonly<MobileAppBarMenuProps>) {
    const { t } = useTranslation();
    const theme = useTheme();
    const menuItems = useGeneratedMenuItems();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    return (
        <MobileScreenBox>
            <TmIconButton
                testid={'mobileAppBarMenu'}
                size='large'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={() => handleToggleDrawer(!openDrawer)}
                color='inherit'
            >
                <MenuIcon />
            </TmIconButton>
            <SwipeableDrawer
                open={openDrawer}
                onClose={() => handleToggleDrawer(false)}
                onOpen={() => handleToggleDrawer(true)}
            >
                <Box
                    role='presentation'
                    onClick={() => handleToggleDrawer(false)}
                    onKeyDown={() => handleToggleDrawer(false)}
                    height='100%'
                >
                    <Box height='100%' display='flex' flexDirection='column' justifyContent='space-between' alignItems='center' >
                        <TmAppBarList testid={'appBarList'}>
                            <NavLink to='home'>
                                <ListItem key={'home'} disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <HomeIcon />
                                        </ListItemIcon>
                                        <TmListItemText
                                            testid={toCamelCaseWords('appBar', 'home')}
                                            primary={'Home'}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </NavLink>
                            {menuItems.map((menu: MenuItemsType) => (
                                <NavLink
                                    key={menu.url}
                                    to={menu.url}
                                    className={({ isActive }) =>
                                        isActive ? 'active' : ''
                                    }
                                    onClick={menu.action}
                                >
                                    <ListItem
                                        key={menu.url}
                                        disablePadding
                                    >
                                        <ListItemButton>
                                            <ListItemIcon>
                                                {menu.icon ? menu.icon : <DescriptionIcon />}
                                            </ListItemIcon>
                                            <TmListItemText
                                                testid={toCamelCaseWords('appBar', t(menu.title))}
                                                primary={t(menu.title)}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            ))}
                        </TmAppBarList>
                        <Box
                            padding={isMobile ? 0 : 10}
                            paddingBottom={isMobile ? 20 : 50}
                            style={{ 
                                backgroundColor: !isMobile ? theme.palette.primary.main : undefined,
                                width: '100%'
                            }}
                        >
                            <Stack direction={!isMobile ? 'row' : 'column'}>
                                <TerminalMenu isMobile={isMobile} />
                                <TenantMenu isMobile={isMobile} />
                                <WeighbridgeMenu isMobile={isMobile} />
                                <TenantFilter isMobile={isMobile} />
                                <AppMenu isMobile={isMobile} />
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </SwipeableDrawer>
        </MobileScreenBox>
    );
}

