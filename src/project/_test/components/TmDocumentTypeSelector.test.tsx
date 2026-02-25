import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TmDocumentTypeSelector, {
  DocumentTypeOption,
} from "../../components/printing/TmDocumentTypeSelector";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  })
}));

vi.mock('@mui/material', async () => {
  const original = await vi.importActual('@mui/material');
  return {
      ...original,
      useMediaQuery: vi.fn(() => {
          return false;
      }),
  };
});

const documentTypeOptions: DocumentTypeOption[] = [
  {
    label: "Offender Copy",
    type: "OFFENDER_COPY",
    id: "OffenderCopy"
  },
  {
    label: "Office Copy Red",
    type: "OFFICE_COPY_RED",
    id: "OfficeCopyRed"
  },
];

afterEach(() => {
  cleanup();
});

describe("TmDocumentTypeSelector", () => {
  test("can render", async () => {
    render(
      <TmDocumentTypeSelector
        printHeader="printTransgression"
        documentTypeOptions={documentTypeOptions}
        setPreviewDocumentType={() => {}}
        printDocumentTypes={[documentTypeOptions[0].type]}
        setPrintDocumentTypes={() => {}}
        testId="test"
        selectionEnabled={true}
      />
    );
    const text = screen.getByText("Offender Copy");
    expect(text).toBeInTheDocument();
  });

  test("can select a document to preview", async () => {
    render(
      <TmDocumentTypeSelector
        printHeader="printTransgression"
        documentTypeOptions={documentTypeOptions}
        setPreviewDocumentType={() => {}}
        printDocumentTypes={[documentTypeOptions[0].type]}
        setPrintDocumentTypes={() => {}}
        testId="test"
        selectionEnabled={true}
      />
    );

    const button = screen.getByTestId("btnOfficeCopyRed");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
  });

  test("can select and check a document to print", async () => {
    render(
      <TmDocumentTypeSelector
        printHeader="printTransgression"
        documentTypeOptions={documentTypeOptions}
        setPreviewDocumentType={() => {}}
        printDocumentTypes={[documentTypeOptions[0].type]}
        setPrintDocumentTypes={() => {}}
        testId="test"
        selectionEnabled={true}
      />
    );

    const checkbox = screen.getByTestId("checkboxOfficeCopyRed").querySelector("input") as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);
    checkbox.checked = true;
    expect(checkbox.checked).toBe(true);
  });
});
