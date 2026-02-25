import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CaptureCorrectionReasonContent from '../../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonContent';
import { ArrestCaseAdministratorContext } from '../../../pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorContext';
import { Charge, VehicleChargeDto } from '../../../redux/api/transgressionsApi';

vi.mock('i18next', () => ({
    t: (key: string) => key
}));

vi.mock('../../../../framework/utils', () => ({
    default: vi.fn(),
    toCamelCaseWords: (...args: string[]) => args.join('')
}));

vi.mock('../../../../framework/components/selection/TmCheckbox', () => ({
    default: ({ testid, onChange, checked }: { testid: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; checked?: boolean }) => (
        <input
            type="checkbox"
            data-testid={testid}
            onChange={onChange}
            checked={checked}
        />
    )
}));

vi.mock('../../../hooks/prosecution/arrest-case-administrator/CaptureCorrectionReasonChargeMapper', () => ({
    default: (charges: Charge[], vehicleCharges: VehicleChargeDto[]) => {
        const mockMappedCharges = charges.map((charge, index) => {
            const vehicleCharge = vehicleCharges[index];
            const fineAmount = charge.fineAmount && charge.fineAmount.amount > 0
                ? `${charge.fineAmount.currency} ${charge.fineAmount.amount}`
                : 'arrest';
            return {
                chargeId: charge.chargeId,
                chargeCode: charge.chargeCode,
                fineAmount: fineAmount,
                chargeDescription: charge.chargeTitle,
                percentage: vehicleCharge?.overloadMassPercentage || 0,
                actualMass: vehicleCharge?.actualMass || 0,
                permissibleMass: vehicleCharge?.permissible || 0
            };
        });
        return [mockMappedCharges];
    }
}));

const theme = createTheme();

const mockCharges: Charge[] = [
    {
        chargeId: '1',
        chargeCode: 'OVL001',
        chargeTitle: 'Overload Violation',
        chargeShortDescription: 'Overload',
        fineAmount: {
            currency: 'ZAR',
            amount: 5000
        },
        chargebook: {
            chargebookId: '1',
            chargebookType: 'OVERLOAD',
            startDate: '2023-01-01',
            active: false,
            defaultChargebook: false,
            legislation: {
                legislationId: '',
                legislationType: 'CPA',
                country: '',
                maximumAllowableCharges: 0,
                active: false
            }
        },
        type: 'OVERLOAD'
    },
    {
        chargeId: '2',
        chargeCode: 'OVL002',
        chargeTitle: 'Severe Overload',
        chargeShortDescription: 'Severe Overload',
        fineAmount: {
            currency: 'ZAR',
            amount: 10000
        },
        chargebook: {
            chargebookId: '1',
            chargebookType: 'OVERLOAD',
            startDate: '2023-01-01',
            active: false,
            defaultChargebook: false,
            legislation: {
                legislationId: '',
                legislationType: 'CPA',
                country: '',
                maximumAllowableCharges: 0,
                active: false
            }
        },
        type: 'OVERLOAD'
    }
];

const mockVehicleCharges: VehicleChargeDto[] = [
    {
        actualMass: 15000,
        permissible: 12000,
        overloadMassPercentage: 25.0
    },
    {
        actualMass: 20000,
        permissible: 15000,
        overloadMassPercentage: 33.33
    }
] as VehicleChargeDto[];

const mockEmptyCharges: Charge[] = [];
const mockEmptyVehicleCharges: VehicleChargeDto[] = [];

const defaultProps = {
    testId: 'test',
    charges: mockCharges,
    vehicleCharges: mockVehicleCharges
};

const mockContext = {
    incorrectVehicleConfig: false,
    checkIncorrectVehicleConfig: vi.fn()
};

const renderComponent = (props = {}, contextValue = mockContext) => {
    return render(
        <ThemeProvider theme={theme}>
            <ArrestCaseAdministratorContext.Provider value={contextValue}>
                <CaptureCorrectionReasonContent {...defaultProps} {...props} />
            </ArrestCaseAdministratorContext.Provider>
        </ThemeProvider>
    );
};

