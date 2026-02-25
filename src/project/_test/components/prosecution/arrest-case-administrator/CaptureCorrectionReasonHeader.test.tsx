import { render, screen } from "@testing-library/react";
import * as i18next from "i18next";
import CaptureCorrectionReasonHeader from "../../../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonHeader";

vi.mock("../../../../../framework/utils", () => ({
  toCamelCaseWords: (base: string, suffix: string) => `${base}${suffix[0].toUpperCase()}${suffix.slice(1)}`
}));

vi.mock("i18next", async () => {
  const actual = await vi.importActual<typeof i18next>("i18next");
  return {
    ...actual,
    t: vi.fn((key: string) => {
      if (key === "arrestCase") return "Mocked Arrest Case Title";
      if (key === "arrestCaseCaptureDescription") return "Mocked Arrest Case Description";
      return key;
    }),
  };
});

describe("CaptureCorrectionReasonHeader", () => {
  const testId = "correctionReason";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title and description with correct test ids and content", () => {
    render(<CaptureCorrectionReasonHeader testId={testId} />);

    const title = screen.getByTestId("correctionReasonTitle");
    const description = screen.getByTestId("correctionReasonDescription");

    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Mocked Arrest Case Title");

    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("Mocked Arrest Case Description");
  });
});
