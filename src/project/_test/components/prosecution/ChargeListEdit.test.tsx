import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import TmChargeListEdit, { TmRtqsCharge } from "../../../components/prosecution/ChargeListEdit";
import { Money, RtqsCharge, transgressionsApi } from "../../../redux/api/transgressionsApi";
import { JsonObjectType } from "../../../enum/JsonObjectType";
import { Provider } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import transgressionReducer from "../../../redux/transgression/transgressionSlice";
import configReducer from "../../../../framework/config/configSlice";
import themeReducer from "../../../../framework/ui/uiSlice";
import authReducer from "../../../../framework/auth/authSlice";
import errorReducer from "../../../../framework/error/errorSlice";
import { TransgressionStatus } from "../../../enum/TransgressionStatus";


vi.mock("@mui/icons-material/Search", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Clear", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Edit", () => ({ default: () => null }));
vi.mock("@mui/icons-material/CancelOutlined", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Check", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Cancel", () => ({ default: () => null }));
vi.mock("@mui/icons-material/ExpandLess", () => ({ default: () => null }));
vi.mock("@mui/icons-material/ExpandMore", () => ({ default: () => null }));
vi.mock("@mui/icons-material/HighlightOffOutlined", () => ({ default: () => null }));

vi.mock("i18next", () => ({
    default: {
        t: (key: string) => key
    },
    t: (key: string) => key
}));

vi.mock("@mui/material", async () => {
    const original = await vi.importActual("@mui/material");
    return {
        ...original,
        useMediaQuery: vi.fn(() => false)
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn()
        }
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn()
    }
}));

vi.mock("../../../components/prosecution/ChargeRow", () => ({
    ChargeRow: ({ charge, index, chargeOps, disableEdit, firstChargeValid, secondChargeValid, steeringVehiclePlateNumber }: {
        charge: { chargeCode: string, plateNumber?: string, fineAmount?: { amount: number, currency: string }, chargeTitle?: string, isNew?: boolean };
        index: number;
        chargeOps?: {
            clearCharge: (
                index: number,
                defaultSupervisorApproval: boolean,
                defaultPrevSupervisorApproval: boolean,
                defaultPlateNumber: string,
                onClearCallback?: (supervisorApproval: boolean) => void,
                linkedToSetValue?: (value: string | undefined) => void
            ) => void;
        };
        disableEdit?: boolean;
        firstChargeValid?: boolean;
        secondChargeValid?: boolean;
        steeringVehiclePlateNumber?: string;
    }) => {
        const isSecondCharge = index === 1;
        const isThirdCharge = index === 2;
        const disableSecondCharge = isSecondCharge && !firstChargeValid;
        const disableThirdCharge = isThirdCharge && (!firstChargeValid || !secondChargeValid);

        return (
            <div data-testid={`charge-row-${index}`}>
                <input
                    data-testid={`chargeCode${index}`}
                    value={charge.chargeCode || ''}
                    readOnly
                    disabled={disableEdit}
                />
                <span data-testid={`rtqsChargeTitle${index}`}>{charge.chargeTitle || ''}</span>
                <input
                    data-testid={`chargeVehiclePlateNo${index}`}
                    value={charge.plateNumber || ''}
                    readOnly
                    disabled={disableEdit}
                />
                <span data-testid={`rtqsFineAmountTitle${index}`}>
                    {charge.fineAmount ? `amountPayable: ${charge.fineAmount.currency} ${charge.fineAmount.amount}` : ''}
                </span>
                <button
                    data-testid={`rtqsRemoveCharge${index}`}
                    onClick={() => chargeOps?.clearCharge(
                        index,
                        false,
                        false,
                        steeringVehiclePlateNumber || '',
                        undefined,
                        undefined
                    )}
                    disabled={disableEdit || charge.isNew}
                >
                    Remove
                </button>
                <input type="checkbox" data-testid={`rtqsActive${index}`} disabled={disableEdit} />
                <button data-testid={`rtqsEditCharge${index}`} disabled={disableEdit}>Edit</button>
                <button
                    data-testid={`rtqsAddCharge${index}`}
                    disabled={disableEdit || disableSecondCharge || disableThirdCharge}
                >
                    Add Charge
                </button>
                <select data-testid={`rtqsLinkedTo${index}`} disabled={disableEdit}></select>
            </div>
        );
    }
}));

