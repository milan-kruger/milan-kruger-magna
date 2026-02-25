import '../mocks/i18next.vi.mock';
import '../mocks/router-dom.vi.mock';

import { renderHook, cleanup } from "@testing-library/react";
import useCancelContemptOfCourtFeeManager from "../../hooks/court-results/CancelContemptOfCourtFeeManager";
import { transgressionsApi, useAuthoriseSupervisorOverrideMutation, useCancelContemptOfCourtMutation, useProvideCourtResultMutation } from "../../redux/api/transgressionsApi";
import { act, ReactNode } from 'react';

vi.mock("../../redux/api/transgressionsApi", async () => {

    const actual = await vi.importActual("../../redux/api/transgressionsApi");

    const mockUseLazyQuery = vi.fn();

    const mockModule = {
        ...actual,
        endpoints: {
            ...(actual.endpoints ?? {}),
            retrieveTransgressionHistory: { useLazyQuery: mockUseLazyQuery },
        },
        useProvideCourtResultMutation: vi.fn(),
        useCancelContemptOfCourtMutation: vi.fn(),
        useAuthoriseSupervisorOverrideMutation: vi.fn(),
    };

    return mockModule;
});


vi.mock("../../../project/hooks/SupervisorAuthorizationManager", async () => {
    const actual = await vi.importActual("../../../project/hooks/SupervisorAuthorizationManager");
    return {
        ...actual,
        onSupervisorAuthorization: vi.fn(),
    };
});

vi.mock("../../../framework/auth/authService", async () => {
    const actual = await vi.importActual("../../../framework/auth/authService");
    return {
        ...actual,
        getUserName: vi.fn(),
    };
});

vi.mock("react-hotkeys-hook", () => ({
    useHotkeys: vi.fn(),
}));

vi.mock("../../../framework/auth/components/SecuredContent.tsx", () => ({
    default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
        accessRoles.includes("ROLE_CANCELTRANSGRESSION_OVERRIDE")
            ? <div data-testid="secured-content">{children}</div>
            : <div data-testid="access-denied">Access Denied</div>
    ),
}));


beforeAll(() => {
    vi.spyOn(
        transgressionsApi.endpoints.retrieveTransgressionHistory,
        "useLazyQuery"
    ).mockImplementation(() => [
        vi.fn(),
        {
            isLoading: false,
            data: { transgressionEntries: [] },
            reset: () => { },
            isError: false,
            isSuccess: true,
        },
        {
            lastArg: {
                noticeNumber: ''
            }
        },
    ]);
});

afterEach(() => {
    cleanup();
});

