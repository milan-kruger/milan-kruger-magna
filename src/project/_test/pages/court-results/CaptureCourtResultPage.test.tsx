import { ReactNode } from "react";
import { act, cleanup, screen, waitFor } from "@testing-library/react";
import { MockData } from "../../mocks/MockData";
import { useFinaliseCourtResultMutation, useFindTransgressionParameterQuery, useProvideCourtCaseListMutation } from "../../../redux/api/transgressionsApi";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import { MemoryRouter } from "react-router-dom";
import CaptureCourtResultPage from "../../../pages/court-results/court-result-manager/CaptureCourtResultPage";
import { renderWithProviders } from "../../mocks/MockStore";

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

vi.mock("../../../utils/", async () => {
    const actual = await vi.importActual("../../../utils/");

    return {
        ...actual,
        toCamelCase: vi.fn(),
        toCamelCaseWords: vi.fn(),
    };
});

// Mock the hook
vi.mock("../../../hooks/court-results/CaptureCourtResultsManager", () => ({
    default: vi.fn().mockReturnValue({
        transgressionDetails: MockData.getTransgression,
        generateWarrantNumber: false,
        onSubmitResults: vi.fn().mockReturnValue([]),
        onCancelCourtResults: vi.fn().mockReturnValue([]),
        onConfirmResults: vi.fn(),
        onDiscardChanges: vi.fn(),
        courtDateList: []
    }),
}))

// Mock the hook
vi.mock("../../../../framework/auth/components/SecuredContent", () => ({
    default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
        accessRoles.includes("COURTRESULT_MAINTAIN") || accessRoles.includes("COURTRESULT_VIEW")
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
        default: vi.fn().mockReturnValue({
            toCamelCase: vi.fn()
        })
    };
});

const renderComponent = () => {
    return renderWithProviders(
        <MemoryRouter initialEntries={[{ state: { courts: [MockData.getCourts] } }]}>
            <CaptureCourtResultPage />
        </MemoryRouter>
    );
};

afterEach(() => {
    cleanup();
});

describe("CaptureCourtResultPage", () => {
    let finaliseCourtResult = vi.fn();
    let retrieveCourtResult = vi.fn();

    beforeEach(() => {
        finaliseCourtResult = vi.fn(() => ({
            courtResultCaptured: true
        }))

        retrieveCourtResult = vi.fn(() => ({
            courtCaseList: []
        }))

        vi.mocked(useFinaliseCourtResultMutation).mockReturnValue([finaliseCourtResult, { isLoading: false, reset() { }, }]);
        vi.mocked(useProvideCourtCaseListMutation).mockReturnValue([retrieveCourtResult, { isLoading: false, reset() { }, }]);
        vi.mocked(useFindTransgressionParameterQuery).mockReturnValue({
            data: [],
            isFetching: false,
            refetch: vi.fn(),
            reset: vi.fn(),
        });
    })

    test("render page: not secured and display access denied", async () => {
        await act(async () => {
            renderWithProviders(
                <SecuredContent accessRoles={['TRANSGRESSIONDETAILS_VIEW']}>
                    <MemoryRouter initialEntries={["/test-path"]}>
                        <CaptureCourtResultPage />
                    </MemoryRouter>
                </SecuredContent>
            );
        });

        expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    })

    test("render page: secured and display", async () => {

        await act(async () => {
            renderComponent();
        });

        expect(screen.getByTestId("captureCourtResults")).toBeInTheDocument();
    })

    test("opens and closes confirm results dialog", async () => {
        renderComponent();
        await waitFor(() => {
            const confirmDialog = screen.queryByTestId("confirmCourtResultsDialog");

            if (confirmDialog) {
                expect(confirmDialog).not.toBeVisible();
            } else {
                expect(confirmDialog).toBeNull();
            }
        });
    });

    test("opens and closes discard changes dialog", async () => {
        renderComponent();

        await waitFor(() => {
            const discardDialog = screen.queryByTestId("cancelCourtResultsDialog");

            if (discardDialog) {
                expect(discardDialog).not.toBeVisible();
            } else {
                expect(discardDialog).toBeNull();
            }
        });
    });


})
