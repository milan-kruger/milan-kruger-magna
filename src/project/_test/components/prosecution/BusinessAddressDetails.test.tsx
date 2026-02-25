import { ThemeProvider, createTheme } from "@mui/material";
import BusinessAddressDetails from "../../../components/prosecution/BusinessAddressDetails";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { initialState as transgressionInitialState } from "../../../redux/transgression/transgressionSlice";
import { waitFor } from "@testing-library/react";
import { render } from "vitest-browser-react";
import { vi } from "vitest";

// Type definitions for mock components
interface MockSmartLookupProps {
    testid: string;
    fieldValue?: string;
    disabled?: boolean;
    readonly?: boolean;
    error?: boolean;
}

interface MockSmartTextfieldProps {
    testid: string;
    fieldValue?: string;
    disabled?: boolean;
    readonly?: boolean;
    error?: boolean;
    maxLength?: number;
}

vi.mock("../../../components/prosecution/SmartLookup", () => ({
    __esModule: true,
    default: (props: MockSmartLookupProps) => (
        <div data-testid={props.testid}>
            <div className={props.error ? "Mui-error" : ""}>
                <input
                    value={props.fieldValue || ""}
                    disabled={props.disabled}
                    readOnly={props.readonly || true}
                    onChange={() => {}}
                />
            </div>
        </div>
    )
}));

vi.mock("../../../components/prosecution/SmartTextfield", () => ({
    __esModule: true,
    default: (props: MockSmartTextfieldProps) => (
        <div data-testid={props.testid}>
            <div className={props.error ? "Mui-error" : ""}>
                <input
                    value={props.fieldValue || ""}
                    disabled={props.disabled}
                    readOnly={props.readonly || true}
                    maxLength={props.maxLength}
                    onChange={() => {}}
                />
            </div>
        </div>
    )
}));

const mockSetFormFieldValidation = vi.fn();
const mockOnComponentFieldChanges = vi.fn();
const theme = createTheme();

const getInputValue = (element: Element | null): string => {
    if (element && 'value' in element) {
        return (element as HTMLInputElement).value;
    }
    return '';
};

const getInputMaxLength = (element: Element | null): number => {
    if (element && 'maxLength' in element) {
        return (element as HTMLInputElement).maxLength;
    }
    return 0;
};

interface StateOverrides {
    form?: {
        formData?: {
            operator?: Record<string, unknown>;
        };
        formValidation?: Record<string, boolean>;
    };
    disableBusinessAddress?: boolean;
    [key: string]: unknown;
}

const createMockTransgressionState = (overrides: StateOverrides = {}) => {
    const baseState = {
        ...transgressionInitialState,
        form: {
            ...transgressionInitialState.form,
            formData: {
                operator: {
                    businessAddressLine1: "",
                    businessAddressLine2: "",
                    businessCity: "",
                    businessCountry: "",
                    businessPostalCode: ""
                }
            },
            formValidation: {
                businessAddressCountryError: false,
                businessAddressCityError: false,
                businessAddressLine1Error: false,
                businessAddressLine2Error: false,
                businessAddressCodeError: false
            }
        }
    };

    return {
        ...baseState,
        ...overrides,
        form: {
            ...baseState.form,
            ...(overrides.form || {}),
            formData: {
                ...baseState.form.formData,
                ...(overrides.form?.formData || {}),
                operator: {
                    ...baseState.form.formData.operator,
                    ...(overrides.form?.formData?.operator || {})
                }
            },
            formValidation: {
                ...baseState.form.formValidation,
                ...(overrides.form?.formValidation || {})
            }
        }
    };
};

const renderComponent = async (props = {}, transgressionStateOverrides = {}) => {
    const mockState = createMockTransgressionState(transgressionStateOverrides);

    const transgressionSlice = createSlice({
        name: 'transgression',
        initialState: mockState,
        reducers: {}
    });

    const mockApiSlice = createSlice({
        name: 'mockApi',
        initialState: {},
        reducers: {}
    });

    const store = configureStore({
        reducer: {
            coreApi: mockApiSlice.reducer,
            transgressionsApi: mockApiSlice.reducer,
            weighApi: mockApiSlice.reducer,
            contentStoreApi: mockApiSlice.reducer,
            transgression: transgressionSlice.reducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false
            })
    });

    return render(
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <BusinessAddressDetails
                    disableEdit={false}
                    displayOptionalFields={true}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    onComponentFieldChanges={mockOnComponentFieldChanges}
                    {...props}
                />
            </Provider>
        </ThemeProvider>
    ).then(({ container }) => ({ container }));
};