describe("useCancelContemptOfCourtFeeManager", () => {
    let mockProvideCourtResult = vi.fn();
    let mockCancelContemptOfCourt = vi.fn();
    let onSupervisorAuthorization = vi.fn();
    const mockRetrieveTransgressionHistory = vi.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createMutationMock = (resolvedValue: any) =>
        vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue(resolvedValue),
        }));

    const createAuthoriseSupervisorMock = (approved: boolean) => {
        const fn = vi.fn(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const promise: any = Promise.resolve({ data: { approved } });
            promise.unwrap = vi.fn().mockResolvedValue({ approved });
            return promise;
        });
        return [fn, { isLoading: false, reset() { } }] as const;
    };

    const setupHook = () => {
        return renderHook(() => useCancelContemptOfCourtFeeManager());
    }

    beforeEach(() => {
        mockProvideCourtResult = createMutationMock({
            courtResult: {
                noticeNumber: "123",
                contemptOfCourtFee: { amount: 100 },
            },
        });

        mockCancelContemptOfCourt = createMutationMock({
            contemptOfCourtCancelled: false,
        });

        vi.mocked(useProvideCourtResultMutation).mockReturnValue([mockProvideCourtResult, { isLoading: false, reset() { } }]);
        vi.mocked(useCancelContemptOfCourtMutation).mockReturnValue([mockCancelContemptOfCourt, { isLoading: false, reset() { } }]);

        onSupervisorAuthorization = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({ approved: true }),
        }));
        vi.mocked(onSupervisorAuthorization).mockReturnValue({
            data: onSupervisorAuthorization,
            isError: false,
            isLoading: false,
            reset() {
                throw new Error('Function not implemented.');
            },
        });
        vi.mocked(useAuthoriseSupervisorOverrideMutation).mockReturnValue(createAuthoriseSupervisorMock(true));
        const useLazyQueryMock = transgressionsApi.endpoints.retrieveTransgressionHistory.useLazyQuery as unknown as ReturnType<typeof vi.fn>;

        useLazyQueryMock.mockReturnValue([
            mockRetrieveTransgressionHistory,
            {
                isLoading: false,
                data: {
                    transgressionEntries: [
                        { comments: "Some comment" },
                        { comments: "Cancelled contempt of court fee" },
                    ],
                },
                reset: () => { },
                isError: false,
                isSuccess: true,
            },
            {},
        ]);

    });

    test("should initialize with default values", () => {
        const { result } = setupHook();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.courtResults).toEqual([]);
        expect(result.current.showCourtResultPopup).toBe(false);
        expect(result.current.showAuthorizationPopup).toBe(false);
        expect(result.current.showConfirmationDialog).toBe(false);
        expect(result.current.contemptOfCourtFeeCancelled).toBe(false);
        expect(result.current.contemptOfCourtFee).toBeUndefined();
        expect(result.current.searchByError).toBeUndefined();
        expect(result.current.notApproved).toBe(false);
    });

    test("should handle onValueChanges", () => {
        const { result } = setupHook();
        act(() => {
            result.current.onValueChanges("Notice No", "123", true);
        });
        expect(result.current).toBeDefined();
    });

    test("should handle onSubmit with Notice No", async () => {
        mockProvideCourtResult.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    courtResult: {
                        noticeNumber: "123",
                        contemptOfCourtFee: { amount: 100 },
                    },
                }),
        });

        mockRetrieveTransgressionHistory.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    transgressionEntries: [{ comments: "Some comment" }],
                }),
        });

        const { result } = setupHook();

        await act(async () => {
            await result.current.onSubmit("Notice No", "123");
        });
        expect(mockProvideCourtResult).toHaveBeenCalled();
        expect(mockRetrieveTransgressionHistory).toHaveBeenCalled();
        expect(result.current.courtResults[0].noticeNumber).toBe("123");
        expect(result.current.contemptOfCourtFee).toEqual({ amount: 100 });
        expect(result.current.showCourtResultPopup).toBe(true);
    });

    test("should handle onSubmit with Warrant No", async () => {
        mockProvideCourtResult.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    courtResult: {
                        noticeNumber: "456",
                        contemptOfCourtFee: { amount: 200 },
                    },
                }),
        });
        mockRetrieveTransgressionHistory.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    transgressionEntries: [{ comments: "Cancelled contempt of court fee" }],
                }),
        });

        const { result } = setupHook();

        await act(async () => {
            await result.current.onSubmit("Warrant No", "456");
        });
        expect(result.current.courtResults[0].noticeNumber).toBe("456");
        expect(result.current.contemptOfCourtFeeCancelled).toBe(true);
        expect(result.current.showCourtResultPopup).toBe(true);
    });

    test("should handle closeCourtResultPopup", () => {
        const { result } = setupHook();
        act(() => {
            result.current.closeCourtResultPopup();
        });
        expect(result.current.showCourtResultPopup).toBe(false);
    });

    test("should handle closeAuthorizationPopup", () => {
        const { result } = setupHook();
        act(() => {
            result.current.setShowAuthorizationPopup(true);
            result.current.setSupervisorUsername("supervisor");
            result.current.setSupervisorPassword("pass");
            result.current.closeAuthorizationPopup();
        });
        expect(result.current.showAuthorizationPopup).toBe(false);
        expect(result.current.supervisorUsername).toBe("");
        expect(result.current.supervisorPassword).toBe("");
    });

    test("should handle onCancelContemptOfCourtFee with approval", async () => {
        mockCancelContemptOfCourt.mockReturnValue({
            unwrap: () => Promise.resolve({ contemptOfCourtCancelled: true }),
        });

        const { result } = setupHook();

        act(() => {
            result.current.setSupervisorUsername("supervisor");
            result.current.setSupervisorPassword("pass");
        });
        await act(async () => {
            result.current.onCancelContemptOfCourtFee("supervisor", "pass");
        });

        expect(mockCancelContemptOfCourt).toHaveBeenCalled();
        expect(result.current.showConfirmationDialog).toBe(true);
        expect(result.current.notApproved).toBe(false);
    });

    test("should handle onCancelContemptOfCourtFee with not approved", async () => {
        vi.mocked(useAuthoriseSupervisorOverrideMutation).mockReturnValue(createAuthoriseSupervisorMock(false));
        const { result } = setupHook();
        await act(async () => {
            result.current.onCancelContemptOfCourtFee("supervisor", "pass");
        });
        expect(result.current.notApproved).toBe(true);
    });

    it("should handle closeAll", () => {
        const { result } = setupHook();
        act(() => {
            result.current.setShowConfirmationDialog(true);
            result.current.setShowAuthorizationPopup(true);
            result.current.closeAll();
        });
        expect(result.current.showCourtResultPopup).toBe(false);
        expect(result.current.showConfirmationDialog).toBe(false);
        expect(result.current.showAuthorizationPopup).toBe(false);
    });
});
