import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../redux/store';
import callbackRegistry from './callbackRegistry';

export type BackendErrorData = {
    type: string;
    context: string;
    message: string;
    code: string;
    target: string;
}

export type RtkError = {
    type: string;
    error: {
        message: string;
    }
    meta: {
        requestStatus: string;
        arg: {
            endpointName: string;
            type: string;
        }
        baseQueryMeta: {
            request: {
                method: string;
                url: string;
            };
        }
    }
    payload: {
        status: string;
        // From FE
        error?: string;
        // From BE
        data?: {
            status: string;
            message: string;
            exception: string;
            errors?: BackendErrorData[];
        }
    }
}

type ErrorState = {
    errors: RtkError[];
    callbackKey?: string;
}

const initialState: ErrorState = {
    errors: [],
    callbackKey: undefined
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        addError: (state, action: PayloadAction<RtkError>) => {
            state.errors.push(action.payload);
        },
        removeAllErrors: () => initialState,
        setErrorCallback: (state, action: PayloadAction<{ key: string }>) => {
            state.callbackKey = action.payload.key;
        },
        clearErrorCallback: (state) => {
            if (state.callbackKey) {
                callbackRegistry.clearCallback(state.callbackKey);
                state.callbackKey = undefined;
            }
        },
    }
});

export const { addError, removeAllErrors, setErrorCallback, clearErrorCallback } = errorSlice.actions;

export const selectErrors = (state: RootState) => state.error.errors;
export const selectErrorCallbackKey = (state: RootState) => state.error.callbackKey;

export default errorSlice.reducer;
