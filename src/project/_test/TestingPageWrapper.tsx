import { createTheme, ThemeProvider } from "@mui/material";
import { EnhancedStore } from "@reduxjs/toolkit";
import { JSX, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ConfigContext, ConfigContextState, initialConfigContextState } from "../../framework/config/ConfigContext";

type InitialEntry = object;

type Props = {
    store: EnhancedStore;
    initialEntries?: InitialEntry[];
    initialConfigState?: Partial<ConfigContextState>;
}

const TestingPageWrapper = ({ store, initialEntries, initialConfigState, children }: PropsWithChildren<Props>): JSX.Element => {
    const theme = createTheme();
    const mockState = { ...initialConfigContextState, ...initialConfigState };
    return (
        <ConfigContext.Provider value={mockState}>
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <MemoryRouter initialEntries={initialEntries}>
                        {children}
                    </MemoryRouter>
                </ThemeProvider>
            </Provider>
        </ConfigContext.Provider>
    )
}

export default TestingPageWrapper;
