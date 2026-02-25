import { render, screen, fireEvent } from "@testing-library/react";
import dayjs from "dayjs";
import CaptureCourtResults from "../../../components/court-results/CaptureCourtResults";
import { MockData } from "../../mocks/MockData";
import { useAppSelector } from "../../../../framework/redux/hooks";
import { OverloadTransgression } from "../../../redux/api/transgressionsApi";

// Mock dependencies
vi.mock("../../../../framework/redux/hooks", () => ({
    useAppSelector: vi.fn(),
}));

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

// Mocking child components
vi.mock("../../../../project/components/court-results/CaptureCourtResultsDetails", () => ({
    __esModule: true,
    default: vi.fn(() => <div>CaptureCourtResultsDetails</div>),
}));

vi.mock("../../../../project/components/court-results/CaptureCourtResultsForm", () => ({
    __esModule: true,
    default: vi.fn(() => <div>CaptureCourtResultsForm</div>),
}));

vi.mock("../../../../project/components/court-results/CaptureCourtResultsAction", () => ({
    __esModule: true,
    default: vi.fn(({ onSubmitResults, onCancelCourtResults }) => (
        <div data-testid="CaptureCourtResultsAction">
            <button onClick={onSubmitResults}>Submit</button>
            <button onClick={onCancelCourtResults}>Cancel</button>
        </div>
    )),
}));

describe("CaptureCourtResults", () => {
    const mockOnSubmitResults = vi.fn();
    const mockOnCancelCourtResults = vi.fn();

    const mockTransgressionDetails = {
        ...MockData.getTransgression,
        type: "OverloadTransgression"
    } as OverloadTransgression;

    const mockCourtDateList = [dayjs("2025-07-28"), dayjs("2025-08-10")];
    const mockContemptOfCourtFee = { amount: 300, currency: "USD" };

    beforeEach(() => {
        vi.mocked(useAppSelector).mockReturnValue({});
    });

    it("should render the component correctly", () => {
        render(
            <CaptureCourtResults
                transgressionDetails={mockTransgressionDetails}
                onSubmitResults={mockOnSubmitResults}
                onCancelCourtResults={mockOnCancelCourtResults}
                showWarrantNumber={true}
                courtDateList={mockCourtDateList}
                contemptOfCourtFee={mockContemptOfCourtFee}
            />
        );

        // Verify that the components and elements are rendered
        expect(screen.getByText("CaptureCourtResultsDetails")).toBeInTheDocument();
        expect(screen.getByText("CaptureCourtResultsForm")).toBeInTheDocument();
        expect(screen.getByTestId("CaptureCourtResultsAction")).toBeInTheDocument();
    });

    it("should call onSubmitResults when the submit button is clicked", async () => {
        render(
            <CaptureCourtResults
                transgressionDetails={mockTransgressionDetails}
                onSubmitResults={mockOnSubmitResults}
                onCancelCourtResults={mockOnCancelCourtResults}
                showWarrantNumber={true}
                courtDateList={mockCourtDateList}
                contemptOfCourtFee={mockContemptOfCourtFee}
            />
        );

        // Find the submit button inside CaptureCourtResultsAction and fire the click event
        const submitButton = screen.getByText("Submit"); // The button text should match exactly
        fireEvent.click(submitButton);

        // Ensure that the onSubmitResults function is called
        expect(mockOnSubmitResults).toHaveBeenCalledTimes(1);
    });

    it("should call onCancelCourtResults when cancel is triggered", async () => {
        render(
            <CaptureCourtResults
                transgressionDetails={mockTransgressionDetails}
                onSubmitResults={mockOnSubmitResults}
                onCancelCourtResults={mockOnCancelCourtResults}
                showWarrantNumber={true}
                courtDateList={mockCourtDateList}
                contemptOfCourtFee={mockContemptOfCourtFee}
            />
        );

        // Find the cancel button inside CaptureCourtResultsAction and fire the click event
        const cancelButton = screen.getByText("Cancel"); // The button text should match exactly
        fireEvent.click(cancelButton);

        // Ensure that the onCancelCourtResults function is called
        expect(mockOnCancelCourtResults).toHaveBeenCalledTimes(1);
    });
});
