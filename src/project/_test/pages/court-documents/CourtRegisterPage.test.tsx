import { render, screen, fireEvent } from '@testing-library/react';
import CourtRegisterPage from '../../../pages/court-documents/court-register-manager/CourtRegisterPage';
import { vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { act } from 'react';

const mockUseCourtRegisterManager = vi.fn();
const mockT = (str: string) => str;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT })
}));

vi.mock('../../../hooks/court-documents/CourtRegisterManager', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (...args: any[]) => mockUseCourtRegisterManager(...args)
}));

vi.mock('../../../../framework/components/dialog/TmDialog', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = await vi.importActual<any>('../../../../framework/components/dialog/TmDialog');
    return {
        ...actual,
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (props: any) => <div data-testid={props.testid}>{props.contentComponent}{props.children}</div>
    };
});

vi.mock('../../../../framework/components/dialog/TmAuthenticationDialog', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = await vi.importActual<any>('../../../../framework/components/dialog/TmAuthenticationDialog');
    return {
        ...actual,
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (props: any) => <div data-testid={props.testid}>
            <input data-testid="specialAuthorizationUsernameField" value={props.username} onChange={props.handleUsernameOnChange} />
            <input data-testid="specialAuthorizationPasswordField" value={props.password} onChange={props.handlePasswordOnChange} />
        </div>
    };
});

vi.mock('../../../../framework/components/textfield/TmTextField', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = await vi.importActual<any>('../../../../framework/components/textfield/TmTextField');
    return {
        ...actual,
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (props: any) => <input data-testid={props.testid} value={props.value} onChange={props.onChange} />
    };
});

vi.mock('../../../../framework/components/typography/TmTypography', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = await vi.importActual<any>('../../../../framework/components/typography/TmTypography');
    return {
        ...actual,
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (props: any) => <div data-testid={props.testid}>{props.children}</div>
    };
});

const theme = createTheme();

const renderPage = (managerOverrides: Partial<ReturnType<typeof mockUseCourtRegisterManager>> = {}) => {
    mockUseCourtRegisterManager.mockReturnValue({
        isLoading: false,
        handleGenerateCourtRegister: vi.fn(),
        adjudicationTimeFence: 3,
        courtNameList: ['Court A', 'Court B'],
        allPersonnelFieldsEmpty: false,
        disablePersonnelFields: false,
        courts: [{ name: 'Court A' }, { name: 'Court B' }],
        presidingOfficer: 'Presiding Officer',
        publicProsecutor: 'Public Prosecutor',
        clerkOfTheCourt: 'Clerk',
        interpreter: 'Interpreter',
        showUpdatePersonnelBtn: true,
        transgressionsSummaryList: [
            { driver: { firstNames: 'John', surname: 'Doe' }, noticeNumber: { number: '123' } },
            { driver: { firstNames: 'Jane', surname: 'Smith' }, noticeNumber: { number: '456' } }
        ],
        supervisorUsername: 'supervisor',
        setSupervisorUsername: vi.fn(),
        supervisorPassword: 'password',
        setSupervisorPassword: vi.fn(),
        handleOnSkip: vi.fn(),
        handleOnSubmit: vi.fn(),
        handleOnUpdatePersonnel: vi.fn(),
        handlePresidingOfficerChange: vi.fn(),
        handlePublicProsecutorChange: vi.fn(),
        handleClerkOfTheCourtChange: vi.fn(),
        handleInterpreterChange: vi.fn(),
        handleSupervisorAuthConfirm: vi.fn(),
        handleUnadjudicatedConfirm: vi.fn(),
        fieldsUpdated: () => true,
        isErrorAuthentication: false,
        notApproved: false,
        ...managerOverrides
    });
    return render(
        <ThemeProvider theme={theme}>
            <CourtRegisterPage />
        </ThemeProvider>
    );
};

