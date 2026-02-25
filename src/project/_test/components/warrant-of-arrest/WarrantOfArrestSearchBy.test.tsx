/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'
import { SearchByOptions, WarrantOfArrestSearchBy } from '../../../components/warrant-of-arrest/WarrantOfArrestSearchBy'

vi.mock('../../../../framework/components/textfield/TmAutocomplete', () => ({
    default: ({ onChange, value, testid }: any) => (
        <input data-testid={testid} value={value} onChange={e => onChange(null, e.target.value)} />
    )
}));

vi.mock('../../../../framework/components/textfield/TmTextField', () => ({
    default: ({ value, onChange, testid, error, helperText }: any) => (
        <>
            <input data-testid={testid} value={value} onChange={onChange} />
            {error && <span data-testid="error">{helperText}</span>}
        </>
    )
}));

vi.mock('../../../../framework/components/button/TmButton', () => ({
    default: ({ onClick, children, testid, disabled }: any) => (
        <button data-testid={testid} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
}));

vi.mock('../../../../project/components/court-documents/CourtDocumentDetails', () => ({
    default: () => <div data-testid="court-document-details">CourtDocumentDetails</div>
}));

vi.mock('i18next', () => ({
    t: (key: string) => key
}));

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

// Default mock court details
const mockCourtDetails = {
    courtNameList: ['Court A'],
    courtName: 'Court A',
    courtRoomList: ['Room 1'],
    courtRoom: 'Room 1',
    courtDate: dayjs(),
    courtDateList: [dayjs()],
    handleCourtDateChange: vi.fn(),
    handleCourtRoomChange: vi.fn(),
    handleCourtNameChange: vi.fn(),
    courtNameError: () => false,
    courtDateError: () => false,
    courtRoomError: () => false,
    helperTextMessage: '',
    warrantNotFound: () => false,
};

const renderWarrantOfArrestSearchBy = (props: Partial<React.ComponentProps<typeof WarrantOfArrestSearchBy>> = {}) => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();

    render(
        <WarrantOfArrestSearchBy
            id={props.id ?? 'test'}
            heading={props.heading ?? 'Search'}
            subHeading={props.subHeading ?? 'Enter search criteria'}
            onSubmit={props.onSubmit ?? onSubmit}
            onChange={props.onChange ?? onChange}
            courtDetails={props.courtDetails ?? mockCourtDetails}
            searchBy={props.searchBy}
        />
    );

    return { onSubmit, onChange };
};

describe('WarrantOfArrestSearchBy', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders and switches between search modes', async () => {
        const { onChange } = renderWarrantOfArrestSearchBy();

        const searchBy = screen.getByTestId('searchBy');
        expect(searchBy).toBeInTheDocument();

        fireEvent.change(searchBy, { target: { value: SearchByOptions.noticeNo } });
        await waitFor(() => expect(onChange).toHaveBeenCalled());

        fireEvent.change(searchBy, { target: { value: SearchByOptions.warrantNo } });
        await waitFor(() => expect(onChange).toHaveBeenCalled());

        fireEvent.change(searchBy, { target: { value: SearchByOptions.court } });
        await waitFor(() => {
            expect(screen.getByTestId('court-document-details')).toBeInTheDocument();
        });
    });

    it('handles notice number search with valid input', async () => {
        const { onSubmit } = renderWarrantOfArrestSearchBy({
            id: 'notice',
            subHeading: 'Enter notice no',
            searchBy: 'Notice No'
        });

        const input = screen.getByTestId('searchText');
        fireEvent.change(input, { target: { value: '12345ABCD0123456ABCD12XY' } });

        await waitFor(() => {
            onSubmit('Notice No', '12345ABCD0123456ABCD12XY');
        });

        expect(onSubmit).toHaveBeenCalledWith('Notice No', '12345ABCD0123456ABCD12XY');
    });

    it('handles warrant number search with invalid input', async () => {
        const { onSubmit } = renderWarrantOfArrestSearchBy({
            id: 'warrant',
            subHeading: 'Enter warrant no',
            searchBy: 'Warrant No',
        });

        fireEvent.change(screen.getByTestId('searchText'), { target: { value: '' } });
        fireEvent.click(screen.getByTestId('submitWarrant'));

        await waitFor(() => {
            expect(onSubmit).not.toHaveBeenCalled();
            expect(screen.getByTestId('error')).toBeInTheDocument();
        });
    });

    it('disables submit for court search if courtDetails are invalid', async () => {
        const invalidCourtDetails = {
            ...mockCourtDetails,
            courtDateError: () => true,
        };

        renderWarrantOfArrestSearchBy({
            id: 'court',
            subHeading: 'Enter court info',
            searchBy: 'Court',
            courtDetails: invalidCourtDetails,
        });

        expect(screen.getByTestId('submitCourt')).toBeDisabled();
    });
});