vi.mock("use-debounce", () => ({
    useDebouncedCallback: <T extends (...args: unknown[]) => unknown>(fn: T) => fn
}));

const mockWatch = vi.fn();

vi.mock("react-hook-form", () => ({
    useForm: () => ({
        control: {},
        setValue: vi.fn(),
        watch: mockWatch,
        formState: { errors: {}, isDirty: false }
    }),
    Controller: ({ render, name }: { render: (props: { field: { onChange: () => void; value: string }; fieldState: { error: undefined } }) => React.ReactNode; name: string }) => {
        const value = mockWatch(name) || "";
        return render({
            field: { onChange: vi.fn(), value },
            fieldState: { error: undefined }
        });
    }
}));

const mockProvideSnapshotCharge = vi.fn();
vi.mock("../../../hooks/chargebook/ChargeProvider", () => ({
    default: () => ({ provideSnapshotCharge: mockProvideSnapshotCharge }),
    RtqsChargePlaceholder: {
        isNew: true,
        chargeId: '',
        chargeCode: '',
        fineAmount: { amount: 0, currency: 'ZAR' },
        isAlternative: false,
        supervisorApproval: false,
        chargePrevSupervisorApproval: false
    }
}));

const mockOnSupervisorAuthorization = vi.fn();
vi.mock("../../../hooks/SupervisorAuthorizationManager", () => ({
    default: () => ({
        onSupervisorAuthorization: mockOnSupervisorAuthorization,
        isError: false
    })
}));

vi.mock("../../../../framework/components/button/TmIconButton", () => ({
    default: ({ children, onClick, disabled, testid }: { children?: React.ReactNode; onClick?: () => void; disabled?: boolean; testid?: string }) => (
        <button onClick={onClick} disabled={disabled} data-testid={testid}>
            {children}
        </button>
    )
}));

vi.mock("../../../../framework/components/selection/TmCheckbox", () => ({
    default: ({ onChange, checked, disabled, testid }: { onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; checked?: boolean; disabled?: boolean; testid?: string }) => (
        <input
            type="checkbox"
            onChange={onChange}
            checked={checked}
            disabled={disabled}
            data-testid={testid}
        />
    )
}));

vi.mock("../../../../framework/components/textfield/TmTextField", () => ({
    default: ({ value, onChange, disabled, testid, endadornment }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; testid?: string; endadornment?: React.ReactNode }) => (
        <div>
            <input
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                data-testid={testid}
            />
            {endadornment}
        </div>
    )
}));

interface AutocompleteOption {
    id: string;
    display: string;
}

vi.mock("../../../../framework/components/textfield/TmAutocomplete", () => ({
    default: ({ value, onChange, disabled, testid, options, getOptionLabel }: {
        value?: AutocompleteOption;
        onChange?: (e: React.ChangeEvent<HTMLSelectElement>, value: AutocompleteOption | undefined) => void;
        disabled?: boolean;
        testid?: string;
        options?: AutocompleteOption[];
        getOptionLabel?: (option: AutocompleteOption) => string
    }) => (
        <select
            value={value?.id || ''}
            onChange={(e) => {
                const selectedOption = options?.find((opt) => opt.id === e.target.value);
                onChange?.(e, selectedOption);
            }}
            disabled={disabled}
            data-testid={testid}
        >
            <option value="">Select</option>
            {options?.map((option) => (
                <option key={option.id} value={option.id}>
                    {getOptionLabel?.(option) || option.display}
                </option>
            ))}
        </select>
    )
}));

vi.mock("../../../../framework/components/textfield/TmNumberField", () => ({
    default: ({ value, onChange, disabled, testid }: { value?: number; onChange?: (value: number) => void; disabled?: boolean; testid?: string }) => (
        <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(Number(e.target.value))}
            disabled={disabled}
            data-testid={testid}
        />
    )
}));

vi.mock("../../../../framework/components/typography/TmTypography", () => ({
    default: ({ children, testid }: { children?: React.ReactNode; testid?: string }) => (
        <span data-testid={testid}>{children}</span>
    )
}));

