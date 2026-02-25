import { Box, Container, Paper, useTheme, useMediaQuery, Fade } from '@mui/material';
import { ReactNode } from 'react';
import { TmLanguageSelector } from '../language/TmLanguageSelector';
import { TmThemeButton } from '../mode/TmThemeButton';
import Background from '../../assets/images/login.jpg';
import Logo from '../../assets/images/logo.svg';
import Trafman from '../../assets/images/Trafman.svg';
import DarkTrafman from '../../assets/images/Dark-Trafman.svg';
import { useAppSelector } from '../../redux/hooks';
import { selectThemeMode } from '../../ui/uiSlice';

interface AuthLayoutProps {
    children: ReactNode;
    wide?: boolean;
}

export default function AuthLayout({ children, wide = false }: Readonly<AuthLayoutProps>) {
    const theme = useTheme();
    const themeMode = useAppSelector(selectThemeMode);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: `url(${Background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.palette.mode === 'dark'
                        ? theme.palette.background.paper + 'AA'
                        : theme.palette.background.default + '66'
                }
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    right: isMobile ? 20 : 40,
                    display: 'flex',
                    gap: 2,
                    zIndex: 2
                }}
            >
                <TmLanguageSelector 
                    customIconHoverColor={theme.palette.primary.main}
                />
                <TmThemeButton 
                    customIconHoverColor={theme.palette.primary.main}
                />
            </Box>
            <Container
                component='main'
                maxWidth={wide ? 'md' : 'sm'}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <Fade in timeout={1000}>
                    <Paper
                        elevation={24}
                        sx={{
                            padding: 20,
                            width: '100%',
                            maxWidth: wide ? 800 : 500,
                            backgroundColor: theme.palette.background.paper,
                            backdropFilter: 'blur(10px)',
                            borderRadius: theme.shape.borderRadius,
                            boxShadow: theme.shadows[24],
                            overflow: 'hidden'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <img
                                    src={Logo}
                                    alt='Logo'
                                    style={{
                                        height: isMobile ? 50 : 60,
                                        width: 'auto'
                                    }}
                                />
                                <img
                                    src={themeMode === 'dark' ? DarkTrafman : Trafman }
                                    alt='Trafman'
                                    style={{
                                        height: isMobile ? 40 : 50,
                                        width: 'auto'
                                    }}
                                />
                            </Box>
                        </Box>
                        {children}
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}

