import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../redux/store';

type AuthState = {
    user?: string | null;
    token?: string | null;
    isAuthenticated: boolean
};

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthState>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = action.payload.isAuthenticated;
        },
        logout: () => initialState,
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
        }
    }
});

export const { login, logout, setToken } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export default authSlice.reducer;
