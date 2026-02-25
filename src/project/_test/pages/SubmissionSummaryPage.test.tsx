import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SubmissionSummaryPage from '../../pages/adjudication/SubmissionSummaryPage';
import useAdjudicationManager from '../../hooks/adjudication/AdjudicationManager';
import { SubmissionSummaryDto } from '../../redux/api/transgressionsApi';

const mockHandleNextSubmission = vi.fn();
const mockHandleCourtsSubmissions = vi.fn();
const mockCheckDisplayBlockResult = vi.fn(() => '');

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('../../hooks/adjudication/AdjudicationManager', () => ({
    __esModule: true,
    default: vi.fn()
}));

vi.mock('../../../framework/auth/authService', () => ({
    default: {
        hasRole: vi.fn(() => true),
        hasRoles: vi.fn(() => true),
        isAuthenticated: vi.fn(() => true),
    }
}));

vi.mock('../../../framework/auth/components/SecuredContent', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/adjudication/submission-summary/SubmissionSummaryTable', () => ({
    default: () => <div data-testid="submission-table" />,
}));

vi.mock('react-hotkeys-hook', () => ({
    useHotkeys: vi.fn(),
}));

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

const theme = createTheme();
const mockedUseAdjudicationManager = vi.mocked(useAdjudicationManager);

const createMockSubmissionSummary = (overrides: Partial<SubmissionSummaryDto> = {}): SubmissionSummaryDto => ({
    courtDate: '2099-06-15T00:00:00.000Z',
    noticeNumber: 'N001',
    offenderName: 'John Doe',
    submissionStatus: 'REGISTERED',
    courtName: 'Test Court',
    courtResult: true,
    ...overrides
});

const setupMock = (overrides: Record<string, unknown> = {}) => {
    mockedUseAdjudicationManager.mockReturnValue({
        submissionSummaries: [createMockSubmissionSummary()],
        checkDisplayBlockResult: mockCheckDisplayBlockResult,
        handleCourtsSubmissions: mockHandleCourtsSubmissions,
        handleNextSubmission: mockHandleNextSubmission,
        ...overrides,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
};

const renderPage = () => {
    return render(
        <ThemeProvider theme={theme}>
            <SubmissionSummaryPage />
        </ThemeProvider>
    );
};

describe('SubmissionSummaryPage', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        setupMock();
    });

    describe('rendering', () => {

        test('renders the title', () => {
            renderPage();
            expect(screen.getByTestId('submissionSummaryTitle')).toBeInTheDocument();
        });

        test('renders the submission summary table', () => {
            renderPage();
            expect(screen.getByTestId('submission-table')).toBeInTheDocument();
        });

        test('renders the adjudicate button', () => {
            renderPage();
            expect(screen.getByTestId('adjudicateSubmissionButton')).toBeInTheDocument();
        });
    });

    describe('mount behavior', () => {

        test('calls handleCourtsSubmissions on mount', () => {
            renderPage();
            expect(mockHandleCourtsSubmissions).toHaveBeenCalled();
        });
    });

    describe('adjudicate button click', () => {

        test('calls handleNextSubmission when adjudicate button is clicked', () => {
            renderPage();
            fireEvent.click(screen.getByTestId('adjudicateSubmissionButton'));
            expect(mockHandleNextSubmission).toHaveBeenCalled();
        });
    });

    describe('adjudicate button disabled state', () => {

        test('enables button when valid registered submissions exist', () => {
            renderPage();
            const button = screen.getByTestId('adjudicateSubmissionButton');
            expect(button).not.toBeDisabled();
        });

        test('disables button when no submissions exist', () => {
            setupMock({ submissionSummaries: [] });
            renderPage();
            const button = screen.getByTestId('adjudicateSubmissionButton');
            expect(button).toBeDisabled();
        });

        test('disables button when no submissions are REGISTERED', () => {
            setupMock({
                submissionSummaries: [
                    createMockSubmissionSummary({ submissionStatus: 'CANCELLED' }),
                    createMockSubmissionSummary({ submissionStatus: 'PENDING_ADJUDICATION' }),
                ]
            });
            renderPage();
            const button = screen.getByTestId('adjudicateSubmissionButton');
            expect(button).toBeDisabled();
        });

        test('disables button when all submissions require court results', () => {
            setupMock({
                submissionSummaries: [
                    createMockSubmissionSummary({ courtResult: false }),
                    createMockSubmissionSummary({ courtResult: false }),
                ],
                checkDisplayBlockResult: vi.fn(() => 'courtResultsRequired'),
            });
            renderPage();
            const button = screen.getByTestId('adjudicateSubmissionButton');
            expect(button).toBeDisabled();
        });

        test('enables button when at least one submission does not require court results', () => {
            const mockCheck = vi.fn(
                (courtResult: boolean) => courtResult ? '' : 'courtResultsRequired'
            );
            setupMock({
                submissionSummaries: [
                    createMockSubmissionSummary({ courtResult: false }),
                    createMockSubmissionSummary({ courtResult: true }),
                ],
                checkDisplayBlockResult: mockCheck,
            });
            renderPage();
            const button = screen.getByTestId('adjudicateSubmissionButton');
            expect(button).not.toBeDisabled();
        });

        test('enables button when mixed statuses include at least one REGISTERED', () => {
            setupMock({
                submissionSummaries: [
                    createMockSubmissionSummary({ submissionStatus: 'CANCELLED' }),
                    createMockSubmissionSummary({ submissionStatus: 'REGISTERED' }),
                ]
            });
            renderPage();
            const button = screen.getByTestId('adjudicateSubmissionButton');
            expect(button).not.toBeDisabled();
        });
    });
});
