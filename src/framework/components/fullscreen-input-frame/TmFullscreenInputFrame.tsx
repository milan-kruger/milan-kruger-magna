import { Box, Stack, useTheme } from '@mui/material';
import { ReactElement, useContext } from 'react';
import { WindowContext } from '../../ui/WindowContext';
import TmTypography from '../typography/TmTypography';

interface Prop {
    title: string;
    backgroundImage: string;
    children: ReactElement;
}

function TmFullscreenInputFrame({
    title,
    backgroundImage,
    children,
}: Readonly<Prop>) {
    const { windowHeight } = useContext(WindowContext);
    const theme = useTheme();
    return (
        <Box
            style={{
                backgroundImage: `url('${backgroundImage}')`,
                backgroundRepeat: 'repeat',
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.75)',
                backgroundBlendMode: theme.palette.mode === 'light' ? 'lighten' : 'darken',
                backgroundPosition: 'center',
                height: `${windowHeight - 99}px`
            }}
        >
            <Stack alignItems='center' justifyContent='center' height='90%'>
                <TmTypography
                    testid={title + 'FullscreenInputTitle'}
                    variant='h4'
                    sx={{
                        padding: '1%',
                    }}
                    color={'primary'}
                    fontWeight='bold'
                >
                    {title}
                </TmTypography>
                <Box
                    boxShadow='3'
                    style={{
                        backgroundColor:
                            theme.palette.background.default,
                        borderTop: `6px ${theme.palette.primary.main} solid`,
                        inlineSize: 'fit-content',
                        padding: 40,
                        paddingBottom: 15
                    }}
                >
                    {children}
                </Box>
            </Stack>
        </Box>
    );
}

export default TmFullscreenInputFrame;