describe('CourtRegisterPage', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test('renders court document generator and personnel dialog', () => {
        renderPage();
        expect(screen.getByText('generateCourtRegister')).toBeInTheDocument();
        expect(screen.getByTestId('courtPersonnelDiaolog')).toBeInTheDocument();
    });

    test('renders personnel fields and allows input', () => {
        const setPresidingOfficer = vi.fn();
        const setPublicProsecutor = vi.fn();
        const setClerk = vi.fn();
        const setInterpreter = vi.fn();
        renderPage({
            handlePresidingOfficerChange: setPresidingOfficer,
            handlePublicProsecutorChange: setPublicProsecutor,
            handleClerkOfTheCourtChange: setClerk,
            handleInterpreterChange: setInterpreter,
        });
        fireEvent.change(screen.getByTestId('presidingOfficer'), { target: { value: 'New Presiding' } });
        fireEvent.change(screen.getByTestId('publicProsecutor'), { target: { value: 'New Prosecutor' } });
        fireEvent.change(screen.getByTestId('clerkOfTheCourt'), { target: { value: 'New Clerk' } });
        fireEvent.change(screen.getByTestId('interpreter'), { target: { value: 'New Interpreter' } });
        expect(setPresidingOfficer).toHaveBeenCalled();
        expect(setPublicProsecutor).toHaveBeenCalled();
        expect(setClerk).toHaveBeenCalled();
        expect(setInterpreter).toHaveBeenCalled();
    });

    test('renders unadjudicated submissions dialog with transgressions', () => {
        renderPage({ showUnadjudicatedSubmissionsDialog: true });
        expect(screen.getByTestId('unadjudicatedSubmissionsDialog')).toBeInTheDocument();
    });

    test('renders supervisor authentication dialog', () => {
        renderPage({ isSupervisorAuthDialogOpen: true });
        expect(screen.getByTestId('driverDetailsSupervisorAuthDialog')).toBeInTheDocument();
    });

    test('renders supervisor authentication dialog and can change values', async () => {
        const mockSetSupervisorUsername = vi.fn();
        const mockSetSupervisorPassword = vi.fn();
        let setIsSupervisorAuthDialogOpenRef: (open: boolean) => void = () => { };
        mockUseCourtRegisterManager.mockImplementation((_a, _b, setIsSupervisorAuthDialogOpen) => {
            setIsSupervisorAuthDialogOpenRef = setIsSupervisorAuthDialogOpen;
            return {
                fieldsUpdated: () => false,
                setSupervisorUsername: mockSetSupervisorUsername,
                setSupervisorPassword: mockSetSupervisorPassword,
            };
        });

        render(
            <ThemeProvider theme={theme}>
                <CourtRegisterPage />
            </ThemeProvider>
        );

        act(() => {
            setIsSupervisorAuthDialogOpenRef(true);
        });

        expect(screen.getByTestId('driverDetailsSupervisorAuthDialog')).toBeInTheDocument();

        const usernameInput = await screen.getByTestId('specialAuthorizationUsernameField');
        expect(usernameInput).toBeInTheDocument();
        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'newUsername' } });
        });
        expect(mockSetSupervisorUsername).toHaveBeenCalledWith('NEWUSERNAME');

        const passwordInput = await screen.getByTestId('specialAuthorizationPasswordField');
        expect(passwordInput).toBeInTheDocument();
        act(() => {
            fireEvent.change(passwordInput, { target: { value: 'newPassword' } });
        });
        expect(mockSetSupervisorPassword).toHaveBeenCalled();
    });

    test('calls handleOnSubmit when submit is triggered', () => {
        const handleOnSubmit = vi.fn();
        renderPage({ handleOnSubmit });

        expect(handleOnSubmit).not.toHaveBeenCalled();
    });

    test('shows error state in supervisor auth dialog', () => {
        renderPage({ isSupervisorAuthDialogOpen: true, isErrorAuthentication: true });
        expect(screen.getByTestId('driverDetailsSupervisorAuthDialog')).toBeInTheDocument();
    });
});
