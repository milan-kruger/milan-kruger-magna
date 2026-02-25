import { renderHook, waitFor } from "@testing-library/react";
import MockReduxProvider from "../../../framework/_test/MockReduxProvider";
import useProsecuteTransgressionMananger from "../../hooks/prosecution/ProsecuteTransgressionManager";
import { RetrieveTransgressionInformationResponse } from "../../redux/api/transgressionsApi";
import { ROUTE_NAMES } from "../../Routing";


const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ sequenceNumber: '12345' }));
const mockRetrieveTransgressionInformation = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({
        arrestCase: false
    } as RetrieveTransgressionInformationResponse)
}));

vi.mock("sockjs-client", () => ({ default: vi.fn() }));
vi.mock("@stomp/stompjs", () => ({ Client: vi.fn() }));
vi.mock("../../pages/aarto/notice-management/NoticeManagementPage", () => ({ default: () => null }));

vi.mock('react-router-dom', async() => {
    const originalModule = await vi.importActual('react-router-dom');
    return {
        ...originalModule,
        useNavigate: () => mockNavigate,
        useParams: () => ({ sequenceNumber: mockUseParams().sequenceNumber }),
    };
});

// Mock the API hooks
vi.mock('../../redux/api/transgressionsApi', async() => {
    const originalModule = await vi.importActual('../../redux/api/transgressionsApi');
    return {
        ...originalModule,
        useRetrieveOverloadTransgressionInformationMutation: vi.fn(() => ([
            mockRetrieveTransgressionInformation,
            { isLoading: false }
        ])),
        useRemovePendingProsecutionMutation: vi.fn(() => ([
            vi.fn(),
            { isLoading: false }
        ])),
    }
});

describe('ProsecuteTransgressionManager', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should navigate to capture Transgression page when sequenceNumber is valid and arrestCase is false', async () => {
        renderHook(() => useProsecuteTransgressionMananger(), {
            wrapper: MockReduxProvider
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                '/prosecuteTransgression/captureTransgression/12345',
                {
                    replace: true,
                    state: {
                        transgressionDetails: {
                            arrestCase: false,
                            transgressionStatus: 'Unknown',
                        },
                        newTransgression: true,
                        from: ROUTE_NAMES.prosecuteTransgressionRoute
                    }
                }
            );
        });
    });

    it('should navigate to capture correction reason page when sequenceNumber is valid and arrestCase is true', async () => {
        mockRetrieveTransgressionInformation.mockReturnValueOnce({
            unwrap: vi.fn().mockResolvedValue({
                arrestCase: true
            } as RetrieveTransgressionInformationResponse)
        });
        renderHook(() => useProsecuteTransgressionMananger(), {
            wrapper: MockReduxProvider
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                `/${ROUTE_NAMES.captureCorrectionReason}`,
                {
                    state: {
                        transgressionDetails: { arrestCase: true },
                        sequenceNumber: 12345,
                    },
                    replace: true
                }
            );
        });
    });

    it('should stop loading when an error occurs', async () => {
        mockRetrieveTransgressionInformation.mockReturnValueOnce({
            unwrap: vi.fn().mockRejectedValue(new Error('Network Error'))
        });
        const { result } = renderHook(() => useProsecuteTransgressionMananger(), {
            wrapper: MockReduxProvider
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('should stop loading if sequenceNumber is invalid', async () => {
        mockUseParams.mockReturnValueOnce({ sequenceNumber: '' });
        const { result } = renderHook(() => useProsecuteTransgressionMananger(), {
            wrapper: MockReduxProvider
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });
});
