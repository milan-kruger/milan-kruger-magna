import { render, screen } from "@testing-library/react";
import VehicleDetails from "../../../components/prosecution/VehicleDetails";
import { TransgressionType } from "../../../enum/TransgressionType";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { coreApi, GetLookupsApiArg } from "../../../redux/api/coreApi";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { transgressionConfig as baseConfig } from "../../mocks/transgressionConf.mock";


vi.mock("react", async () => {
    const original = await vi.importActual("react");
    const originalTyped = original as typeof import("react");
    return {
        ...original,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useState: (initialState: any) => {
            if (initialState?.lookupType === "VEHICLE_MODEL") {
                return [initialState, vi.fn()];
            }
            const [state, setState] = originalTyped.useState(initialState);
            return [state, setState];
        }
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
        },
    }),
}));

vi.mock("../../../../framework/auth/authService.ts", () => ({
    default: {
        getUserName: vi.fn(() => "testUser"),
        isFeatureEnabled: vi.fn(() => true),
    },
}));

vi.mock("../../../components/prosecution/SmartLookup", () => ({
    __esModule: true,
    default: ({ ...props }) => (
        <input
            data-testid={props.testid}
            aria-label={props.label}
            value={props.value || ''}
            onChange={e => props.onChange && props.onChange(e, e.target.value)}
            {...props}
        />
    ),
}));

vi.mock("../../../../framework/redux/hooks", () => ({
    useAppSelector: vi.fn((selector) => {

        if (selector.name === "selectForm") {
            return mockState();
        }
        else if (selector.name === "selectConfigDevMode") {
            return true;
        }
        else if (selector.name === "selectVehicleMake") {
            return { id: 1, name: "Toyota" };
        }
        else if (typeof selector === "function") {
            try {
                const result = selector(mockState());
                return result;
            } catch (e) {
                console.error('Error occurred in selector:', e);
                return undefined;
            }
        }
    }),
    useAppDispatch: () => vi.fn(),
}));

vi.mock("../../../redux/api/coreApi", async () => {
    const actual = await vi.importActual("../../../redux/api/coreApi");
    return {
        ...actual,
        useGetLookupsQuery: (arg: GetLookupsApiArg) => {
            if (!arg || !arg.lookupType) {
                return { data: { content: [] }, isLoading: false, isError: false };
            }
            if (arg.lookupType === "VEHICLE_MODEL") {
                return {
                    data: {
                        content: [
                            { id: 1, lookupValue: "Corolla", parentId: 1 },
                            { id: 2, lookupValue: "Focus", parentId: 2 },
                        ]
                    },
                    isLoading: false,
                    isError: false
                };
            }
            if (arg.lookupType === "VEHICLE_MAKE") {
                return {
                    data: {
                        content: [
                            { id: 1, lookupValue: "Toyota", parentId: null },
                            { id: 2, lookupValue: "Ford", parentId: null },
                        ]
                    },
                    isLoading: false,
                    isError: false
                };
            }
            if (arg.lookupType === "ORIGIN_DESTINATION") {
                return {
                    data: {
                        content: [
                            { id: 1, lookupValue: "Location A", parentId: null },
                            { id: 2, lookupValue: "Location B", parentId: null },
                        ]
                    },
                    isLoading: false,
                    isError: false
                };
            }
            // Default: return empty
            return { data: { content: [] }, isLoading: false, isError: false };
        },
    };
});

const defaultProps = {
    disableEdit: false,
    setFormDataField: vi.fn(),
    setFormFieldValidation: vi.fn(),
    supervisorAuthorizationRequired: false,
    setSupervisor: vi.fn(),
    transgressionConfig: baseConfig,
    onComponentFieldChanges: vi.fn(),
    transgressionType: TransgressionType.RTQS,
    displayOptionalFields: true,
};

