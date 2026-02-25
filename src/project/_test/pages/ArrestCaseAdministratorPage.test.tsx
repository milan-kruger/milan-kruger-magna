/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ArrestCaseAdministratorPage from '../../pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorPage';
import useArrestCaseAdministratorManager from '../../hooks/prosecution/ArrestCaseAdministratorManager';

vi.mock('react-router-dom', () => ({
    useLocation: () => ({
        state: {
            transgressionDetails: {
                charges: [{ id: 1, name: 'Charge1' }],
                vehicleCharges: [{ id: 2, name: 'VehicleCharge1' }]
            },
            sequenceNumber: 123
        }
    })
}));

vi.mock('i18next', () => ({
    t: (key: string) => key
}));

vi.mock('@mui/material', async () => {
    const actual = await vi.importActual('@mui/material');
    return {
        ...actual,
        useTheme: () => ({
            palette: { mode: 'light', background: { default: '#fff' } }
        }),
        Stack: ({ children, ...props }: any) => <div data-testid="mui-stack" {...props}>{children}</div>
    };
});

const baseMock = {
    submitCorrectionReason: vi.fn(),
    closeCaptureCorrectionReason: vi.fn(),
    closeDialogs: vi.fn(),
    showAuthorizationDialog: false,
    supervisorUsername: '',
    setSupervisorUsername: vi.fn(),
    supervisorPassword: '',
    setSupervisorPassword: vi.fn(),
    handleCorrectionPending: vi.fn(),
    isLoading: false,
    showReweighDialog: false,
    showAuthErrorDialog: false,
    notApproved: false,
    isErrorAuthentication: false
}

vi.mock('../../hooks/prosecution/ArrestCaseAdministratorManager', () => ({
    __esModule: true,
    default: vi.fn(() => ({ ...baseMock }))
}));

vi.mock('../../../framework/auth/components/SecuredContent', () => ({
    __esModule: true,
    default: ({ children }: any) => <div data-testid="secured-content">{children}</div>
}));

vi.mock('../../pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorContextProvider', () => ({
    __esModule: true,
    default: ({ children }: any) => <div data-testid="context-provider">{children}</div>
}));

vi.mock('../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonHeader', () => ({
    __esModule: true,
    default: ({ testId }: any) => <div data-testid={`${testId}-header`}>Header</div>
}));

vi.mock('../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonContent', () => ({
    __esModule: true,
    default: ({ testId }: any) => <div data-testid={`${testId}-content`}>Content</div>
}));

vi.mock('../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonActions', () => ({
    __esModule: true,
    default: ({ testId, onSubmit, onCancel }: any) => (
        <div data-testid={`${testId}-actions`}>
            <button data-testid="submit-btn" onClick={onSubmit}>Submit</button>
            <button data-testid="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
    )
}));

vi.mock('../../../framework/components/dialog/TmAuthenticationDialog', () => ({
    __esModule: true,
    default: (props: any) => props.isOpen ? <div data-testid="auth-dialog" /> : null
}));

vi.mock('../../../framework/components/dialog/TmDialog', () => ({
    __esModule: true,
    default: (props: any) => props.isOpen ? <div data-testid={props.testid} /> : null
}));

vi.mock('../../../framework/components/progress/TmLoadingSpinner', () => ({
    __esModule: true,
    default: (props: any) => <div data-testid={props.testid || 'loading-spinner'} />
}));

vi.mock('../../../framework/utils', () => ({
    toCamelCaseWords: (a: string, b: string) => `${a}${b.charAt(0).toUpperCase()}${b.slice(1)}`
}));

const mockedUseArrestCaseAdministratorManager = vi.mocked(useArrestCaseAdministratorManager);

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ArrestCaseAdministratorPage', () => {
    it('renders SecuredContent and ContextProvider', () => {
        render(<ArrestCaseAdministratorPage />);
        expect(screen.getByTestId('secured-content')).toBeInTheDocument();
        expect(screen.getByTestId('context-provider')).toBeInTheDocument();
    });

    it('renders header, content, and actions when not loading', () => {
        render(<ArrestCaseAdministratorPage />);
        expect(screen.getByTestId('arrestCaseAdministrator-header')).toBeInTheDocument();
        expect(screen.getByTestId('arrestCaseAdministrator-content')).toBeInTheDocument();
        expect(screen.getByTestId('arrestCaseAdministrator-actions')).toBeInTheDocument();
    });

    it('calls submitCorrectionReason and closeCaptureCorrectionReason on button clicks', () => {
        const submitCorrectionReason = vi.fn();
        const closeCaptureCorrectionReason = vi.fn();
        mockedUseArrestCaseAdministratorManager.mockReturnValueOnce({
            ...baseMock,
            submitCorrectionReason,
            closeCaptureCorrectionReason
        });

        render(<ArrestCaseAdministratorPage />);
        fireEvent.click(screen.getByTestId('submit-btn'));
        expect(submitCorrectionReason).toHaveBeenCalled();

        fireEvent.click(screen.getByTestId('cancel-btn'));
        expect(closeCaptureCorrectionReason).toHaveBeenCalled();
    });

    it('shows loading spinner when isLoading is true', () => {
        mockedUseArrestCaseAdministratorManager.mockReturnValueOnce({
            ...baseMock,
            isLoading: true
        });
        render(<ArrestCaseAdministratorPage />);
        expect(screen.getByTestId('arrestCaseAdministratorSpinner')).toBeInTheDocument();
    });

    it('shows TmAuthenticationDialog when showAuthorizationDialog is true', () => {
        mockedUseArrestCaseAdministratorManager.mockReturnValueOnce({
            ...baseMock,
            showAuthorizationDialog: true
        });
        render(<ArrestCaseAdministratorPage />);
        expect(screen.getByTestId('auth-dialog')).toBeInTheDocument();
    });

    it('shows reWeighDialog when showReweighDialog is true', () => {
        mockedUseArrestCaseAdministratorManager.mockReturnValueOnce({
            ...baseMock,
            showReweighDialog: true
        });
        render(<ArrestCaseAdministratorPage />);
        expect(screen.getByTestId('arrestCaseAdministratorReWeighDialog')).toBeInTheDocument();
    });

    it('shows authErrorDialog when showAuthErrorDialog is true', () => {
        mockedUseArrestCaseAdministratorManager.mockReturnValueOnce({
            ...baseMock,
            showAuthErrorDialog: true
        });
        render(<ArrestCaseAdministratorPage />);
        expect(screen.getByTestId('authErrorDialog')).toBeInTheDocument();
    });
});
