/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '../mocks/i18next.vi.mock';

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SubmissionPage from '../../pages/submissions/SubmissionPage';
import useSubmissionManager from '../../hooks/submissions/SubmissionManager';
import { TFunction } from 'i18next';

const filterDomProps = (props: Record<string, any>) => {
    const {
        fullWidth, variant, sx, size, color, testid, onDebouncedChange,
        searchValue, item, container, xs, sm, md, lg, xl,
        ...domProps
    } = props;
    return domProps;
};

vi.mock('react-router-dom', () => ({
    useLocation: () => ({ state: {} })
}));

vi.mock('@mui/material', async () => {
    const actual = await vi.importActual('@mui/material');
    return {
        ...actual,
        useMediaQuery: () => false,
        Grid: ({ children, ...props }: any) => (
            <div data-testid="mui-grid" {...filterDomProps(props)}>{children}</div>
        )
    };
});

vi.mock('../../../framework/components/list/TmSearch', () => ({
    __esModule: true,
    default: ({ testid, onDebouncedChange, searchValue, ...rest }: any) => (
        <input
            data-testid={testid}
            value={searchValue}
            onChange={e => onDebouncedChange?.(e)}
            {...filterDomProps(rest)}
        />
    )
}));

vi.mock('../../../framework/components/button/TmButton', () => ({
    __esModule: true,
    default: ({ testid, onClick, disabled, children, ...props }: any) => {
        const safeProps = filterDomProps(props);
        return (
            <button data-testid={testid} onClick={onClick} disabled={disabled} {...safeProps}>
                {children}
            </button>
        );
    }
}));

vi.mock('../../../framework/components/progress/TmLoadingSpinner', () => ({
    __esModule: true,
    default: (props: any) => <div data-testid={props.testid ?? 'loadingSpinner'} />
}));

vi.mock('../../../framework/auth/components/SecuredContent', () => ({
    __esModule: true,
    default: ({ children }: any) => <div data-testid="secured-content">{children}</div>
}));

vi.mock('../../pages/submissions/SubmissionContextProvider', () => ({
    __esModule: true,
    default: ({ children }: any) => <div data-testid="context-provider">{children}</div>
}));

vi.mock('../../pages/submissions/SubmissionContent', () => ({
    __esModule: true,
    default: () => <div data-testid="submission-content">SubmissionContent</div>
}));

const t: TFunction<"translation", undefined> = ((key: string) => key) as TFunction<"translation", undefined>;

const baseMock = {
    t,
    searchValue: '',
    loadingRetrieveSubmission: false,
    handleSearch: vi.fn(),
    handleSearchChange: vi.fn(),
    submissionSummaries: [],
    courtResultsAvailability: {},
    setCourtResultsAvailability: vi.fn(),
    isCourtResultAvailable: vi.fn(),
    isLoading: false,
    handleCourtsSubmissions: vi.fn(),
    sortSubmissionSummaries: vi.fn(),
    handleProvideCourtResult: vi.fn(),
    preCheckCanAdjudicate: vi.fn(),
    checkDisplayBlockResult: vi.fn()
};


vi.mock('../../hooks/submissions/SubmissionManager', () => ({
    __esModule: true,
    default: vi.fn(() => ({ ...baseMock }))
}));

const mockedUseSubmissionManager = vi.mocked(useSubmissionManager);

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('SubmissionPage', () => {
    it('renders SecuredContent and ContextProvider', () => {
        render(<SubmissionPage />);
        expect(screen.getByTestId('secured-content')).toBeInTheDocument();
        expect(screen.getByTestId('context-provider')).toBeInTheDocument();
    });

    it('renders TmSearch and TmButton', () => {
        render(<SubmissionPage />);
        expect(screen.getByTestId('searchTransgression')).toBeInTheDocument();
        expect(screen.getByTestId('findTransgressions')).toBeInTheDocument();
    });

    it('disables search button when searchValue is empty', () => {
        mockedUseSubmissionManager.mockReturnValueOnce({
            ...baseMock,
            searchValue: ''
        });
        render(<SubmissionPage />);
        expect(screen.getByTestId('findTransgressions')).toBeDisabled();
    });

    it('enables search button when searchValue is not empty', () => {
        mockedUseSubmissionManager.mockReturnValueOnce({
            ...baseMock,
            searchValue: '123'
        });
        render(<SubmissionPage />);
        expect(screen.getByTestId('findTransgressions')).not.toBeDisabled();
    });

    it('calls handleSearch when search button is clicked', () => {
        const handleSearch = vi.fn();
        mockedUseSubmissionManager.mockReturnValueOnce({
            ...baseMock,
            searchValue: 'abc',
            handleSearch
        });
        render(<SubmissionPage />);
        fireEvent.click(screen.getByTestId('findTransgressions'));
        expect(handleSearch).toHaveBeenCalled();
    });

    it('calls handleSearchChange when search input changes', () => {
        const handleSearchChange = vi.fn();
        mockedUseSubmissionManager.mockReturnValueOnce({
            ...baseMock,
            handleSearchChange
        });
        render(<SubmissionPage />);
        fireEvent.change(screen.getByTestId('searchTransgression'), { target: { value: 'test' } });
        expect(handleSearchChange).toHaveBeenCalled();
    });

    it('shows loading spinner when loadingRetrieveSubmission is true', () => {
        mockedUseSubmissionManager.mockReturnValueOnce({
            ...baseMock,
            loadingRetrieveSubmission: true
        });
        render(<SubmissionPage />);
        expect(screen.getByTestId('loadingSpinner')).toBeInTheDocument();
    });

    it('shows SubmissionContent when loadingRetrieveSubmission is false', () => {
        mockedUseSubmissionManager.mockReturnValueOnce({
            ...baseMock,
            loadingRetrieveSubmission: false
        });
        render(<SubmissionPage />);
        expect(screen.getByTestId('submission-content')).toBeInTheDocument();
    });
});
