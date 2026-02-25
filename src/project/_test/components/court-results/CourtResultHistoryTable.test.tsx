import { render, screen, fireEvent } from "@testing-library/react";
import CourtResultHistoryTable, { CourtResultHistoryListData } from "../../../components/court-results/CourtResultHistoryTable";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

const rows: CourtResultHistoryListData[] = [
    {
        courtDate: "2025-07-30",
        courtName: "Pretoria High Court",
        noticeNo: "N1234",
        plateNo: "XYZ123GP",
        offenderName: "John Doe",
        status: "Guilty",
        courtResult: "Guilty"
    },
    {
        courtDate: "2025-07-29",
        courtName: "Johannesburg Court",
        noticeNo: "N5678",
        plateNo: "ABC987GP",
        offenderName: "Jane Smith",
        status: "Withdrawn",
        courtResult: "Withdrawn"
    }
];
const onRowClick = vi.fn();

const renderComponent = (props = {}) => {
    return render(
        <CourtResultHistoryTable
            rows={[]}
            searchValue=""
            onRowClick={vi.fn()}
            {...props}
        />
    );
}

describe("CourtResultHistoryTable", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders table rows and headers", () => {
        renderComponent({ rows });

        expect(screen.getByText("courtDate")).toBeInTheDocument();
        expect(screen.getByText("Pretoria High Court")).toBeInTheDocument();
        expect(screen.getByText("N1234")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("filters rows by searchValue", () => {
        renderComponent({ rows, searchValue: "Jane" });

        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("calls onRowClick when a row is clicked", () => {
        renderComponent({ rows, onRowClick });

        const row = screen.getByText("N1234").closest("tr");
        fireEvent.click(row!);

        expect(onRowClick).toHaveBeenCalledWith("N1234");
    });

    it("sorts rows when header is clicked", () => {
        renderComponent({ rows, onRowClick });

        const header = screen.getByText("courtDate");
        fireEvent.click(header); // sort asc
        fireEvent.click(header); // sort desc
        // After two clicks, the first row should be the latest date
        const firstRow = screen.getAllByRole("row")[1];

        expect(firstRow).toHaveTextContent("2025-07-30");
    });
});
