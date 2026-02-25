import '../mocks/mui.vi.mock';
import '../mocks/i18next.vi.mock';
import '../mocks/router-dom.vi.mock';

import { cleanup, renderHook } from '@testing-library/react';
import useCancelTransgressionManager from '../../hooks/cancel-trangression/CancelTransgressionManager';
import { MockData } from '../mocks/MockData';
import { OverloadTransgression, OverloadTransgressionDto, RtqsTransgression, RtqsTransgressionDto, useAuthoriseSupervisorOverrideMutation, useCancelRtqsTransgressionMutation, useCancelTransgressionMutation } from '../../redux/api/transgressionsApi';
import { LookupResponse, useGetLoggedInUserQuery } from '../../redux/api/coreApi';
import { act, ChangeEvent, ReactNode, SyntheticEvent } from 'react';
import { mockPageLookupResponse } from '../mocks/lookupResponse.mock';
import { TransgressionStatus } from '../../enum/TransgressionStatus';
import { JsonObjectType } from '../../enum/JsonObjectType';

vi.mock("sockjs-client", () => ({ default: vi.fn() }));
vi.mock("@stomp/stompjs", () => ({ Client: vi.fn() }));
vi.mock("../../pages/aarto/notice-management/NoticeManagementPage", () => ({ default: () => null }));

vi.mock("../../redux/api/transgressionsApi", async () => {
    const actual = await vi.importActual("../../redux/api/transgressionsApi");

    return {
        ...actual,
        useCancelTransgressionMutation: vi.fn(),
        useCancelRtqsTransgressionMutation: vi.fn(),
        useAuthoriseSupervisorOverrideMutation: vi.fn()
    };
});

vi.mock("../../redux/api/coreApi", async () => {
    const actual = await vi.importActual("../../redux/api/coreApi");

    return {
        ...actual,
        useGetLoggedInUserQuery: vi.fn(),
        useGetLookupsQuery: vi.fn(() => ({
            data: mockPageLookupResponse,
            isFetching: false,
        }))
    };
});

vi.mock("../../../framework/auth/authService", async () => {
    const actual = await vi.importActual("../../../framework/auth/authService");
    return {
        ...actual,
        getUserName: vi.fn(),
    };
});

vi.mock("../../../project/hooks/SupervisorAuthorizationManager", async () => {
    const actual = await vi.importActual("../../../project/hooks/SupervisorAuthorizationManager");
    return {
        ...actual,
        onSupervisorAuthorization: vi.fn(),
    };
});

vi.mock("../../../framework/auth/components/SecuredContent.tsx", () => ({
    default: ({ accessRoles, children }: { accessRoles: string[]; children: ReactNode }) => (
        accessRoles.includes("ROLE_CANCELTRANSGRESSION_OVERRIDE")
            ? <div data-testid="secured-content">{children}</div>
            : <div data-testid="access-denied">Access Denied</div>
    ),
}));

afterEach(() => {
    cleanup();
});

