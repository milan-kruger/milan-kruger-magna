import { renderHook } from "@testing-library/react";
import MockReduxProvider from "../../../framework/_test/MockReduxProvider";
import useCaptureTransgressionManager from "../../hooks/prosecution/CaptureTransgressionManager";
import { act } from "react";
import { MockData } from "../mocks/MockData";
import { ROUTE_NAMES } from "../../Routing";

const mockConfigSelector = { config: { subsystem: { apps: { weigh: "weigh" } } } };
const mockFormSelector = { formData: MockData.getTransgression };
const mockPathName = vi.fn(() => "/test-path");
const mockNavigate = vi.fn();
const mockAppDispatch = vi.fn();
const mockAppSelector = vi.fn((selector: { name?: string }) => {
    // Handle different selectors appropriately
    if (selector && selector.name === 'selectConfig') {
        return mockConfigSelector;
    }
    if (selector && selector.name === 'selectForm') {
        return mockFormSelector;
    }
    // Default return for any other selector
    return mockFormSelector;
});

const mockUpdateVehicleWeighDetails = vi.fn().mockResolvedValue({});
const mockUpdateOverloadTransgressionInformation = vi.fn().mockReturnValue({
    unwrap: vi.fn().mockResolvedValue({noticeNumber: {number: 'Notice123'}}),
});

vi.mock("sockjs-client", () => ({ default: vi.fn() }));
vi.mock("@stomp/stompjs", () => ({ Client: vi.fn() }));
vi.mock("../../pages/aarto/notice-management/NoticeManagementPage", () => ({ default: () => null }));

vi.mock('react-router-dom', async() => {
    const originalModule = await vi.importActual('react-router-dom');
    return {
        ...originalModule,
        useNavigate: () => mockNavigate,
        useParams: () => ({ sequenceNumber: '12345' }),
        useLocation: vi.fn(() => ({
            state: {
                newTransgression: true,
                overloadTransgression: MockData.getTransgression,
                transgressionDetails: {}
            },
            pathname: mockPathName(),
        })),
    };
});

vi.mock('react', async () => {
    const actualReact = await vi.importActual<typeof import('react')>('react');
    return {
        ...actualReact,
        useContext: vi.fn(),
    }
});

vi.mock("../../../framework/redux/hooks", async() => {
    const originalModule = await vi.importActual("../../../framework/redux/hooks");
    return {
        ...originalModule,
        useAppDispatch: () => mockAppDispatch,
        useAppSelector: (selector: { name?: string }) => mockAppSelector(selector),
    }
});

vi.mock('../../../framework/config/configSlice', async() => {
    const originalModule = await vi.importActual('../../../framework/config/configSlice');
    return {
        ...originalModule,
        config: { subsystem: { apps: { weigh: "weigh" } } },
    }
});

vi.mock('../../redux/api/transgressionsApi', async() => {
    const originalModule = await vi.importActual('../../redux/api/transgressionsApi');
    return {
        ...originalModule,
        useGenerateOverloadTransgressionMutation: vi.fn(() => ([
            vi.fn(),
            { isLoading: false }
        ])),
        useUpdateOverloadTransgressionInformationMutation: vi.fn(() => ([
            mockUpdateOverloadTransgressionInformation,
            { isLoading: false }
        ])),
    }
});

vi.mock('../../redux/api/coreApi', async() => {
    const originalModule = await vi.importActual('../../redux/api/coreApi');
    return {
        ...originalModule,
        useFindAllIdentityTypesQuery: vi.fn(() => ({
            data: [{ name: 'ID', description: 'Identity Document' }],
        })),
        useGetLoggedInUserQuery: vi.fn(() => ({
            data: { userId: 'test-user' },
        })),
    }
});

vi.mock('../../redux/api/weighApi', async() => {
    const originalModule = await vi.importActual('../../redux/api/weighApi');
    return {
        ...originalModule,
        useUpdateVehicleWeighDetailsMutation: vi.fn(() => ([
            mockUpdateVehicleWeighDetails,
            { isLoading: false }
        ]))
    }
});

