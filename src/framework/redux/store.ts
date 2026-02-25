/* eslint-disable @typescript-eslint/no-explicit-any */
import { Middleware, MiddlewareAPI, combineReducers, configureStore, createListenerMiddleware, isAnyOf, isRejectedWithValue } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { coreApi } from '../../project/redux/api/coreApi';
import { transgressionsApi } from '../../project/redux/api/transgressionsApi';
import { weighApi } from '../../project/redux/api/weighApi';
import transgressionReducer from '../../project/redux/transgression/transgressionSlice';
import captureCourtResultReducer from '../../project/redux/capture-court-result/CaptureCourtResultSlice';
import authReducer from '../auth/authSlice';
import configReducer from '../config/configSlice';
import errorReducer, { addError } from '../error/errorSlice';
import { loadUITheme, saveUITheme } from '../ui/uiLocalStorage';
import themeReducer, { setThemeMode } from '../ui/uiSlice';
import { contentStoreApi } from '../../project/redux/api/contentStoreApi';
import AuthService from '../auth/authService';

export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const rejectedAction = action;
        console.error('ERROR ACTION:', rejectedAction);
        api.dispatch(addError({
            type: rejectedAction.type,
            error: {
                message: rejectedAction.error.message ?? 'unknown'
            },
            meta: {
                requestStatus: rejectedAction.meta.requestStatus ?? 'unknown',
                arg: {
                    endpointName: (rejectedAction.meta.arg as any).endpointName ?? 'unknown',
                    type: (rejectedAction.meta.arg as any).type ?? 'unknown'
                },
                baseQueryMeta: {
                    request: {
                        method: (rejectedAction.meta as any).baseQueryMeta?.request?.method ?? 'unknown',
                        url: (rejectedAction.meta as any).baseQueryMeta?.request?.url ?? 'unknown'
                    }
                }
            },
            payload: {
                status: (rejectedAction.payload as any).status ?? 'unknown',
                error: (rejectedAction.payload as any).error ?? undefined, // From FE
                data: (rejectedAction.payload as any).data ?? undefined // From BE
            }
        }));
    }
    return next(action);
}

// Special middleware to persist the theme mode (light/dark) to LocalStorage
const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
    matcher: isAnyOf(setThemeMode),
    effect: (action, listenerApi) => {
        switch (action.type) {
            case 'ui/setThemeMode':
                saveUITheme((listenerApi.getState() as RootState).ui.themeMode);
                break;
        }
    }
});

export const rootReducer = combineReducers({
    conf: configReducer,
    ui: themeReducer,
    auth: authReducer,
    error: errorReducer,
    transgressionsApi: transgressionsApi.reducer,
    coreApi: coreApi.reducer,
    weighApi: weighApi.reducer,
    contentStoreApi: contentStoreApi.reducer,
    transgression: transgressionReducer,
    captureCourtResults: captureCourtResultReducer,
});

export const store = configureStore({
    preloadedState: {
        ui: { themeMode: loadUITheme() }
    },
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
        transgressionsApi.middleware as any,
        coreApi.middleware as any,
        weighApi.middleware as any,
        contentStoreApi.middleware as any,
        listenerMiddleware.middleware,
        rtkQueryErrorLogger
    )
});

setupListeners(store.dispatch);
AuthService.initializeAuthService(store.dispatch);
AuthService.setStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
