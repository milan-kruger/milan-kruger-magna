import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import TransgressionsListTable, { TransgressionData } from '../../components/transgression-details/transgression-list/TransgressionsListTable';
import { TransgressionType } from '../../enum/TransgressionType';
import i18n from '../mocks/i18nForTests.mock';

vi.mock('../../../framework/auth/authService', () => ({
    default: {
        isFeatureEnabled: vi.fn(() => true),
    },
}));

// Mock data
const sampleRows: TransgressionData[] = [
    {
        date: '2025-08-04',
        sequenceNo: 12345,
        noticeNo: 'N123',
        plateNo: 'CA123456',
        offenderName: 'John Doe',
        status: 'open',
    },
    {
        date: '2025-08-03',
        sequenceNo: 67890,
        noticeNo: 'N456',
        plateNo: 'CA654321',
        offenderName: 'Jane Smith',
        status: 'closed',
    },
];
const handleClick = vi.fn();

const renderTable = (
    rows = sampleRows,
    transgressionType = TransgressionType.OVERLOAD,
    searchValue = '',
    onTransgressionClick = handleClick
) => {
    return render(
        <I18nextProvider i18n={i18n}>
            <TransgressionsListTable
                rows={rows}
                searchValue={searchValue}
                onTransgressionClick={onTransgressionClick}
                transgressionType={transgressionType}
            />
        </I18nextProvider>
    );
};

afterEach(() => {
    cleanup();
});

describe('TransgressionsListTable', () => {

    it('renders all rows and columns for OVERLOAD type', () => {
        renderTable();

        // Check headers
        expect(screen.getByText(/date/i)).toBeInTheDocument();
        expect(screen.getByText(/Sequence No/i)).toBeInTheDocument();
        expect(screen.getByText(/Notice No/i)).toBeInTheDocument();
        expect(screen.getByText(/Plate No/i)).toBeInTheDocument();
        expect(screen.getByText(/Offender Name/i)).toBeInTheDocument();
        expect(screen.getByText(/status/i)).toBeInTheDocument();

        // Check row content
        expect(screen.getByText('N123')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('omits sequenceNo for RTQS when feature is enabled', () => {
        renderTable(sampleRows, TransgressionType.RTQS);
        expect(screen.queryByText(/Sequence No/i)).not.toBeInTheDocument();
    });

    it('calls onTransgressionClick when a row is clicked', () => {
        const test = vi.fn().mockReturnValueOnce(sampleRows[0])
        renderTable(sampleRows, TransgressionType.OVERLOAD, '', test);

        fireEvent.click(screen.getByText('CA123456'));
        expect(test).toHaveBeenCalledWith(sampleRows[0]);
    });

    it('filters rows by noticeNo', () => {
        renderTable(sampleRows, TransgressionType.OVERLOAD, 'N456');
        expect(screen.getByText('N456')).toBeInTheDocument();
        expect(screen.queryByText('N123')).not.toBeInTheDocument();
    });

    it('copies notice number on icon click', async () => {
        const writeText = vi.fn();
        vi.stubGlobal('navigator', { clipboard: { writeText } });

        renderTable();
        const copyable = screen.getByText('N123');
        fireEvent.click(copyable);

        expect(writeText).toHaveBeenCalledWith('N123');
    });

    it('sorts by clicking header', () => {
        renderTable();

        // Get the button inside the table header by accessible name
        const sortButton = screen.getByRole('button', { name: /date/i });
        fireEvent.click(sortButton);

        // Now find the closest <th> to assert aria-sort
        const header = sortButton.closest('th');
        if (!header) throw new Error('Date header not found');

        expect(header).toHaveAttribute('aria-sort');
    });
});
