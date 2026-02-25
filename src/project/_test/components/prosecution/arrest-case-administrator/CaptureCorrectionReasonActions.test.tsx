
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CaptureCorrectionReasonActions from "../../../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonActions";

vi.mock("i18next", () => ({ t: (key: string) => key }));

const onSubmit = vi.fn();
const onCancel = vi.fn();
const renderComponent = (props = {}) => {
    render(
      <CaptureCorrectionReasonActions
        testId={"correction-reason"}
        onSubmit={onSubmit}
        onCancel={onCancel}
        {...props}
      />
    );
    return { onSubmit, onCancel };
  };

describe("CaptureCorrectionReasonActions", () => {

  it("should render both confirm and cancel buttons with correct text and icons", () => {
    renderComponent();

    const confirmBtn = screen.getByTestId("btnCorrection-reasonConfirm");
    const cancelBtn = screen.getByTestId("btnCorrection-reasonCancel");

    expect(confirmBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();
    expect(confirmBtn).toHaveTextContent("confirm");
    expect(cancelBtn).toHaveTextContent("cancel");

    expect(confirmBtn.querySelector("svg")).toBeInTheDocument();
    expect(cancelBtn.querySelector("svg")).toBeInTheDocument();
  });

  it("should call onSubmit when confirm button is clicked", async () => {
    const { onSubmit } = renderComponent();

    const confirmBtn = screen.getByTestId("btnCorrection-reasonConfirm");
    await userEvent.click(confirmBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const { onCancel } = renderComponent();

    const cancelBtn = screen.getByTestId("btnCorrection-reasonCancel");
    await userEvent.click(cancelBtn);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should pass the correct testid props to TmButton", () => {
    renderComponent();

    expect(screen.getByTestId("btnCorrection-reasonConfirm")).toBeInTheDocument();
    expect(screen.getByTestId("btnCorrection-reasonCancel")).toBeInTheDocument();
  });
});
