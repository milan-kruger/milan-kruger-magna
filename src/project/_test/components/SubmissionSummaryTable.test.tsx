import SubmissionSummaryTable from "../../components/adjudication/submission-summary/SubmissionSummaryTable";
import { render } from "vitest-browser-react";
import { SubmissionSummaryDto } from "../../redux/api/transgressionsApi";
import { Dayjs } from "dayjs";


vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => {
            return false;
        }),
    };
});

vi.mock('../../hooks/submissions/SubmissionManager', () => ({
    default: vi.fn(() => ({
        checkDisplayBlockResult: vi.fn((courtResult: boolean, currentDate: Dayjs, courtDate: Dayjs) => {
            return !courtResult && currentDate.isAfter(courtDate) ? 'Court Result Required' : '';
        }),
    })),
}));

const mockSubmissionSummaries: SubmissionSummaryDto[] = [
    {
        courtDate: "2022-01-01",
        noticeNumber: "notice1",
        offenderName: "John Doe",
        submissionStatus: "PENDING_ADJUDICATION",
        courtName: "Cape Town Court",
        courtResult: false,
    },
    {
        courtDate: "2022-01-02",
        noticeNumber: "notice2",
        offenderName: "Jane Doe",
        submissionStatus: "PENDING_ADJUDICATION",
        courtName: "Cape Town Court",
        courtResult: false,
    }
];

const renderComponent = () => {
    return render(
        <SubmissionSummaryTable
            submissionSummaries={mockSubmissionSummaries}
        />
    );
};

describe("SubmissionSummaryTable", () => {

    test('should render the table', () => {
        renderComponent();

        const table = document.querySelector('table');

        expect(table).toBeInTheDocument();
    });

    test('should render the correct number of rows', () => {
        renderComponent();

        const rows = document.querySelectorAll('tr');

        expect(rows).toHaveLength(3);
    });

    test('should render the correct number of columns', () => {
        renderComponent();

        const columns = document.querySelectorAll('th');

        expect(columns).toHaveLength(6);
    });
});
