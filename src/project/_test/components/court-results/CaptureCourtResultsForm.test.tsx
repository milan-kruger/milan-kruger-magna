import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CaptureCourtResultsForm from '../../../components/court-results/CaptureCourtResultsForm';
import TestingPageWrapper from '../../TestingPageWrapper';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../../../framework/redux/store';
import { initialConfigState } from '../../mocks/config.mock';
import { act } from 'react';
import { transgressionConfig } from '../../mocks/transgressionConf.mock';
import { TransgressionStatus } from '../../../enum/TransgressionStatus';
import { MockData } from '../../mocks/MockData';
import { CourtOutCome } from '../../../enum/CourtOutCome';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('../../../../framework/components/textfield/TmTextField', () => ({
    __esModule: true,
    default: vi.fn(({ value, disabled, testid }) => <input
        data-testid={testid}
        value={value}
        disabled={disabled}
    />),
}));

vi.mock('../../../../framework/components/textfield/TmTextArea', () => ({
    default: vi.fn(({ value, disabled, testId, onChange }) => {
        return (<textarea
            data-testid={testId}
            value={value}
            disabled={disabled}
            onChange={onChange}
        />)
    }),
}));

vi.mock('../../../../framework/components/textfield/TmAutocomplete', () => ({
    __esModule: true,
    default: vi.fn(({ value, disabled, testid, onChange }) => {
        return (
            <input
                data-testid={testid}
                disabled={disabled}
                value={typeof value === 'string' ? value : value?.lookupValue ?? ''}
                onChange={(e) => {
                    const val = e.target.value;
                    const payload =
                        testid === 'courtOutcome'
                            ? val
                            : {
                                lookupValue: val,
                                lookupCode: val.toUpperCase().replace(/\s/g, '_'),
                            };
                    onChange?.(e, payload);
                }}
            />
        );
    }),
}));



vi.mock('../../../../framework/components/textfield/TmNumberField', () => ({
    __esModule: true,
    default: vi.fn(({ testid }) => <input
        data-testid={testid}
    />),
}));

vi.mock('../../../../framework/components/textfield/date-time/TmDatePicker', () => ({
    __esModule: true,
    default: vi.fn(({ testid, required }) => <input
        data-testid={testid}
        required={required}
    />),
}));

vi.mock('../../../../project/components/prosecution/ChargeList', () => ({
    __esModule: true,
    default: vi.fn(({ testid }) => <div
        data-testid={testid}
    />),
}));

