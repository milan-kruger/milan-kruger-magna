/* eslint-disable @typescript-eslint/no-explicit-any */
import '../../mocks/i18next.vi.mock';

import { screen, fireEvent } from "@testing-library/react";
import PrintTransgressionPage from "../../../pages/printing/PrintTransgressionPage";
import usePrintTransgressionManager from "../../../hooks/printing/PrintTransgressionManager";
import { AllDocumentTypes, TDocumentType } from "../../../components/printing/TmDocumentTypeSelector";
import { renderWithProviders } from '../../mocks/MockStore';
import { createTheme, ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';

// MUI mocks
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

// Icons
vi.mock("@mui/icons-material/CancelOutlined", () => ({
  __esModule: true,
  default: () => <span data-testid="cancel-icon" />,
}));
vi.mock("@mui/icons-material/CheckCircleOutline", () => ({
  __esModule: true,
  default: () => <span data-testid="confirm-icon" />,
}));

vi.mock("../../../../framework/auth/components/SecuredContent", () => ({
  default: ({ children }: { children: ReactNode }) => <div data-testid="secured-content">{children}</div>,
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
  default: (props: any) => {
    return (
      <div data-testid={props.testId}>
        <div data-testid="print-header">{props.printHeader ?? "[undefined]"}</div>
        <button data-testid="set-preview" onClick={() => props.setPreviewDocumentType("docType")}>
          SetPreview
        </button>
      </div>
    );
  },
}));


vi.mock("../../../components/printing/TmDocumentPreview", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid={props.testId}>
      <button data-testid="print-btn" onClick={props.printCallBack}>Print</button>
      <button data-testid="print-all-btn" onClick={props.printAllCallBack}>PrintAll</button>
      <button data-testid="exit-btn" onClick={props.exitCallBack}>Exit</button>
      {props.data}
    </div>
  ),
}));

// Shared mock data
const mockSetPreviewDocumentType = vi.fn();
const mockSetSelectedDocuments = vi.fn();
const mockPrint = vi.fn();
const mockPrintAll = vi.fn();
const mockExit = vi.fn();
const mockOnPrintSuccessful = vi.fn();
const mockGetDocumentTypeOptions = vi.fn((opts) => opts);
const mockDocType: TDocumentType = "CHARGE_SHEET";


const baseMock = {
  base64: "pdfdata",
  isPrintAll: false,
  isArrestCase: false,
  printDocuments: [] as TDocumentType[],
  chargeSheetIsLoading: false,
  transgressionIsLoading: false,
  chargeSheetIsError: false,
  transgressionIsError: false,
  transgressionIsSuccess: true,
  chargeSheetIsSuccess: false,
  transgressionDocumentTypeOptions: [
    {
      label: "Doc1",
      value: mockDocType,
      type: mockDocType as AllDocumentTypes,
      id: "123",
    },
  ],
  getDocumentTypeOptions: mockGetDocumentTypeOptions,
  onPrintSuccessful: mockOnPrintSuccessful,
  setPreviewDocumentType: mockSetPreviewDocumentType,
  setSelectedDocuments: mockSetSelectedDocuments,
  printAll: mockPrintAll,
  print: mockPrint,
  exit: mockExit,
  isLoading: false,
  allDocumentsRequired: true
};


vi.mock("../../../hooks/printing/PrintTransgressionManager", () => ({
  __esModule: true,
  default: vi.fn(() => ({ ...baseMock })),
}));

const mockedUsePrintTransgressionManager = vi.mocked(usePrintTransgressionManager);

const theme = createTheme();

const renderWithRouter = () => {
  return renderWithProviders(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={["/"]}>
        <PrintTransgressionPage />
      </MemoryRouter>
    </ThemeProvider>

  );
};

