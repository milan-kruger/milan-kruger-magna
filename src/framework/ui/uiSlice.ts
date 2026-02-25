import { PaletteMode } from '@mui/material';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../redux/store';
import { ConfigContextState } from '../config/ConfigContext';

// TYPES
export type UIState = {
    themeMode: PaletteMode;
    activeTheme?: ConfigContextState['theme'];
}

// INITIAL STATE
export const initialState: UIState = {
    themeMode: 'light',
    activeTheme: undefined
};

// SLICE
export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setThemeMode: (state, action: PayloadAction<PaletteMode>) => {
            state.themeMode = action.payload;
        },
        setActiveTheme: (state, action: PayloadAction<ConfigContextState['theme']>) => {
            state.activeTheme = action.payload;
        }
    }
});

// ACTIONS
export const { setThemeMode, setActiveTheme } = uiSlice.actions;

// SELECTORS
export const selectThemeMode = (state: RootState) => state.ui.themeMode;
export const selectActiveTheme = (state: RootState) => state.ui.activeTheme;

// REDUCERS
export default uiSlice.reducer;