vi.mock("../../../../framework/components/dialog/TmAuthenticationDialog", () => ({
    default: ({ isOpen, onCancel, onConfirm, handleUsernameOnChange, handlePasswordOnChange, testid }: {
        isOpen?: boolean;
        onCancel?: () => void;
        onConfirm?: () => void;
        handleUsernameOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        handlePasswordOnChange?: (value: string) => void;
        testid?: string;
    }) => {
        if (!isOpen) return null;
        return (
            <div data-testid={testid}>
                <input data-testid="auth-username" onChange={handleUsernameOnChange} />
                <input data-testid="auth-password" onChange={(e) => handlePasswordOnChange?.(e.target.value)} />
                <button data-testid="auth-confirm" onClick={onConfirm}>Confirm</button>
                <button data-testid="auth-cancel" onClick={onCancel}>Cancel</button>
            </div>
        );
    }
}));

vi.mock("../../../../framework/components/dialog/TmDialog", () => ({
    default: ({ isOpen }: { isOpen?: boolean }) => isOpen ? <div>Dialog</div> : null
}));

vi.mock("../../../../framework/components/button/TmButton", () => ({
    default: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>
}));

vi.mock("../../../utils/Constants", () => ({
    default: {
        plateNumberMaxLength: 15,
        dtoToObj: <T,>(obj: T) => obj
    }
}));

vi.mock("../../../../framework/utils", () => ({
    default: (str: string) => str?.toLowerCase().replace(/\s/g, ''),
    toCamelCaseWords: (...words: string[]) => words.join(''),
    toCamelCase: (str: string) => str?.toLowerCase().replace(/\s/g, ''),
    toTitleCase: (str: string) => str
}));

vi.mock("../../../utils/ZeroMoney", () => ({
    ZeroMoney: { amount: 0, currency: 'ZAR' }
}));

interface ChargeTypeDialogProps {
    isOpen?: boolean;
    numberOfLamps?: number;
    vehicleHeight?: number;
    allowedHeight?: number;
    charge?: {
        chargeType?: string;
    };
}

interface ChargeSearchProps {
    testId: string;
    open: boolean;
    setOpen: (value: boolean) => void;
    itemIndex: number;
    updateCharges: TmRtqsCharge[];
    setUpdateCharges: (value: TmRtqsCharge[]) => void;
    charges: unknown[];
    supervisorApprovalCopy: boolean;
    numberOfLamps?: number;
    vehicleHeight?: number;
    allowedHeight?: number;
    setVehicleHeight: (height: number) => void;
    setAllowedHeight: (height: number) => void;
    setNumberOfLamps: (numberOfLamps: number) => void
}

// Mock the components directly in the vi.mock factory
vi.mock("../../../components/prosecution/ChargeSearch", () => ({
    default: (props: ChargeSearchProps) => {
        const { open } = props;
        if (open) {
            return <div data-testid="charge-search-dialog">ChargeSearch is Open</div>;
        }
        return <></>;
    }
}));

vi.mock("../../../components/charge-type/ChargeTypeDialog", () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: (_props: ChargeTypeDialogProps) => null
}));

