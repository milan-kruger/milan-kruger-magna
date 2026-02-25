import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CaptureCourtResultsAction from "../../../components/court-results/CaptureCourtResultsAction";
import { FormState } from "../../../redux/capture-court-result/CaptureCourtResultSlice";


const mockOnSubmitResults = vi.fn();
const mockOnCancelCourtResults = vi.fn();
const testIdPrefix = "captureCourt";
const mockForm = vi.fn(() => ({
    isDirty: false, validationErrors: false,
    initialFormData: {}, formData: {}, formValidation: {}
} as FormState));

vi.mock("i18next", () => ({
    t: (key: string) => key
}));



const renderComponent = (props = {}) => {
    return render(
        <CaptureCourtResultsAction
            testIdPrefix={testIdPrefix}
            onSubmitResults={mockOnSubmitResults}
            onCancelCourtResults={mockOnCancelCourtResults}
            form={mockForm()}
            {...props}
        />
    );
};

describe("CaptureCourtResultsAction", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the component", () => {
        const { container } = renderComponent();

        expect(container).toBeInTheDocument();
    });

    it("should render submit and cancel buttons", () => {
        renderComponent();

        expect(screen.getByTestId("captureCourtCourtResults")).toBeInTheDocument();
        expect(screen.getByTestId("captureCourtCourtResultsCancel")).toBeInTheDocument();
    });

    it("should call onSubmitResults when submit button is clicked", async () => {
        renderComponent();

        await userEvent.click(screen.getByTestId("captureCourtCourtResults"));

        expect(mockOnSubmitResults).toHaveBeenCalled();
    });

    it("should call onCancelCourtResults when cancel button is clicked", async () => {
        renderComponent();

        await userEvent.click(screen.getByTestId("captureCourtCourtResultsCancel"));

        expect(mockOnCancelCourtResults).toHaveBeenCalled();
    });

    it("should call onSubmitResults when ALT+S is pressed and form is not dirty and has no validation errors", async () => {
        mockForm.mockReturnValue({ isDirty: false, validationErrors: false,
            initialFormData: {}, formData: {}, formValidation: {} });
        renderComponent();

        await userEvent.keyboard("{Alt>}S{/Alt}");

        expect(mockOnSubmitResults).toHaveBeenCalled();
    });

    it("should call onCancelCourtResults when ALT+C is pressed", async () => {
        renderComponent();

        await userEvent.keyboard("{Alt>}C{/Alt}");

        expect(mockOnCancelCourtResults).toHaveBeenCalled();
    });

    it("should disable submit button if form is dirty", () => {
        mockForm.mockReturnValue({ isDirty: true, validationErrors: false,
            initialFormData: {}, formData: {}, formValidation: {} });
        renderComponent();

        expect(screen.getByTestId("captureCourtCourtResults")).toBeDisabled();
    });

    it("should disable submit button if form has validation errors", () => {
        mockForm.mockReturnValue({ isDirty: false, validationErrors: true,
            initialFormData: {}, formData: {}, formValidation: {} });
        renderComponent();

        expect(screen.getByTestId("captureCourtCourtResults")).toBeDisabled();
    });
});
