import { screen, cleanup, act, fireEvent } from "@testing-library/react";
import { ReactNode } from "react";
import { useProvideCourtResultSummaryMutation } from "../../../redux/api/transgressionsApi";
import { MockData } from "../../mocks/MockData";
import CourtCaseListPage from "../../../pages/court-results/court-result-manager/CourtCaseListPage";
import { MemoryRouter } from "react-router-dom";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
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
                courtCaseList: [{ id: 1, name: 'Case 1' }],
                courtData: { key: 'value' },
                courts: ['Court A', 'Court B'],
            },
        })),
    }
});

vi.mock("../../../redux/api/transgressionsApi", async () => {
    const actual = await vi.importActual("../../../redux/api/transgressionsApi");

    return {
        ...actual,
        useProvideCourtResultSummaryMutation: vi.fn(),
    };
});

// Mock the hook
vi.mock("../../../hooks/court-results/CourtCaseListManager", () => ({
    default: vi.fn().mockReturnValue({
        getRows: vi.fn().mockReturnValue([]),
        handleSearchCourtCase: vi.fn(),
        handleCourtCaseClick: vi.fn(),
        handleOnClickViewHistory: vi.fn(),
        handleOnExit: vi.fn(),
        isLoading: true,
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
            <CourtCaseListPage />
        </MemoryRouter>
    );
};

afterEach(() => {
    cleanup();
});

describe("CourtCaseListPage", () => {
    let retrieveMock = vi.fn();

    beforeEach(() => {
        retrieveMock = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                courtResultSummaries: [MockData.getCourtResultSummary]
            })
        }));

        vi.mocked(useProvideCourtResultSummaryMutation).mockReturnValue([retrieveMock, { isLoading: false, reset() { }, }]);
    })

    // test("displays loading spinner when isLoading is true", async() => {
    //    await act(async () => {
    //     renderWithProviders(<MemoryRouter initialEntries={["/test-path"]}>
    //         <CourtCaseListPage />
    //     </MemoryRouter>);
    //    })

    //     expect(screen.getByTestId("courtCaseListLoadingSpinner")).toBeInTheDocument();
    // });

    test("render page: not secured and display access denied", async () => {
        await act(async () => {
            renderWithProviders(
                <SecuredContent accessRoles={['TRANSGRESSIONDETAILS_VIEW']}>
                    <MemoryRouter initialEntries={["/test-path"]}>
                        <CourtCaseListPage />
                    </MemoryRouter>
                </SecuredContent>
            );
        });

        expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    })

    test("renders court case list correctly", () => {
        vi.mock("../../../hooks/court-results/CourtCaseListManager", () => ({
            default: vi.fn().mockReturnValue({
                getRows: vi.fn().mockReturnValue([]),
                isLoading: false,
            }),
        }))

        renderComponent();

        expect(screen.getByTestId("courtCaseList")).toBeInTheDocument();
    });

    test("search input updates correctly", () => {
        renderComponent();

        const searchInput = screen.getByRole("textbox");

        if (searchInput instanceof HTMLInputElement) {
            fireEvent.change(searchInput, { target: { value: "Case 123" } });
            expect(searchInput.value).toBe("Case 123");
        } else {
            throw new Error("Search input is not an HTMLInputElement");
        }
    });

    test("view history button is disabled when expected", () => {
        renderComponent();
        const button = screen.getByRole("button", { name: "viewHistory" });
        expect(button).toBeDisabled();
    });

    test("exit button works correctly", async () => {
        renderComponent();
        const exitButton = document.querySelector('[data-testid="btnExit"]') as HTMLButtonElement;
        expect(exitButton).not.toBeNull();
    });

})