describe('CaptureTransgressionManager', async() => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should set editable and findTransgressionConfigurationRequest onEdit', () => {
        const { result } = renderHook(() => useCaptureTransgressionManager(() => {}), {
            wrapper: MockReduxProvider
        });

        act(() => {
            result.current.onEdit();
        });

        expect(result.current.isEditable).toBe(true);
    });

    it("should disable editing onDisableEdit", () => {
        const { result } = renderHook(() => useCaptureTransgressionManager(() => {}), {
            wrapper: MockReduxProvider
        });

        act(() => {
            result.current.onDisableEdit();
        });

        expect(result.current.isEditable).toBe(false);
    });

    it("should reset transgression details redux global state onDisableEdit", () => {
        const { result } = renderHook(() => useCaptureTransgressionManager(() => {}), {
            wrapper: MockReduxProvider
        });

        act(() => {
            result.current.onDisableEdit();
        });

        expect(mockAppDispatch).toHaveBeenNthCalledWith(1, {payload: true, type: "transgression/setNewTransgression"});
        expect(mockAppDispatch).toHaveBeenNthCalledWith(2, {payload: {}, type: "transgression/setFormData"});
        expect(mockAppDispatch).toHaveBeenNthCalledWith(3, {payload: {}, type: "transgression/setInitialFormData"});
    });

    it('should navigate to overload transgression list route onCancel when current path is transgression details onCancel', () => {
        mockPathName.mockReturnValue(ROUTE_NAMES.transgressionDetailsRoute);
        const { result } = renderHook(() => useCaptureTransgressionManager(() => {}), {
            wrapper: MockReduxProvider
        });

        act(() => {
            result.current.onCancel();
        });

        expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE_NAMES.overloadTransgression}`, { replace: true });
    });

    it('should navigate to rtqs transgression list route onCancel when current path is rtqs transgression create onCancel', () => {
        mockPathName.mockReturnValue(ROUTE_NAMES.rtqsTransgressionCreate);
        const { result } = renderHook(() => useCaptureTransgressionManager(() => {}), {
            wrapper: MockReduxProvider
        });

        act(() => {
            result.current.onCancel();
        });

        expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE_NAMES.rtqsTransgression}`, { replace: true });
    });

    it('should navigate to rtqs transgression list route onCancel when current path is rtqs transgression details onCancel', () => {
        mockPathName.mockReturnValue(ROUTE_NAMES.rtqsTransgressionDetails);
        const { result } = renderHook(() => useCaptureTransgressionManager(() => {}), {
            wrapper: MockReduxProvider
        });

        act(() => {
            result.current.onCancel();
        });

        expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE_NAMES.rtqsTransgression}`, { replace: true });
    });

    //TODO Fix test

    it('should update vehicle weigh details when onUpdateVehicleWeighDetails is called', () => {
        const { result } = renderHook(() => useCaptureTransgressionManager(() => { }), {
            wrapper: MockReduxProvider
        });

        act(() => {
            result.current.onUpdateVehicleWeighDetails("Notice123");
        });

        expect(mockUpdateVehicleWeighDetails).toHaveBeenCalled();
        // expect(mockUpdateVehicleWeighDetails).toHaveBeenCalledWith({
        //     updateVehicleWeighDetailsRequest: {
        //         businessAddressLine1: mockFormSelector.formData?.operator?.businessAddressLine1,
        //         businessCity: mockFormSelector.formData?.operator?.businessCity,
        //         businessPostalCode: mockFormSelector.formData?.operator?.businessPostalCode,
        //         contactNumber: mockFormSelector.formData?.driver?.contactNumber?.number,
        //         dateOfBirth: mockFormSelector.formData?.driver?.dateOfBirth,
        //         driverName: mockFormSelector.formData?.driver?.firstNames,
        //         driverSurname: mockFormSelector.formData?.driver?.surname,
        //         emailAddress: null,
        //         identificationNumber: mockFormSelector.formData?.driver?.identification?.number,
        //         identificationType: mockFormSelector.formData?.driver?.identification?.idType,
        //         noticeNumber: "Notice123",
        //         residentialAddressLine1: mockFormSelector.formData?.driver?.residentialAddressLine1,
        //         residentialCity: mockFormSelector.formData?.driver?.residentialCity,
        //         residentialPostalCode: mockFormSelector.formData?.driver?.residentialPostalCode,
        //         sequenceNumber: 12345,
        //     },
        // });
    });

    it('should update Overload Transgression Information when onUpdateOverloadTransgression is called', async() => {
        mockUpdateVehicleWeighDetails.mockResolvedValueOnce({ noticeNumber: { number: 'Notice123' } });
        const { result } = renderHook(() => useCaptureTransgressionManager(() => {}), {
            wrapper: MockReduxProvider
        });

        await act(() => {
            result.current.onUpdateOverloadTransgression();
        });

        expect(mockUpdateOverloadTransgressionInformation).toHaveBeenCalled();
    });
});
