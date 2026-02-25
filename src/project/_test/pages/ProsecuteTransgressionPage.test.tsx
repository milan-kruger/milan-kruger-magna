import { cleanup, screen } from "@testing-library/react";
import ProsecuteTransgressionPage from "../../pages/prosecution/prosecute-transgression/ProsecuteTransgressionPage";
import { MemoryRouter } from "react-router-dom";
import useProsecuteTransgressionMananger from "../../hooks/prosecution/ProsecuteTransgressionManager";
import { createTheme, ThemeProvider } from "@mui/material";
import { renderWithProviders } from "../mocks/MockStore";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockSetCallback = vi.fn();

vi.mock("../../../framework/components/progress/TmLoadingSpinner", () => ({
  default: ({ testid }: { testid: string }) => <div data-testid={testid}>Loading...</div>
}));

vi.mock("../../../framework/auth/components/SecuredContent", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
});

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch
  };
});


const baseMock = {
  isLoading: false
}

vi.mock("../../hooks/prosecution/ProsecuteTransgressionManager", () => ({
  __esModule: true,
  default: vi.fn(() => ({ ...baseMock })),
}));


const mockedUseProsecuteTransgressionMananger = vi.mocked(useProsecuteTransgressionMananger);

const theme = createTheme();

const renderComponent = () => {
  return renderWithProviders(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ProsecuteTransgressionPage />
      </MemoryRouter>
    </ThemeProvider>

  );
};

afterEach(() => {
  cleanup();
});

describe("ProsecuteTransgressionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const cb = vi.fn();
    mockSetCallback.mockImplementation(() => { });
    mockSetCallback("prosecuteTransgressionPageCallback", cb);
  })

  it("registers error callback on mount", () => {
    renderComponent();
    expect(mockSetCallback).toHaveBeenCalledWith("prosecuteTransgressionPageCallback", expect.any(Function));
  });


  it("renders spinner when loading", () => {
    mockedUseProsecuteTransgressionMananger.mockReturnValueOnce({
      ...baseMock,
      isLoading: true
    })
    renderComponent();
    expect(screen.getByTestId("prosecuteLoadingSpinner")).toBeInTheDocument();
  });

  it("does not render spinner when not loading", () => {
    mockedUseProsecuteTransgressionMananger.mockReturnValueOnce({
      ...baseMock,
      isLoading: false
    })
    renderComponent();
    expect(screen.queryByTestId("prosecuteLoadingSpinner")).toBeNull();
  });
});
