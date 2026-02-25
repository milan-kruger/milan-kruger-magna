import { ReactNode } from "react";
import { MockData } from "../../mocks/MockData";
import { renderWithProviders } from "../../mocks/MockStore";
import CancelContemptOfCourtFeePage from "../../../pages/court-results/court-result-manager/cancel-contempt-of-court-fee-manager/CancelContemptOfCourtFeePage";
import { MemoryRouter } from "react-router-dom";
import { act, cleanup, screen } from "@testing-library/react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import { useAppDispatch, useAppSelector } from "../../../../framework/redux/hooks";
import AuthService from "../../../../framework/auth/authService";
import { ThemeProvider } from "@emotion/react";
import { createTheme, useMediaQuery, useTheme } from "@mui/material";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { }),
        },
    })
}));

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => {
            return false;
        }),
        useTheme: vi.fn()
    };
});

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: vi.fn(() => ({
            pathname: "/test-path",
            search: "",
            hash: "",
            state: {
                courtResultHistory: []
            },
        })),
    }
});

vi.mock("../../../redux/api/transgressionsApi", async () => {
    const actual = await vi.importActual("../../../redux/api/transgressionsApi");

    return {
        ...actual,
        useFinaliseCourtResultMutation: vi.fn(),
        useProvideCourtCaseListMutation: vi.fn(),
        useFindTransgressionParameterQuery: vi.fn()
    };
});

vi.mock("../../../../framework/auth/authService", async () => {
    const actual = await vi.importActual("../../../../framework/auth/authService");
    return {
        ...actual,
        getUserName: vi.fn(),
    };
});

vi.mock("../../../utils/", async () => {
    const actual = await vi.importActual("../../../utils/");

    return {
        ...actual,
        toCamelCase: vi.fn(),
        toCamelCaseWords: vi.fn(),
    };
});

vi.mock("../../../../framework/redux/hooks", () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

vi.mock("../../../../framework/auth/authService", async () => {
    const actual = await vi.importActual("../../../../framework/auth/authService");
    return {
        ...actual,
        getUserName: vi.fn(),
    };
});

// Mock the hook
vi.mock("../../../hooks/court-results/CancelContemptOfCourtFeeManager", async () => ({
    default: vi.fn().mockReturnValue({
        isLoading: false,
        onSubmit: vi.fn(),
        showCourtResultPopup: false,
        closeCourtResultPopup: vi.fn(),
        onValueChanges: vi.fn(),
        showAuthorizationPopup: false,
        setShowAuthorizationPopup: vi.fn(),
        onCancelContemptOfCourtFee: vi.fn(),
        courtResults: [MockData.getCourtResult],
        showConfirmationDialog: false,
        supervisorPassword: "test",
        setSupervisorPassword: vi.fn(),
        supervisorUsername: "test",
        setSupervisorUsername: vi.fn(),
        closeAuthorizationPopup: vi.fn(),
        closeAll: vi.fn(),
        contemptOfCourtFeeCancelled: false,
        contemptOfCourtFee: MockData.getMoney,
        searchByError: {},
        isErrorAuthentication: false,
        notApproved: false
    }),

}))

// Mock the hook
vi.mock("../../../../framework/auth/components/SecuredContent", () => ({
    default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
        accessRoles.includes("CANCELCONTEMPTOFCOURT_MAINTAIN")
            ? <div data-testid="secured-content">{children}</div>
            : <div data-testid="access-denied">Access Denied</div>
    ),
}));

vi.mock("../../../../framework/utils/index", async () => {
    const actual = await vi.importActual("../../../../framework/utils/index");

    return {
        ...actual,
        toCamelCaseWords: vi.fn(),
        removeUnderscores: vi.fn(),
        toTitleCase: vi.fn(),
        default: vi.fn().mockReturnValue({
            toCamelCase: vi.fn()
        })
    };
});

const theme = createTheme();

const renderComponent = () => {
    return renderWithProviders(
        <ThemeProvider theme={theme}>
            <MemoryRouter>
                <CancelContemptOfCourtFeePage />
            </MemoryRouter>
        </ThemeProvider>

    );
};

afterEach(() => {
    cleanup();
});

describe(("CancelContemptOfCourtFeePage"), () => {
    const mockDispatch = vi.fn();
    const formData = {
        amountPaid: { amount: 500 },
        courtOutcome: "Guilty",
        caseNumber: "12345",
        newCourtDate: "2025-03-15",
        reason: "Test Reason",
        receiptNumber: "RC123",
        sentence: "Fine",
        sentenceType: "Monetary",
        paymentMethod: "Credit Card",
        sentenceLength: 12,
        sentenceTimePeriod: "Months",
        warrantNumber: "WN456",
    };

    beforeEach(() => {
        vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
        vi.mocked(useAppSelector).mockReturnValue({ isValid: true, formData })
        const getUserName = vi.spyOn(AuthService, 'getUserName');
        getUserName.mockReturnValue('john_doe');
        const hasRole = vi.spyOn(AuthService, 'hasRole');
        hasRole.mockReturnValue(true);
        vi.mocked(useTheme).mockReturnValue(theme);
        vi.mocked(useMediaQuery).mockReturnValue(false);

    })

    test("render page: not secured and display access denied", async () => {
        await act(async () => {
            renderWithProviders(
                <SecuredContent accessRoles={['TRANSGRESSIONDETAILS_VIEW']}>
                    <MemoryRouter initialEntries={["/test-path"]}>
                        <CancelContemptOfCourtFeePage />
                    </MemoryRouter>
                </SecuredContent>
            );
        });

        expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    })

    test("renders loading spinner when isLoading is true", async () => {
        vi.mock("../../../hooks/court-results/CancelContemptOfCourtFeeManager", () => ({
            default: vi.fn().mockReturnValue({
                isLoading: true
            }),
        }))
        await act(async () => {
            renderComponent();
        })

        expect(screen.getByTestId("cancelContemptOfCourtFeeLoadingSpinner")).toBeInTheDocument();
    });
})
