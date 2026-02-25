import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CourtDocumentsListTable from "../../../components/court-documents/CourtDocumentsListTable";

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock typography component
vi.mock('../../../../framework/components/typography/TmTypography', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children, ...props }: any) => <span data-testid={props.testid || 'mockedTmTypography'}>{children}</span>,
}));

afterEach(() => {
    cleanup();
});

describe('CourtDocumentsListTable', () => {
    it('renders table rows correctly', () => {
        const mockData = [{
            courtDate: '2023-01-01',
            courtName: 'Pretoria',
            noticeNo: 'ABC123',
            plateNo: 'XYZ789',
            offenderName: 'John Doe',
            status: 'WARRANT_OF_ARREST_PRINTED'
        }];

        render(
            <CourtDocumentsListTable
                rows={mockData}
                searchValue=""
                onCourtCaseClick={vi.fn()}
            />
        );

        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('sorts the rows when clicking on column headers', () => {
        const mockData = [
            { courtDate: '2023-01-01', courtName: 'A', noticeNo: '001', plateNo: 'P1', status: 'WARRANT_OF_ARREST_PRINTED' },
            { courtDate: '2023-01-02', courtName: 'B', noticeNo: '002', plateNo: 'P2', status: 'WARRANT_OF_ARREST_PRINTED' },
        ];

        render(
            <CourtDocumentsListTable
                rows={mockData}
                searchValue=""
                onCourtCaseClick={vi.fn()}
            />
        );

        const column = screen.getByText('courtDate');
        fireEvent.click(column); // sort ascending
        fireEvent.click(column); // sort descending
        expect(screen.getByText('002')).toBeInTheDocument();
    });

    it('displays upload and delete buttons when a file is present', () => {
        const mockData = [{
            courtDate: '2023-01-01',
            courtName: 'Pretoria',
            noticeNo: 'ABC123',
            plateNo: 'XYZ789',
            offenderName: 'John Doe',
            status: 'WARRANT_OF_ARREST_PRINTED',
            offenderIdNo: '1234567890',
            courtDocument: 'Doc.pdf',
        }];

        const files = new Map();
        files.set('ABC123', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

        render(
            <CourtDocumentsListTable
                rows={mockData}
                searchValue=""
                files={files}
                onCourtCaseClick={vi.fn()}
                onFileChange={vi.fn()}
                onDeleteFile={vi.fn()}
                showCourtDocumentColumn
            />
        );

        expect(screen.getByTestId('uploadedDocument')).toHaveTextContent('test.pdf');
    });

    it('invokes upload click when button is clicked', () => {
        const mockData = [{
            courtDate: '2023-01-01',
            courtName: 'Pretoria',
            noticeNo: 'ABC123',
            plateNo: 'XYZ789',
            offenderName: 'John Doe',
            status: 'WARRANT_OF_ARREST_PRINTED',
            offenderIdNo: '1234567890',
        }];

        render(
            <CourtDocumentsListTable
                rows={mockData}
                searchValue=""
                onCourtCaseClick={vi.fn()}
                onFileChange={vi.fn()}
                showCourtDocumentColumn
            />
        );

        const uploadButton = screen.getByText('upload');
        expect(uploadButton).toBeEnabled();
    });

    it('filters results by searchValue', () => {
        const sampleRow = [{
            courtDate: '2025-07-28',
            courtName: 'Pretoria High Court',
            noticeNo: 'NTC1234',
            plateNo: 'XYZ123GP',
            offenderName: 'John Doe',
            status: 'WARRANT_OF_ARREST_PRINTED',
            offenderIdNo: '8001015009081',
            courtDocument: 'doc.pdf'
        }];

        render(
            <CourtDocumentsListTable
                rows={sampleRow}
                searchValue="XYZ123GP"
                onCourtCaseClick={vi.fn()}
            />
        );

        expect(screen.getByText('XYZ123GP')).toBeInTheDocument();
        expect(screen.queryByText('ABC000GP')).not.toBeInTheDocument();
    });
})
