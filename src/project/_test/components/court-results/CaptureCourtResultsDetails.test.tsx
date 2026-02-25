import { cleanup, screen } from "@testing-library/react";
import CaptureCourtResultsDetails from "../../../components/court-results/CaptureCourtResultsDetails";
import { render } from "vitest-browser-react";
import { CourtResult } from "../../../redux/api/transgressionsApi";

vi.mock('../../../../framework/utils', () => ({
    default: vi.fn((str: string) => {
        if (!str) return '';
        return str.replace(/_/g, ' ').replace(/[()]/g, '').trim();
    }),
    toCamelCaseWords: vi.fn((...words: string[]) => {
        return words.filter(Boolean).join('');
    })
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

const mockTransgressionDetails = {
    noticeNumber: "TRG123456",
    offenderName: "John Doe",
    plateNumber: "ABC123",
    identificationNumber: "ID987654"
};

const mockCourtResult: CourtResult = {
  courtResultId: "CR-2024-001789",
  noticeNumber: "TN240156789",
  courtOutcome: "GUILTY",
  caseNumber: "CASE-2024/789",
  plateNumber: "ABC123GP",
  offenderName: "John Smith",
  newCourtDate: undefined,
  courtDate: "2024-03-15T09:00:00Z",
  courtName: "Johannesburg Magistrate Court",
  courtRoom: "Court Room 3A",
  identificationNumber: "8501015800080",
  transgressionStatus: "PAID",
  amountPaid: {
    amount: 1500.00,
    currency: "ZAR"
  },
  reason: "Speeding violation - 80km/h in 60km/h zone",
  receiptNumber: "RCP240789456",
  sentence: "Fine of R1,500",
  sentenceType: "MONETARY_FINE",
  paymentMethod: "CREDIT_CARD",
  sentenceLength: undefined,
  warrantNumber: undefined,
  sentenceTimePeriod: undefined,
  contemptOfCourtFee: undefined,
  snapshotCharges: [
    {
      type: "SnapshotLoadCharge",
      chargeId: "CHG-LD-002",
      snapshotId: "SNAP-123",
      chargeCode: "LOAD-001",
      chargeShortDescription: "Overload on GVM",
      fineAmount: {
        amount: 1500,
        currency: "ZAR"
      },
      plateNumber: "ABC123GP",
      vehicleCategory: "GOODS_VEHICLE",
      vehicleType: "TRUCK",
      combinationVehicle: false,
      vehicleUsage: "COMMERCIAL",
      articulatedVehicle: false,
      axleUnit: false,
      numberOfAxles: "2",
      tyreType: "STANDARD",
      numberOfTyres: "6",
      permissible: 12000,
      minValue: 12000,
      maxValue: 15000,
      chargeCategory: "GVM_WEIGH_TEST"
    }
  ]
};

const mockSx = { padding: 2 };

const renderComponent = async (props = {}) => {
    const defaultProps = {
        transgressionDetails: mockTransgressionDetails,
        sx: mockSx
    };

    return render(
        <CaptureCourtResultsDetails {...defaultProps} {...props} />
    );
};

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("CaptureCourtResultsDetails", () => {

    afterAll(() => {
        vi.resetAllMocks();
    });

    describe("Rendering", () => {
        it("should render all fields with values", async () => {
            await renderComponent();

            expect(screen.getByText("TRG123456")).toBeInTheDocument();
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("ABC123")).toBeInTheDocument();
            expect(screen.getByText("ID987654")).toBeInTheDocument();
        });

        it("should render transgression details when only transgressionDetails prop is provided", async () => {
            await renderComponent();

            expect(screen.getByTestId("editHeadingnoticeNo")).toHaveTextContent("TRG123456");
            expect(screen.getByTestId("editHeadingoffenderName")).toHaveTextContent("John Doe");
            expect(screen.getByTestId("editHeadingplateNo")).toHaveTextContent("ABC123");
            expect(screen.getByTestId("editHeadingidentificationNo")).toHaveTextContent("ID987654");
        });

        it("should prioritize courtResult data over transgressionDetails for overlapping fields", async () => {
            await renderComponent({ courtResult: mockCourtResult });

            expect(screen.getByTestId("editHeadingnoticeNo")).toHaveTextContent("TN240156789");
            expect(screen.getByTestId("editHeadingoffenderName")).toHaveTextContent("John Smith");
            expect(screen.getByTestId("editHeadingplateNo")).toHaveTextContent("ABC123GP");
            expect(screen.getByTestId("editHeadingidentificationNo")).toHaveTextContent("ID987654");
        });

        it("should render without transgressionDetails", async () => {
            const { container } = await renderComponent({ transgressionDetails: undefined });

            const gridContainer = container.querySelector('.MuiGrid-container');
            expect(gridContainer).toBeInTheDocument();

            const gridItems = gridContainer?.querySelectorAll('.MuiGrid-root') || [];
            expect(gridItems.length).toBeGreaterThanOrEqual(4);
        });

        it("should render with only courtResult", async () => {
            await renderComponent({
                transgressionDetails: undefined,
                courtResult: mockCourtResult
            });

            expect(screen.getByTestId("editHeadingnoticeNo")).toHaveTextContent("TN240156789");
            expect(screen.getByTestId("editHeadingoffenderName")).toHaveTextContent("John Smith");
            expect(screen.getByTestId("editHeadingplateNo")).toHaveTextContent("ABC123GP");
        });
    });

    describe("Responsive behavior", () => {
        it("should render in row layout on desktop", () => {
            renderComponent();

            const stacks = document.querySelectorAll('.MuiStack-root');
            expect(stacks.length).toBeGreaterThan(0);
            expect(window.getComputedStyle(stacks[0]).flexDirection).toBe('row');
        });

        it("should render in column layout on mobile", async () => {
            const { useMediaQuery } = await import("@mui/material");
            (useMediaQuery as jest.Mock).mockReturnValue(true);

            renderComponent();

            const stacks = document.querySelectorAll('.MuiStack-root');
            expect(stacks.length).toBeGreaterThan(0);
            expect(window.getComputedStyle(stacks[0]).flexDirection).toBe('column');
        });
    });

    describe("Test IDs", () => {
        it("should have correct test IDs for all label elements", async () => {
            await renderComponent();

            const editHeadings = screen.getAllByTestId("editHeading");
            expect(editHeadings).toHaveLength(4);
        });

        it("should have correct test IDs for all value elements", async () => {
            await renderComponent();

            expect(screen.getByTestId("editHeadingnoticeNo")).toBeInTheDocument();
            expect(screen.getByTestId("editHeadingoffenderName")).toBeInTheDocument();
            expect(screen.getByTestId("editHeadingplateNo")).toBeInTheDocument();
            expect(screen.getByTestId("editHeadingidentificationNo")).toBeInTheDocument();
        });
    });

    describe("Edge cases", () => {
        it("should handle empty string values", async () => {
            const emptyDetails = {
                noticeNumber: "",
                offenderName: "",
                plateNumber: "",
                identificationNumber: ""
            };

            await renderComponent({ transgressionDetails: emptyDetails });

            expect(screen.getByTestId("editHeadingnoticeNo")).toHaveTextContent("");
            expect(screen.getByTestId("editHeadingoffenderName")).toHaveTextContent("");
            expect(screen.getByTestId("editHeadingplateNo")).toHaveTextContent("");
            expect(screen.getByTestId("editHeadingidentificationNo")).toHaveTextContent("");
        });

        it("should handle partial courtResult data", async () => {
            const partialCourtResult: Partial<CourtResult> = {
                noticeNumber: "PARTIAL123",
                offenderName: undefined,
                plateNumber: undefined
            };

            await renderComponent({ courtResult: partialCourtResult as CourtResult });

            expect(screen.getByTestId("editHeadingnoticeNo")).toHaveTextContent("PARTIAL123");
            expect(screen.getByTestId("editHeadingoffenderName")).toHaveTextContent("John Doe");
            expect(screen.getByTestId("editHeadingplateNo")).toHaveTextContent("ABC123");
        });

        it("should apply custom sx styles", async () => {
            const customSx = { margin: 4, backgroundColor: "red" };
            const { container } = await renderComponent({ sx: customSx });

            const gridContainer = container.querySelector(".MuiGrid-container");
            expect(gridContainer).toBeTruthy();
        });

        it("should handle courtResult with undefined fields falling back to transgressionDetails", async () => {
            const incompleteCourtResult: CourtResult = {
                ...mockCourtResult,
                noticeNumber: "",
                offenderName: undefined,
                plateNumber: ""
            };

            await renderComponent({ courtResult: incompleteCourtResult });

            expect(screen.getByTestId("editHeadingnoticeNo")).toHaveTextContent("TRG123456");
            expect(screen.getByTestId("editHeadingoffenderName")).toHaveTextContent("John Doe");
            expect(screen.getByTestId("editHeadingplateNo")).toHaveTextContent("ABC123");
            expect(screen.getByTestId("editHeadingidentificationNo")).toHaveTextContent("ID987654");
        });

        it("should handle all undefined values", async () => {
            const emptyCourtResult: CourtResult = {
                ...mockCourtResult,
                noticeNumber: "",
                offenderName: undefined,
                plateNumber: ""
            };

            await renderComponent({
                courtResult: emptyCourtResult,
                transgressionDetails: {
                    noticeNumber: "",
                    offenderName: "",
                    plateNumber: "",
                    identificationNumber: ""
                }
            });

            expect(screen.getByTestId("editHeadingnoticeNo")).toHaveTextContent("");
            expect(screen.getByTestId("editHeadingoffenderName")).toHaveTextContent("");
            expect(screen.getByTestId("editHeadingplateNo")).toHaveTextContent("");
            expect(screen.getByTestId("editHeadingidentificationNo")).toHaveTextContent("");
        });
    });
});