const rootReducer = combineReducers({
    [transgressionsApi.reducerPath]: transgressionsApi.reducer,
    transgression: transgressionReducer,
    conf: configReducer,
    ui: themeReducer,
    auth: authReducer,
    error: errorReducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

describe("TmChargeListEdit", () => {
    const mockMoney: Money = {
        amount: 1000,
        currency: "ZAR"
    };

    const mockTmRtqsCharge: TmRtqsCharge = {
        isNew: false,
        actualCharge: {
            chargeId: "charge-1",
            chargeCode: "CHG001",
            chargeTitle: "Test Charge",
            fineAmount: mockMoney,
            type: JsonObjectType.RtqsCharge
        } as RtqsCharge,
        isAlternative: false,
        chargeId: "charge-1",
        chargeCode: "CHG001",
        chargeTitle: "Test Charge",
        fineAmount: mockMoney,
        plateNumber: "ABC123",
        supervisorApproval: false,
        chargePrevSupervisorApproval: false
    };

    const mockNewCharge: TmRtqsCharge = {
        isNew: true,
        isAlternative: false,
        chargeId: "",
        chargeCode: "",
        fineAmount: { amount: 0, currency: "ZAR" },
        supervisorApproval: false,
        chargePrevSupervisorApproval: false
    };

    const defaultProps = {
        captureCharges: [mockTmRtqsCharge, mockNewCharge, mockNewCharge],
        updateCharges: vi.fn(),
        charges: [],
        onValidate: vi.fn(),
        disableEdit: false,
        supervisorAuthRequired: false,
        newTransgression: false,
        allowArrestCase: false,
        steeringVehiclePlateNumber: 'ABC123',
        status: 'Unknown' as TransgressionStatus
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockProvideSnapshotCharge.mockResolvedValue({
            chargeId: "snapshot-1",
            chargeCode: "CHG001",
            chargeTitle: "Test Charge",
            plateNumber: "ABC123",
            fineAmount: mockMoney
        });

        mockWatch.mockImplementation((name: string) => {
            if (name.startsWith("chargeCode")) return "CHG001";
            if (name.startsWith("plateNo")) return "ABC123";
            if (name.startsWith("linkedTo")) return "";
            if (name.startsWith("fineAmount")) return 1000;
            if (name.startsWith("vehicleplateno")) return "ABC123";
            if (name.startsWith("chargeVehiclePlateNo")) return "ABC123";
            return "";
        });
    });

    const renderWithProvider = (props = {}) => {
        return render(
            <Provider store={store}>
                <TmChargeListEdit {...defaultProps} {...props} />
            </Provider>
        );
    };

    afterEach(async () => {
        cleanup();
        vi.clearAllMocks();
        document.body.innerHTML = '';
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    it("renders without crashing", () => {
        renderWithProvider();
        expect(screen.getByTestId("chargeCode0")).toBeInTheDocument();
    });

    it("displays charge information correctly", () => {
        renderWithProvider();

        expect(screen.getByTestId("chargeCode0")).toHaveValue("CHG001");
        expect(screen.getByTestId("rtqsChargeTitle0")).toHaveTextContent("Test Charge");
        expect(screen.getByTestId("chargeVehiclePlateNo0")).toHaveValue("ABC123");
    });

    it("shows fine amount", () => {
        renderWithProvider();

        const fineAmount = screen.getByTestId("rtqsFineAmountTitle0");
        expect(fineAmount).toHaveTextContent("amountPayable: ZAR 1000");
    });

    it("disables fields when edit is disabled", () => {
        const props = {
            ...defaultProps,
            disableEdit: true,
            supervisorAuthRequired: true,
            captureCharges: [
                { ...mockTmRtqsCharge, supervisorApproval: false, chargePrevSupervisorApproval: false },
                mockNewCharge,
                mockNewCharge
            ]
        };

        renderWithProvider(props);

        const plateInput = screen.getByTestId("chargeVehiclePlateNo0");
        expect(plateInput).toBeDisabled();
    });

    it("shows supervisor auth button when required", () => {
        const props = {
            ...defaultProps,
            supervisorAuthRequired: true,
            disableEdit: true
        };

        renderWithProvider(props);

        const editButton = screen.getByTestId("rtqsEditCharge0");
        expect(editButton).toBeInTheDocument();
    });

    it("validates form on mount", () => {
        renderWithProvider();
        expect(defaultProps.onValidate).toHaveBeenCalled();
    });

    it("handles arrest case with custom fine amount", () => {
        const props = {
            ...defaultProps,
            allowArrestCase: true,
            arrestCaseFineAmount: { amount: 2000, currency: "ZAR" },
            captureCharges: [
                {
                    ...mockTmRtqsCharge,
                    fineAmount: { amount: 2000, currency: "ZAR" }
                },
                mockNewCharge,
                mockNewCharge
            ]
        };

        renderWithProvider(props);

        const fineAmount = screen.getByTestId("rtqsFineAmountTitle0");
        expect(fineAmount).toBeInTheDocument();
        expect(fineAmount.textContent).toContain("2000");
    });

    it("shows linked to field for alternative charges", () => {
        const altCharge = {
            ...mockTmRtqsCharge,
            isAlternative: true,
            linkedTo: "CHG001",
            plateNumber: "XYZ789"
        };

        const props = {
            ...defaultProps,
            captureCharges: [mockTmRtqsCharge, mockNewCharge, altCharge]
        };

        renderWithProvider(props);

        expect(screen.getByTestId("rtqsLinkedTo2")).toBeInTheDocument();
    });

    it("disables second charge when first is invalid", () => {
        const props = {
            ...defaultProps,
            captureCharges: [mockNewCharge, mockTmRtqsCharge, mockNewCharge]
        };

        renderWithProvider(props);

        const secondChargeSearch = screen.getByTestId("rtqsAddCharge1");
        expect(secondChargeSearch).toBeDisabled();
    });

    it("handles charges with vehicle height", () => {
        const chargeWithHeight = {
            ...mockTmRtqsCharge,
            vehicleHeight: 4.5,
            allowedHeight: 4.0
        };

        const props = {
            ...defaultProps,
            captureCharges: [chargeWithHeight, mockNewCharge, mockNewCharge]
        };

        renderWithProvider(props);
        expect(screen.getByTestId("chargeCode0")).toBeInTheDocument();
    });

    it("handles charges with number of lamps", () => {
        const chargeWithLamps = {
            ...mockTmRtqsCharge,
            numberOfLamps: 2
        };

        const props = {
            ...defaultProps,
            captureCharges: [chargeWithLamps, mockNewCharge, mockNewCharge]
        };

        renderWithProvider(props);
        expect(screen.getByTestId("chargeCode0")).toBeInTheDocument();
    });

    it("validates required charge code for first charge", () => {
        mockWatch.mockImplementation((name: string) => {
            if (name.startsWith("chargeCode")) return "";
            if (name.startsWith("plateNo")) return "ABC123";
            return "";
        });

        const emptyCharge = {
            ...mockNewCharge,
            chargeCode: ""
        };

        const props = {
            ...defaultProps,
            captureCharges: [emptyCharge, mockNewCharge, mockNewCharge]
        };

        renderWithProvider(props);

        expect(defaultProps.onValidate).toHaveBeenCalled();
        expect(screen.getByTestId("chargeCode0")).toBeInTheDocument();
        expect(screen.getByTestId("chargeCode0")).toHaveValue("");
    });




    it("handles charge with no actualCharge", () => {
        mockWatch.mockImplementation((name: string) => {
            if (name === "chargeCode") return "CHG999";
            if (name.startsWith("plateNo")) return "XYZ123";
            if (name.startsWith("linkedTo")) return "";
            if (name.startsWith("fineAmount")) return 1000;
            if (name.startsWith("vehicleplateno")) return "XYZ123";
            if (name.startsWith("chargeVehiclePlateNo")) return "XYZ123";
            return "";
        });

        const chargeWithoutActual = {
            ...mockNewCharge,
            chargeCode: "CHG999",
            plateNumber: "XYZ123"
        };

        const props = {
            ...defaultProps,
            captureCharges: [chargeWithoutActual, mockNewCharge, mockNewCharge]
        };

        renderWithProvider(props);

        expect(screen.getByTestId("chargeCode0")).toHaveValue("CHG999");
    });

    it("handles transformValue function for plate numbers", () => {
        const props = {
            ...defaultProps,
            captureCharges: [mockTmRtqsCharge, mockNewCharge, mockNewCharge]
        };

        renderWithProvider(props);

        const plateInput = screen.getByTestId("chargeVehiclePlateNo0");

        fireEvent.change(plateInput, { target: { value: "abc 123" } });

        expect(plateInput).toHaveValue("ABC123");
    });

    it("validates plate number length", () => {
        const props = {
            ...defaultProps,
            captureCharges: [mockTmRtqsCharge, mockNewCharge, mockNewCharge]
        };

        renderWithProvider(props);

        const plateInput = screen.getByTestId("chargeVehiclePlateNo0") as HTMLInputElement;

        const longPlate = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        fireEvent.change(plateInput, { target: { value: longPlate } });

        expect(plateInput.value.length).toBeLessThanOrEqual(15);
    });

    it("handles empty plate number in updateSnapshotChargePlateNo", async () => {
        const props = {
            ...defaultProps,
            captureCharges: [mockTmRtqsCharge, mockNewCharge, mockNewCharge]
        };

        renderWithProvider(props);

        const plateInput = screen.getByTestId("chargeVehiclePlateNo0");

        fireEvent.change(plateInput, { target: { value: "" } });

        await waitFor(() => {
            expect(mockProvideSnapshotCharge).not.toHaveBeenCalled();
        });
    });

});
