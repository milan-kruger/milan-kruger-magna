'use client';
import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Provider } from 'react-redux';
import App from './framework/App';
import AuthWrapper from './framework/auth/components/AuthWrapper';
import ConfigContextProvider from './framework/config/ConfigContext';
import ErrorWrapper from './framework/error/ErrorWrapper';
import { I18nWrapper } from './framework/i18n/I18nWrapper';
import { PwaWrapper } from './framework/pwa/PwaWrapper';
import { store } from './framework/redux/store';
import { ThemeWrapper } from './framework/ui/ThemeWrapper';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <ErrorBoundary fallback={
        // Can't translate the error text because the translations haven't been initialised yet
        <h1 style={{
            textAlign: 'center',
            verticalAlign: 'center',
            width: '100%',
            height: '100%'
        }}>
            💥 Something went wrong! 🥲
        </h1>
    }>
        <PwaWrapper>
            <Provider store={store}>
                <ThemeWrapper>
                    <I18nWrapper>
                        <ConfigContextProvider>
                            <AuthWrapper>
                                <StrictMode>
                                    <ErrorWrapper>
                                        <HotkeysProvider>
                                            <App />
                                        </HotkeysProvider>
                                    </ErrorWrapper>
                                </StrictMode>
                            </AuthWrapper>
                        </ConfigContextProvider>
                    </I18nWrapper>
                </ThemeWrapper>
            </Provider>
        </PwaWrapper>
    </ErrorBoundary>
);
