import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import TransgressionListSearch from "../../components/transgression-details/transgression-list/TransgressionListSearch";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => { }),
    },
  }),
}));

vi.mock("../../../framework/components/list/TmSearch", () => ({
  default: ({
    testid,
    onClick,
    children,
  }: {
    testid: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button data-testid={testid} onClick={onClick}>
      {children}
    </button>
  ),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const onFindTransgressions = vi.fn();
const onSearchTransgression = vi.fn();

const renderComponent = (propsOverride = {}) => {

  const props = {
    onFindTransgressions,
    onSearchTransgression,
    ...propsOverride,
  };

  return (
    render(
      <ThemeProvider theme={createTheme()}>
        <TransgressionListSearch {...props} />
      </ThemeProvider>
    )
  );
};

describe.skip("TransgressionListSearch", () => {
  test('plateNo input value is capitalized', () => {
    renderComponent();
    const plateInput = screen.getByTestId("plateNo");
    fireEvent.change(plateInput, { target: { value: 'abc123' } });
    expect((plateInput as HTMLInputElement).value).toBe('ABC123');
  })

  test.skip("should allow user to set plate number and status and call onFindTransgressions", async () => {
    renderComponent();

    const plateInput = screen.getByTestId("plateNo") as HTMLInputElement;
    const statusSelect = screen.getByTestId(
      "transgressionStatus"
    ) as HTMLSelectElement;
    const fromDateInput = screen.getByTestId("dateFrom") as HTMLInputElement;
    const toDateInput = screen.getByTestId("dateTo") as HTMLInputElement;

    const today = dayjs().format("YYYY-MM-DD");

    fireEvent.change(plateInput, { target: { value: "abc123" } });
    fireEvent.change(statusSelect, { target: { value: "ISSUED" } });
    fireEvent.change(fromDateInput, { target: { value: today } });
    fireEvent.change(toDateInput, { target: { value: today } });

    fireEvent.click(screen.getByTestId("findTransgressions"));

    await waitFor(() => {
      expect(onFindTransgressions).toHaveBeenCalledWith(
        expect.objectContaining({
          plateNumber: "ABC123",
          fromDate: `${today}T00:00:00`,
          toDate: `${today}T23:59:59`,
          status: "ISSUED",
        })
      );
    });
  });

  test.skip("should call onSearchTransgression with the typed value", () => {
    renderComponent();

    const searchInput = screen.getByTestId(
      "searchTransgression"
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "search me" } });

    expect(onSearchTransgression).toHaveBeenCalledWith("search me");
  });
});
