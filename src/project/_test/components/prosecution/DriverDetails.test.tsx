/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { act } from "react";
import { useAppDispatch, useAppSelector } from "../../../../framework/redux/hooks";
import { rootReducer } from "../../../../framework/redux/store";
import DriverDetails from "../../../components/prosecution/DriverDetails";
import { initialConfigState } from "../../mocks/config.mock";
import { transgressionConfig } from "../../mocks/transgressionConf.mock";
import TestingPageWrapper from "../../TestingPageWrapper";

const mockOnSupervisorAuthorization = vi.fn(() => Promise.resolve(true));
const mockHandleSupervisorAuthDialogClose = vi.fn();
const mockSetIsIdentificationDisabled = vi.fn();
const mockSetNotApproved = vi.fn();
const mockSetSupervisor = vi.fn();

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

vi.mock('../../../../framework/redux/hooks', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn().mockReturnValue({
        transgression: {
            form: {
                formData: {
                    driver: {
                        firstNames: "FSAFA",
                        surname: "ASFFS",
                        gender: "Female",
                        dateOfBirth: "2025-02-19",
                        identification: {
                            primaryId: false,
                            number: "12321",
                            idType: "NATIONAL_ID",
                            countryOfIssue: "Afghanistan",
                        },
                        contactNumber: {
                            number: "2132131",
                            dialingCode: "+1-242",
                            contactNumberType: "Home",
                        },
                        depot: undefined,
                        trn: undefined,
                        licenceCode: "0",
                        licenceNumber: undefined,
                        prDPCode: undefined,
                        prDPNumber: undefined,
                        countryOfIssue: "Armenia",
                        age: "0",
                        residentialAddressLine1: "SAFAFS",
                        residentialAddressLine2: undefined,
                        residentialCity: "SAAF",
                        residentialPostalCode: "AFSS",
                        residentialCountry: "Antigua and Barbuda",
                        idCountryOfIssue: "Armenia",
                        occupation: "Administrative Associate Professionals",
                    }
                }
            }
        }
    })
}));

vi.mock('../../../redux/api/coreApi', async () => {
    const original = await vi.importActual('../../../redux/api/coreApi');
    return {
        ...original,
        useGetLookupsQuery: vi.fn(() => ({
            data: [],
            isFetching: false,
        })),
        useFindAllIdentityTypesQuery: vi.fn(() => ({
            data: [],
            isFetching: false
        }))
    }
});

vi.mock('../../../redux/api/transgressionsApi', async () => {
    const original = await vi.importActual('../../../redux/api/transgressionsApi');
    return {
        ...original,
        useFindTransgressionConfigurationQuery: vi.fn(() => ({
            data: {
                transgressionConfigurations: [transgressionConfig]
            },
            isFetching: false
        })),
    }
})

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

vi.mock("../../../../framework/utils", async () => {
    const actual = await vi.importActual("../../../../framework/utils");

    return {
        ...actual,
        toCamelCase: vi.fn(),
        toCamelCaseWords: (a: string, b: string) => `${a}${b.charAt(0).toUpperCase()}${b.slice(1)}`,
        containsSpecialCharacters: vi.fn()
    };
});

vi.mock('../../../../framework/components/textfield/TmTextField', () => ({
    __esModule: true,
    default: (props: any) => <input data-testid={props.testid} {...props} />,
}));
vi.mock('../../../../framework/components/textfield/TmAutocomplete', () => ({
    __esModule: true,
    default: (props: any) => <input data-testid={props.testid} {...props} />,
}));
vi.mock('../../../../framework/components/textfield/date-time/TmDatePicker', () => ({
    __esModule: true,
    default: (props: any) => <input data-testid={props.testid} {...props} />,
}));

