import { createTheme, PaletteMode, responsiveFontSizes } from '@mui/material';
import { TypographyVariantsOptions } from '@mui/material/styles';
import { ConfigContextState } from '../config/ConfigContext';

const createTrafmanTheme = (mode: PaletteMode, trafmanTheme: ConfigContextState['theme'], clientName: string) => {

    const primaryColor: string =
        clientName.toLowerCase().includes('fischer') && trafmanTheme.fischerTheme
            ? trafmanTheme.fischerTheme.primary
            : clientName.toLowerCase().includes('magna') && trafmanTheme.magnaTheme
            ? trafmanTheme.magnaTheme.primary
            : trafmanTheme.primary;

    const secondaryColor: string =
        clientName.toLowerCase().includes('fischer') && trafmanTheme.fischerTheme
            ? trafmanTheme.fischerTheme.secondary
            : clientName.toLowerCase().includes('magna') && trafmanTheme.magnaTheme
            ? trafmanTheme.magnaTheme.secondary
            : trafmanTheme.primary;

    return responsiveFontSizes(createTheme({
        // General
        spacing: 2,
        // Palette
        palette: {
            mode: mode,
            primary: { main: primaryColor },
            secondary: { main: secondaryColor },
            success: {
                main: trafmanTheme.success
            },
            error: {
                main: trafmanTheme.error
            },
            warning: {
                main: trafmanTheme.warning
            },
            info: {
                main: trafmanTheme.info
            },
            text: {
                primary: mode === 'dark' ? '#FFF' : '#000'
            },
        },
        // Text
        typography: {
            h1: {
                fontSize: '4rem',
                fontWeight: 'bold',
                textShadow: `0 0 5px #111`
            },
            h4: {
                fontSize: '1.8rem',
                fontWeight: 'bold'
            },
        } as TypographyVariantsOptions,
        // Component Customizations
        components: {
            // Baseline CSS Overrides for Components
            MuiCssBaseline: {
                styleOverrides: {
                    ':focus-visible': {
                        outline: 'none !important'
                    },
                    body: {
                        // TextField
                        '& .MuiInputLabel-shrink': {
                            color: mode === 'dark' ? '#FFF' : '#000',
                            fontWeight: 600,
                            fontSize: '1.25em'
                        },
                        '& .MuiOutlinedInput-notchedOutline .css-14lo706': {
                            fontSize: '0.9em'
                        },
                        // Scrollbar
                        scrollbarColor: '#DBDBDB',
                        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                            width: '10px',
                            backgroundColor: !mode ? '#DBDBDB' : '#686868',
                            borderRadius: '2px',
                            height: '10px'
                        },
                        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                            backgroundColor: trafmanTheme.scrollbar,
                            border: !mode ? `3px solid #DBDBDB` : `3px solid #686868`,
                            borderRadius: '2px',
                            minHeight: 24,
                            padding: '3px'
                        }
                    }
                }
            }
        },
        // breakpoints: {
        //     values: {
        //         xs: 0,
        //         sm: 600,
        //         md: 799,
        //         lg: 1200,
        //         xl: 1536
        //     }
        // }
    }));
}

export default createTrafmanTheme;