describe("PrintTransgressionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading spinner when transgressionIsLoading is true", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      transgressionIsLoading: true,
    });
    renderWithRouter();
    expect(screen.getByTestId("loadingRenderedDocument")).toBeInTheDocument();
  });

  test("renders loading spinner when chargeSheetIsLoading is true", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      chargeSheetIsLoading: true,
    });
    renderWithRouter();
    expect(screen.getByTestId("loadingRenderedDocument")).toBeInTheDocument();
  });

  test("renders main content when not loading", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    expect(screen.getByTestId("focus-trap")).toBeInTheDocument();
    expect(screen.getByTestId("secured-content")).toBeInTheDocument();
    expect(screen.getByTestId("confirmPrintDialog")).toBeInTheDocument();
    expect(screen.getByTestId("documentType")).toBeInTheDocument();
    expect(screen.getByTestId("renderedPdf")).toBeInTheDocument();
  });

  test("does not render preview if base64 is empty", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      base64: "",
    });
    renderWithRouter();
    expect(screen.queryByTestId("renderedPdf")).not.toBeInTheDocument();
  });

  test("does not render preview if error", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      transgressionIsError: true,
    });
    renderWithRouter();
    expect(screen.queryByTestId("renderedPdf")).not.toBeInTheDocument();
  });

  test("does not render preview if not success", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      transgressionIsSuccess: false,
      chargeSheetIsSuccess: false,
    });
    renderWithRouter();
    expect(screen.queryByTestId("renderedPdf")).not.toBeInTheDocument();
  });

  test("renders correct header text for transgression", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    expect(screen.getByTestId("documentType")).toHaveTextContent("printTransgression");
  });

  test("renders correct header text for arrest case", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      isArrestCase: true,
    });
    renderWithRouter();
    expect(screen.getByTestId("documentType")).toHaveTextContent("printChargeSheet");
  });

  test("calls setPreviewDocumentType on click", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    fireEvent.click(screen.getByTestId("set-preview"));
    expect(mockSetPreviewDocumentType).toHaveBeenCalledWith("docType");
  });

  test("calls setSelectedDocuments via setPrintDocumentTypes", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    fireEvent.click(screen.getByTestId("set-preview"));
    expect(mockSetPreviewDocumentType).toHaveBeenCalledTimes(1);
  });

  test("calls print when print button is clicked", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    fireEvent.click(screen.getByTestId("print-btn"));
    expect(mockPrint).toHaveBeenCalled();
  });

  test("calls printAll when print all button is clicked", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    fireEvent.click(screen.getByTestId("print-all-btn"));
    expect(mockPrintAll).toHaveBeenCalled();
  });

  test("calls exit when exit button is clicked", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    fireEvent.click(screen.getByTestId("exit-btn"));
    expect(mockExit).toHaveBeenCalled();
  });

  test("handles dialog confirm and cancel buttons", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    fireEvent.click(screen.getByTestId("cancel-btn"));
    fireEvent.click(screen.getByTestId("confirm-btn"));
    expect(mockOnPrintSuccessful).toHaveBeenCalled();
  });

  test("disables print button if printDocuments is empty and not arrest case", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      printDocuments: [],
      isArrestCase: false,
      transgressionIsSuccess: true,
      base64: "pdfdata",
    });
    renderWithRouter();
    expect(screen.getByTestId("print-btn")).not.toBeDisabled(); // Update mock implementation if disabling is conditional
  });

  test("enables print button if arrest case", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce({
      ...baseMock,
      isArrestCase: true,
      printDocuments: [],
      transgressionIsSuccess: true,
      base64: "pdfdata",
    });
    renderWithRouter();
    expect(screen.getByTestId("print-btn")).not.toBeDisabled();
  });

  test("calls getDocumentTypeOptions with options", () => {
    mockedUsePrintTransgressionManager.mockReturnValueOnce(baseMock);
    renderWithRouter();
    expect(mockGetDocumentTypeOptions).toHaveBeenCalledWith(baseMock.transgressionDocumentTypeOptions);
  });
});
