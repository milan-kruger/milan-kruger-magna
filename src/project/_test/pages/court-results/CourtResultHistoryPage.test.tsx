import { ReactNode } from "react";
import { act, cleanup, screen } from "@testing-library/react";
import { MockData } from "../../mocks/MockData";
import { useProvideCourtResultMutation } from "../../../redux/api/transgressionsApi";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import { MemoryRouter } from "react-router-dom";
import CourtResultHistoryPage from "../../../pages/court-results/court-result-manager/CourtResultHistoryPage";
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
        useProvideCourtResultMutation: vi.fn(),
    };
});

// Mock the hook
vi.mock("../../../hooks/court-results/CourtResultHistoryManager", () => ({
    default: vi.fn().mockReturnValue({
        provideCaseResultDetails: vi.fn().mockReturnValue([]),
        isLoading: true,
        captureDialogOpen: false,
        closeCaptureDialog: vi.fn(),
        handleCourtCaseClick: vi.fn(),
        transgressionDetails: MockData.getTransgression
    }),
}))

// Mock the hook
vi.mock("../../../../framework/auth/components/SecuredContent.tsx", () => ({
    default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
        accessRoles.includes("COURTRESULT_MAINTAIN") || accessRoles.includes("COURTRESULT_VIEW")
            ? <div data-testid="secured-content">{children}</div>
            : <div data-testid="access-denied">Access Denied</div>
    ),
}));

const renderComponent = () => {
    return renderWithProviders(
        <MemoryRouter initialEntries={["/test-path"]}>
            <CourtResultHistoryPage />
        </MemoryRouter>
    );
};

afterEach(() => {
    cleanup();
});

describe("CourtResultHistoryPage", () => {
    let retrieveMock = vi.fn();

    beforeEach(() => {
        retrieveMock = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                courtResult: [MockData.getCourtResult]
            })
        }));

        vi.mocked(useProvideCourtResultMutation).mockReturnValue([retrieveMock, { isLoading: false, reset() { }, }]);
    })

    test("render page: not secured and display access denied", async () => {
        await act(async () => {
            renderWithProviders(
                <SecuredContent accessRoles={['TRANSGRESSIONDETAILS_VIEW']}>
                    <MemoryRouter initialEntries={["/test-path"]}>
                        <CourtResultHistoryPage />
                    </MemoryRouter>
                </SecuredContent>
            );
        });

        expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    })

    test("render court history list correctly", async () => {
        vi.mock("../../../hooks/court-results/CourtResultHistoryManager", () => ({
            default: vi.fn().mockReturnValue({
                provideCaseResultDetails: vi.fn().mockReturnValue([]),
                isLoading: false,
                captureDialogOpen: false,
                closeCaptureDialog: vi.fn(),
                handleCourtCaseClick: vi.fn(),
                transgressionDetails: MockData.getTransgression
            }),
        }))
        await act(async () => {
            renderComponent()
        });

        expect(screen.getByTestId("courtResultHistory")).toBeInTheDocument();
    })

    // test("displays loading spinner when isLoading is true", async() => {
    //    await act(async () => {
    //     renderWithProviders(<MemoryRouter initialEntries={["/test-path"]}>
    //         <CourtResultHistoryPage />
    //     </MemoryRouter>);
    //    })

    //     expect(screen.getByTestId("loadingCourtResultHistory")).toBeInTheDocument();
    // });

})
