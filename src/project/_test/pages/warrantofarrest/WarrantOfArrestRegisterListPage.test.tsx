import { MemoryRouter, useLocation } from "react-router-dom";
import { renderWithProviders } from "../../mocks/MockStore";
import { screen } from "@testing-library/dom";
import { ReactNode, act } from "react";
import { cleanup } from "@testing-library/react";
import WarrantOfArrestRegisterListPage from "../../../pages/warrantofarrest/WarrantOfArrestRegisterListPage";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { }),
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

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: vi.fn(() => ({
            pathname: "/test-path",
            search: "",
            hash: "",
            state: {
                disablePrintButton: true,
                warrantList: []
            },
        })),
    }
})

vi.mock("../../../hooks/warrant-of-arrest/WarrantOfArrestRegisterManager", async () => ({
    default: vi.fn().mockReturnValue({
        isLoading: false,
        searchValue: '',
        handleSearchCourtCase: vi.fn(),
        handleWarrantArrestClick: vi.fn(),
        finaliseWarrantOfArrestRegister: vi.fn(),
        handleOnExit: vi.fn()
    }),
}))

vi.mock("../../../../framework/auth/components/SecuredContent.tsx", () => ({
    default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
        accessRoles.includes("WARRANTOFARRESTREGISTER_MAINTAIN") || accessRoles.includes("WARRANTOFARRESTREGISTER_VIEW")
            ? <div data-testid="secured-content">{children}</div>
            : <div data-testid="access-denied">Access Denied</div>
    ),
}));

const renderComponent = () => {
    return renderWithProviders(
        <MemoryRouter initialEntries={["/test-path"]}>
            <WarrantOfArrestRegisterListPage />
        </MemoryRouter>
    );
};

afterEach(() => {
    cleanup();
});

describe('WarrantOfArrestRegister Component', () => {
    test('should disable the print button if disablePrintButton is true', async () => {
        vi.mocked(useLocation).mockReturnValue({
            pathname: "/mock-path",
            search: "",
            hash: "",
            key: "mock-key",
            state: {
                disablePrintButton: true,
                warrantList: []
            },
        });

        await act(async () => {
            renderComponent();
        });

        const printButton = screen.getByText(/printRegister/i);
        expect(printButton).toBeDisabled();
    });

    test('should render CourtDocumentsListTable with correct rows', async () => {
        const mockRows = [{
            noticeNo: "25071W001000096000046C",
            offenderName: "DFG GFDF",
            plateNo: "TTH5566",
            status: "WARRANT_OF_ARREST",
            courtDate: "03/01/2025",
            courtName: "Brakwater Court",
        }];

        vi.mocked(useLocation).mockReturnValue({
            pathname: "/mock-path",
            search: "",
            hash: "",
            key: "mock-key",
            state: {
                disablePrintButton: false,
                warrantList: mockRows
            },
        });

        // Re-mock the module
        vi.mock("../../../hooks/warrant-of-arrest/WarrantOfArrestRegisterManager", async () => ({
            default: vi.fn().mockReturnValue({
                isLoading: false,
                searchValue: '',
                handleWarrantArrestClick: vi.fn()
            }),
        }));

        await act(async () => {
            renderComponent();
        });

        expect(screen.getByTestId("warrantOfArrestRegisterList")).toBeInTheDocument();
    });

})
