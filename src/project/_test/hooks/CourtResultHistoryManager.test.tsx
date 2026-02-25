import { cleanup, renderHook } from "@testing-library/react";
import { MockData } from "../mocks/MockData";
import useCourtResultHistoryManager from "../../hooks/court-results/CourtResultHistoryManager";
import { useProvideCourtResultMutation, useRetrieveTransgressionDetailsMutation } from "../../redux/api/transgressionsApi";
import { act } from "react";

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

const mockNavigate = vi.fn();
let retrieveCourtResultMock = vi.fn();
let retrieveTransgressionMock = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("../../redux/api/transgressionsApi.ts", async () => {
    const actual = await vi.importActual("../../redux/api/transgressionsApi");

    return {
        ...actual,
        useProvideCourtResultMutation: vi.fn(),
        useRetrieveTransgressionDetailsMutation: vi.fn()
    };
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
});

describe("CourtResultHistoryManager", () => {

    const mockSetCourtResults = vi.fn();

    const setupHook = () => renderHook(() => useCourtResultHistoryManager(mockSetCourtResults));

    test("should retrieve transgression details and provide court results", async () => {
        retrieveCourtResultMock = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                courtResult: MockData.getCourtResult
            })
        }));

        retrieveTransgressionMock = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                transgression: MockData.getTransgression
            })
        }));

        vi.mocked(useProvideCourtResultMutation).mockReturnValue([retrieveCourtResultMock, { isLoading: false, reset() { }, }]);
        vi.mocked(useRetrieveTransgressionDetailsMutation).mockReturnValue([retrieveTransgressionMock, { isLoading: false, reset() { }, }]);

        const { result } = setupHook()

        await act(async () => {
            result.current.provideCaseResultDetails("25050W0010000960000269");
        });

        expect(result.current.transgressionDetails).toEqual(MockData.getTransgression);
        expect(result.current.captureDialogOpen).toBe(true);
    })

    test("should handle errors gracefully", async () => {
        retrieveCourtResultMock = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                courtResult: null
            })
        }));

        retrieveTransgressionMock = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                transgression: null
            })
        }));

        vi.mocked(useProvideCourtResultMutation).mockReturnValue([retrieveCourtResultMock, { isLoading: false, reset() { }, }]);
        vi.mocked(useRetrieveTransgressionDetailsMutation).mockReturnValue([retrieveTransgressionMock, { isLoading: false, reset() { }, }]);

        const { result } = setupHook()

        await act(async () => {
            result.current.provideCaseResultDetails("12345");
        });

        expect(result.current.transgressionDetails).toBeUndefined();
        expect(result.current.captureDialogOpen).toBe(false);
    });
})