describe('useCancelTransgressionManager', () => {
    let retrieveCancelledOverloadTransgression = vi.fn();
    let retrieveCancelledRtqsTransgression = vi.fn();
    let onSupervisorAuthorization = vi.fn();

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

    // Helper to setup hook easily
    const setupHook = (
        transgression: OverloadTransgressionDto | RtqsTransgressionDto,
        onCancel = vi.fn()
    ) => {
        return renderHook(() =>
            useCancelTransgressionManager(transgression, onCancel)
        );
    };

    // Helper for setting supervisor creds & reason in tests
    const fillSupervisorAuthAndReason = (
        result: ReturnType<typeof setupHook>['result']
    ) => {
        act(() => {
            result.current.setSupervisorUsername('supervisor');
            result.current.setSupervisorPassword('pass');
            result.current.onChangeReason(
                {} as SyntheticEvent<Element, Event>,
                { lookupValue: 'Reason1' } as LookupResponse
            );
        });
    };

    const originalRtqs = MockData.getTransgression as RtqsTransgression;
    const rtqsTransgression: RtqsTransgressionDto = {
        ...originalRtqs,
        type: JsonObjectType.RtqsTransgressionDto,
    };

    const originalOverload = MockData.getTransgression as OverloadTransgression;
    const overloadTransgression: OverloadTransgressionDto = {
        ...originalOverload,
        type: JsonObjectType.OverloadTransgressionDto,
    };

    beforeEach(() => {
        vi.mocked(useGetLoggedInUserQuery).mockReturnValue({
            data: { name: 'John Doe' },
            isLoading: true,
            error: null,
            refetch: vi.fn(),
        });

        retrieveCancelledOverloadTransgression = createMutationMock({ cancelled: true });
        retrieveCancelledRtqsTransgression = createMutationMock({ cancelled: false });
        onSupervisorAuthorization = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue({ approved: true }),
        }));

        vi.mocked(useCancelTransgressionMutation).mockReturnValue([
            retrieveCancelledOverloadTransgression,
            { isLoading: false, reset() { } },
        ]);
        vi.mocked(useCancelRtqsTransgressionMutation).mockReturnValue([
            retrieveCancelledRtqsTransgression,
            { isLoading: false, reset() { } },
        ]);
        vi.mocked(onSupervisorAuthorization).mockReturnValue({
            data: onSupervisorAuthorization,
            isError: false,
            isLoading: false,
            reset() {
                throw new Error('Function not implemented.');
            },
        });

        vi.mocked(useAuthoriseSupervisorOverrideMutation).mockReturnValue(createAuthoriseSupervisorMock(true));
    });

    test('should initialize with default values', () => {
        const { result } = setupHook(overloadTransgression);
        expect(result.current.openSupervisorDialog).toBe(false);
        expect(result.current.cancellationReason).toBeUndefined();
        expect(result.current.supervisorUsername).toBe('');
        expect(result.current.invalidReason).toBe(true);
    });

    test('should update cancellation reason and set isIncorrectOverloadPlateNo', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.onChangeReason(
                {} as SyntheticEvent<Element, Event>,
                { lookupValue: 'Incorrect plate number' } as LookupResponse,
            );
        });
        expect(result.current.cancellationReason).toBe('Incorrect plate number');
        expect(result.current.isIncorrectOverloadPlateNo).toBe(true);
    });

    test('should clear fields', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.setSupervisorUsername('supervisor');
            result.current.setSupervisorPassword('pass');
            result.current.onChangeReason({} as SyntheticEvent<Element, Event>, { lookupValue: 'Reason1' } as LookupResponse);
            result.current.onPlateNumberChange({ target: { value: 'NEW123' } } as ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.clearFields();
        });
        expect(result.current.supervisorUsername).toBe('');
        expect(result.current.supervisorPassword).toBe('');
        expect(result.current.cancellationReason).toBeUndefined();
        expect(result.current.newPlateNumber).toBeUndefined();
    });

    test('should handle supervisor auth confirm and call cancelOverloadTransgression', async () => {
        const { result } = setupHook(overloadTransgression);
        fillSupervisorAuthAndReason(result);
        await act(async () => {
            result.current.handleSupervisorAuthConfirm();
        });
        expect(result.current.openReturnDocumentsDialog || result.current.openReweighDialog).toBe(true);
    });

    it('should handle cancel overload transgression', async () => {
        const { result } = setupHook(overloadTransgression);
        const res = await result.current.handleCancelOverloadTransgression(['Reason1'], 'supervisor', 'pass', 'NEW123');
        expect(res).toBe(true);
    });

    test('should handle cancel overload transgression with CREATED status', async () => {
        const { result } = setupHook({...overloadTransgression, status: TransgressionStatus.CREATED});
        act(() => {
            result.current.setSupervisorUsername('supervisor');
            result.current.setSupervisorPassword('pass');
        });
        await act(async () => {
            result.current.handleSupervisorAuthConfirm();
        });
        expect(result.current.openReturnDocumentsDialog).toBe(false);
        expect(result.current.openReweighDialog).toBe(true);
    });

    test('should handle cancel rtqs transgression', async () => {
        retrieveCancelledRtqsTransgression = createMutationMock({ cancelled: true });
        vi.mocked(useCancelRtqsTransgressionMutation).mockReturnValue([
            retrieveCancelledRtqsTransgression,
            { isLoading: false, reset() { } },
        ]);
        const { result } = setupHook(rtqsTransgression);
        const res = await result.current.handleCancelRtqsTransgression(
            ['Reason1'],
            'supervisor',
            'pass'
        );
        expect(res).toBe(true);
    });


    test('should handle cancel Rtqs transgression with CREATED status', async () => {
        const { result } = setupHook({...rtqsTransgression, status: TransgressionStatus.CREATED});
        act(() => {
            result.current.setSupervisorUsername('supervisor');
            result.current.setSupervisorPassword('pass');
        });
        await act(async () => {
            result.current.handleSupervisorAuthConfirm();
        });
        expect(result.current.openReturnDocumentsDialog).toBe(false);
        expect(result.current.openReweighDialog).toBe(false);
    });

    test('should set invalidReason to true if cancellationReason is empty', () => {
        vi.mock('../../../hooks/cancel-trangression/CancelTransgressionManager', () => ({
            default: vi.fn().mockReturnValue({
                setCancellationReason: vi.fn().mockReturnValue(''),
            }),
        }));
        const { result } = setupHook(overloadTransgression);
        expect(result.current.invalidReason).toBe(true);
    });

    test('should set isIncorrectOverloadPlateNo to false for other reasons', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.onChangeReason(
                {} as SyntheticEvent<Element, Event>,
                { lookupValue: 'Some other reason' } as LookupResponse,
            );
        });
        expect(result.current.isIncorrectOverloadPlateNo).toBe(false);
    });

    test('should set notApproved to true if supervisor authorization fails', async () => {
        vi.mocked(useAuthoriseSupervisorOverrideMutation).mockReturnValue(createAuthoriseSupervisorMock(false));
        const { result } = setupHook(overloadTransgression);
        fillSupervisorAuthAndReason(result);
        await act(async () => {
            result.current.handleSupervisorAuthConfirm();
        });
        expect(result.current.notApproved).toBe(true);
    });

    test('should call onCancel when handleCloseDialog is called', () => {
        const onCancel = vi.fn();
        const { result } = setupHook(overloadTransgression, onCancel);
        act(() => {
            result.current.handleCloseDialog();
        });
        expect(onCancel).toHaveBeenCalled();
    });

    test('should open supervisor dialog and call onCancel on handleOnConfirm', () => {
        const onCancel = vi.fn();
        const { result } = setupHook(overloadTransgression, onCancel);
        act(() => {
            result.current.handleOnConfirm();
        });
        expect(result.current.openSupervisorDialog).toBe(true);
        expect(onCancel).toHaveBeenCalled();
    });

    test('should close supervisor dialog', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.setSupervisorUsername('supervisor');
            result.current.setSupervisorPassword('pass');
            result.current.handleSupervisorAuthDialogClose();
        });
        expect(result.current.openSupervisorDialog).toBe(false);
    });

    test('should close return documents dialog and open reweigh dialog for overload', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.handleReturnDocumentsDialogClose(true);
        });
        expect(result.current.openReturnDocumentsDialog).toBe(false);
        expect(result.current.openReweighDialog).toBe(true);
    });

    test('should close reweigh dialog and call navigate', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.handleVehicleReweighDialogClose();
        });
        expect(result.current.openReweighDialog).toBe(false);
    });

    test('should close auth error dialog', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.setSupervisorUsername('supervisor');
            result.current.setSupervisorPassword('pass');
            result.current.handleCloseAuthErrorDialog();
        });
        expect(result.current.cancelAuthErrorDialogVisible).toBe(false);
    });

    test('should return correct option from getTransgressionReasonValue', () => {
        const { result } = setupHook(overloadTransgression);
        const option = result.current.getTransgressionReasonValue('Test Lookup');
        expect(option).toEqual(mockPageLookupResponse.content?.[0]);
    });

    test('should return null from getTransgressionReasonValue for unknown value', () => {
        const { result } = setupHook(overloadTransgression);
        const option = result.current.getTransgressionReasonValue('Unknown');
        expect(option).toBeUndefined();
    });

    test('should handle onPlateNumberChange', () => {
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.onPlateNumberChange({ target: { value: 'XYZ987' } } as ChangeEvent<HTMLInputElement>);
        });
        expect(result.current.newPlateNumber).toBe('XYZ987');
    });

    test('should debounce handleOnInputChange and update searchValue', () => {
        vi.useFakeTimers();
        const { result } = setupHook(overloadTransgression);
        act(() => {
            result.current.handleOnInputChange(null, 'R1 - Reason1');
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });
        vi.useRealTimers();
    });

    test('should display plate numbers', () => {
        const { result } = setupHook(overloadTransgression);
        const display = result.current.displayPlateNumbers();

        expect(display).toContain('oldPlateNumber');
        expect(display).toContain('newPlateNumber');
    });

});
