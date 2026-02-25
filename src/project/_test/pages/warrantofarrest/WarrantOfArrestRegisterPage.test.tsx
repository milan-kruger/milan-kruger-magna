import { cleanup } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { act } from "react";
import { MockData } from "../../mocks/MockData";
import { useFindTransgressionParameterQuery, useGenerateWarrantOfArrestRegisterMutation, useInitialiseCourtDocumentsMutation, useProvideWarrantListMutation } from "../../../redux/api/transgressionsApi";
import { renderWithProviders } from "../../mocks/MockStore";
import WarrantOfArrestRegisterPage from "../../../pages/warrantofarrest/WarrantOfArrestRegisterPage";
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

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
        useNavigate: () => vi.fn()
    }
})

vi.mock("../../../redux/api/transgressionsApi", async () => {
    const actual = await vi.importActual("../../../redux/api/transgressionsApi");

    return {
        ...actual,
        useInitialiseCourtDocumentsMutation: vi.fn(),
        useGenerateWarrantOfArrestRegisterMutation: vi.fn(),
        useProvideWarrantListMutation: vi.fn(),
        useFindTransgressionParameterQuery: vi.fn()
    };
});

vi.mock("../../../../framework/auth/components/SecuredContent.tsx", () => ({
    default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
        accessRoles.includes("WARRANTOFARRESTREGISTER_MAINTAIN") || accessRoles.includes("WARRANTOFARRESTREGISTER_VIEW")
            ? <div data-testid="secured-content">{children}</div>
            : <div data-testid="access-denied">Access Denied</div>
    ),
}));

afterEach(() => {
    cleanup();
});

const renderComponent = () => {
    return renderWithProviders(
        <MemoryRouter initialEntries={["/test-path"]}>
            <WarrantOfArrestRegisterPage />
        </MemoryRouter>
    );
};

describe("WarrantOfArrestRegisterPage", () => {
    let initialiseMock = vi.fn();
    let retrieveWarrantListMock = vi.fn();
    let generateWarrantOfArrest = vi.fn();

    beforeEach(() => {

        window.HTMLElement.prototype.scrollTo = vi.fn();

        initialiseMock = vi.fn().mockReturnValue([
            vi.fn(() => ({
                unwrap: vi.fn().mockResolvedValue({
                    courts: [MockData.getCourts],
                    adjudicationTimeFence: 3,
                }),
            })),
            { isLoading: false },
        ]);

        retrieveWarrantListMock = vi.fn().mockReturnValue([
            vi.fn(() => ({
                unwrap: vi.fn().mockResolvedValue({
                    transgressions: [MockData.getTransgression]
                })
            })),
            { isLoading: false },
        ]);

        generateWarrantOfArrest = vi.fn(() => ({
            encodedPdf: MockData.getBase64,
            noticeNumbers: MockData.getNoticeNo.number
        }));

        (useInitialiseCourtDocumentsMutation as unknown as typeof initialiseMock).mockImplementation(initialiseMock);
        vi.mocked(useProvideWarrantListMutation).mockReturnValue([retrieveWarrantListMock, { isLoading: false, reset() { } }]);
        vi.mocked(useGenerateWarrantOfArrestRegisterMutation).mockReturnValue([generateWarrantOfArrest, { isLoading: false, reset() { }, }]);
        vi.mocked(useFindTransgressionParameterQuery).mockReturnValue({
            data: [],
            isFetching: false,
            refetch: vi.fn(),
            reset: vi.fn(),
        });
    })

    test("render page", async () => {
        await act(async () => {
            renderComponent()
        })
        expect(screen.getByTestId("courtDocumentHeading")).toBeInTheDocument();
    });
})
