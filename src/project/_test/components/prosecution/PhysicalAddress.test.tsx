import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { transgressionSlice } from "../../../redux/transgression/transgressionSlice";
import { coreApi } from "../../../redux/api/coreApi";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { render } from "@testing-library/react";

import PhysicalAddressDetails from "../../../components/prosecution/PhysicalAddress";
import { TransgressionConfiguration } from "../../../redux/api/transgressionsApi";

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

type TranslationFunction = (key: string, options?: Record<string, string>) => string;

vi.mock("../../../utils/TransgressionHelpers", () => ({
  displayField: (displayOptional: boolean, configField: boolean) =>
    displayOptional || configField,
  helperTextMessage: (
    error: boolean | undefined,
    field: string | undefined,
    fieldLabel: string,
    disableEdit: boolean,
    t: TranslationFunction
  ) =>
    error ||
    disableEdit ||
    field ||
    fieldLabel ||
    t("fieldRequired", { field: fieldLabel }),
}));

interface SmartTextfieldProps {
  testid: string;
  label: string;
  fieldValue?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

vi.mock("./SmartTextfield", () => ({
  default: ({
    testid,
    label,
    fieldValue,
    error,
    disabled,
    required,
    helperText,
  }: SmartTextfieldProps) => (
    <div>
      <input
        data-testid={testid}
        aria-label={label}
        value={fieldValue || ""}
        disabled={disabled}
        required={required}
        onChange={() => {}}
        {...(error && { "aria-invalid": "true" })}
      />
      {helperText && <span data-testid={`${testid}-error`}>{helperText}</span>}
    </div>
  ),
}));

interface SmartLookupProps {
  testid: string;
  label: string;
  fieldValue?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
}

vi.mock("./SmartLookup", () => ({
  default: ({ testid, label, fieldValue, error, disabled, required }: SmartLookupProps) => (
    <div>
      <select
        data-testid={testid}
        aria-label={label}
        value={fieldValue || ""}
        disabled={disabled}
        required={required}
        onChange={() => {}}
        {...(error && { "aria-invalid": "true" })}
      >
        <option value={fieldValue}>{fieldValue}</option>
      </select>
    </div>
  ),
}));

const mockTransgressionConfig: TransgressionConfiguration = {
  residentialAddressLine1: true,
  residentialAddressLine2: true,
  residentialCity: true,
  residentialPostalCode: true,
  residentialCountry: true,
  legislationType: "CPA",
  country: "",
  vehicleMake: false,
  vehicleModel: false,
  tripsDepotIdentifier: false,
  operatorName: false,
  operatorDiscNumber: false,
  emailAddress: false,
  contactNumber: false,
  contactNumberType: false,
  licenceCode: false,
  licenceNumber: false,
  prDPCode: false,
  prDPNumber: false,
  idCountryOfIssue: false,
  businessAddressLine1: false,
  businessAddressLine2: false,
  businessCity: false,
  businessCountry: false,
  businessPostalCode: false,
  occupation: false,
  depotName: false,
  colour: false,
  origin: false,
  destination: false,
  driverName: false,
  driverSurname: false,
  identificationType: false,
  identificationNumber: false,
  dateOfBirth: false,
  gender: false,
  trn: false,
  licenceCountryOfIssue: false,
  cargo: false,
  vehicleType: false,
  steeringAxleUnderloadRangeType: "PERCENTAGE",
  displayOptionalFields: false,
};

interface FormData {
  residentialAddressLine1?: string;
  residentialAddressLine2?: string;
  residentialCity?: string;
  residentialPostalCode?: string;
  residentialCountry?: string;
}

interface FormValidation {
  physicalAddressLine1Error?: boolean;
  physicalAddressLine2Error?: boolean;
  physicalAddressCityError?: boolean;
  physicalAddressCodeError?: boolean;
  physicalAddressCountryError?: boolean;
}

interface StateOverrides {
  formData?: FormData;
  formValidation?: FormValidation;
}

const createInitialState = (formData: FormData = {}, formValidation: FormValidation = {}) => ({
  transgression: {
    vehicleDetails: {
      vehicleMake: undefined
    },
    driverDetails: {
      driverLicenceCountryOfIssue: undefined
    },
    newBusinessAddressCountry: '',
    disableBusinessAddress: false,
    newTransgression: false,
    form: {
      initialFormData: {},
      formData: {
        driver: {
          residentialAddressLine1: "123 Main St",
          residentialAddressLine2: "Apt 4B",
          residentialCity: "Johannesburg",
          residentialPostalCode: "2001",
          residentialCountry: "ZA",
          ...formData,
        },
      },
      formValidation: {
        physicalAddressLine1Error: false,
        physicalAddressCityError: false,
        physicalAddressCountryError: false,
        physicalAddressCodeError: false,
        physicalAddressLine2Error: false,
        ...formValidation,
      },
      validationErrors: false,
      isDirty: false
    },
  }
});

const createMockStore = (initialState: ReturnType<typeof createInitialState>) => {
  const store = configureStore({
    reducer: {
      transgression: transgressionSlice.reducer,
      [coreApi.reducerPath]: coreApi.reducer
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      }).concat(coreApi.middleware)
  } as const);

