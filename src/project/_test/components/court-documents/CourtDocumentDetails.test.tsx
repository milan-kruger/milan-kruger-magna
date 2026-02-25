import { cleanup, screen } from "@testing-library/react";
import CourtDocumentDetails from "../../../components/court-documents/CourtDocumentDetails";
import dayjs from "dayjs";
import { CourtDocumentsView } from "../../../enum/CourtDocumentsView";
import { render } from "vitest-browser-react";

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
        useMediaQuery: vi.fn(() => {
            return false;
        }),
    };
});

const mockProps = {
    courtNameList: ["Court A", "Court B"],
    courtName: "Court A",
    handleCourtNameChange: vi.fn(),
    courtNameError: () => false,
    courtRoomList: ["Room 1", "Room 2"],
    courtRoom: "Room 1",
    handleCourtRoomChange: vi.fn(),
    courtRoomError: () => false,
    handleCourtDateChange: vi.fn(),
    courtDate: dayjs(),
    courtDateList: [dayjs(), dayjs().add(1, "day")],
    courtDateError: () => false,
    view: CourtDocumentsView.COURT_RESULTS,
    maxCourtDate: dayjs().add(10, "day"),
    helperTextMessage: "Select a valid date",
};

const renderComponent = (props = mockProps) => {
    return render(
        <CourtDocumentDetails {...props} />
    );
};

afterEach(() => {
    cleanup();
});

describe("CourtDocumentDetails Component", () => {
    test("renders component correctly", async () => {
        renderComponent();

        expect(screen.getByTestId("courtName")).toBeInTheDocument();
        expect(screen.getByTestId("courtRoom")).toBeInTheDocument();
        expect(screen.getByTestId("courtDate")).toBeInTheDocument();
    });
})