const store = configureStore({
    reducer: {
        [coreApi.reducerPath]: coreApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDefaultMiddleware().concat(coreApi.middleware) as any,
});

const mockFormData = {
    vehicleConfiguration: {
        vehicles: [
            {
                plateNumber: "ABC123",
                vehicleMake: "Toyota",
                vehicleModel: "Corolla",
                vehicleType: "Sedan",
                colour: "Blue",
            }
        ]
    },
    route: {
        originOfCargo: "Location A",
        destinationOfCargo: "Location B",
        cargo: "Weapons of Mass Destruction",
    }
};

const mockFormValidation = {
    plateNumberError: false,
    vehicleMakeError: false,
    vehicleModelError: false,
    vehicleTypeError: false,
    vehicleColorError: false,
    originOfCargoError: false,
    destinationOfCargoError: false,
    cargoError: false,
};

const mockConfig = {
    apiUrl: "http://mock",
    features: {
        enableRtqsTransgressions: true,
    },
};

const mockState = vi.fn(() => ({
    formData: mockFormData,
    formValidation: mockFormValidation,
    config: mockConfig,
}));

const renderComponent = (props = {}) => {
    const router = createMemoryRouter([
        {
            path: "/",
            element: <VehicleDetails {...defaultProps} {...props} />,
        },
    ]);
    return render(
        <ThemeProvider theme={createTheme()}>
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        </ThemeProvider>
    );
};

describe("VehicleDetails", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the component", () => {
        const { container } = renderComponent();

        expect(container).toBeInTheDocument();
    });

    it("should render plate number field if transgression is RTQS", () => {
        renderComponent({
            transgressionType: TransgressionType.RTQS
        });

        expect(screen.getByTestId("captureTransgressionPlateNumber")).toBeInTheDocument();
    });

    it("should not render plate number field if transgression is Overload", () => {
        renderComponent({
            transgressionType: TransgressionType.OVERLOAD
        });

        expect(screen.queryByTestId("captureTransgressionPlateNumber")).not.toBeInTheDocument();
    });

    it("should render vehicle make field if config enabled", () => {
        renderComponent({
            transgressionConfig: { ...baseConfig, vehicleMake: true }
        });

        expect(screen.getByTestId("captureTransgressionVehicleMake")).toBeInTheDocument();
    });

    it("should render vehicle model field if config enabled", () => {
        renderComponent({
            transgressionConfig: { ...baseConfig, vehicleModel: true }
        });

        expect(screen.getByTestId("captureTransgressionVehicleModel")).toBeInTheDocument();
    });

    it("should not show render edit button when supervisor auth not required", async() => {
        renderComponent({
            supervisorAuthorizationRequired: false
        });

        expect(screen.queryByTestId("editPlateNoButton")).not.toBeInTheDocument();
    });

    it("should show supervisor auth dialog when edit plate number and auth required", async() => {
        renderComponent({
            supervisorAuthorizationRequired: true
        });

        const editBtn = screen.getByTestId("editPlateNoButton");
        await userEvent.click(editBtn);

        expect(screen.getByTestId("driverDetailsSupervisorAuthDialog")).toBeInTheDocument();
    });

    it("should not render optional fields when displayOptionalFields is false", () => {
        renderComponent({
            transgressionConfig: {
                ...baseConfig,
                vehicleMake: false,
                vehicleModel: false,
                colour: false,
                vehicleType: false,
                origin: false,
                destination: false,
                cargo: false,
                displayOptionalFields: false
            },
            displayOptionalFields: false
        });

        expect(screen.queryByTestId("captureTransgressionVehicleMake")).not.toBeInTheDocument();
        expect(screen.queryByTestId("captureTransgressionVehicleModel")).not.toBeInTheDocument();
        expect(screen.queryByTestId("captureTransgressionVehicleColour")).not.toBeInTheDocument();
        expect(screen.queryByTestId("captureTransgressionVehicleType")).not.toBeInTheDocument();
        expect(screen.queryByTestId("captureTransgressionOrigin")).not.toBeInTheDocument();
        expect(screen.queryByTestId("captureTransgressionDestination")).not.toBeInTheDocument();
        expect(screen.queryByTestId("captureTransgressionCargo")).not.toBeInTheDocument();
    });

    it('should render optional fields when displayOptionalFields is true', async () => {
        renderComponent({
            transgressionConfig: {
                ...baseConfig,
                vehicleMake: false,
                vehicleModel: false,
                colour: false,
                vehicleType: false,
                origin: false,
                destination: false,
                cargo: false,
                displayOptionalFields: false
            },
            displayOptionalFields: true
        });

        expect(screen.getByTestId("captureTransgressionVehicleMake")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionVehicleModel")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionVehicleColour")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionVehicleType")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionOrigin")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionDestination")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionCargo")).toBeInTheDocument();
    });

    it("should always render required fields regardless of displayOptionalFields", () => {
        renderComponent({
            transgressionConfig: {
                ...baseConfig,
                vehicleMake: true,
                vehicleModel: true,
                colour: true,
                vehicleType: true,
                origin: true,
                destination: true,
                cargo: true,
            },
            displayOptionalFields: false
        });

        expect(screen.getByTestId("captureTransgressionVehicleMake")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionVehicleModel")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionVehicleColour")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionVehicleType")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionOrigin")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionDestination")).toBeInTheDocument();
        expect(screen.getByTestId("captureTransgressionCargo")).toBeInTheDocument();
    });

    it("should disable edit fields when disableEdit is true", () => {
        renderComponent({
            disableEdit: true
        });

        expect(screen.getByTestId("captureTransgressionVehicleMake")).toBeDisabled();
        expect(screen.getByTestId("captureTransgressionVehicleModel")).toBeDisabled();
        expect(screen.getByTestId("captureTransgressionVehicleColour")).toBeDisabled();
        expect(screen.getByTestId("captureTransgressionVehicleType")).toBeDisabled();
        expect(screen.getByTestId("captureTransgressionOrigin")).toBeDisabled();
        expect(screen.getByTestId("captureTransgressionDestination")).toBeDisabled();
        expect(screen.getByTestId("captureTransgressionCargo")).toBeDisabled();
    });

    it("destination should be required when origin is set", async () => {
        mockState.mockReturnValue({
            formData: {
                ...mockFormData,
                route: {
                    originOfCargo: "Location A",
                    destinationOfCargo: "",
                    cargo: "",
                },
            },
            formValidation: mockFormValidation,
            config: mockConfig,
        });
        renderComponent({
            transgressionConfig: {
                ...baseConfig,
                origin: false,
                destination: false,
            },
            displayOptionalFields: true
        });

        expect(screen.getByTestId("captureTransgressionDestination")).toBeRequired();
    });

    it("origin should be required when destination is set", async () => {
        mockState.mockReturnValue({
            formData: {
                ...mockFormData,
                route: {
                    originOfCargo: "",
                    destinationOfCargo: "Location B",
                    cargo: "",
                },
            },
            formValidation: mockFormValidation,
            config: mockConfig,
        });
        renderComponent({
            transgressionConfig: {
                ...baseConfig,
                origin: false,
                destination: false,
            },
            displayOptionalFields: true
        });

        expect(screen.getByTestId("captureTransgressionOrigin")).toBeRequired();
    });

    it("origin and destination should not be required when both are not set", async () => {
        mockState.mockReturnValue({
            formData: {
                ...mockFormData,
                route: {
                    originOfCargo: "",
                    destinationOfCargo: "",
                    cargo: "",
                },
            },
            formValidation: mockFormValidation,
            config: mockConfig,
        });
        renderComponent({
            transgressionConfig: {
                ...baseConfig,
                origin: false,
                destination: false,
            },
            displayOptionalFields: true
        });

        expect(screen.queryByTestId("captureTransgressionDestination")).not.toBeRequired();
        expect(screen.getByTestId("captureTransgressionOrigin")).not.toBeRequired();
    });

});