vi.mock('../../../../framework/components/dialog/TmAuthenticationDialog', () => ({
    __esModule: true,
    default: (props: any) => {
        const { isOpen, testid, onConfirm, handleUsernameOnChange, handlePasswordOnChange, isAuthenticationError, username, password } = props;

        // Simulating username and password input changes and confirm button click
        const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            handleUsernameOnChange(event);
        };

        const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            handlePasswordOnChange(event.target.value);
        };

        const handleConfirmClick = () => {
            onConfirm();
            mockHandleSupervisorAuthDialogClose();
            mockSetIsIdentificationDisabled();
        };

        return isOpen ? (
            <div data-testid={testid}>
                <input
                    data-testid="driverDetailsSupervisorAuthDialogUsername"
                    value={username}
                    onChange={handleUsernameChange}
                />
                <input
                    data-testid="driverDetailsSupervisorAuthDialogPassword"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <button data-testid="driverDetailsSupervisorAuthDialogConfirm" onClick={handleConfirmClick}>
                    Confirm
                </button>
                {isAuthenticationError && <div data-testid="auth-error">Authentication Failed</div>}
            </div>
        ) : null;
    },
}));

vi.mock('../../../../framework/components/dialog/TmDialog', () => ({
    __esModule: true,
    default: (props: any) => props.isOpen ? <div data-testid={props.testid} /> : null,
}));
vi.mock('../../../utils/IdValidationManager', () => ({
    __esModule: true,
    default: () => [null, vi.fn(), vi.fn()],
}));
vi.mock('../../../hooks/SupervisorAuthorizationManager', () => ({
    __esModule: true,
    default: () => ({
        onSupervisorAuthorization: mockOnSupervisorAuthorization,
        isError: false,
    }),
}));

vi.mock('react-number-format', () => ({
    NumericFormat: ({ value, onValueChange, ...rest }: any) => (
        <input
            data-testid={rest.testid}
            value={value}
            onChange={(e) => onValueChange({ value: e.target.value })}
            {...rest}
        />
    ),
}));

vi.mock('../../../../project/components/prosecution/SmartTextfield', () => ({
    __esModule: true,
    default: ({ ...props }: any) => {
        return (
            <input
                value={props.fieldValue}
                onChange={(e) => props.onChange?.(e, e.target.value)}
                data-testid={props.testid}
                {...props}
            />
        );
    }
}));

vi.mock('../../../../project/components/prosecution/SmartLookup', () => ({
    __esModule: true,
    default: (props: any) => (
        <div data-testid={props.testid} className="mock-smart-lookup">
            {props.label}
        </div>
    ),
}));

// Setup mocks
const mockSetFormDataField = vi.fn();
const mockSetFormFieldValidation = vi.fn();

const initializeStore = () => configureStore({
    reducer: rootReducer,
});

