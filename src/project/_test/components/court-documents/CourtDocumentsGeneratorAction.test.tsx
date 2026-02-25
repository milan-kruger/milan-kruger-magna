import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourtDocumentsGeneratorAction from "../../../components/court-documents/CourtDocumentsGeneratorAction";
import { CourtDocumentsView } from "../../../enum/CourtDocumentsView";

vi.mock("i18next", () => ({
    t: (key: string) => key
}));

const MockOnClick = vi.fn();

const renderComponent = (props = {}) => {
    return render(
        <CourtDocumentsGeneratorAction
            disabled={false}
            onClick={MockOnClick}
            view={CourtDocumentsView.COURT_REGISTER}
            {...props}
        />
    );
}

describe("CourtDocumentsGeneratorAction", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders button with 'generate' text for non-COURT_RESULTS view", () => {
        renderComponent();
        const button = screen.getByTestId("generateCourtDocuments");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("generate");
    });

    it("renders button with 'submit' text for COURT_RESULTS view", () => {
        renderComponent({
            view: CourtDocumentsView.COURT_RESULTS
        });

        const button = screen.getByTestId("generateCourtDocuments");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("submit");
    });

    it("calls onClick when button is clicked", async () => {
        renderComponent();

        await userEvent.click(screen.getByTestId("generateCourtDocuments"));
        expect(MockOnClick).toHaveBeenCalled();
    });

    it("disables button when disabled prop is true", () => {
        renderComponent({
            disabled: true
        });

        expect(screen.getByTestId("generateCourtDocuments")).toBeDisabled();
    });
});
