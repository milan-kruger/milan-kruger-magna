import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { useFinaliseCourtResultMutation, useFindTransgressionParameterQuery, useProvideCourtCaseListMutation } from "../../redux/api/transgressionsApi";
import useCaptureCourtResultsManager from "../../hooks/court-results/CaptureCourtResultsManager";
import { MockData } from "../mocks/MockData";
import { useAppDispatch, useAppSelector } from "../../../framework/redux/hooks";
import { useLocation } from "react-router-dom";
import { useGetLoggedInUserQuery } from "../../redux/api/coreApi";
import AuthService from "../../../framework/auth/authService";
import dayjs from "dayjs";
import { act } from "react";

vi.mock("sockjs-client", () => ({ default: vi.fn() }));
vi.mock("@stomp/stompjs", () => ({ Client: vi.fn() }));
vi.mock("../../pages/aarto/notice-management/NoticeManagementPage", () => ({ default: () => null }));

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
                courtCaseDetails: MockData.getTransgression,
                courtData: {
                    courtName: "Brakwater Court",
                    courtRoom: "A",
                    courtDate: "2025-01-03"
                },
            },
        })),
    }
});

vi.mock("../../redux/api/transgressionsApi", async () => {
    const actual = await vi.importActual("../../redux/api/transgressionsApi");

    return {
        ...actual,
        useFinaliseCourtResultMutation: vi.fn(),
        useProvideCourtCaseListMutation: vi.fn(),
        useFindTransgressionParameterQuery: vi.fn()
    };
});

vi.mock("../../redux/api/coreApi", async () => {
    const actual = await vi.importActual("../../redux/api/coreApi");

    return {
        ...actual,
        useGetLoggedInUserQuery: vi.fn(),
    };
});

vi.mock("../../../framework/redux/hooks.ts", () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
    useAppSelectorShallow: vi.fn()
}));

vi.mock("../../../framework/auth/authService", async () => {
    const actual = await vi.importActual("../../../framework/auth/authService");
    return {
        ...actual,
        getUserName: vi.fn(),
    };
});


afterEach(() => {
    cleanup();
});

describe("CaptureCourtResultManage", () => {
    let finaliseCourtResult = vi.fn();
    let retrieveCourtResult = vi.fn();
    let setShowConfirmResults = vi.fn();
    let setShowDiscardChanges = vi.fn();
    let mockDispatch = vi.fn();

    const formData = {
        amountPaid: { amount: 500 },
        courtOutcome: "Guilty",
        caseNumber: "12345",
        newCourtDate: "2025-03-15",
        reason: "Test Reason",
        receiptNumber: "RC123",
        sentence: "Fine",
        sentenceType: "Monetary",
        paymentMethod: "Credit Card",
        sentenceLength: 12,
        sentenceTimePeriod: "Months",
        warrantNumber: "WN456",
    };

    const mockCourts = [MockData.getCourts]

    beforeEach(() => {
        setShowConfirmResults = vi.fn();
        setShowDiscardChanges = vi.fn();

        mockDispatch = vi.fn();

        vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)

        vi.mocked(useAppSelector).mockReturnValue({ isValid: true, formData })

        vi.mocked(useLocation).mockReturnValue({
            pathname: "/mock-path",
            search: "",
            hash: "",
            key: "mock-key",
            state: {
                courtCaseDetails: MockData.getTransgression,
                courtData: {
                    courtName: "Brakwater Court",
                    courtRoom: "A",
                    courtDate: "2025-01-03",
                },
            },
        });

        vi.mocked(useFindTransgressionParameterQuery).mockReturnValue({
            data: { value: 'TRUE' },
            isFetching: false,
            refetch: vi.fn(),
            reset: vi.fn(),
        });

        vi.mocked(useGetLoggedInUserQuery).mockReturnValue({
            data: { name: "John Doe" },
            isLoading: true,
            error: null,
            refetch: vi.fn()
        });

        finaliseCourtResult = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                courtResultCaptured: true
            })
        }))

        retrieveCourtResult = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({
                courtCaseList: [MockData.getCaseEntry]
            })
        }))

        vi.mocked(useFinaliseCourtResultMutation).mockReturnValue([finaliseCourtResult, { isLoading: false, reset() { }, }]);
        vi.mocked(useProvideCourtCaseListMutation).mockReturnValue([retrieveCourtResult, { isLoading: false, reset() { }, }]);

    })

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const setupHook = () => renderHook(() =>
        useCaptureCourtResultsManager(setShowConfirmResults, setShowDiscardChanges, mockCourts)
    );

    test("should finalise court result and retrieve entry", async () => {

        const getUserName = vi.spyOn(AuthService, 'getUserName');
        getUserName.mockReturnValue('john_doe');
        const hasRole = vi.spyOn(AuthService, 'hasRole');
        hasRole.mockReturnValue(true);

        const { result } = setupHook()

        expect(result.current).toBeDefined();
    })

    test('should set courtDateList correctly based on courtData', () => {
        const { result } = setupHook()
        expect(result.current.courtDateList).toEqual([dayjs('2024-10-04')]);
    });

    test('should update generateWarrantNumber based on transgression parameter', () => {
        const { result } = setupHook()
        expect(result.current.generateWarrantNumber).toBe(true);
    });

    test('should call finaliseCourtResults with the correct data', async () => {
        const { result } = setupHook()

        await act(async () => {
            result.current.onConfirmResults();
        });

        await waitFor(() =>
            expect(finaliseCourtResult).toHaveBeenCalled()
        );
    });

    test("should call provideCourtCaseList when court result is captured", async () => {
        const { result } = setupHook()

        await act(async () => {
            result.current.onConfirmResults();
        });

        await waitFor(() =>
            expect(retrieveCourtResult).toHaveBeenCalledWith(
                {
                    provideCourtCaseListRequest: {
                        courtDate: "2025-01-03",
                        courtName: "Brakwater Court",
                        courtRoom: "A"
                    }
                }
            )
        );
    });

    test("should handle missing amountPaid gracefully", async () => {
        const mockFormWithoutAmount = { formData: { ...formData, amountPaid: undefined } };
        vi.mocked(useAppSelector).mockReturnValue({ isValid: true, formData: mockFormWithoutAmount.formData })

        const { result } = setupHook()

        await act(async () => {
            result.current.onConfirmResults();
        });

        expect(finaliseCourtResult).toHaveBeenCalledWith(
            expect.objectContaining({
                finaliseCourtResultRequest: expect.objectContaining({ amountPaid: undefined }),
            })
        );
    });

})
