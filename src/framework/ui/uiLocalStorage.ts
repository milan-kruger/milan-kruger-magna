import { PaletteMode } from '@mui/material';
import { initialState } from './uiSlice';

const STORAGE_KEY_THEME = 'theme';

export function saveUITheme(theme: PaletteMode) {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
}

export function loadUITheme(): PaletteMode {
    return (localStorage.getItem(STORAGE_KEY_THEME) ?? initialState.themeMode) as PaletteMode;
}
