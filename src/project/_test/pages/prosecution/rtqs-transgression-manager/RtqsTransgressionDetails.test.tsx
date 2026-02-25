/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanup, render, screen } from "@testing-library/react";
import { vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// Hoist mock functions to make them available in vi.mock factories
const { mockHasRole, mockHasAllRoles, mockIsFeatureEnabled } = vi.hoisted(() => ({
    mockHasRole: vi.fn(),
    mockHasAllRoles: vi.fn(),
    mockIsFeatureEnabled: vi.fn()
}));

vi.mock('../../../../../framework/auth/authService', () => ({
    __esModule: true,
    default: {
        hasRole: mockHasRole,
        hasAllRoles: mockHasAllRoles,
        isFeatureEnabled: mockIsFeatureEnabled
    }
}));

// Mock SecuredContent
vi.mock('../../../../../framework/auth/components/SecuredContent', () => ({
    __esModule: true,
    default: ({ children, accessRoles }: any) => {
        // If no roles required (empty array), don't render
        if (!accessRoles || accessRoles.length === 0) {
            return null;
        }
        // Check if user has access based on mocked role functions
        const hasAccess = mockHasAllRoles(accessRoles);
        return hasAccess ? (
            <div data-testid="secured-content" data-access-roles={JSON.stringify(accessRoles)}>{children}</div>
        ) : null;
    }
}));

// Mock TransgressionContextProvider
vi.mock("../../../../pages/prosecution/overload-transgression-manager/CaptureTransgressionContext", () => ({
    __esModule: true,
    default: ({ children }: any) => <div data-testid="transgression-context-provider">{children}</div>
}));

// Mock roles file
vi.mock('../../../../auth/roles.ts', () => ({
    Role: {} as any
}));

// Create a test store with minimal configuration
const createTestStore = () => configureStore({
    reducer: {
        ui: (state = { themeMode: 'light' }) => state,
        auth: (state = { isAuthenticated: true }) => state,
        error: (state = []) => state,
        conf: (state = { config: {} }) => state,
        transgression: (state = {}) => state,
        captureCourtResults: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

// Mock routing constants
vi.mock('../../../../Routing', () => ({
    ROUTE_NAMES: {
        rtqsTransgression: 'rtqs-transgression'
    }
}));

// Mock redirect types
vi.mock('../../../../enum/RedirectType', () => ({
    RedirectType: {
        PROSECUTE_RTQS: 'PROSECUTE_RTQS'
    }
}));

// Mock APIs
vi.mock('../../../../redux/api/transgressionsApi', () => ({
    TransgressionDto: {} as any,
    transgressionsApi: {
        reducer: (state = {}) => state,
        middleware: () => (next: any) => (action: any) => next(action),
    },
    OverloadTransgressionDto: {} as any,
    RtqsTransgressionDto: {} as any,
    SnapshotRtqsCharge: {} as any,
}));

vi.mock('../../../../redux/api/coreApi', () => ({
    coreApi: {
        reducer: (state = {}) => state,
        middleware: () => (next: any) => (action: any) => next(action),
    },
}));

vi.mock('../../../../redux/api/weighApi', () => ({
    weighApi: {
        reducer: (state = {}) => state,
        middleware: () => (next: any) => (action: any) => next(action),
    },
}));

vi.mock('../../../../redux/api/contentStoreApi', () => ({
    contentStoreApi: {
        reducer: (state = {}) => state,
        middleware: () => (next: any) => (action: any) => next(action),
    },
}));

// Mock the shared transgression-details service
vi.mock("../../../../utils/transgression-details", () => ({
    useTransgressionDetailsService: vi.fn().mockReturnValue({
        buildCaptureComponentProps: vi.fn().mockReturnValue({
            exitDialogState: false,
            openDialogState: false,
            handleOpenSaveDialog: vi.fn(),
            handleOpenExitDialog: vi.fn(),
            handleOpenHistoryDialog: vi.fn(),
            handleReprint: vi.fn(),
            closeSaveDialog: vi.fn(),
            closeExitDialog: vi.fn(),
            handleDiscardConfirmDialog: vi.fn(),
            handleOpenCancelDialog: vi.fn(),
            handleEdit: vi.fn(),
            setFormChargesValid: vi.fn()
        }),
        openHistoryDialog: false,
        handleConfirmHistoryDialogClose: vi.fn(),
        openCancelTransgressionDialog: false,
        handleConfirmCancelTransgressionDialogClose: vi.fn(),
        form: {},
        isUpdating: false,
        location: { state: { noticeNo: "TEST123", transgressionDetails: { sequenceNumber: 1 } } }
    }),
}));

vi.mock("../../../../pages/prosecution/rtqs-transgression-manager/CaptureRtqsTransgressionPageEdit", () => ({
    default: vi.fn().mockImplementation(() => <div data-testid="capture-rtqs-transgression-page-edit">CaptureRtqsTransgressionPageEdit</div>)
}));

vi.mock("../../../../components/transgression-history/TransgressionHistoryDialog", () => ({
    default: vi.fn().mockImplementation(() => <div data-testid="transgression-history-dialog">TransgressionHistoryDialog</div>)
}));

vi.mock("../../../../components/cancel-transgression/CancelTransgressionDialog", () => ({
    default: vi.fn().mockImplementation(() => <div data-testid="cancel-transgression-dialog">CancelTransgressionDialog</div>)
}));

const mockLocationState = {
    noticeNo: "TEST123",
    transgressionDetails: {
        sequenceNumber: 1
    }
};

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: () => ({
            state: mockLocationState
        }),
    };
});

// Import components AFTER all mocks are defined
import RtqsTransgressionDetailsPage from "../../../../pages/prosecution/rtqs-transgression-manager/RtqsTransgressionDetails";
import TestingPageWrapper from "../../../TestingPageWrapper";

const renderComponent = (isFeatureEnabled = true, hasRoleAccess = true) => {
    mockHasRole.mockReturnValue(hasRoleAccess);
    mockHasAllRoles.mockReturnValue(hasRoleAccess);
    mockIsFeatureEnabled.mockReturnValue(isFeatureEnabled);

    const testStore = createTestStore();
    return render(
        <TestingPageWrapper store={testStore}
            initialEntries={[{ pathname: "/", state: mockLocationState }]}>
            <RtqsTransgressionDetailsPage />
        </TestingPageWrapper>
    );
};

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("RtqsTransgressionDetailsPage", () => {
    test("renders RtqsTransgressionDetailsPage with RTQS transgressions enabled", () => {
        renderComponent();

        expect(screen.getByTestId("capture-rtqs-transgression-page-edit")).toBeInTheDocument();
        expect(screen.getByTestId("transgression-history-dialog")).toBeInTheDocument();
        expect(screen.getByTestId("cancel-transgression-dialog")).toBeInTheDocument();
    });

    test("does not render when RTQS transgressions are disabled", () => {
        renderComponent(false, false);

        expect(screen.queryByTestId("capture-rtqs-transgression-page-edit")).not.toBeInTheDocument();
        expect(screen.queryByTestId("transgression-history-dialog")).not.toBeInTheDocument();
        expect(screen.queryByTestId("cancel-transgression-dialog")).not.toBeInTheDocument();
    });

    test("does not render when user lacks required roles", () => {
        renderComponent(true, false);

        expect(screen.queryByTestId("capture-rtqs-transgression-page-edit")).not.toBeInTheDocument();
        expect(screen.queryByTestId("transgression-history-dialog")).not.toBeInTheDocument();
        expect(screen.queryByTestId("cancel-transgression-dialog")).not.toBeInTheDocument();
    });

    test("renders with correct layout structure", () => {
        renderComponent();

        // Check for the main layout container
        const containers = screen.getByTestId("capture-rtqs-transgression-page-edit").parentElement;
        expect(containers).toBeInTheDocument();
    });

    test("integrates with shared transgression-details service correctly", () => {
        renderComponent();

        // Verify the service components are rendered based on mock return values
        expect(screen.getByTestId("capture-rtqs-transgression-page-edit")).toBeInTheDocument();
        expect(screen.getByTestId("transgression-history-dialog")).toBeInTheDocument();
        expect(screen.getByTestId("cancel-transgression-dialog")).toBeInTheDocument();
    });
});
