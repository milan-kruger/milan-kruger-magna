import { screen, fireEvent } from "@testing-library/dom";
import { cleanup } from "@testing-library/react";
import { renderWithProviders } from "../../mocks/MockStore";
import WarrantOfArrestTabPage from "../../../pages/warrantofarrest/WarrantOfArrestTabPage";
import { MemoryRouter } from "react-router-dom";
import { act, ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ROUTE_NAMES } from "../../../Routing";

const mockNavigate = vi.fn();
const mockAccessRolesRequired = vi.fn(() => {
    return ["WARRANTOFARRESTREGISTER_MAINTAIN",
        "WARRANTOFARRESTREGISTER_VIEW",
        "WARRANTOFARREST_VIEW",
        "WARRANTOFARREST_MAINTAIN"];
})

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
});

vi.mock("../../../../framework/auth/components/SecuredContent.tsx", () => ({
  default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
    accessRoles.includes(mockAccessRolesRequired()[0]) ||
    accessRoles.includes(mockAccessRolesRequired()[1]) ||
    accessRoles.includes(mockAccessRolesRequired()[2]) ||
    accessRoles.includes(mockAccessRolesRequired()[3])
      ? <div data-testid="secured-content">{children}</div>
      : <div data-testid="access-denied">Access Denied</div>
  ),
}));

// Mock child pages to avoid rendering their internals
vi.mock("../../../pages/warrantofarrest/WarrantOfArrestRegisterPage", () => ({
    default: () => <div data-testid="warrantsOfArrestRegisterPage">Warrants of Arrest Register Page</div>
}));
vi.mock("../../../pages/warrantofarrest/WarrantOfArrestPage", () => ({
    default: () => <div data-testid="warrantsOfArrestPage">Warrants of Arrest Page</div>
}));

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false),
  };
});

afterEach(() => {
    cleanup();
});

const renderComponent = (initialEntries = ["/warrant-of-arrest-tab"]) => {
    const theme = createTheme();
    return renderWithProviders(
        <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={initialEntries}>
                <WarrantOfArrestTabPage />
            </MemoryRouter>
        </ThemeProvider>
    );
};

describe("WarrantOfArrestTabPage", () => {

    test("should render component", () => {
        renderComponent();
    });

    test("should renders both tabs and first tab panel by default", () => {
        renderComponent();

        expect(screen.getAllByTestId("secured-content").length).toBeGreaterThan(0);
        expect(screen.getByText("Warrants of Arrest Register Page")).toBeInTheDocument();

        expect(screen.getByTestId("warrantsOfArrestRegister")).toBeVisible();
        expect(screen.getByTestId("warrantsOfArrestRegister")).toBeVisible();

        expect(screen.queryByTestId("warrantsOfArrestPage")).not.toBeInTheDocument();
    });

    test("should switch to second tab and navigate correctly", () => {
        renderComponent();

        const secondTab = screen.getByTestId("warrantsOfArrest");

        act(() => {
            fireEvent.click(secondTab);
        });

        expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE_NAMES.warrantsOfArrest}`);
    });

    test("should show access denied if user lacks roles", () => {
        mockAccessRolesRequired.mockImplementation(() => []);

        renderComponent();

        expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });
});