describe("BusinessAddressDetails", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render the component', async () => {
        const component = await renderComponent({}, {});
        expect(component).toBeDefined();
    });

    it('should render all address fields when config enables them', async () => {
        const transgressionConfig = {
            businessAddressLine1: true,
            businessAddressLine2: true,
            businessCity: true,
            businessCountry: true,
            businessPostalCode: true
        };
        const { container } = await renderComponent({ transgressionConfig }, {});

        await waitFor(() => {
            expect(container.querySelector('[data-testid="captureTransgressionBusinessAddress"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressLine2"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressCity"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressCountry"]')).toBeTruthy();
            expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressPostalCode"]')).toBeTruthy();
        });
    });

    it('should not render fields when displayOptionalFields is false and fields are not required', async () => {
        const transgressionConfig = {
            businessAddressLine1: false,
            businessAddressLine2: false,
            businessCity: false,
            businessCountry: false,
            businessPostalCode: false
        };
        const { container } = await renderComponent({
            transgressionConfig,
            displayOptionalFields: false
        }, {});

        expect(container.querySelector('[data-testid="captureTransgressionBusinessAddress"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressLine2"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressCity"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressCountry"]')).toBeNull();
        expect(container.querySelector('[data-testid="captureTransgressionBusinessAddressPostalCode"]')).toBeNull();
    });

    it('should call setFormFieldValidation for all validation fields on mount', async () => {
        const transgressionConfig = {
            businessAddressLine1: true,
            businessAddressLine2: true,
            businessCity: true,
            businessCountry: true,
            businessPostalCode: true
        };
        await renderComponent({ transgressionConfig }, {});

        await waitFor(() => {
            expect(mockSetFormFieldValidation).toHaveBeenCalledWith('businessAddressCountryError', expect.any(Boolean));
            expect(mockSetFormFieldValidation).toHaveBeenCalledWith('businessAddressCityError', expect.any(Boolean));
            expect(mockSetFormFieldValidation).toHaveBeenCalledWith('businessAddressLine1Error', expect.any(Boolean));
            expect(mockSetFormFieldValidation).toHaveBeenCalledWith('businessAddressLine2Error', expect.any(Boolean));
            expect(mockSetFormFieldValidation).toHaveBeenCalledWith('businessAddressCodeError', expect.any(Boolean));
        });
    });

    it('should display validation errors when fields are required but empty', async () => {
        const transgressionConfig = {
            businessAddressLine1: true,
            businessCity: true,
            businessCountry: true,
            businessPostalCode: true
        };

        const stateWithErrors = {
            form: {
                formValidation: {
                    businessAddressCountryError: true,
                    businessAddressCityError: true,
                    businessAddressLine1Error: true,
                    businessAddressLine2Error: false,
                    businessAddressCodeError: true
                }
            }
        };

        const { container } = await renderComponent({ transgressionConfig }, stateWithErrors);

        const addressField = container.querySelector('[data-testid="captureTransgressionBusinessAddress"]');
        const cityField = container.querySelector('[data-testid="captureTransgressionBusinessAddressCity"]');
        const countryField = container.querySelector('[data-testid="captureTransgressionBusinessAddressCountry"]');
        const postalCodeField = container.querySelector('[data-testid="captureTransgressionBusinessAddressPostalCode"]');

        expect(addressField?.querySelector('.Mui-error')).toBeTruthy();
        expect(cityField?.querySelector('.Mui-error')).toBeTruthy();
        expect(countryField?.querySelector('.Mui-error')).toBeTruthy();
        expect(postalCodeField?.querySelector('.Mui-error')).toBeTruthy();
    });

    it('should disable all fields when disableEdit is true', async () => {
        const transgressionConfig = {
            businessAddressLine1: true,
            businessAddressLine2: true,
            businessCity: true,
            businessCountry: true,
            businessPostalCode: true
        };

        const { container } = await renderComponent({
            transgressionConfig,
            disableEdit: true
        }, {});

        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            expect(input).toHaveProperty('disabled', true);
        });
    });

    it('should render with form data from Redux state', async () => {
        const transgressionConfig = {
            businessAddressLine1: true,
            businessCity: true,
            businessCountry: "ZA",
            businessPostalCode: true
        };

        const stateWithData = {
            form: {
                formData: {
                    operator: {
                        businessAddressLine1: "123 Main Street",
                        businessAddressLine2: "Suite 200",
                        businessCity: "Cape Town",
                        businessCountry: "ZA",
                        businessPostalCode: "8001"
                    }
                }
            }
        };

        const { container } = await renderComponent({ transgressionConfig }, stateWithData);

        const addressInput = container.querySelector('[data-testid="captureTransgressionBusinessAddress"] input');
        const cityInput = container.querySelector('[data-testid="captureTransgressionBusinessAddressCity"] input');
        const postalCodeInput = container.querySelector('[data-testid="captureTransgressionBusinessAddressPostalCode"] input');

        expect(getInputValue(addressInput)).toBe("123 Main Street");
        expect(getInputValue(cityInput)).toBe("Cape Town");
        expect(getInputValue(postalCodeInput)).toBe("8001");
    });

    it('should call onComponentFieldChanges when country changes', async () => {
        const transgressionConfig = {
            businessCountry: true
        };

        const stateWithCountry = {
            form: {
                formData: {
                    operator: {
                        businessCountry: "US"
                    }
                }
            }
        };

        await renderComponent({ transgressionConfig }, stateWithCountry);

        await waitFor(() => {
            expect(mockOnComponentFieldChanges).toHaveBeenCalled();
        });
    });

    it('should validate special characters in city field', async () => {
        const transgressionConfig = {
            businessCity: true
        };

        const stateWithSpecialChars = {
            form: {
                formData: {
                    operator: {
                        businessCity: "Cape@Town!"
                    }
                }
            }
        };

        await renderComponent({ transgressionConfig }, stateWithSpecialChars);

        expect(mockSetFormFieldValidation).toHaveBeenCalledWith('businessAddressCityError', true);
    });

    it('should validate special characters in postal code field', async () => {
        const transgressionConfig = {
            businessPostalCode: true
        };

        const stateWithSpecialCharsPostal = {
            form: {
                formData: {
                    operator: {
                        businessPostalCode: "8001@#"
                    }
                }
            }
        };

        await renderComponent({ transgressionConfig }, stateWithSpecialCharsPostal);

        expect(mockSetFormFieldValidation).toHaveBeenCalledWith('businessAddressCodeError', true);
    });

    it('should filter businessAddressLine2 if longer than 50 characters', async () => {
        const transgressionConfig = {
            businessAddressLine2: true
        };

        const longAddressLine2 = "This is a very long address line that exceeds fifty characters limit";

        const stateWithLongAddress = {
            form: {
                formData: {
                    operator: {
                        businessAddressLine2: longAddressLine2
                    }
                }
            }
        };

        const { container } = await renderComponent({ transgressionConfig }, stateWithLongAddress);

        const addressLine2Input = container.querySelector('[data-testid="captureTransgressionBusinessAddressLine2"] input');
        expect(getInputValue(addressLine2Input)).toBe("");
    });

    it('should render properly for mobile view', async () => {
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: query.includes('max-width'),
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        const transgressionConfig = {
            businessAddressLine1: true,
            businessCity: true
        };

        const { container } = await renderComponent({ transgressionConfig }, {});

        const mainBox = container.querySelector('.MuiBox-root');
        expect(mainBox).toBeTruthy();
    });

    it('should render fields with correct max lengths', async () => {
        const transgressionConfig = {
            businessAddressLine1: true,
            businessAddressLine2: true,
            businessCity: true,
            businessPostalCode: true
        };

        const { container } = await renderComponent({ transgressionConfig }, {});

        const addressInput = container.querySelector('[data-testid="captureTransgressionBusinessAddress"] input');
        const addressLine2Input = container.querySelector('[data-testid="captureTransgressionBusinessAddressLine2"] input');
        const cityInput = container.querySelector('[data-testid="captureTransgressionBusinessAddressCity"] input');
        const postalCodeInput = container.querySelector('[data-testid="captureTransgressionBusinessAddressPostalCode"] input');

        expect(getInputMaxLength(addressInput)).toBe(50);
        expect(getInputMaxLength(addressLine2Input)).toBe(50);
        expect(getInputMaxLength(cityInput)).toBe(50);
        expect(getInputMaxLength(postalCodeInput)).toBe(10);
    });
});
