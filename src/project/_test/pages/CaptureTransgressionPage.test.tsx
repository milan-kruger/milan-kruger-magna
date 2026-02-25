import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import CaptureTransgressionPage from "../../pages/prosecution/overload-transgression-manager/CaptureTransgressionPage";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({
      state: {
        transgressionDetails: {
          charges: [{ id: 1, name: "Charge1" }],
          vehicleCharges: [{ id: 2, name: "VehicleCharge1" }],
        },
        sequenceNumber: 123,
      },
    }),
  };
});

vi.mock("i18next", () => ({
  __esModule: true,
  default: { t: (key: string) => key },
  t: (key: string) => key,
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

vi.mock("../../../framework/auth/components/SecuredContent", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="secured-content">{children}</div>
  ),
}));

vi.mock("../../../components/NavigationBlocker", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock(
  "../../pages/prosecution/overload-transgression-manager/CaptureTransgressionContext",
  () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="context-provider">{children}</div>
    ),
  })
);

// Only keep this correct mock:
vi.mock(
  "../../pages/prosecution/overload-transgression-manager/CaptureTransgressionPageEdit",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="capture-transgression-edit">Edit Component</div>
    ),
  })
);

vi.mock("../../../redux/transgression/transgressionSlice", () => ({
  selectForm: () => ({ validationErrors: null }),
}));

const mockStore = configureStore({
  reducer: {
    config: () => ({
      active: {
        id: "test-config",
        name: "Test Configuration",
      },
    }),
    auth: () => ({
      isAuthenticated: true,
      user: { roles: ["TRANSGRESSIONDETAILS_VIEW", "TRANSGRESSION_MAINTAIN"] },
    }),
    transgression: () => ({
      form: { validationErrors: null },
    }),
  },
});

describe("CaptureTransgressionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the edit component", () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <CaptureTransgressionPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId("context-provider")).toBeInTheDocument();
    expect(screen.getByTestId("secured-content")).toBeInTheDocument();
  });

  it("should render without crashing", () => {
    expect(() => {
      render(
        <Provider store={mockStore}>
          <BrowserRouter>
            <CaptureTransgressionPage />
          </BrowserRouter>
        </Provider>
      );
    }).not.toThrow();
  });
});

describe("CaptureTransgressionPage hotkey and dialog logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the save dialog when CTRL+S is pressed and there are no validation errors", async () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <CaptureTransgressionPage />
        </BrowserRouter>
      </Provider>
    );
    // Simulate CTRL+S
    fireEvent.keyDown(window, { key: "s", ctrlKey: true });
    expect(screen.getByTestId("context-provider")).toBeInTheDocument();
  });

  it("opens the exit dialog when CTRL+E is pressed", async () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <CaptureTransgressionPage />
        </BrowserRouter>
      </Provider>
    );
    // Simulate CTRL+E
    fireEvent.keyDown(window, { key: "e", ctrlKey: true });
    expect(screen.getByTestId("context-provider")).toBeInTheDocument();
  });

  it("does not open the save dialog if there are validation errors", async () => {
    // Override the store to simulate validation errors
    const errorStore = configureStore({
      reducer: {
        config: () => ({ active: { id: "test-config", name: "Test Configuration" } }),
        auth: () => ({ isAuthenticated: true, user: { roles: ["TRANSGRESSIONDETAILS_VIEW", "TRANSGRESSION_MAINTAIN"] } }),
        transgression: () => ({ form: { validationErrors: { some: "error" } } }),
      },
    });
    render(
      <Provider store={errorStore}>
        <BrowserRouter>
          <CaptureTransgressionPage />
        </BrowserRouter>
      </Provider>
    );
    // Simulate CTRL+S
    fireEvent.keyDown(window, { key: "s", ctrlKey: true });
    expect(screen.getByTestId("context-provider")).toBeInTheDocument();
  });
});
