import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdjudicationCourtSelectionPage from '../../pages/adjudication/AdjudicationCourtSelectionPage';
import useAdjudicationManager from '../../hooks/adjudication/AdjudicationManager';
import { useForm } from 'react-hook-form';

const mockHandleFindCourts = vi.fn();
const mockHandleCourtSelection = vi.fn();
const mockSetCourts = vi.fn();
const mockGetCourtNames = vi.fn(() => ['All Courts', 'Gobabis Court', 'Brakwater Court']);
const mockSetError = vi.fn();
const mockClearErrors = vi.fn();
const mockSetValue = vi.fn();

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

vi.mock('react-hook-form', () => ({
    useForm: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Controller: vi.fn(({ render }: { render: any }) =>
        render({
            field: { onChange: vi.fn(), onBlur: vi.fn(), value: [] },
            fieldState: { error: null }
        })
    ),
}));

vi.mock('../../assets/images/dynamic_court_icon', () => ({
    default: () => <div data-testid="court-icon" />,
}));

vi.mock('../../../framework/components/textfield/TmCheckboxAutocomplete', () => ({
    default: () => <div data-testid="courtNameSelection" />,
}));

vi.mock('../../../framework/components/button/TmButton', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children, testid, ...props }: any) => (
        <button data-testid={testid} id={testid} disabled={props.disabled} onClick={props.onClick}>
            {children}
        </button>
    ),
}));

const theme = createTheme();
const mockedUseAdjudicationManager = vi.mocked(useAdjudicationManager);
const mockedUseForm = vi.mocked(useForm);

const mockCourts = [{ courtName: 'Gobabis Court' }, { courtName: 'Brakwater Court' }];

const setupMocks = (hookOverrides: Record<string, unknown> = {}, formOverrides: Record<string, unknown> = {}) => {
    mockedUseAdjudicationManager.mockReturnValue({
        t: (str: string) => str,
        selectedCourts: [],
        setCourts: mockSetCourts,
        initialiseAdjudication: { data: { courts: mockCourts } },
        handleCourtSelection: mockHandleCourtSelection,
        handleFindCourts: mockHandleFindCourts,
        getCourtNames: mockGetCourtNames,
        ...hookOverrides,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    mockedUseForm.mockReturnValue({
        control: {},
        formState: { errors: {}, isValid: true },
        setError: mockSetError,
        clearErrors: mockClearErrors,
        setValue: mockSetValue,
        ...formOverrides,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
};

const renderPage = () => {
    return render(
        <ThemeProvider theme={theme}>
            <AdjudicationCourtSelectionPage />
        </ThemeProvider>
    );
};

describe('AdjudicationCourtSelectionPage', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        setupMocks();
    });

    describe('rendering', () => {

        test('renders the helper label', () => {
            renderPage();
            expect(screen.getByText('adjudicationHelperLabel', { exact: false })).toBeInTheDocument();
        });

        test('renders the find court button', () => {
            renderPage();
            expect(screen.getByTestId('findCourtButton')).toBeInTheDocument();
        });

        test('renders the court icon', () => {
            renderPage();
            expect(screen.getByTestId('court-icon')).toBeInTheDocument();
        });

        test('renders the court name selection', () => {
            renderPage();
            expect(screen.getByTestId('courtNameSelection')).toBeInTheDocument();
        });

        test('renders the find button with correct label', () => {
            renderPage();
            expect(screen.getByTestId('findCourtButton')).toHaveTextContent('find');
        });
    });

    describe('mount behavior', () => {

        test('calls setCourts on mount with initialiseAdjudication courts data', () => {
            renderPage();
            expect(mockSetCourts).toHaveBeenCalledWith(mockCourts);
        });

        test('sets initial courtNames validation error on mount', () => {
            renderPage();
            expect(mockSetError).toHaveBeenCalledWith(
                'courtNames',
                expect.objectContaining({ type: 'required' })
            );
        });
    });

    describe('find court button', () => {

        test('calls handleFindCourts when find button is clicked', () => {
            renderPage();

            fireEvent.click(screen.getByTestId('findCourtButton'));

            expect(mockHandleFindCourts).toHaveBeenCalled();
        });

        test('passes formState to handleFindCourts when clicked', () => {
            const mockFormState = { errors: {}, isValid: true };
            setupMocks({}, { formState: mockFormState });

            renderPage();
            fireEvent.click(screen.getByTestId('findCourtButton'));

            expect(mockHandleFindCourts).toHaveBeenCalledWith(
                expect.objectContaining({ errors: {}, isValid: true })
            );
        });

        test('is disabled when form has courtNames error', () => {
            setupMocks({}, {
                formState: {
                    errors: { courtNames: { type: 'required', message: 'Required' } },
                    isValid: false
                }
            });

            renderPage();
            const button = screen.getByTestId('findCourtButton');
            expect(button).toBeDisabled();
        });

        test('is enabled when form has no courtNames error', () => {
            setupMocks({}, {
                formState: { errors: {}, isValid: true }
            });

            renderPage();
            const button = screen.getByTestId('findCourtButton');
            expect(button).not.toBeDisabled();
        });
    });
});
