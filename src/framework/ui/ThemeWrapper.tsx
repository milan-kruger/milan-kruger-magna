import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { ReactNode, useEffect } from 'react';
import createTrafmanTheme from './trafmanTheme';
import { WindowProvider } from './WindowContext';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectActiveTheme, selectThemeMode, setActiveTheme } from './uiSlice';
import { selectConfig } from '../config/configSlice';
import { initialConfigContextState } from '../config/ConfigContext';

type Props = {
    children?: ReactNode;
}

export function ThemeWrapper({ children }: Readonly<Props>) {
    const dispatch = useAppDispatch();

    const { config } = useAppSelector(selectConfig);
    const themeMode = useAppSelector(selectThemeMode);
    const activeTheme = useAppSelector(selectActiveTheme);

    useEffect(() => {
        if (!activeTheme && config.theme.primary !== initialConfigContextState.theme.primary) {
            dispatch(setActiveTheme(config.theme));
        }
    }, [activeTheme, config.theme, dispatch]);

    return (
        <ThemeProvider theme={activeTheme ? createTrafmanTheme(themeMode, activeTheme, config.clientName.en) : responsiveFontSizes(createTheme())}>
            <WindowProvider>
                {children}
            </WindowProvider>
        </ThemeProvider >
    );
}
