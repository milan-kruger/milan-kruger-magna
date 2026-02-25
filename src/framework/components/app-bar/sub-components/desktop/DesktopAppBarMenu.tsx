import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Menu, MenuItem, useTheme } from '@mui/material';
import React, { createRef, forwardRef, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import useGeneratedMenuItems, { MenuItemsType } from '../../../../../project/components/app-bar/menuItems';
import { DesktopScreenBox } from '../../styles/NormalScreenBox';
import { TmAppBarButton } from '../../styles/TmAppBarButton';
import toCamelCase, { toCamelCaseWords } from '../../../../utils';

export function DesktopAppBarMenu() {
    const { t } = useTranslation();
    const menuItems = useGeneratedMenuItems();
    const parentRef = useRef<HTMLDivElement>(null);
    const moreButtonRef = useRef<HTMLButtonElement>(null);
    const buttonRefs = useRef<RefObject<HTMLButtonElement>[]>([]);

    const [ buttonWidths, setButtonWidths ] = useState<number[]>(Array(menuItems.length).fill(0));
    const [ appBarMenuItems, setAppBarMenuItems ] = useState<MenuItemsType[]>([]);
    const [ moreMenuItems, setMoreMenuItems ] = useState<MenuItemsType[]>([]);
    const [ parentWidth, setParentWidth ] = useState<number>(0);

    const moreButtonWidth = moreButtonRef.current?.offsetWidth ?? 0;

    const getPrevButtonWidths = useCallback((index: number) => {
        if (index < 0 || index >= buttonWidths.length) {
            return 0;
        }
        const prevWidths = buttonWidths.slice(0, index + 1);
        return prevWidths.reduce((total, width) => total + width, 0);
    }, [buttonWidths]);

    useEffect(() => {
        const handleResize = () => {
            if (parentRef.current) {
                setParentWidth(parentRef.current.offsetWidth - 90);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const appBarMenuItems: MenuItemsType[] = [];
        const moreMenuItems: MenuItemsType[] = [];
        buttonRefs.current = [];
        menuItems.forEach((menu, index) => {
            buttonRefs.current.push(createRef<HTMLButtonElement>() as RefObject<HTMLButtonElement>);
            if (buttonWidths.length > 0 && parentWidth != 0) {
                if (parentWidth > (getPrevButtonWidths(index) + moreButtonWidth)) {
                    appBarMenuItems.push(menu);
                }
                else {
                    moreMenuItems.push(menu)
                }
            }
        });
        setAppBarMenuItems(appBarMenuItems);
        setMoreMenuItems(moreMenuItems);
    }, [buttonWidths.length, getPrevButtonWidths, menuItems, moreButtonWidth, parentWidth]);

    useEffect(() => {
        buttonRefs.current.forEach((buttonRef, refIndex) => {
            if (buttonRef.current && buttonWidths[refIndex] !== buttonRef.current.offsetWidth) {
                setButtonWidths(prevWidths => {
                    const newWidths = [...prevWidths];
                    if (buttonRef.current) {
                        newWidths[refIndex] = buttonRef.current.offsetWidth;
                    }
                    return newWidths;
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buttonRefs.current]);

    return (
        <DesktopScreenBox
            sx={{
                flexGrow: 1,
                paddingLeft: 20,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}
            ref={parentRef}
        >
            {
                appBarMenuItems.map((menu, index) => (
                    <Box key={`button${index}`} ref={buttonRefs.current[index]}>
                        <NavLink
                            to={menu.url}
                            key={menu.url}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                            onClick={menu.action}
                        >
                            <TmAppBarButton testid={toCamelCaseWords('appBarMenu', toCamelCase(t(menu.title)))}>
                                {t(menu.title)}
                            </TmAppBarButton>
                        </NavLink>
                    </Box>
                ))
            }
            {
                moreMenuItems.length > 0 &&
                <MoreAppBarMenu
                    menuItems={moreMenuItems}
                    ref={moreButtonRef}
                />
            }
        </DesktopScreenBox>
    );
}

type MoreMenuProps = {
    menuItems: MenuItemsType[];
}

const MoreAppBarMenu = forwardRef<HTMLButtonElement, MoreMenuProps>(({ menuItems }, ref) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
    }, []);

    return (
        <>
            <TmAppBarButton
                testid={toCamelCaseWords('appBarMenu', 'More')}
                ref={ref}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleOpenMenu}
                sx={{ display: 'inline-flex', minWidth: 'fit-content' }}
            >
                {t('more')}
            </TmAppBarButton>
            <Menu
                open={open}
                onClose={handleCloseMenu}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {
                    menuItems.map((menu) => (
                        <NavLink
                            to={menu.url}
                            key={menu.url}
                            style={({ isActive }) => ({
                                color: isActive
                                    ? theme.palette.secondary.main
                                    : theme.palette.primary.main,
                                textDecoration: 'none'
                            })}
                        >
                            <MenuItem
                                key={menu.url}
                                onClick={() => {
                                    menu.action?.();
                                    handleCloseMenu();
                                }}
                                sx={{ fontWeight: 'bold' }}
                                id={toCamelCaseWords('appBarMenu', toCamelCase(t(menu.title)))}
                            >
                                {t(menu.title)}
                            </MenuItem>
                        </NavLink>
                    ))
                }
            </Menu>
        </>
    );
});
