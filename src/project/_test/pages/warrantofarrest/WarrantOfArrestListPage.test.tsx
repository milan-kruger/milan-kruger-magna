import { render, screen, fireEvent } from '@testing-library/react';
import { describe, vi, beforeEach } from 'vitest';
import WarrantOfArrestListPage from '../../../pages/warrantofarrest/WarrantOfArrestListPage';
import { store } from '../../../../framework/redux/store';
import TestingPageWrapper from '../../TestingPageWrapper';
import useWarrantOfArrestManager, { SearchWarrantsOfArrestDetails } from '../../../hooks/warrant-of-arrest/WarrantOfArrestManager';
import { CourtResult } from '../../../redux/api/transgressionsApi';
import { act, useState } from 'react';

const mockOnPrint = vi.fn();
const mockCloseWarrantOfArrestDetails = vi.fn();
const mockHandleOnExit = vi.fn();

const mockSearchDetails: SearchWarrantsOfArrestDetails = {
    searchBy: 'noticeNo',
    noticeNo: '1234567890',
    courtDetails: {
        courtName: 'Brakwater Court',
        courtRoom: 'A',
        courtDate: '2025-03-07'
    }
};

const mockCourtResult: CourtResult = {
    courtResultId: 'test-court-result-id',
    noticeNumber: '1234567890',
    courtOutcome: 'WARRANT_OF_ARREST',
    caseNumber: 'CASE123',
    plateNumber: 'T0001',
    offenderName: 'TEST FOE',
    courtDate: '2025-03-07',
    courtName: 'Brakwater Court',
    courtRoom: 'A',
    transgressionStatus: 'WARRANT_OF_ARREST',
    snapshotCharges: []
};

const mockLocationState = {
    searchDetails: mockSearchDetails,
    disablePrintButton: false,
    warrantList: []
};
const mockAuthoriseDeleteFile = vi.fn();
const mockSetSupervisorPassword = vi.fn()
const mockSetSupervisorUsername = vi.fn();

const useMockWarrantOfArrestManager = () => {
    const [showWarrantDetails, setShowWarrantDetails] = useState(true);
    return {
        ...mockWarrantOfArrestManager,
        showWarrantDetails: showWarrantDetails,
        closeWarrantOfArrestDetails: () => { setShowWarrantDetails(false) }
    }
}

const mockWarrantOfArrestManager = {
    isLoading: false,
    onSubmit: vi.fn(),
    onValueChanges: vi.fn(),
    courtDetails: {
        courtNameList: [],
        courtName: null,
        handleCourtNameChange: vi.fn(),
        courtNameError: vi.fn(),
        courtRoomList: [],
        courtRoom: null,
        handleCourtRoomChange: vi.fn(),
        courtRoomError: vi.fn(),
        handleCourtDateChange: vi.fn(),
        courtDate: null,
        courtDateList: [],
        courtDateError: vi.fn(),
        helperTextMessage: undefined,
        warrantNotFound: vi.fn()
    },
    searchByError: undefined,
    searchCriteria: undefined,
    courtDate: null,
    courtName: null,
    courtRoom: null,
    searchValue: "",
    searchBy: "",
    getRows: [],
    files: new Map<string, File | null>(),
    showAuthorizationPopup: false,
    supervisorUsername: "",
    supervisorPassword: "",
    onDeleteFile: vi.fn(),
    setShowAuthorizationPopup: vi.fn(),
    setSupervisorPassword: mockSetSupervisorPassword,
    setSupervisorUsername: mockSetSupervisorUsername,
    authoriseDeleteFile: mockAuthoriseDeleteFile,
    handleOnExit: mockHandleOnExit,
    handleSearchCourtCase: vi.fn(),
    handleWarrantOfArrestClick: vi.fn(),
    refetchWarrantsOfArrestList: vi.fn(),
    provideWarrantByNoticeNumber: vi.fn(),
    onPrint: mockOnPrint,
    showWarrantDetails: false,
    closeWarrantOfArrestDetails: mockCloseWarrantOfArrestDetails,
    transgressionDetails: null,
    courtResult: mockCourtResult,
    onFileChange: vi.fn(),
    warrantsToPrint: ["test001"],
    notApproved: false,
    isErrorAuthentication: false
};

