import '../../mocks/i18next.vi.mock';

import { render, screen, fireEvent } from "@testing-library/react";
import RegisterOfControlDocumentPage from "../../../pages/court-documents/register-of-control-documents-manager/RegisterOfControlDocumentPage";

// Mock MUI icons
vi.mock('@mui/icons-material/CancelOutlined', () => ({
    __esModule: true,
    default: () => <div data-testid="cancel-icon" />,
}));

// Mock CourtDocumentsGenerator
vi.mock("../../../components/court-documents/CourtDocumentsGenerator", () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => (
        <div data-testid="court-documents-generator">
            <div>{props.heading ?? "controlDocumentsHeading"}</div>
            <div>{props.subHeading ?? "controlDocumentsSubHeading"}</div>
            <button onClick={props.handleGenerateDocuments} data-testid="generate-btn">
                Generate
            </button>
        </div>
    ),
}));

// Mock TmDialog
vi.mock("../../../../framework/components/dialog/TmDialog", () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) =>
        props.isOpen ? (
            <div data-testid={props.testid ?? "transgressionsNotFoundDialog"}>
                <div>{props.message ?? "noTransgressionsFound"}</div>
                <button data-testid="cancel-btn" onClick={props.onCancel}>
                    {props.cancelLabel ?? "Cancel"}
                    {props.cancelIcon}
                </button>
            </div>
        ) : null,
}));

// Mock enum
vi.mock("../../../enum/CourtDocumentsView", () => ({
    CourtDocumentsView: { CONTROL_DOCUMENTS: "CONTROL_DOCUMENTS" },
}));

// Mock hook
const mockSetShowTransgressionsNotFoundDialog = vi.fn();
const mockGenerateRegisterOfControlDocuments = vi.fn();

vi.mock("../../../hooks/court-documents/RegisterOfControlDocumentsManager", () => ({
    __esModule: true,
    default: () => ({
        isLoading: false,
        generateRegisterOfControlDocuments: mockGenerateRegisterOfControlDocuments,
        adjudicationTimeFence: "2024-01-01",
        courtNameList: ["Court A", "Court B"],
        courts: [{ id: 1, name: "Court A" }],
        showNoCourtRegisterFound: false,
        showTransgressionsNotFoundDialog: true,
        setShowTransgressionsNotFoundDialog: mockSetShowTransgressionsNotFoundDialog,
    }),
}));

// Capture props in a variable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let receivedGeneratorProps: any;

vi.mock("../../../components/court-documents/CourtDocumentsGenerator", () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => {
        receivedGeneratorProps = props; // Save for inspection
        return (
            <div data-testid="court-documents-generator">
                <div>{props.heading ?? "controlDocumentsHeading"}</div>
                <div>{props.subHeading ?? "controlDocumentsSubHeading"}</div>
                <button onClick={props.handleGenerateDocuments} data-testid="generate-btn">
                    Generate
                </button>
            </div>
        );
    },
}));

describe("RegisterOfControlDocumentPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders CourtDocumentsGenerator with correct headings", () => {
        render(<RegisterOfControlDocumentPage />);
        expect(screen.getByTestId("court-documents-generator")).toBeInTheDocument();
        expect(screen.getByText("controlDocumentsHeading")).toBeInTheDocument();
        expect(screen.getByText("controlDocumentsSubHeading")).toBeInTheDocument();
    });

    test("calls generateRegisterOfControlDocuments when generate button is clicked", () => {
        render(<RegisterOfControlDocumentPage />);
        fireEvent.click(screen.getByTestId("generate-btn"));
        expect(mockGenerateRegisterOfControlDocuments).toHaveBeenCalled();
    });

    test("renders TmDialog when showTransgressionsNotFoundDialog is true", () => {
        render(<RegisterOfControlDocumentPage />);
        expect(screen.getByTestId("transgressionsNotFoundDialog")).toBeInTheDocument();
        expect(screen.getByText("noTransgressionsFound")).toBeInTheDocument();
        expect(screen.getByTestId("cancel-btn")).toBeInTheDocument();
        expect(screen.getByTestId("cancel-icon")).toBeInTheDocument();
    });

    test("calls setShowTransgressionsNotFoundDialog(false) when cancel is clicked", () => {
        render(<RegisterOfControlDocumentPage />);
        fireEvent.click(screen.getByTestId("cancel-btn"));
        expect(mockSetShowTransgressionsNotFoundDialog).toHaveBeenCalledWith(false);
    });

    test("passes correct props from the manager to CourtDocumentsGenerator", () => {
        render(<RegisterOfControlDocumentPage />);

        expect(receivedGeneratorProps.isLoading).toBe(false);
        expect(receivedGeneratorProps.adjudicationTimeFence).toBe("2024-01-01");
        expect(receivedGeneratorProps.courtNameList).toEqual(["Court A", "Court B"]);
        expect(receivedGeneratorProps.courts).toEqual([{ id: 1, name: "Court A" }]);
        expect(receivedGeneratorProps.showNoCourtRegisterFound).toBe(false);
    });
});
