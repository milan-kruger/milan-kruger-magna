import { MenuItem, Select, Stack, Tabs, Theme, useMediaQuery } from "@mui/material";
import TmTab from "../../../framework/components/tab/TmTab";
import { useLocation, useNavigate } from "react-router-dom";
import { JSX, useCallback, useEffect, useState } from "react";
import TmTabPanel from "../../../framework/components/tab/TmTabPanel";

export interface TmResponsiveTabSelectItem {
    id: string;
    label: string;
    route: string;
    component: JSX.Element;
}

type Props = {
    entryPath: string;
    items: TmResponsiveTabSelectItem[];
}

const TmResponsiveTabSelect = ({ entryPath, items }: Props) => {
    const isMiniMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const location = useLocation();
    const [currentRoute, setCurrentRoute] = useState('');

    useEffect(() => {
        if (location.pathname === `/${entryPath}`) {
            setValue(1)
            return;
        }

        items.forEach((item, index) => {
            if (location.pathname === `/${item.route}`) {
                setValue(index + 1)
            }
        })
        setCurrentRoute(location.pathname);
    }, [location, currentRoute, navigate, items, entryPath]);

    const navigateToTab = useCallback((route: string) => {
        navigate(`/${route}`);
    }, [navigate])


    return (
        <Stack mt={2} p={2}>
            <Stack sx={{
                borderBottom: 'solid 1px #BEBEBE',
                '& .MuiTabs-indicator': {
                    bottom: '2px'
                }
            }}>
                {!isMiniMobile ?
                    <Tabs value={value === 0 ? 0 : value - 1} >
                        {
                            items.map((item, index) => {
                                return <TmTab
                                    key={`tab-${item.id}-${index}`}
                                    label={item.label}
                                    id={item.id}
                                    testid={item.id}
                                    onClick={() => navigateToTab(item.route)}
                                />
                            })
                        }
                    </Tabs> :
                    <Select
                        value={value}
                        onChange={(event) => {
                            setValue(event.target.value as number);
                        }}
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    minWidth: '150px',
                                    width: 'auto',
                                },
                            },
                        }}
                    >
                        {
                            items.map((item, index) => {
                                return <MenuItem
                                    key={`menu-item-${item.id}-${index}`}
                                    value={index + 1}
                                    id={item.id}>{item.label}
                                </MenuItem>
                            })
                        }
                    </Select>
                }
            </Stack>
            {
                items.map((item, index) => {
                    return <TmTabPanel key={`tab-panel-${item.id}-${index}`} value={value} index={index + 1} testid={item.id}>
                        {item.component}
                    </TmTabPanel>
                })
            }
        </Stack>
    )
}

export default TmResponsiveTabSelect;
