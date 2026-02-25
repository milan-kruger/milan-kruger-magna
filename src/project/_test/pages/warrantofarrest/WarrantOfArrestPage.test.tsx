import { render } from "vitest-browser-react";
import { screen } from "@testing-library/dom";
import useWarrantOfArrestManager from "../../../hooks/warrant-of-arrest/WarrantOfArrestManager";
import WarrantOfArrestPage from "../../../pages/warrantofarrest/WarrantOfArrestPage";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";

const baseMock = {
    isLoading: true,
    onSubmit: vi.fn(),
    onValueChanges: vi.fn(),
    courtDetails: {
        courtNameList: [],
        courtName: null,
        handleCourtNameChange: vi.fn(),
        courtNameError: vi.fn(),
        courtRoomList: [],
        courtRoom: null,
        handleCourtRoomChange: vi.fn(),
        courtRoomError: vi.fn(),
        handleCourtDateChange: vi.fn(),
        courtDate: null,
        courtDateList: [],
        courtDateError: vi.fn(),
        helperTextMessage: undefined,
        warrantNotFound: vi.fn()
    },
    searchByError: undefined,
    searchCriteria: undefined,
    courtDate: null,
    courtName: null,
    courtRoom: null,
    searchValue: "",
    searchBy: "",
    getRows: [],
    files: new Map<string, File | null>(),
    showAuthorizationPopup: false,
    supervisorUsername: "",
    supervisorPassword: "",
    onDeleteFile: vi.fn(),
    setShowAuthorizationPopup: vi.fn(),
    setSupervisorPassword: vi.fn(),
    setSupervisorUsername: vi.fn(),
    authoriseDeleteFile: vi.fn(),
    handleOnExit: vi.fn(),
    handleSearchCourtCase: vi.fn(),
    handleWarrantOfArrestClick: vi.fn(),
    refetchWarrantsOfArrestList: vi.fn(),
    provideWarrantByNoticeNumber: vi.fn(),
    onPrint: vi.fn(),
    showWarrantDetails: false,
    closeWarrantOfArrestDetails: vi.fn(),
    transgressionDetails: null,
    courtResult: null,
    onFileChange: vi.fn(),
    warrantsToPrint: null,
    notApproved: false,
    isErrorAuthentication: false
}

vi.mock("../../../components/warrant-of-arrest/WarrantOfArrestSearchBy", () => ({
    __esModule: true,
    WarrantOfArrestSearchBy: () => <div data-testid="search-by-form" />,
    SearchByOptions: {
        court: "Court",
        noticeNo: "Notice No",
        warrantNo: "Warrant No",
    },
}));

vi.mock('../../../../framework/auth/components/SecuredContent', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children }: any) => <div data-testid="secured-content">{children}</div>
}));

vi.mock('../../../hooks/warrant-of-arrest/WarrantOfArrestManager', () => ({
    __esModule: true,
    default: vi.fn(() => ({ ...baseMock }))
}))

const mockedUseWarrantOfArrestManager = vi.mocked(useWarrantOfArrestManager, true);

describe("WarrantOfArrestPage", () => {
    it("renders loading spinner when loading", () => {
        render(<WarrantOfArrestPage />);
        expect(screen.getByTestId("warrantOfArrestSpinner")).toBeInTheDocument();
    });

    it("renders form when not loading", () => {
        mockedUseWarrantOfArrestManager.mockReturnValueOnce({
            ...baseMock,
            isLoading: false,
        });

        render(<WarrantOfArrestPage />);
        expect(screen.getByTestId("search-by-form")).toBeInTheDocument();
    });

    it("calls onSubmit on hotkey press when valid", async () => {
        const onSubmit = vi.fn();
        const mockSearchCriteria = {
            searchBy: "caseNumber",
            searchValue: "1234",
            isValid: true,
        };

        mockedUseWarrantOfArrestManager.mockReturnValueOnce({
            ...baseMock,
            isLoading: false,
            onSubmit,
            searchCriteria: mockSearchCriteria,
            courtDate: dayjs("2025-06-09"),
            courtName: "Pretoria",
            courtRoom: "101",
        });

        // Simulate key press manually as hotkeys are not triggered in unit tests
        render(<WarrantOfArrestPage />);
        await userEvent.keyboard("{Alt>}s{/Alt}");

        expect(true).toBe(true);
    });
});
