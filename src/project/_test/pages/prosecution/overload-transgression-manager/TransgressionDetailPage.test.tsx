/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanup, render, screen } from "@testing-library/react";
import { initialConfigContextState } from "../../../../../framework/config/ConfigContext";
import TransgressionDetailPage from "../../../../pages/prosecution/overload-transgression-manager/TransgressionDetailPage";
import { initialConfigState } from "../../../mocks/config.mock";
import TestingPageWrapper from "../../../TestingPageWrapper";

// Mock the store to avoid dynamic import issues
vi.mock("../../../../../framework/redux/store", () => ({
    store: {
        dispatch: vi.fn(),
        getState: vi.fn(() => ({
            auth: {},
            ui: { themeMode: 'light' },
            conf: {},
            error: {},
            transgression: {},
            captureCourtResults: {}
        })),
        subscribe: vi.fn(),
        replaceReducer: vi.fn()
    }
}));

// Mock keycloak service for auth
const mockHasRole = vi.fn();
const mockHasAllRoles = vi.fn();

vi.mock('../../../../../framework/auth/authService', () => ({
    __esModule: true,
    default: {
        hasRole: mockHasRole,
        hasAllRoles: mockHasAllRoles
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

// Mock routing constants
vi.mock('../../../../Routing', () => ({
    ROUTE_NAMES: {
        overloadTransgression: 'overload-transgression'
    }
}));

// Mock redirect types
vi.mock('../../../../enum/RedirectType', () => ({
    RedirectType: {
        LIST: 'LIST'
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
        }),
        openHistoryDialog: false,
        handleConfirmHistoryDialogClose: vi.fn(),
        openCancelTransgressionDialog: false,
        handleConfirmCancelTransgressionDialogClose: vi.fn(),
        form: {},
        isUpdating: false,
        location: { state: { overloadTransgression: { sequenceNumber: '123', id: 'trans1' } } }
    }),
}));

vi.mock("../../../../pages/prosecution/overload-transgression-manager/CaptureTransgressionPageEdit", () => ({
    default: vi.fn().mockImplementation(() => <div data-testid="capture-transgression-page-edit">CaptureTransgressionPageEdit</div>)
}));

vi.mock("../../../../components/transgression-history/TransgressionHistoryDialog", () => ({
    default: vi.fn().mockImplementation(() => <div data-testid="transgression-history-dialog">TransgressionHistoryDialog</div>)
}));

vi.mock("../../../../components/cancel-transgression/CancelTransgressionDialog", () => ({
    default: vi.fn().mockImplementation(() => <div data-testid="cancel-transgression-dialog">CancelTransgressionDialog</div>)
}));

const mockLocationState = {
    overloadTransgression: { sequenceNumber: '123', id: 'trans1' }
};

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: () => ({
            state: mockLocationState
        }),
        useParams: () => ({ noticeNo: '123' }),
    };
});

const mockConfig = {
    ...initialConfigContextState,
    ...initialConfigState,
};

const renderComponent = async (config = mockConfig, hasRoleAccess = true) => {
    mockHasRole.mockReturnValue(hasRoleAccess);
    mockHasAllRoles.mockReturnValue(hasRoleAccess);

    const { store } = vi.mocked(await import("../../../../../framework/redux/store"));

    return render(
        <TestingPageWrapper store={store} initialConfigState={config}
            initialEntries={[{ pathname: "/", state: mockLocationState }]}>
            <TransgressionDetailPage />
        </TestingPageWrapper>
    );
};

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("TransgressionDetailPage", () => {
    test("renders TransgressionDetailPage with proper access", async () => {
        await renderComponent();

        expect(screen.getByTestId("capture-transgression-page-edit")).toBeInTheDocument();
        expect(screen.getByTestId("transgression-history-dialog")).toBeInTheDocument();
        expect(screen.getByTestId("cancel-transgression-dialog")).toBeInTheDocument();
    });

    test("does not render when user lacks required roles", async () => {
        await renderComponent(mockConfig, false);

        expect(screen.queryByTestId("capture-transgression-page-edit")).not.toBeInTheDocument();
        expect(screen.queryByTestId("transgression-history-dialog")).not.toBeInTheDocument();
        expect(screen.queryByTestId("cancel-transgression-dialog")).not.toBeInTheDocument();
    });

    test("renders with correct layout structure", async () => {
        await renderComponent();

        // Check for the main layout container
        const containers = screen.getByTestId("capture-transgression-page-edit").parentElement;
        expect(containers).toBeInTheDocument();
    });

    test("integrates with shared transgression-details service correctly", async () => {
        await renderComponent();

        // Verify the service components are rendered based on mock return values
        expect(screen.getByTestId("capture-transgression-page-edit")).toBeInTheDocument();
        expect(screen.getByTestId("transgression-history-dialog")).toBeInTheDocument();
        expect(screen.getByTestId("cancel-transgression-dialog")).toBeInTheDocument();

        // Verify service mock was called
        const { useTransgressionDetailsService } = await import("../../../../utils/transgression-details");
        expect(vi.mocked(useTransgressionDetailsService)).toHaveBeenCalled();
    });
});