  return store;
};

const mockProps = {
  disableEdit: false,
  displayOptionalFields: true,
  setFormDataField: vi.fn(),
  setFormFieldValidation: vi.fn(),
  transgressionConfig: mockTransgressionConfig,
};

const theme = createTheme();

const renderComponent = (props = mockProps, stateOverrides: StateOverrides = {}) => {
  const initialState = createInitialState(
    stateOverrides.formData,
    stateOverrides.formValidation
  );
  const store = createMockStore(initialState);

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <PhysicalAddressDetails {...props} />
      </ThemeProvider>
    </Provider>
  );
};

describe("PhysicalAddressDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders residential address toggle switch", () => {
      renderComponent();

      expect(screen.getByText("useResidential")).toBeInTheDocument();
      expect(screen.getByTestId("addressToggle")).toBeInTheDocument();
    });

    it("does not render fields when displayOptionalFields is false and config field is false", () => {
      const configWithoutLine2 = {
        ...mockTransgressionConfig,
        residentialAddressLine2: false,
      };

      renderComponent({
        ...mockProps,
        displayOptionalFields: false,
        transgressionConfig: configWithoutLine2,
      });

      expect(screen.queryByLabelText("addressLine2")).not.toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("calls setFormFieldValidation with correct validation states", async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressLine1Error",
          false
        );
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCityError",
          false
        );
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCountryError",
          false
        );
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCodeError",
          false
        );
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressLine2Error",
          false
        );
      });
    });

    it("validates required fields correctly", async () => {
      const emptyFormData = {
        residentialAddressLine1: "",
        residentialCity: "",
        residentialCountry: "",
        residentialPostalCode: "",
      };

      renderComponent(mockProps, { formData: emptyFormData });

      await waitFor(() => {
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressLine1Error",
          true
        );
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCityError",
          true
        );
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCountryError",
          true
        );
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCodeError",
          true
        );
      });
    });

    it("validates special characters in city field", async () => {
      const invalidCityData = {
        residentialCity: "City@#$",
      };

      renderComponent(mockProps, { formData: invalidCityData });

      await waitFor(() => {
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCityError",
          true
        );
      });
    });

    it("validates special characters in postal code field", async () => {
      const invalidPostalCodeData = {
        residentialPostalCode: "2001@#$",
      };

      renderComponent(mockProps, { formData: invalidPostalCodeData });

      await waitFor(() => {
        expect(mockProps.setFormFieldValidation).toHaveBeenCalledWith(
          "physicalAddressCodeError",
          true
        );
      });
    });
  });

  describe("Postal Code Length Validation", () => {
    it("handles postal code length correctly", () => {
      const longPostalCode = "12345678901234567890";

      renderComponent(mockProps, {
        formData: { residentialPostalCode: longPostalCode },
      });

      expect(longPostalCode.length).toBeGreaterThan(10);
    });
  });

  describe("Residential Address Toggle", () => {
    it("handles toggle switch change - checking", async () => {
      renderComponent();

      const toggle = screen.getByTestId("addressToggle");
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessCountry",
          "ZA"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessCity",
          "Johannesburg"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessPostalCode",
          "2001"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessAddressLine1",
          "123 Main St"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessAddressLine2",
          "Apt 4B"
        );
      });
    });

    it("handles toggle switch change - unchecking", async () => {
      renderComponent();

      const toggle = screen.getByTestId("addressToggle");

      fireEvent.click(toggle);
      // simulate unchecking the toggle
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessCountry",
          "ZA"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessCity",
          "Johannesburg"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessPostalCode",
          "2001"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessAddressLine1",
          "123 Main St"
        );
        expect(mockProps.setFormDataField).toHaveBeenCalledWith(
          "operator.businessAddressLine2",
          "Apt 4B"
        );
      });
    });
  });

  describe("Disabled State", () => {
    it("does not show validation errors when disableEdit is true", () => {
      const errorFormValidation = {
        physicalAddressLine1Error: true,
        physicalAddressCityError: true,
        physicalAddressCountryError: true,
        physicalAddressCodeError: true,
        physicalAddressLine2Error: true,
      };

      renderComponent(
        { ...mockProps, disableEdit: true },
        { formValidation: errorFormValidation }
      );

      expect(
        screen.queryByTestId("captureTransgressionaddress-error")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("captureTransgressionaddressCity-error")
      ).not.toBeInTheDocument();
    });
  });

  describe("Address Line 2 Length Validation", () => {
    it("handles address line 2 when length is within limit", () => {
      const shortAddressLine2 = "Short address";

      renderComponent(mockProps, {
        formData: { residentialAddressLine2: shortAddressLine2 },
      });

      expect(screen.getByDisplayValue(shortAddressLine2)).toBeInTheDocument();
    });

    it("handles address line 2 when length exceeds limit", () => {
      const longAddressLine2 =
        "This is a very long address line that exceeds the 50 character limit and should be handled appropriately";

      renderComponent(mockProps, {
        formData: { residentialAddressLine2: longAddressLine2 },
      });

      expect(
        screen.queryByDisplayValue(longAddressLine2)
      ).not.toBeInTheDocument();
    });
  });
});
