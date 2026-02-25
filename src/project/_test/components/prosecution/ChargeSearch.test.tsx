/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import TmChargeSearch from '../../../components/prosecution/ChargeSearch';
import { TmRtqsCharge } from '../../../components/prosecution/ChargeListEdit';
import { RtqsCharge } from '../../../redux/api/transgressionsApi';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('../../../../framework/components/textfield/TmTextField', () => ({
    default: (props: any) => <input data-testid={props.testid} {...props} />,
}));
vi.mock('../../../../framework/components/typography/TmTypography', () => ({
    default: (props: any) => <span data-testid={props.testid}>{props.children}</span>,
}));
vi.mock('../../../components/charge-type/ChargeTypeDialog', () => ({
    default: (props: any) => props.isOpen ? (
        <div data-testid="charge-type-dialog">
            <button onClick={props.onConfirm}>Confirm</button>
            <button onClick={props.handleCloseDialog}>Cancel</button>
        </div>
    ) : null,
}));

const mockCharges = [
    {
        type: "RtqsCharge",
        chargeCode: 'A1',
        chargeTitle: 'Speeding',
        specificRegulation: 'Reg 1',
        chargeShortDescription: 'Over speed limit',
        chargeId: 'id1',
        fineAmount: { amount: 100 },
        chargeType: undefined, // No charge type
    },
    {
        type: "RtqsCharge",
        chargeCode: 'B2',
        chargeTitle: 'Parking',
        specificRegulation: 'Reg 2',
        chargeShortDescription: 'Illegal parking',
        chargeId: 'id2',
        fineAmount: { amount: 50 },
        chargeType: undefined, // No charge type
    },
    {
        type: "RtqsCharge",
        chargeCode: 'C3',
        chargeTitle: 'Height Violation',
        specificRegulation: 'Reg 3',
        chargeShortDescription: 'Over height limit',
        chargeId: 'id3',
        fineAmount: { amount: 200 },
        chargeType: 'HEIGHT', // Has charge type
    },
];

const defaultProps = {
    testId: 'charge-search-dialog',
    open: true,
    setOpen: vi.fn(),
    itemIndex: 0,
    updateCharges: [
        {
            isNew: true,
            isAlternative: false,
            chargeTitle: '',
            chargeId: '',
            chargeCode: '',
            fineAmount: { amount: 0 },
            actualCharge: {},
            supervisorApproval: false,
            chargePrevSupervisorApproval: false,
            plateNumber: '',
            linkedTo: undefined,
            linkedToIndex: undefined,
        } as TmRtqsCharge,
    ],
    setUpdateCharges: vi.fn(),
    charges: mockCharges as RtqsCharge[],
    supervisorApprovalCopy: false,
    numberOfLamps: undefined,
    vehicleHeight: undefined,
    allowedHeight: undefined,
    roadTravelledOn: '',
    numberOfTyres: undefined,
    vehicleLength: undefined,
    numberOfPersons: undefined,
    numberOfPanels: undefined,
    setRoadTravelledOn: vi.fn(),
    setNumberOfTyres: vi.fn(),
    setVehicleLength: vi.fn(),
    setNumberOfPersons: vi.fn(),
    setVehicleHeight: vi.fn(),
    setAllowedHeight: vi.fn(),
    setNumberOfLamps: vi.fn(),
    setNumberOfPanels: vi.fn(),
};

describe('TmChargeSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders dialog and table with charges', () => {
        render(<TmChargeSearch {...defaultProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('charge-search-dialog')).toBeInTheDocument();
        expect(screen.getByTestId('chargeSearch')).toBeInTheDocument();
        expect(screen.getByText('Speeding')).toBeInTheDocument();
        expect(screen.getByText('Parking')).toBeInTheDocument();
        // All 3 charges should be visible with rowsPerPage=5
        expect(screen.getByText('Height Violation')).toBeInTheDocument();
    });

    it('filters charges by search text', () => {
        render(<TmChargeSearch {...defaultProps} />);
        const input = screen.getByTestId('chargeSearch');
        fireEvent.change(input, { target: { value: 'Speed' } });
        expect(screen.getByText('Speeding')).toBeInTheDocument();
        expect(screen.queryByText('Parking')).not.toBeInTheDocument();
        expect(screen.queryByText('Height Violation')).not.toBeInTheDocument();
    });

    it('shows charge short description when expand icon is clicked', () => {
        render(<TmChargeSearch {...defaultProps} />);
        const expandBtns = screen.getAllByRole('button');
        // Click the first expand button
        fireEvent.click(expandBtns[0]);
        expect(screen.getByTestId('chargeShortDescription')).toHaveTextContent('Over speed limit');
    });

    it('calls setUpdateCharges and setOpen when a charge without chargeType is clicked', async () => {
        render(<TmChargeSearch {...defaultProps} />);
        const row = screen.getByText('Speeding').closest('tr');
        fireEvent.click(within(row!).getByText('Speeding'));

        // Should update charges immediately
        expect(defaultProps.setUpdateCharges).toHaveBeenCalled();

        // Should close dialog after a frame
        await waitFor(() => {
            expect(defaultProps.setOpen).toHaveBeenCalledWith(false);
        });
    });

    it('updates charges after ChargeTypeDialog confirmation', async () => {
        render(<TmChargeSearch {...defaultProps} />);
        const row = screen.getByText('Height Violation').closest('tr');
        fireEvent.click(within(row!).getByText('Height Violation'));

        // Wait for ChargeTypeDialog to open
        await waitFor(() => {
            expect(screen.getByTestId('charge-type-dialog')).toBeInTheDocument();
        });

        // Click confirm button
        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        // Now charges should be updated
        await waitFor(() => {
            expect(defaultProps.setUpdateCharges).toHaveBeenCalled();
            expect(defaultProps.setOpen).toHaveBeenCalledWith(false);
        });
    });

    it('pagination works: changes page', () => {
        // Add more charges to test pagination
        const manyCharges = Array.from({ length: 12 }, (_, i) => ({
            ...mockCharges[0],
            chargeCode: `C${i}`,
            chargeTitle: `Title${i}`,
            chargeId: `id${i}`,
        }));
        render(<TmChargeSearch {...defaultProps} charges={manyCharges as RtqsCharge[]} />);
        const nextBtn = screen.getByLabelText('Go to next page');
        fireEvent.click(nextBtn);
        expect(screen.getByText('Title5')).toBeInTheDocument();
    });

    it('resets search text and pagination when dialog opens', () => {
        const { rerender } = render(<TmChargeSearch {...defaultProps} open={false} />);
        rerender(<TmChargeSearch {...defaultProps} open={true} />);
        expect(screen.getByTestId('chargeSearch')).toHaveValue('');
    });
});
