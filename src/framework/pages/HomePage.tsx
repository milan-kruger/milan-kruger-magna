import GavelIcon from '@mui/icons-material/Gavel';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Box, Fade, Grid, Paper, Slide, Stack, useScrollTrigger, useTheme } from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../assets/images/logo.svg';
import TmTypography from '../components/typography/TmTypography';
import { BASE_URL } from '../const';

export default function HomePage() {
    const { t } = useTranslation();
    const theme = useTheme();
    const trigger = useScrollTrigger();

    const [aboutTransition, setAboutTransition] = useState(false);
    const triggerAboutAnimation = (trigger: boolean) => {
        if (trigger && !aboutTransition) {
            setAboutTransition(true);
            return true;
        }
    };

    const [featureTransition, setFeatureTransition] = useState(false);
    const triggerFeatureAnimation = (trigger: boolean) => {
        if (trigger && !featureTransition) {
            setTimeout(() => {
                setFeatureTransition(true);
            }, 500);
        }
        if (featureTransition) {
            return true;
        }
    };

    const featureTitleContainer = useRef<HTMLDivElement | null>(null);
    const feature1Container = useRef<HTMLDivElement | null>(null);
    const feature2Container = useRef<HTMLDivElement | null>(null);
    const feature3Container = useRef<HTMLDivElement | null>(null);
    const [featureTitleContainerEl, setFeatureTitleContainerEl] = useState<Element | null>(null);
    const [feature1ContainerEl, setFeature1ContainerEl] = useState<Element | null>(null);
    const [feature2ContainerEl, setFeature2ContainerEl] = useState<Element | null>(null);
    const [feature3ContainerEl, setFeature3ContainerEl] = useState<Element | null>(null);
    useEffect(() => {
        setFeatureTitleContainerEl(featureTitleContainer.current);
        setFeature1ContainerEl(feature1Container.current);
        setFeature2ContainerEl(feature2Container.current);
        setFeature3ContainerEl(feature3Container.current);
    }, []);

    return (
        <Grid container spacing={2}>
            <Grid size={{ md: 12 }}>
                <Box display='flex' flexDirection='column'>
                    <Box display='flex'>
                        <div
                            style={{
                                height: '65vh',
                                width: '100vw',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundImage: `url(${BASE_URL}/background.jpg)`,
                                backgroundPosition: 'center',
                                opacity: 0,
                                animation: 'fadeIn 3s forwards'
                            }}
                        />
                        <style>
                            {`
                            @keyframes fadeIn {
                                to {
                                    opacity: 1;
                                }
                            }
                        `}
                        </style>
                        <div
                            style={{
                                position: 'absolute',
                                height: '65vh',
                                width: '100%',
                                backgroundColor: '#000',
                                opacity: 0.4,
                                pointerEvents: 'none'
                            }}
                        />
                    </Box>
                    <Stack position='absolute' alignSelf='center' alignItems='center' sx={{ margin: 20, top: '22vh' }}>
                        <Slide in timeout={1500}>
                            <div>
                                <Fade in timeout={3000}>
                                    <Box>
                                        <TmTypography
                                            testid={'homePageTitle'}
                                            variant='h1'
                                            margin={20}
                                            color='#FFFFFF'
                                            align='center'
                                            style={{
                                                fontWeight: 'bold',
                                                textShadow: `0 0 5px #111111`
                                            }}
                                        >
                                            {t('welcomeTitle').toUpperCase()}
                                        </TmTypography>
                                    </Box>
                                </Fade>
                            </div>
                        </Slide>
                        <Slide in timeout={1500}>
                            <div>
                                <Fade in timeout={3000}>
                                    <Box>
                                        <TmTypography testid={'homePageDescription'} variant='h3' color='#FFFFFF' align='center'>
                                            {t('welcomeMessage')}
                                        </TmTypography>
                                    </Box>
                                </Fade>
                            </div>
                        </Slide>
                    </Stack>
                </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                <Fade in timeout={5000}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem' }}>
                        <img src={`${BASE_URL}/client-logo.png`} height={100} style={{ alignSelf: 'center' }} alt='client-logo' />
                    </Box>
                </Fade>
            </Grid>
            <Grid size={{ md: 12 }}>
                <Slide
                    in={!aboutTransition ? triggerAboutAnimation(trigger) : aboutTransition}
                    timeout={1000}
                    direction='up'
                >
                    <div>
                        <Fade
                            in={!aboutTransition ? triggerAboutAnimation(trigger) : aboutTransition}
                            timeout={2500}
                        >
                            <Paper
                                elevation={3}
                                sx={{
                                    ml: { xs: 15, ms: 15, md: 30, lg: 30 },
                                    mr: { xs: 15, ms: 15, md: 30, lg: 30 },
                                    mt: { xs: 8, ms: 8, md: 15, lg: 50 },
                                    mb: { xs: 8, ms: 8, md: 15, lg: 15 },
                                    p: { xs: 8, ms: 8, md: 15, lg: 15 }
                                }}
                            >
                                <Stack direction='row' gap={{ xs: 8, ms: 8, md: 15, lg: 15 }}>
                                    <img src={Logo} height={100} style={{ alignSelf: 'center' }} alt='logo' />
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Stack gap={10}>
                                            <TmTypography testid={'homePageAboutTitle'} variant='h4'>
                                                {t('about')}
                                            </TmTypography>
                                            <TmTypography testid={'homePageAboutDescription'} variant='subtitle1'>
                                                {t('homePageDescription')}
                                            </TmTypography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Fade>
                    </div>
                </Slide>
            </Grid>
            <Grid
                container
                size={{ md: 12 }}
                rowSpacing={30}
                sx={{
                    ml: { xs: 15, ms: 15, md: 60, lg: 60 },
                    mr: { xs: 15, ms: 15, md: 60, lg: 60 },
                    mt: { xs: 10, ms: 10, md: 10, lg: 10 },
                    mb: { xs: 10, ms: 10, md: 40, lg: 50 }
                }}
            >
                <Grid size={{ xs: 12, sm: 12, md: 12 }} ref={featureTitleContainer}>
                    <Slide
                        in={!featureTransition ? triggerFeatureAnimation(trigger) : featureTransition}
                        timeout={500}
                        direction='down'
                        container={featureTitleContainerEl}
                    >
                        <div>
                            <Fade
                                in={!featureTransition ? triggerFeatureAnimation(trigger) : featureTransition}
                                timeout={2000}
                            >
                                <Box>
                                    <TmTypography testid={'homePageFeaturesTitle'} variant='h4' align='center'>
                                        {t('features')}
                                    </TmTypography>
                                </Box>
                            </Fade>
                        </div>
                    </Slide>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }} ref={feature1Container}>
                    <Slide
                        in={!featureTransition ? triggerFeatureAnimation(trigger) : featureTransition}
                        timeout={1000}
                        direction='down'
                        container={feature1ContainerEl}
                    >
                        <div>
                            <Fade in={!featureTransition ? triggerFeatureAnimation(trigger) : featureTransition} timeout={2000}>
                                <Stack spacing={20} alignItems='center'>
                                    <GavelIcon style={{ fontSize: '8rem', color: theme.palette.primary.light }} />
                                    <TmTypography testid={'homePageFeature1'} variant='subtitle1' align='center'>
                                        {t('featureItem1')}
                                    </TmTypography>
                                </Stack>
                            </Fade>
                        </div>
                    </Slide>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }} ref={feature2Container}>
                    <Slide in={!featureTransition ? triggerFeatureAnimation(trigger) : featureTransition} timeout={1500} direction='down' container={feature2ContainerEl}>
                        <div>
                            <Fade in={!featureTransition ? triggerFeatureAnimation(trigger) : featureTransition} timeout={2000}>
                                <Stack spacing={20} alignItems='center'>
                                    <ReceiptLongIcon style={{ fontSize: '8rem', color: theme.palette.primary.light }} />
                                    <TmTypography testid={'homePageFeature2'} variant='subtitle1' align='center'>
                                        {t('featureItem2')}
                                    </TmTypography>
                                </Stack>
                            </Fade>
                        </div>
                    </Slide>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }} ref={feature3Container}>
                    <Slide in={!featureTransition ? triggerFeatureAnimation(trigger) : featureTransition} timeout={2000} direction='down' container={feature3ContainerEl}>
                        <div>
                            <Fade in={triggerFeatureAnimation(trigger)} timeout={2000}>
                                <Stack spacing={20} alignItems='center'>
                                    <PaidIcon style={{ fontSize: '8rem', color: theme.palette.primary.light }} />
                                    <TmTypography testid={'homePageFeature3'} variant='subtitle1' align='center'>
                                        {t('featureItem3')}
                                    </TmTypography>
                                </Stack>
                            </Fade>
                        </div>
                    </Slide>
                </Grid>
            </Grid>
        </Grid>
    );
}
