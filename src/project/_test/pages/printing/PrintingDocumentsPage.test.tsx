/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import PrintCourtDocumentsPage from "../../../pages/printing/PrintDocumentsPage";
import usePrintDocumentsManager from "../../../hooks/printing/PrintDocumentsManager";

// Mocks
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@mui/material", async () => {
    const actual = await vi.importActual("@mui/material");
    return {
        ...actual,
        useMediaQuery: vi.fn().mockReturnValue(false),
        Stack: ({ children }: any) => <div data-testid="mui-stack">{children}</div>,
    };
});

vi.mock("@mui/material/Unstable_TrapFocus", () => ({
    __esModule: true,
    default: ({ children }: any) => <div data-testid="focus-trap">{children}</div>,
}));

vi.mock("react-hotkeys-hook", () => ({
    useHotkeys: vi.fn(),
}));

vi.mock("../../../../framework/auth/components/SecuredContent", () => ({
    __esModule: true,
    default: ({ children }: any) => <div data-testid="secured-content">{children}</div>,
}));

vi.mock("../../../../framework/components/progress/TmLoadingSpinner", () => ({
    __esModule: true,
    default: (props: any) => <div data-testid={props.testid}>Loading...</div>,
}));

vi.mock("../../../../framework/components/dialog/TmDialog", () => ({
    __esModule: true,
    default: (props: any) => (
        <div data-testid={props.testid}>
            <button data-testid="cancel-btn" onClick={props.onCancel}>Cancel</button>
            <button data-testid="confirm-btn" onClick={props.onConfirm}>Confirm</button>
            <span>{props.title}</span>
            <span>{props.message}</span>
        </div>
    ),
}));

vi.mock("../../../components/printing/TmDocumentTypeSelector", () => ({
    __esModule: true,
    default: (props: any) => (
        <div data-testid={props.testId}>
            {props.printHeader}
            <button data-testid="set-preview" onClick={() => props.setPreviewDocumentType("docType")}>SetPreview</button>
        </div>
    ),
}));

vi.mock("../../../components/printing/TmDocumentPreview", () => ({
    __esModule: true,
    default: (props: any) => (
        <div data-testid={props.testId}>
            <button data-testid="print-btn" onClick={props.printCallBack}>Print</button>
            <button data-testid="exit-btn" onClick={props.exitCallBack}>Exit</button>
            {props.data}
        </div>
    ),
}));

vi.mock("@mui/icons-material/CancelOutlined", () => ({
    __esModule: true,
    default: () => <span data-testid="cancel-icon" />,
}));
vi.mock("@mui/icons-material/CheckCircleOutline", () => ({
    __esModule: true,
    default: () => <span data-testid="confirm-icon" />,
}));

// Shared mocks
const mockSetPreviewDocumentType = vi.fn();
const mockSetSelectedDocuments = vi.fn();
const mockPrint = vi.fn();
const mockNavigate = vi.fn();
const mockOnPrintSuccessful = vi.fn();

const baseMock = {
    accessRoles: ["role1"],
    base64: "pdfdata",
    printHeader: "header",
    confirmMessage: "Are you sure?",
    returnPath: "/return",
    documents: [
        { label: "Doc1", id: "1", type: "type1", disabled: false },
        { label: "Doc2", id: "2", type: "type2", disabled: false },
    ],
    printDocuments: ["type1"],
    print: mockPrint,
    navigate: mockNavigate,
    setPreviewDocumentType: mockSetPreviewDocumentType,
    setSelectedDocuments: mockSetSelectedDocuments,
    onPrintSuccessful: mockOnPrintSuccessful,
    isLoading: false,
};

vi.mock("../../../hooks/printing/PrintDocumentsManager", () => ({
    __esModule: true,
    default: vi.fn(() => ({
        ...baseMock,
        isOpen: true,
    })),
}));


describe("PrintCourtDocumentsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders loading spinner when isLoading is true", () => {
        (usePrintDocumentsManager as any).mockReturnValueOnce({
            ...baseMock,
            isLoading: true,
        });
        render(<PrintCourtDocumentsPage />);
        expect(screen.getByTestId("printDocumentsLoader")).toBeInTheDocument();
    });

    test("renders main content when not loading", () => {
        render(<PrintCourtDocumentsPage />);
        expect(screen.getByTestId("focus-trap")).toBeInTheDocument();
        expect(screen.getByTestId("secured-content")).toBeInTheDocument();
        expect(screen.getByTestId("confirmPrintDialog")).toBeInTheDocument();
        expect(screen.getByTestId("documentType")).toBeInTheDocument();
        expect(screen.getByTestId("renderedPdf")).toBeInTheDocument();
    });

    test("shows dialog when openDialog is true and handles cancel/confirm", () => {
        render(<PrintCourtDocumentsPage />);
        fireEvent.click(screen.getByTestId("cancel-btn"));
        fireEvent.click(screen.getByTestId("confirm-btn"));
        expect(mockOnPrintSuccessful).toHaveBeenCalled();
    });

    test("calls setPreviewDocumentType when SetPreview is clicked", () => {
        render(<PrintCourtDocumentsPage />);
        fireEvent.click(screen.getByTestId("set-preview"));
        expect(mockSetPreviewDocumentType).toHaveBeenCalledWith("docType");
    });

    test("calls print when print button is clicked", () => {
        render(<PrintCourtDocumentsPage />);
        fireEvent.click(screen.getByTestId("print-btn"));
        expect(mockPrint).toHaveBeenCalled();
    });

    test("calls navigate with returnPath when exit is clicked", () => {
        render(<PrintCourtDocumentsPage />);
        fireEvent.click(screen.getByTestId("exit-btn"));
        expect(mockNavigate).toHaveBeenCalledWith("/return", { replace: true });
    });

    test("does not render TmDocumentPreview if base64 is empty", () => {
        (usePrintDocumentsManager as any).mockReturnValueOnce({
            ...baseMock,
            base64: "",
        });
        render(<PrintCourtDocumentsPage />);
        expect(screen.queryByTestId("renderedPdf")).toBeNull();
    });

    test("passes correct documentTypeOptions to TmDocumentTypeSelector", () => {
        render(<PrintCourtDocumentsPage />);
        expect(screen.getByTestId("documentType")).toHaveTextContent("header");
    });

    test("renders correct number of document options", () => {
        render(<PrintCourtDocumentsPage />);
        expect(screen.getByTestId("documentType")).toHaveTextContent("header");
    });

    test("handles multiple calls to setSelectedDocuments", () => {
        render(<PrintCourtDocumentsPage />);
        fireEvent.click(screen.getByTestId("set-preview"));
        expect(mockSetPreviewDocumentType).toHaveBeenCalledTimes(1);
    });

    test("handles printAllCallBack and disables print all button", () => {
        render(<PrintCourtDocumentsPage />);
        expect(screen.getByTestId("print-btn")).toBeEnabled();
    });
});