vi.mock('react-hotkeys-hook', () => ({
    useHotkeys: (keys: string, fn: () => void) => {
        window.addEventListener("keydown", (e) => {
            const pressedKey = e.altKey ? 'ALT+' + e.key : e.key;

            if (pressedKey === keys) {
                fn();
            }
        });
    }
}));

vi.mock('../../../../framework/auth/components/SecuredContent', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children, accessRoles }: any) => (
        <div data-testid="secured-content" data-access-roles={JSON.stringify(accessRoles)}>{children}</div>
    )
}));

vi.mock('react-router-dom', async () => {
    const original = await vi.importActual('react-router-dom');
    return {
        ...original,
        useLocation: () => ({
            state: mockLocationState
        })
    }
});

vi.mock('../../../hooks/warrant-of-arrest/WarrantOfArrestManager', () => ({
    __esModule: true,
    default: vi.fn(() => (mockWarrantOfArrestManager))
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('../../../components/court-documents/CourtDocumentsListSearch', () => ({
    default: ({ buttonHeading, disableButton, onSearchValue, onClickButton }: any) => (
        <div>
            <input type='text' onChange={() => { onSearchValue() }} />
            <button disabled={disableButton} onClick={() => { onClickButton() }}>{buttonHeading}</button>
        </div>
    )
}));

vi.mock('../../../components/court-results/CaptureCourtResultsDetails', () => ({
    default: ({ sx, transgressionDetails, courtResult }: any) => (
        <div>
            <div data-testid="sx">{JSON.stringify(sx)}</div>
            <div data-testid="transgressionDetails">{JSON.stringify(transgressionDetails)}</div>
            <div data-testid="courtResult">{JSON.stringify(courtResult)}</div>
        </div>
    )
}));

vi.mock('../../../components/court-results/CaptureCourtResultsForm', () => ({
    default: ({ testIdPrefix, fieldWith, form, readonly, sx, transgressionDetails, courtResult }: any) => (
        <div data-testid={testIdPrefix}>
            <div data-testid="fieldWith">{fieldWith}</div>
            <div data-testid="form">{JSON.stringify(form)}</div>
            <div data-testid="readonly">{readonly}</div>
            <div data-testid="sx">{JSON.stringify(sx)}</div>
            <div data-testid="transgressionDetails">{JSON.stringify(transgressionDetails)}</div>
            <div data-testid="courtResult">{JSON.stringify(courtResult)}</div>
        </div>
    )
}));

vi.mock('../../../../framework/components/dialog/TmAuthenticationDialog', () => ({
    default: ({ testid, username,
        handlePasswordOnChange,
        handleUsernameOnChange,
        password,
        message,
        message2,
        title,
        isOpen,
        cancelLabel,
        cancelIcon,
        confirmLabel,
        confirmIcon, onCancel, onConfirm, medium, isAuthenticationError }: any) => {
        return (<>
            {isOpen ? <div data-testid={testid}>
                <h2>{title}</h2>
                <p data-testid='message'>{message}</p>
                <p data-testid='messege-2'>{message2}</p>
                <input data-testid='username' type='text' value={username} onChange={(value) => handleUsernameOnChange(value)} />
                <input data-testid='password' type='text' value={password} onChange={(event) => handlePasswordOnChange(event)} />
                <button data-testid="btnConfirm" onClick={() => onConfirm()}>{confirmLabel}<span>{cancelIcon}</span></button>
                <button data-testid="btnCancel" onClick={() => onCancel()}>{cancelLabel}<span>{confirmIcon}</span></button>
                <div data-testid='medium'>{JSON.stringify(medium)}</div>
                <div data-testid='isAuthenticationError'>{JSON.stringify(isAuthenticationError)}</div>
            </div> : <></>}
        </>)
    }
}));

const renderWithWrapper = () => {
    return render(
        <TestingPageWrapper store={store}>
            <WarrantOfArrestListPage />
        </TestingPageWrapper>
    );
};

describe('WarrantOfArrestListPage', () => {
    test('renders the page correctly', () => {
        renderWithWrapper();

        expect(screen.getByTestId('warrantOfArrestList')).toBeInTheDocument();
        expect(screen.getByTestId('btnExit')).toBeInTheDocument();
    });

    describe("handle ALT+P hotkey for printing warrants", () => {
        test("on print is called with warrants from manager", () => {
            vi.mocked(useWarrantOfArrestManager).mockImplementation(() => ({
                ...mockWarrantOfArrestManager,
                warrantsToPrint: ["test001"],
                showWarrantDetails: true
            }));

            renderWithWrapper();
            fireEvent.keyDown(document, { key: 'P', altKey: true });
            expect(mockOnPrint).toHaveBeenCalled();
        });

        test("on print is called with warrants from location state", () => {
            vi.mocked(useWarrantOfArrestManager).mockImplementation(() => ({
                ...mockWarrantOfArrestManager,
                warrantsToPrint: []
            }));
            renderWithWrapper();
            fireEvent.keyDown(document, { key: 'P', altKey: true });
            expect(mockOnPrint).toHaveBeenCalled();
        });
    })

    describe("handles ALT+E hotkey for exiting", () => {
        test('calls closeWarrantOfArrestDetails for exiting', () => {
            vi.mocked(useWarrantOfArrestManager).mockImplementation(() => ({
                ...mockWarrantOfArrestManager,
                showWarrantDetails: true,
            }));

            renderWithWrapper();
            fireEvent.keyDown(document, { key: 'E', altKey: true });
            expect(mockCloseWarrantOfArrestDetails).toHaveBeenCalled();
        });

        test('calls handleOnExit for exiting', () => {
            vi.mocked(useWarrantOfArrestManager).mockImplementation(() => ({
                ...mockWarrantOfArrestManager,
                showWarrantDetails: false
            }));
            renderWithWrapper();
            fireEvent.keyDown(document, { key: 'E', altKey: true });
            expect(mockHandleOnExit).toHaveBeenCalled();
        });
    });


    test('disables print button based on state', () => {
        Object.assign(mockLocationState, { ...mockLocationState, disablePrintButton: true });
        renderWithWrapper();

        const printButton = screen.getByText('printWarrant');
        expect(printButton).toBeDisabled();
    });

    test('opens and closes warrant details dialog', async () => {
        vi.mocked(useWarrantOfArrestManager).mockImplementation(useMockWarrantOfArrestManager);

        renderWithWrapper();
        expect(screen.getByTestId('dialogTitle')).toBeInTheDocument();

        act(() => {
            const closeButton = screen.getByTestId('btnClose');
            fireEvent.click(closeButton);
        });

        await new Promise((resolve) => { setTimeout(() => { resolve('') }, 500) });

        act(() => {
            expect(screen.queryByTestId('dialogTitle')).not.toBeInTheDocument();
        });
    });

    describe('authentication dialog', () => {
        beforeEach(() => {
            vi.mocked(useWarrantOfArrestManager).mockImplementation(() => ({
                ...mockWarrantOfArrestManager,
                showAuthorizationPopup: true
            }));
        });
        test('on confirm calls AuthoriseDeleteFile', () => {
            renderWithWrapper();
            const authDialog = screen.getByTestId('supervisorAuthorizationDialog');
            expect(authDialog).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('btnConfirm'));
            expect(mockAuthoriseDeleteFile).toHaveBeenCalled();
        });

        test('changing the password calls setSupervisorPassword', () => {
            renderWithWrapper();
            const authDialog = screen.getByTestId('supervisorAuthorizationDialog');
            expect(authDialog).toBeInTheDocument();

            fireEvent.change(screen.getByTestId('password'), { target: { value: "test" } });
            expect(mockSetSupervisorPassword).toHaveBeenCalled();
        });

          test('changing the username calls setSupervisorUsername', () => {
            renderWithWrapper();
            const authDialog = screen.getByTestId('supervisorAuthorizationDialog');
            expect(authDialog).toBeInTheDocument();

            fireEvent.change(screen.getByTestId('username'), { target: { value: "test" } });
            expect(mockSetSupervisorUsername).toHaveBeenCalled();
        });
    });

    test('renders loading spinner when loading', () => {
        Object.assign(mockWarrantOfArrestManager, {
            ...mockWarrantOfArrestManager,
            isLoading: true,
        });
        renderWithWrapper();

        expect(screen.getByTestId('warrantOfArrestLoadingSpinner')).toBeInTheDocument();
    });
});