vi.mock('../../../../project/redux/api/transgressionsApi', async () => {
    const original = await vi.importActual('../../../../project/redux/api/transgressionsApi');
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

vi.mock('../../../../project/redux/api/coreApi', async () => {
    const original = await vi.importActual('../../../../project/redux/api/coreApi');
    return {
        ...original,
        useGetLookupsQuery: vi.fn(({ lookupType }) => {
            if (lookupType === 'SENTENCE') {
                return {
                    data: {
                        content: [{
                            lookupCode: 'FINE',
                            lookupValue: 'Fine',
                        },
                        {
                            lookupCode: 'PRISON',
                            lookupValue: 'Prison',
                        }]
                    },
                    isFetching: false,
                };
            }
            if (lookupType === 'SENTENCE_TYPE') {
                return {
                    data: {
                        content: [{
                            lookupCode: 'COURT_FINE',
                            lookupValue: 'AoG Paid',
                        }]
                    },
                    isFetching: false,
                };
            }
            if (lookupType === 'PAYMENT_METHOD') {
                return {
                    data: {
                        content: [{
                            lookupCode: 'ONLINE',
                            lookupValue: 'Online Payment',
                        },
                        {
                            lookupCode: 'COURT_PAYMENT',
                            lookupValue: 'Court Payment'
                        }
                        ]
                    },
                    isFetching: false,
                };
            }
            return {
                data: { content: [] },
                isFetching: false,
            };
        }),
        useFindAllIdentityTypesQuery: vi.fn(() => ({
            data: [],
            isFetching: false
        }))
    }
});

const initializeStore = () => configureStore({
    reducer: rootReducer,
});

describe('CaptureCourtResultsForm', () => {
    let store: EnhancedStore;

    const baseProps = {
        testIdPrefix: "test-",
        sx: {},
        form: {
            formData: {},
            formValidation: {},
            initialFormData: {},
            validationErrors: false,
            isDirty: false
        },
        fieldWith: '100%',
        transgressionDetails: {
            status: MockData.getTransgression.status,
            courtAppearanceDate: "2025-01-03",
            noticeNumber: MockData.getTransgression.noticeNumber.number,
            snapshotCharges: MockData.getTransgression.snapshotCharges,
            totalAmountPayable: MockData.getTransgression.totalAmountPayable.amount,
            paymentReference: MockData.getTransgression.noticeNumber.number
        }
    };

    const renderForm = (
        overrideProps = {},
        {
            initialState = { newTransgression: true },
            configState = initialConfigState
        } = {}
    ) => {
        const props = { ...baseProps, ...overrideProps };
        return render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: initialState }]}
                initialConfigState={configState}
            >
                <CaptureCourtResultsForm {...props} />
            </TestingPageWrapper>
        );
    };

    beforeEach(() => {
        store = initializeStore();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render CaptureCourtResultsForm correctly', () => {
        renderForm();
        expect(screen.getByTestId('test-CaseNo')).toBeInTheDocument();
        expect(screen.getByTestId('courtOutcome')).toBeInTheDocument();
        expect(screen.getByTestId('test-Charges')).toBeInTheDocument();
    });

    it('disables the form inputs when readonly prop is true', () => {
        renderForm({ readonly: true });
        expect(screen.getByTestId('test-CaseNo')).toBeDisabled();
        expect(screen.getByTestId('courtOutcome')).toBeDisabled();
    });

    it('should show correct caseNo value when the form data is set', () => {
        renderForm({
            form: {
                ...baseProps.form,
                formData: { caseNumber: '12345' }
            }
        });
        expect(screen.getByTestId('test-CaseNo')).toHaveValue('12345');
    });

    it('changes court outcome to GUILTY and sets the sentence and payment method', async () => {
        renderForm({
            transgressionDetails: {
                ...baseProps.transgressionDetails,
                status: TransgressionStatus.PAID,
            }
        });

        const input = screen.getByTestId('courtOutcome');
        await act(async () => {
            fireEvent.change(input, { target: { value: CourtOutCome.GUILTY } });
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'Enter' });
        });

        expect(screen.getByTestId('test-Sentence')).toHaveValue('Fine');
        expect(screen.getByTestId('test-PaymentMethod')).toHaveValue('Online Payment');
    });

    it('shows sentence period and sentence length for "Prison" sentence', async () => {
        renderForm({
            form: {
                ...baseProps.form,
                formData: {
                    courtOutcome: 'GUILTY',
                    sentence: 'Prison',
                }
            }
        });

        const courtOutcomeInput = screen.getByTestId('courtOutcome');
        await act(async () => {
            fireEvent.change(courtOutcomeInput, { target: { value: 'GUILTY' } });
        });

        await waitFor(() => {
            expect(screen.getByTestId('sentencePeriod')).toBeInTheDocument();
            expect(screen.getByTestId('sentenceLength')).toBeInTheDocument();
        });
    });

    it('disables the sentence field when transgression status is PAID', () => {
        renderForm({
            transgressionDetails: {
                ...baseProps.transgressionDetails,
                status: TransgressionStatus.PAID,
            }
        });

        expect(screen.getByTestId('test-Sentence')).toBeDisabled();
    });

    it('clears form fields when a new court outcome is selected', async () => {
        renderForm();

        const input = screen.getByTestId('courtOutcome');

        await act(async () => {
            fireEvent.change(input, { target: { value: CourtOutCome.GUILTY } });
        });

        const before = screen.getByTestId('test-Sentence');

        await act(async () => {
            fireEvent.change(input, { target: { value: CourtOutCome.POSTPONED } });
        });

        await waitFor(() => {
            expect(before).not.toBeInTheDocument();
        });
    });

    it('shows "No Reason Provided" when reason is empty for "WITHDRAWN" outcome', async () => {
        renderForm();

        const input = screen.getByTestId('courtOutcome');
        await act(async () => {
            fireEvent.change(input, { target: { value: CourtOutCome.WITHDRAWN } });
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'Enter' });
        });

        expect(screen.getByTestId('courtResultReason')).toBeInTheDocument();
    });

    it('shows date picker and requires a new court date when outcome is POSTPONED', async () => {
        renderForm();

        const input = screen.getByTestId('courtOutcome');
        await act(async () => {
            fireEvent.change(input, { target: { value: CourtOutCome.POSTPONED } });
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'Enter' });
        });

        const datePicker = screen.getByTestId('newCourtDate');
        expect(datePicker).toBeInTheDocument();
        expect(datePicker).toHaveAttribute('required');
    });

    it('shows warrant number field and contempt of court when outcome is WARRANT_OF_ARREST', async () => {
        renderForm();

        const input = screen.getByTestId('courtOutcome');
        await act(async () => {
            fireEvent.change(input, { target: { value: CourtOutCome.WARRANT_OF_ARREST } });
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'Enter' });
        });

        expect(screen.getByTestId('test-WarrantNumber')).toBeInTheDocument();
        expect(screen.getByTestId('test-ContemptOfCourtFee')).toBeInTheDocument();
    });
});