describe('DriverDetails Component with Providers', () => {
    let store: EnhancedStore;
    let mockDispatch = vi.fn();
    const getIdTypeValue = () => ({ name: 'ID_CARD', description: 'ID Card' });

    beforeEach(() => {
        store = initializeStore();

        // Reset mock calls before each test
        mockSetFormDataField.mockReset();
        mockSetFormFieldValidation.mockReset();
        mockSetSupervisor.mockReset();
        mockDispatch = vi.fn();
        vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
        vi.mocked(useAppSelector).mockReturnValue({
            transgression: {
                form: {
                    formData: {
                        driver: {
                            firstNames: "FSAFA",
                            surname: "ASFFS",
                            gender: "Female",
                            dateOfBirth: "2025-02-19",
                            identification: {
                                primaryId: false,
                                number: "12321",
                                idType: "NATIONAL_ID",
                                countryOfIssue: "Afghanistan",
                            },
                            contactNumber: {
                                number: "2132131",
                                dialingCode: "+1-242",
                                contactNumberType: "Home",
                            },
                            depot: undefined,
                            trn: undefined,
                            licenceCode: "0",
                            licenceNumber: undefined,
                            prDPCode: undefined,
                            prDPNumber: undefined,
                            countryOfIssue: "Armenia",
                            age: "0",
                            residentialAddressLine1: "SAFAFS",
                            residentialAddressLine2: undefined,
                            residentialCity: "SAAF",
                            residentialPostalCode: "AFSS",
                            residentialCountry: "Antigua and Barbuda",
                            idCountryOfIssue: "Armenia",
                            occupation: "Administrative Associate Professionals",
                        }
                    }
                }
            },
            isValid: true,
            formFieldValidation: {}
        });
    });

    it('should render DriverDetails component with SmartTextfield and SmartLookup correctly', async () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={() => ({ name: 'ID_CARD', description: 'ID Card' })}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        // Verify that SmartTextfield is rendered with the correct label (ID Card)
        expect(screen.getByTestId('captureTransgressionDriverName')).toBeInTheDocument();
        expect(screen.getByTestId('captureTransgressionDriverSurname')).toBeInTheDocument();

        // Check that SmartTextfield is mocked correctly with the right label inside mock div
        expect(screen.getByTestId('captureTransgressionIdNumber')).toBeInTheDocument();  // Now it renders "ID_CARD" in mock

        // Verify that SmartLookup is rendered with the correct label (driverCountryOfIssue)
        expect(screen.getByTestId('captureTransgressionDriverCountryOfIssue')).toBeInTheDocument();
        expect(screen.getByTestId('captureTransgressionDriverCountryOfIssueLicence')).toBeInTheDocument();
    });

    it('should call setFormDataField when the contact number changes', () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={() => ({ name: 'ID_CARD', description: 'ID Card' })}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}

                />
            </TestingPageWrapper>
        );

        const contactNumberInput = screen.getByTestId('captureTransgressionContactNumber');
        act(() => {
            fireEvent.change(contactNumberInput, { target: { value: '987654321' } });
        })

        // Assert the change is handled correctly
        expect(mockSetFormDataField).toHaveBeenCalledWith('driver.contactNumber.number', '987654321');
    });

    it('should open supervisor authorization dialog when edit icon is clicked', async () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={() => ({ name: 'ID_CARD', description: 'ID Card' })}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}

                />
            </TestingPageWrapper>
        );

        // Simulate clicking the edit button
        const editButton = screen.getByTestId('captureTransgressionEditIdNumber');
        await act(async () => {
            fireEvent.click(editButton);
        })

        // Assert that the dialog is opened
        expect(screen.getByTestId('driverDetailsSupervisorAuthDialog')).toBeInTheDocument();
    });

    it('should handle supervisor authentication confirmation correctly', async () => {
        // Arrange: Mock the necessary functions and states
        const AUTHORIZATION_ROLE = 'ROLE_UPDATETRANSGRESSION_OVERRIDE';
        const AUTHORIZATION_REASON = 'Update Transgression';

        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={getIdTypeValue}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        // Simulate clicking the edit button to open the supervisor authentication dialog
        const editButton = screen.getByTestId('captureTransgressionEditIdNumber');
        fireEvent.click(editButton);

        // Ensure that the dialog is open
        expect(screen.getByTestId('driverDetailsSupervisorAuthDialog')).toBeInTheDocument();

        // Simulate supervisor username and password input
        const supervisorUsernameInput = screen.getByTestId('driverDetailsSupervisorAuthDialogUsername');
        const supervisorPasswordInput = screen.getByTestId('driverDetailsSupervisorAuthDialogPassword');
        fireEvent.change(supervisorUsernameInput, { target: { value: 'supervisorUser' } });
        fireEvent.change(supervisorPasswordInput, { target: { value: 'supervisorPassword' } });

        // Simulate the supervisor auth confirmation button click
        const confirmButton = screen.getByTestId('driverDetailsSupervisorAuthDialogConfirm');
        await act(async () => {
            fireEvent.click(confirmButton); // This should trigger handleSupervisorAuthConfirm
        });

        // Assert that the mock function `onSupervisorAuthorization` is called with the correct arguments
        expect(mockOnSupervisorAuthorization).toHaveBeenCalledWith('SUPERVISORUSER', 'supervisorPassword', AUTHORIZATION_ROLE, AUTHORIZATION_REASON);

        // Assert that supervisor is set and the dialog is closed after confirmation
        expect(mockSetSupervisor).toHaveBeenCalledWith('SUPERVISORUSER');
        expect(mockHandleSupervisorAuthDialogClose).toHaveBeenCalled();
        expect(mockSetNotApproved).not.toHaveBeenCalled();
    });

    it("calls setFormFieldValidation with correct validation states", async () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={getIdTypeValue}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        await waitFor(() => {
            expect(mockSetFormFieldValidation).toHaveBeenCalledWith(
                "firstNamesError",
                true
            );
            expect(mockSetFormFieldValidation).toHaveBeenCalledWith(
                "surnameError",
                true
            );
        });
    });

    it('should display supervisor dialog when idGroupOverrideRequired is true and handle supervisor flow', async () => {
        const overrideConfig = {
            ...transgressionConfig,
            idGroupOverrideRequired: true
        };

        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={overrideConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={getIdTypeValue}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        // Simulate clicking the edit button to trigger override
        const editButton = screen.getByTestId('captureTransgressionEditIdNumber');
        await act(async () => {
            fireEvent.click(editButton);
        });

        // Supervisor dialog should appear
        expect(screen.getByTestId('driverDetailsSupervisorAuthDialog')).toBeInTheDocument();

        // Simulate supervisor username and password input
        const supervisorUsernameInput = screen.getByTestId('driverDetailsSupervisorAuthDialogUsername');
        const supervisorPasswordInput = screen.getByTestId('driverDetailsSupervisorAuthDialogPassword');
        fireEvent.change(supervisorUsernameInput, { target: { value: 'supervisorUser' } });
        fireEvent.change(supervisorPasswordInput, { target: { value: 'supervisorPassword' } });

        // Simulate the supervisor auth confirmation button click
        const confirmButton = screen.getByTestId('driverDetailsSupervisorAuthDialogConfirm');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        // Supervisor flow should be triggered
        expect(mockOnSupervisorAuthorization).toHaveBeenCalled();
        expect(mockSetSupervisor).toHaveBeenCalled();
        expect(mockHandleSupervisorAuthDialogClose).toHaveBeenCalled();
    });

    // ...existing code...

    it('should render override fields and supervisor dialog when idGroupOverrideRequired is true', async () => {
        // Patch config to require override
        const overrideConfig = {
            ...transgressionConfig,
            idGroupOverrideRequired: true
        };

        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={overrideConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={getIdTypeValue}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        // Should render edit icon for id fields (override mode)
        expect(screen.getByTestId('captureTransgressionEditIdNumber')).toBeInTheDocument();

        // Simulate clicking the edit button to trigger supervisor dialog
        await act(async () => {
            fireEvent.click(screen.getByTestId('captureTransgressionEditIdNumber'));
        });

        // Supervisor dialog should appear
        expect(screen.getByTestId('driverDetailsSupervisorAuthDialog')).toBeInTheDocument();
    });

    it('should render fields without supervisor dialog when idGroupOverrideRequired is false', async () => {
        // Patch config to NOT require override
        const noOverrideConfig = {
            ...transgressionConfig,
            idGroupOverrideRequired: false
        };

        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={noOverrideConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={getIdTypeValue}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        // Should render id fields as editable (not disabled by override)
        expect(screen.getByTestId('captureTransgressionIdNumber')).toBeInTheDocument();
    });

    it('should disable fields when disableEdit is true', () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={true}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={() => ({ name: 'ID_CARD', description: 'ID Card' })}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        // The input should be disabled
        expect(screen.getByTestId('captureTransgressionDriverName')).toBeDisabled();
        expect(screen.getByTestId('captureTransgressionDriverSurname')).toBeDisabled();
        expect(screen.getByTestId('captureTransgressionIdNumber')).toBeDisabled();
    });

    it('should render optional fields when displayOptionalFields is true', () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={() => ({ name: 'ID_CARD', description: 'ID Card' })}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={true}
                />
            </TestingPageWrapper>
        );

        // Should render optional occupation field
        expect(screen.getByTestId('captureTransgressionDriverOccupation')).toBeInTheDocument();
    });

    it('should not render optional fields when displayOptionalFields is false', () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={initialConfigState}
            >
                <DriverDetails
                    disableEdit={false}
                    setFormDataField={mockSetFormDataField}
                    setFormFieldValidation={mockSetFormFieldValidation}
                    transgressionConfig={transgressionConfig}
                    idTypes={{
                        options: [{ name: 'ID_CARD', description: 'ID Card' }],
                        getOptionLabel: (option) => option.description || 'No Description',
                    }}
                    getIdTypeValue={() => ({ name: 'ID_CARD', description: 'ID Card' })}
                    setSupervisor={mockSetSupervisor}
                    displayOptionalFields={false}
                />
            </TestingPageWrapper>
        );

        // Should NOT render optional occupation field
        expect(screen.queryByTestId('captureTransgressionDriverOccupation')).not.toBeInTheDocument();
    });

});
