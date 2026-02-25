import { render, screen, fireEvent } from "@testing-library/react";
import TransgressionHistoryTable from "../../../components/transgression-history/TransgressionHistoryTable";

vi.mock("@mui/material", async () => {
    const actual = await vi.importActual("@mui/material");
    return {
        ...actual,
        useMediaQuery: () => false,
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("../../../../project/components/submission/TransgressionView", () => ({
    default: () => <div data-testid="TransgressionView">Mocked TransgressionView</div>,
}));

vi.mock("../../../../framework/components/button/TmButton", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children, ...props }: any) => <button data-testid="closeButton" {...props}>{children}</button>,
}));

vi.mock("../../../../framework/components/progress/TmLoadingSpinner", () => ({
    default: () => <div data-testid="TmLoadingSpinner">Loading...</div>,
}));

// Mock hook
const mockUseTransgressionHistoryManager = vi.fn();
vi.mock("../../../../project/hooks/transgression-history/TransgressionHistoryManager", () => ({
    __esModule: true,
    default: () => mockUseTransgressionHistoryManager(),
}));

const sampleRows = [
    {
        noticeNo: "A123",
        dateTime: "2025-01-01T12:00:00",
        doneBy: "Officer A",
        authorisedBy: "Chief A",
        transgressionVersion: 1,
        status: "Closed",
        comment: "Some comment",
    },
];

const sampleEntries = [
    {
        noticeNo: "A123",
        version: 1,
        status: "Closed",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

describe("TransgressionHistoryTable", () => {
    const baseMock = {
        page: 0,
        setPage: vi.fn(),
        rowsPerPage: 5,
        setRowsPerPage: vi.fn(),
        viewTransgression: false,
        setViewTransgression: vi.fn(),
        onNextEntry: vi.fn(),
        onPreviousEntry: vi.fn(),
        onSelectedEntry: vi.fn(),
        isLoading: false,
        selectedVersionNo: 1,
        selectedTransgression: null,
        previousData: null,
        selectedHistoryEntry: null,
        selectedHistoryEntryIndex: 0,
        hasFieldUpdates: false,
        findTransgressionConfigurationResponse: {
            transgressionConfigurations: [{}],
        },
    };

    beforeEach(() => {
        mockUseTransgressionHistoryManager.mockReturnValue({ ...baseMock });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders table with rows", () => {
        render(<TransgressionHistoryTable rows={sampleRows} entries={sampleEntries} />);
        expect(screen.getByText("noticeNo")).toBeInTheDocument();
        expect(screen.getByText("A123")).toBeInTheDocument();
        expect(screen.getByText("Closed")).toBeInTheDocument();
    });

    it("opens transgression dialog when viewTransgression is true", async () => {
        mockUseTransgressionHistoryManager.mockReturnValueOnce({
            ...baseMock,
            viewTransgression: true,
            isLoading: false,
            selectedTransgression: {},
        });

        render(<TransgressionHistoryTable rows={sampleRows} entries={sampleEntries} />);
        expect(await screen.findByTestId("TransgressionView")).toBeInTheDocument();
        expect(await screen.findByTestId("closeButton")).toBeInTheDocument();
    });

    it("shows loading spinner when isLoading is true", () => {
        mockUseTransgressionHistoryManager.mockReturnValueOnce({
            ...baseMock,
            viewTransgression: true,
            isLoading: true,
        });

        render(<TransgressionHistoryTable rows={sampleRows} entries={sampleEntries} />);
        expect(screen.getByTestId("TmLoadingSpinner")).toBeInTheDocument();
    });

    it("calls onSelectedEntry when a row is clicked", () => {
        const onSelectedEntry = vi.fn();
        mockUseTransgressionHistoryManager.mockReturnValueOnce({
            ...baseMock,
            onSelectedEntry,
        });

        render(<TransgressionHistoryTable rows={sampleRows} entries={sampleEntries} />);
        fireEvent.click(screen.getByText("A123"));
        expect(onSelectedEntry).toHaveBeenCalledWith("A123", 1, 0);
    });
});
