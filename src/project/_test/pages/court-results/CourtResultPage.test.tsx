import { screen, cleanup, act, waitFor } from "@testing-library/react";
import CourtResultPage from "../../../pages/court-results/court-result-manager/CourtResultPage";
import { useInitialiseCourtDocumentsMutation, useProvideCourtCaseListMutation } from "../../../redux/api/transgressionsApi";
import { MockData } from "../../mocks/MockData";
import { renderWithProviders } from "../../mocks/MockStore";

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

vi.mock("react-router-dom", () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock("../../../redux/api/transgressionsApi", async () => {
    const actual = await vi.importActual("../../../redux/api/transgressionsApi");

    return {
        ...actual,
        useInitialiseCourtDocumentsMutation: vi.fn(),
        useProvideCourtCaseListMutation: vi.fn(),
    };
});

afterEach(() => {
    cleanup();
});

describe("CourtResultPage: CourtResultManager", () => {
    let initialiseMock = vi.fn();
    let retrieveMock = vi.fn();

    beforeEach(() => {
        initialiseMock = vi.fn().mockReturnValue([
            vi.fn(() => ({
                unwrap: vi.fn().mockResolvedValue({
                    courts: [MockData.getCourts],
                    adjudicationTimeFence: 3,
                }),
            })),
            { isLoading: false },
        ]);

        retrieveMock = vi.fn().mockReturnValue([
            vi.fn(() => ({
                unwrap: vi.fn().mockResolvedValue({
                    courtCaseList: [MockData.getCourtCaseList]
                })
            })),
            { isLoading: false },
        ]);

        (useInitialiseCourtDocumentsMutation as unknown as typeof initialiseMock).mockImplementation(initialiseMock);
        (useProvideCourtCaseListMutation as unknown as typeof retrieveMock).mockImplementation(retrieveMock);
    });

    test("render page", async () => {
        (useInitialiseCourtDocumentsMutation as unknown as typeof initialiseMock).mockReturnValue([
            vi.fn(() => ({
                unwrap: vi.fn().mockResolvedValue({
                    courts: []
                })
            })),
            { isLoading: true },
        ]);

        // Render outside act(), since RTL's render already wraps it.
        renderWithProviders(<CourtResultPage />);

        // Use findByRole to properly wait for async updates
        expect(await screen.findByRole("progressbar")).toBeInTheDocument();
    });

    test("renders and calls API", async () => {
        await act(async () => {
            renderWithProviders(<CourtResultPage />);
        });

        await waitFor(() => expect(initialiseMock).toHaveBeenCalled());
    });

})
