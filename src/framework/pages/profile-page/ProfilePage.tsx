import LanguageIcon from '@mui/icons-material/Language';
import ScreenshotMonitorOutlinedIcon from '@mui/icons-material/ScreenshotMonitorOutlined';
import { Grid, Paper, Theme, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MobileScreenBox } from '../../components/app-bar/styles/MobileScreenBox';
import { DesktopScreenBox } from '../../components/app-bar/styles/NormalScreenBox';
import TmTab from '../../components/tab/TmTab';
import LanguageTab from './sub-components/LanguageTab';
import UserInterfaceTab from './sub-components/UserInterfaceTab';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: Readonly<TabPanelProps>) {
    const { children, value, index } = props;

    return (
        <>
            {value === index && (
                <Box
                    sx={{
                        pl: { xs: 10, sm: 5, md: 30, lg: 30 },
                        width: { xs: '100%', sm: '90%', md: '70%', lg: '70%' }
                    }}>
                    <Box>{children}</Box>
                </Box>
            )}
        </>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function ProfilePage() {

    const { t } = useTranslation();

    const [tabValue, setTabValue] = React.useState(0);

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

    return (
        <Container>
            <Box
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.paper',
                    display: { sm: 'block', md: 'flex' },
                    m: { xs: 5, sm: 8, md: 10, lg: 20 },
                    pb: { xs: 10, sm: 10, md: 0 },
                }}
            >
                <DesktopScreenBox>
                    <Tabs
                        orientation='vertical'
                        variant='scrollable'
                        value={tabValue}
                        onChange={handleChangeTab}
                        sx={{ borderRight: 1, borderColor: 'divider' }}
                    >
                        <TmTab
                            testid={'profileLanguageTab'}
                            icon={<LanguageIcon />}
                            iconPosition='start'
                            label={t('language')}
                            {...a11yProps(0)}
                        />
                        <TmTab
                            testid={'profileUserInterfaceTab'}
                            icon={<ScreenshotMonitorOutlinedIcon />}
                            iconPosition='start'
                            label={t('userInterface')}
                            {...a11yProps(1)}
                        />
                    </Tabs>
                </DesktopScreenBox>
                {
                    isMobile ?
                        <MobileScreenBox>
                            <Tabs
                                value={tabValue}
                                onChange={handleChangeTab}
                                variant='scrollable'
                                scrollButtons='auto'
                                sx={{
                                    mb: 20,
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    width: '100%',
                                }}
                            >
                                <Tab
                                    icon={<LanguageIcon />}
                                    iconPosition='start'
                                    label={t('language')}
                                    {...a11yProps(0)}
                                />
                                <Tab
                                    icon={<ScreenshotMonitorOutlinedIcon />}
                                    iconPosition='start'
                                    label={t('userInterface')}
                                    {...a11yProps(1)}
                                />
                            </Tabs>
                        </MobileScreenBox>
                        : null
                }
                <TabPanel value={tabValue} index={0}>
                    <Grid
                        container
                        size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                        rowSpacing={20}
                        sx={{ pr: { xs: 10, sm: 8, md: 0 } }}
                    >
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Paper sx={{ p: 15 }} elevation={3}>
                                <LanguageTab />
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Grid
                        container
                        size={{ md: 12 }}
                        rowSpacing={10}
                        sx={{ pr: { xs: 10, sm: 8, md: 0 } }}
                    >
                        <Grid size={{ md: 12 }}>
                            <Paper sx={{ p: 15 }} elevation={3}>
                                <UserInterfaceTab />
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Box>
        </Container>
    );
}
