import { cleanup, screen } from "@testing-library/react";
import CourtDocumentsPage from "../../../pages/court-documents/CourtDocumentsPage";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "../../mocks/MockStore";
import { createTheme, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import { TmResponsiveTabSelectItem } from "../../../components/tab/ResponsiveTabSelect";

vi.mock("../../../../framework/auth/components/SecuredContent", () => ({
  default: ({ children }: { children: ReactNode }) => <div data-testid="secured-content">{children}</div>,
}));

vi.mock("../../../components/tab/ResponsiveTabSelect", () => ({
  __esModule: true,
  default: ({ items }: { items: TmResponsiveTabSelectItem[] }) => (
    <div data-testid="tab-select">
      {items.map((item: TmResponsiveTabSelectItem) => {
        const fallbackLabel = {
          courtRegisterTab: "courtRegister",
          controlDocumentsTab: "controlDocuments",
          courtResultsTab: "courtResults",
          cancelContemptOfCourtTab: "cancelContemptOfCourtFee",
        }[item.id] ?? item.id;

        return (
          <div key={item.id} data-testid={`tab-item-${item.id}`}>
            {item.label ?? fallbackLabel}
          </div>
        );
      })}
    </div>
  ),
  TmResponsiveTabSelectItem: {},
}));


vi.mock("../../../pages/court-documents/court-register-manager/CourtRegisterPage", () => ({
  __esModule: true,
  default: () => <div>CourtRegisterPage</div>,
}));
vi.mock("../../../pages/court-documents/register-of-control-documents-manager/RegisterOfControlDocumentPage", () => ({
  __esModule: true,
  default: () => <div>RegisterOfControlDocumentPage</div>,
}));
vi.mock("../../../pages/court-results/court-result-manager/CourtResultPage", () => ({
  __esModule: true,
  default: () => <div>CourtResultPage</div>,
}));
vi.mock("../../../pages/court-results/court-result-manager/cancel-contempt-of-court-fee-manager/CancelContemptOfCourtFeePage", () => ({
  __esModule: true,
  default: () => <div>CancelContemptOfCourtFeePage</div>,
}));

const theme = createTheme();

const renderWithRouter = () => {
  return renderWithProviders(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={["/"]}>
        <CourtDocumentsPage />
      </MemoryRouter>
    </ThemeProvider>

  );
};

afterEach(() => {
  cleanup();
});

describe("CourtDocumentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders SecuredContent", () => {
    renderWithRouter();
    expect(screen.getByTestId("secured-content")).toBeInTheDocument();
  });

  //TODO Fix test
  test("renders TmResponsiveTabSelect with all tab items", () => {
    renderWithRouter();
    expect(screen.getByTestId("tab-select")).toBeInTheDocument();
    expect(screen.getByTestId("tab-item-courtRegisterTab")).toHaveTextContent("courtRegister");
    expect(screen.getByTestId("tab-item-controlDocumentsTab")).toHaveTextContent("controlDocuments");
    // expect(screen.getByTestId("tab-item-courtResultsTab")).toHaveTextContent("courtResults");
    // expect(screen.getByTestId("tab-item-cancelContemptOfCourtTab")).toHaveTextContent("cancelContemptOfCourtFee");
  });

  test("renders children in mocked SecuredContent", () => {
    renderWithRouter();
    expect(screen.getByTestId("tab-select")).toBeInTheDocument();
  });

  test("renders mocked TmResponsiveTabSelect component", () => {
    renderWithRouter();
    expect(screen.getByTestId("tab-select")).toBeInTheDocument();
  });
});
