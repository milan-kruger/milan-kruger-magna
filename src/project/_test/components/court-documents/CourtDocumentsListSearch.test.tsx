import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourtDocumentsListSearch from "../../../components/court-documents/CourtDocumentsListSearch";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock("../../../../framework/components/list/TmSearch", () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ testid, onDebouncedChange }: any) => (
        <input data-testid={testid} onChange={e => onDebouncedChange(e.target.value)} />
    )
}));

const mockOnSearchValue = vi.fn();
const mockOnClickButton = vi.fn();

const renderComponent = (props = {}) => {
    return render(
        <CourtDocumentsListSearch
            onSearchValue={mockOnSearchValue}
            onClickButton={mockOnClickButton}
            buttonHeading="View History"
            disableButton={false}
            {...props}
        />
    );
}

describe("CourtDocumentsListSearch", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders search input and button", () => {
        renderComponent();

        expect(screen.getByTestId("searchCourtCase")).toBeInTheDocument();
        expect(screen.getByTestId("viewCaseListHistory")).toBeInTheDocument();
        expect(screen.getByTestId("viewCaseListHistory")).toHaveTextContent("View History");
    });

    it("calls onSearchValue when search input changes", async () => {
        renderComponent();
        const searchInput = screen.getByTestId("searchCourtCase");

        await userEvent.type(searchInput, "case123");

        expect(mockOnSearchValue).toHaveBeenCalledWith("case123");
    });

    it("calls onClickButton when button is clicked", async () => {
        renderComponent();

        await userEvent.click(screen.getByTestId("viewCaseListHistory"));

        expect(mockOnClickButton).toHaveBeenCalled();
    });

    it("disables button when disableButton is true", () => {
        renderComponent({ disableButton: true });

        expect(screen.getByTestId("viewCaseListHistory")).toBeDisabled();
    });
});