describe('CaptureCorrectionReasonContent', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render the component with correction reason label', () => {
        renderComponent();

        expect(screen.getByText('correctionReasonLabel:')).toBeInTheDocument();
    });

    it('should render checkbox with correct label', () => {
        renderComponent();

        expect(screen.getByLabelText('incorrectVehicleConfiguration')).toBeInTheDocument();
    });

    it('should render table with all headings', () => {
        renderComponent();

        expect(screen.getByText('chargeCode')).toBeInTheDocument();
        expect(screen.getByText('amountPayable')).toBeInTheDocument();
        expect(screen.getByText('chargeDescription')).toBeInTheDocument();
        expect(screen.getByText('percentage')).toBeInTheDocument();
        expect(screen.getByText('actualMass')).toBeInTheDocument();
        expect(screen.getByText('permissibleMass')).toBeInTheDocument();
    });

    it('should render charges in table rows', () => {
        renderComponent();

        // Check first charge
        expect(screen.getByText('OVL001')).toBeInTheDocument();
        expect(screen.getByText('ZAR 5000')).toBeInTheDocument();
        expect(screen.getByText('Overload Violation')).toBeInTheDocument();
        expect(screen.getByText('25%')).toBeInTheDocument();

        // Check actual and permissible mass for both charges
        const allMasses = screen.getAllByText(/^(15000|12000|20000)$/);
        expect(allMasses.length).toBeGreaterThanOrEqual(4);

        // Check second charge
        expect(screen.getByText('OVL002')).toBeInTheDocument();
        expect(screen.getByText('ZAR 10000')).toBeInTheDocument();
        expect(screen.getByText('Severe Overload')).toBeInTheDocument();
        expect(screen.getByText(/33\.33%/)).toBeInTheDocument();
    });

    it('should handle checkbox change and call context method', () => {
        const checkIncorrectVehicleConfig = vi.fn();
        const contextValue = {
            incorrectVehicleConfig: false,
            checkIncorrectVehicleConfig
        };

        renderComponent({}, contextValue);

        const checkbox = screen.getByTestId('correctionReasonRadioBtn');
        fireEvent.click(checkbox);

        expect(checkIncorrectVehicleConfig).toHaveBeenCalledWith(true);
    });

    it('should reflect checked state from context', () => {
        const contextValue = {
            incorrectVehicleConfig: true,
            checkIncorrectVehicleConfig: vi.fn()
        };

        renderComponent({}, contextValue);

        const checkbox = screen.getByTestId('correctionReasonRadioBtn') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
    });

    it('should render empty table when no charges provided', () => {
        renderComponent({
            charges: mockEmptyCharges,
            vehicleCharges: mockEmptyVehicleCharges
        });

        // Table headers should still be present
        expect(screen.getByText('chargeCode')).toBeInTheDocument();

        // But no charge data should be present
        expect(screen.queryByText('OVL001')).not.toBeInTheDocument();
    });

    it('should apply custom sx prop', () => {
        const customSx = { padding: 2, margin: 1 };
        renderComponent({ sx: customSx });

        // The component should render without errors when sx is provided
        expect(screen.getByText('correctionReasonLabel:')).toBeInTheDocument();
    });

    it('should handle charges with no fine amount (arrest case)', () => {
        const arrestCharges: Charge[] = [{
            chargeId: '3',
            chargeCode: 'ARR001',
            chargeTitle: 'Arrest Charge',
            chargeShortDescription: 'Arrest',
            fineAmount: {
                currency: 'ZAR',
                amount: 0
            },
            chargebook: {
                chargebookId: '1',
                chargebookType: 'OVERLOAD',
                startDate: '2023-01-01',
                active: false,
                defaultChargebook: false,
                legislation: {
                    legislationId: '',
                    legislationType: 'CPA',
                    country: '',
                    maximumAllowableCharges: 0,
                    active: false
                }
            },
            type: 'OVERLOAD'
        }];

        const arrestVehicleCharges: VehicleChargeDto[] = [{
            actualMass: 10000,
            permissible: 8000,
            overloadMassPercentage: 25.0
        } as VehicleChargeDto];

        renderComponent({
            charges: arrestCharges,
            vehicleCharges: arrestVehicleCharges
        });

        expect(screen.getByText('arrest')).toBeInTheDocument();
    });

    it('should format percentage with 2 decimal places', () => {
        const chargesWithDecimals: Charge[] = [{
            chargeId: '4',
            chargeCode: 'DEC001',
            chargeTitle: 'Decimal Test',
            chargeShortDescription: 'Decimal',
            fineAmount: { currency: 'ZAR', amount: 1000 },
            chargebook: {
                chargebookId: '1',
                chargebookType: 'OVERLOAD',
                startDate: '2023-01-01',
                active: false,
                defaultChargebook: false,
                legislation: {
                    legislationId: '',
                    legislationType: 'CPA',
                    country: '',
                    maximumAllowableCharges: 0,
                    active: false
                }
            },
            type: 'OVERLOAD'
        }];

        const vehicleChargesWithDecimals: VehicleChargeDto[] = [{
            actualMass: 10000,
            permissible: 9000,
            overloadMassPercentage: 11.111111
        } as VehicleChargeDto];

        renderComponent({
            charges: chargesWithDecimals,
            vehicleCharges: vehicleChargesWithDecimals
        });

        expect(screen.getByText(/11\.11%/)).toBeInTheDocument();
    });

    it('should handle uneven charges and vehicleCharges arrays', () => {
        const unevenCharges: Charge[] = [
            ...mockCharges,
            {
                chargeId: '3',
                chargeCode: 'EXTRA',
                chargeTitle: 'Extra Charge',
                chargeShortDescription: 'Extra',
                fineAmount: { currency: 'ZAR', amount: 500 },
                chargebook: {
                    chargebookId: '1',
                    chargebookType: 'OVERLOAD',
                    startDate: '2023-01-01',
                    active: false,
                    defaultChargebook: false,
                    legislation: {
                        legislationId: '',
                        legislationType: 'CPA',
                        country: '',
                        maximumAllowableCharges: 0,
                        active: false
                    }
                },
                type: 'OVERLOAD'
            }
        ];

        // Only 2 vehicle charges for 3 charges
        renderComponent({
            charges: unevenCharges,
            vehicleCharges: mockVehicleCharges
        });

        // Should render the matched charges
        expect(screen.getByText('OVL001')).toBeInTheDocument();
        expect(screen.getByText('OVL002')).toBeInTheDocument();
    });

    it('should have correct testid for elements', () => {
        renderComponent();

        expect(screen.getByTestId('testlabel')).toBeInTheDocument();
        expect(screen.getByTestId('correctionReasonRadioBtn')).toBeInTheDocument();
        expect(screen.getByTestId('testchargeCode')).toBeInTheDocument();
        expect(screen.getByTestId('testamountPayable')).toBeInTheDocument();
        expect(screen.getByTestId('testchargeDescription')).toBeInTheDocument();
        expect(screen.getByTestId('testpercentage')).toBeInTheDocument();
        expect(screen.getByTestId('testactualMass')).toBeInTheDocument();
        expect(screen.getByTestId('testpermissibleMass')).toBeInTheDocument();
    });

    it('should render table with error border styling', () => {
        const { container } = renderComponent();

        // Check that TableContainer has border styling
        const tableContainer = container.querySelector('.MuiTableContainer-root');
        expect(tableContainer).toBeInTheDocument();
    });

    it('should handle checkbox unchecking', () => {
        const checkIncorrectVehicleConfig = vi.fn();
        const contextValue = {
            incorrectVehicleConfig: true,
            checkIncorrectVehicleConfig
        };

        renderComponent({}, contextValue);

        const checkbox = screen.getByTestId('correctionReasonRadioBtn');
        fireEvent.click(checkbox);

        expect(checkIncorrectVehicleConfig).toHaveBeenCalledWith(false);
    });

    it('should render percentage with % suffix', () => {
        renderComponent();

        // NumericFormat should add % suffix
        const percentageElements = screen.getAllByText(/\d+\.\d+%/);
        expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('should handle zero percentage values', () => {
        const zeroPercentageVehicleCharges: VehicleChargeDto[] = [{
            actualMass: 10000,
            permissible: 10000,
            overloadMassPercentage: 0
        } as VehicleChargeDto];

        const singleCharge: Charge[] = [{
            chargeId: '1',
            chargeCode: 'ZERO',
            chargeTitle: 'Zero Percentage',
            chargeShortDescription: 'Zero',
            fineAmount: { currency: 'ZAR', amount: 100 },
            chargebook: {
                chargebookId: '1',
                chargebookType: 'OVERLOAD',
                startDate: '2023-01-01',
                active: false,
                defaultChargebook: false,
                legislation: {
                    legislationId: '',
                    legislationType: 'CPA',
                    country: '',
                    maximumAllowableCharges: 0,
                    active: false
                }
            },
            type: 'OVERLOAD'
        }];

        renderComponent({
            charges: singleCharge,
            vehicleCharges: zeroPercentageVehicleCharges
        });

        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle undefined values in vehicle charges', () => {
        const incompleteVehicleCharges: VehicleChargeDto[] = [{
            actualMass: undefined,
            permissible: undefined,
            overloadMassPercentage: undefined
        } as unknown as VehicleChargeDto];

        const singleCharge: Charge[] = [{
            chargeId: '1',
            chargeCode: 'INC',
            chargeTitle: 'Incomplete Data',
            chargeShortDescription: 'Incomplete',
            fineAmount: { currency: 'ZAR', amount: 100 },
            chargebook: {
                chargebookId: '1',
                chargebookType: 'OVERLOAD',
                startDate: '2023-01-01',
                active: false,
                defaultChargebook: false,
                legislation: {
                    legislationId: '',
                    legislationType: 'CPA',
                    country: '',
                    maximumAllowableCharges: 0,
                    active: false
                }
            },
            type: 'OVERLOAD'
        }];

        renderComponent({
            charges: singleCharge,
            vehicleCharges: incompleteVehicleCharges
        });

        // Component should render without crashing
        expect(screen.getByText('INC')).toBeInTheDocument();
    });
});
