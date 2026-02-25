import { ThemeProvider, createTheme } from "@mui/material";
import OperatorDetails from "../../../components/prosecution/OperatorDetails";
import { render } from "vitest-browser-react";
import { waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { transgressionsApi } from "../../../redux/api/transgressionsApi";

import transgressionReducer from "../../../redux/transgression/transgressionSlice";
import userEvent from "@testing-library/user-event";


const rootReducer = combineReducers({
    [transgressionsApi.reducerPath]: transgressionsApi.reducer,
    transgression: transgressionReducer,
});

const mockDisplayOptionalFields = vi.fn().mockReturnValue(true);
const mockSetFormDataField = vi.fn();
const mockSetFormFieldValidation = vi.fn();
const theme = createTheme();
const renderComponent = async (props = {}) => {
    const store = configureStore({
        reducer: rootReducer,
    });
    return render(
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <OperatorDetails
                    disableEdit={false}
                    displayOptionalFields={mockDisplayOptionalFields()}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    {...props}
                />
            </Provider>
        </ThemeProvider>
    ).then(({ container }) => ({ container }));
};

describe("OperatorDetails", () => {

    afterEach(() => {
        vi.clearAllMocks();
        mockSetFormDataField.mockClear();
        mockSetFormFieldValidation.mockClear();
    });

    test('should render the component', () => {
        const component = renderComponent();

        expect(component).toBeDefined();
    });

    test('should not render non-required fields when displayOptionalFields is false', async () => {
        mockDisplayOptionalFields.mockReturnValue(false);

        const transgressionConfig = {
            tripsDepotIdentifier: false,
            depotName: false,
            operatorName: false,
            operatorDiscNumber: false,
            emailAddress: false
        };
        const { container } = await renderComponent({ transgressionConfig });

        expect(container.querySelector('[data-testid="captureTransgressionDepotNumber"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionDepotName"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionOperatorName"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionOperatorDiscNumber"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionOperatorEmail"]')).toBeNull();
    });

    test('should render all SmartTextfield fields when config enables them', async () => {
        const transgressionConfig = {
            tripsDepotIdentifier: true,
            depotName: true,
            operatorName: true,
            operatorDiscNumber: true,
            emailAddress: true
        };
        const { container } = await renderComponent({ transgressionConfig });
        await waitFor(() => {
            expect(container.querySelector('[data-testid="captureTransgressionDepotNumber"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionDepotName"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionOperatorName"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionOperatorDiscNumber"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionOperatorEmail"]')).toBeTruthy();
        });
    });

    test('should call setFormFieldValidation for required fields', () => {
        const transgressionConfig = {
            depotName: true,
            operatorName: true
        };
        renderComponent({ transgressionConfig });
        expect(mockSetFormFieldValidation).toHaveBeenCalledWith('depotNameError', expect.any(Boolean));
        expect(mockSetFormFieldValidation).toHaveBeenCalledWith('operatorNameError', expect.any(Boolean));
    });

    test('should show error for invalid operator email', async () => {
        const transgressionConfig = { emailAddress: true };
        const { container } = await renderComponent({ transgressionConfig });
        const emailField = container.querySelector('input[data-testid="captureTransgressionOperatorEmail"]');

        await userEvent.type(emailField!, 'invalid-email');
        await waitFor(() => {
            expect(emailField).toBeTruthy();
            expect(emailField?.getAttribute('aria-invalid')).toBe('true');
        });
    });

    test('should require depot name and operator name when either operator field is filled', async () => {
        const transgressionConfig = {
            tripsDepotIdentifier: true,
            depotName: true,
            operatorName: true,
            operatorDiscNumber: true,
            emailAddress: true
         };
        const { container } = await renderComponent({ transgressionConfig });
        const depotDepotNumberField = container.querySelector('input[data-testid="captureTransgressionDepotNumber"]');
        const depotNameField = container.querySelector('input[data-testid="captureTransgressionDepotName"]');
        const operatorNameField = container.querySelector('input[data-testid="captureTransgressionOperatorName"]');
        const operatorDiscNumberField = container.querySelector('input[data-testid="captureTransgressionOperatorDiscNumber"]');
        const emailField = container.querySelector('input[data-testid="captureTransgressionOperatorEmail"]');

        await userEvent.type(depotDepotNumberField!, '12345');

        await waitFor(() => {
            expect(depotNameField?.getAttribute('aria-invalid')).toBe('true');
            expect(operatorNameField?.getAttribute('aria-invalid')).toBe('true');
        });

        await userEvent.clear(depotDepotNumberField!);
        await userEvent.type(depotNameField!, 'Depot A');

        await waitFor(() => {
            expect(depotNameField?.getAttribute('aria-invalid')).toBe('false');
            expect(operatorNameField?.getAttribute('aria-invalid')).toBe('true');
        });

        await userEvent.clear(depotNameField!);
        await userEvent.type(operatorNameField!, 'John Doe');

        await waitFor(() => {
            expect(operatorNameField?.getAttribute('aria-invalid')).toBe('false');
            expect(depotNameField?.getAttribute('aria-invalid')).toBe('true');
        });

        await userEvent.clear(operatorNameField!);
        await userEvent.type(operatorDiscNumberField!, '123456');

        await waitFor(() => {
            expect(operatorNameField?.getAttribute('aria-invalid')).toBe('true');
            expect(depotNameField?.getAttribute('aria-invalid')).toBe('true');
        });

        await userEvent.clear(operatorDiscNumberField!);
        await userEvent.type(emailField!, 'test@example.com');

        await waitFor(() => {
            expect(depotNameField?.getAttribute('aria-invalid')).toBe('true');
            expect(operatorNameField?.getAttribute('aria-invalid')).toBe('true');
        });
    });
});
