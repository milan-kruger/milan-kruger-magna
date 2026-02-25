import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../redux/store';
import { ConfigContextState, initialConfigContextState } from './ConfigContext';

type ConfigState = {
    config: ConfigContextState;
    active: {
        authorityCode: string;
        weighbridgeCode: string;
    }
};

const initialState: ConfigState = {
    config: { ...initialConfigContextState },
    active: {
        authorityCode: '',
        weighbridgeCode: ''
    }
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setConfig: (state, action: PayloadAction<ConfigContextState>) => {
            state.config = action.payload;
        },
        setActiveTenant: (state, action: PayloadAction<string>) => {
            state.active.authorityCode = action.payload;
        },
        setActiveAuthority: (state, action: PayloadAction<string>) => {
            state.active.authorityCode = action.payload;
        },
        setActiveWeighbridge: (state, action: PayloadAction<string>) => {
            state.active.weighbridgeCode = action.payload;
        }
    }
});

export const {
    setConfig,
    setActiveTenant,
    setActiveAuthority,
    setActiveWeighbridge
} = configSlice.actions;

export const selectConfig = (state: RootState) => state.conf;
export const selectConfigDevMode = (state: RootState) => state.conf.config.devMode;
export const selectConfigBaseUrl = (state: RootState) => state.conf.config.apiBaseUrl;
export const selectConfigDateTimeFormats = (state: RootState) => state.conf.config.dateTime;
export const selectActiveTenant = (state: RootState) => state.conf.active.authorityCode;
export const selectActiveAuthority = (state: RootState) => state.conf.active.authorityCode;
export const selectActiveWeighbridge = (state: RootState) => state.conf.active.weighbridgeCode;
export const selectConfigJasperUrl = (state: RootState) => state.conf.config.jasperUrl;

export default configSlice.reducer;
