/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import VehicleReweighDialog from "../../../components/cancel-transgression/VehicleReweighDialog";

// Mocks
vi.mock("../../../../framework/components/button/TmButton", () => ({
  __esModule: true,
  default: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} data-testid="mocked-tm-button">
      {children}
    </button>
  ),
}));

vi.mock("@mui/icons-material/Cancel", () => ({
  __esModule: true,
  default: () => <span data-testid="mocked-cancel-icon">X</span>,
}));

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    Dialog: ({ children, open }: any) => (open ? <div data-testid="mock-dialog">{children}</div> : null),
    DialogActions: ({ children }: any) => <div data-testid="mock-dialog-actions">{children}</div>,
    DialogContent: ({ children }: any) => <div data-testid="mock-dialog-content">{children}</div>,
    Grid: ({ children }: any) => <div data-testid="mock-grid">{children}</div>,
    Stack: ({ children }: any) => <div data-testid="mock-stack">{children}</div>,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      reweighDescription: "Mocked reweigh description",
      close: "Mocked close",
    }[key] ?? key),
  }),
}));

describe("VehicleReweighDialog", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(<VehicleReweighDialog isOpen={false} onCancel={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render content when isOpen is true", () => {
    render(<VehicleReweighDialog isOpen={true} onCancel={() => {}} />);
    expect(screen.getByTestId("mock-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("mock-dialog-content")).toHaveTextContent("Mocked reweigh description");
    expect(screen.getByTestId("mocked-tm-button")).toHaveTextContent("Mocked close");
  });

  it("should call onCancel when close button is clicked", () => {
    const onCancelMock = vi.fn();
    render(<VehicleReweighDialog isOpen={true} onCancel={onCancelMock} />);
    fireEvent.click(screen.getByTestId("mocked-tm-button"));
    expect(onCancelMock).toHaveBeenCalled();
  });
});
