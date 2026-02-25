import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import useRegisterOfControlDocumentsManager from '../../hooks/court-documents/RegisterOfControlDocumentsManager';
import { Dayjs } from 'dayjs';
import { act } from 'react';

// Mock dependencies
const mockNavigate = vi.fn();
const mockT = vi.fn((key) => key);
const mockFinaliseRegisterOfControlDocuments = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ noticeNumbers: ['123'], encodedPdf: 'pdfdata' }) }));
const mockRetrieveTransgression = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ transgressions: [{ noticeNumber: { number: '123' } }] }) }));
const mockInitialiseCourtDocuments = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ courts: [{ courtName: 'Court 1' }], adjudicationTimeFence: 10 }) }));
const mockFindCourtRegister = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ courtRegister: true }) }));

const mockUseAppSelector = vi.fn(() => { return 'WB1'; });

vi.mock("sockjs-client", () => ({ default: vi.fn() }));
vi.mock("@stomp/stompjs", () => ({ Client: vi.fn() }));
vi.mock("../../pages/aarto/notice-management/NoticeManagementPage", () => ({ default: () => null }));

vi.mock('../../redux/api/transgressionsApi', async () => {
    const original = await vi.importActual('../../redux/api/transgressionsApi');
    return {
        ...original,
        useFinaliseRegisterOfControlDocumentsMutation: () => [mockFinaliseRegisterOfControlDocuments, { isLoading: false }],
        useRetrieveTransgressionMutation: () => [mockRetrieveTransgression, { isLoading: false }],
        useInitialiseCourtDocumentsMutation: () => [mockInitialiseCourtDocuments, { isLoading: false }],
        useFindCourtRegisterMutation: () => [mockFindCourtRegister, { isLoading: false }],
        useAuthoriseSupervisorOverrideMutation: () => [vi.fn(), { isLoading: false }]
    };
});

vi.mock('react-router-dom', async () => {
    const original = await vi.importActual('react-router-dom');
    return {
        ...original,
        useNavigate: () => mockNavigate,
        useLocation: vi.fn()
    }
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT })
}));
vi.mock('../../../framework/auth/authService', () => ({
    default: { getUserName: vi.fn(() => 'TestUser') }
}));
vi.mock('../../../framework/redux/hooks', async () => {
    const original = await vi.importActual('../../../framework/redux/hooks');
    return {
        ...original,
        useAppSelector: () => mockUseAppSelector()
    }
});


describe('useRegisterOfControlDocumentsManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('initializes with default values and fetches courts', async () => {
        const { result } = renderHook(() => useRegisterOfControlDocumentsManager());
        await waitFor(() => {
            expect(result.current.courts).toEqual([{ courtName: 'Court 1' }]);
            expect(result.current.adjudicationTimeFence).toBe(10);
            expect(result.current.courtNameList).toEqual(['Court 1']);
        });
    });

    test('generateRegisterOfControlDocuments finds register and retrieves transgressions', async () => {
        const { result } = renderHook(() => useRegisterOfControlDocumentsManager());
        const fakeDayjs = { format: vi.fn(() => '2025-05-20') } as unknown as Dayjs;
        await act(async () => {
            await result.current.generateRegisterOfControlDocuments('Court 1', 'Room 1', fakeDayjs);
        });
        expect(mockFindCourtRegister).toHaveBeenCalledWith({
            findCourtRegisterRequest: {
                courtDate: '2025-05-20',
                courtName: 'Court 1',
                courtRoom: 'Room 1',
            }
        });
        expect(mockRetrieveTransgression).toHaveBeenCalledWith({
            retrieveTransgressionRequest: {
                courtName: 'Court 1',
                courtRoom: 'Room 1',
                courtDate: '2025-05-20',
            }
        });
    });

    test('generateRegisterOfControlDocuments sets showNoCourtRegisterFound if no register', async () => {
        mockFindCourtRegister.mockReturnValueOnce({ unwrap: vi.fn().mockResolvedValue({ courtRegister: null }) });
        const { result } = renderHook(() => useRegisterOfControlDocumentsManager());
        const fakeDayjs = { format: vi.fn(() => '2025-05-20') } as unknown as Dayjs;
        await act(async () => {
            await result.current.generateRegisterOfControlDocuments('Court 1', 'Room 1', fakeDayjs);
        });
        expect(result.current.showNoCourtRegisterFound).toBe(true);
    });

    test('handleFinaliseRegisterOfControlDocuments finalises and navigates to print', async () => {
        const { result } = renderHook(() => useRegisterOfControlDocumentsManager());
        const fakeDayjs = { format: vi.fn(() => '2025-05-20') } as unknown as Dayjs;

        await act(async () => {
            await result.current.generateRegisterOfControlDocuments('Court 1', 'Room 1', fakeDayjs);
        });
        expect(mockFinaliseRegisterOfControlDocuments).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/documents/print'), expect.anything());
    });

    test('setShowTransgressionsNotFoundDialog updates state', () => {
        const { result } = renderHook(() => useRegisterOfControlDocumentsManager());
        act(() => {
            result.current.setShowTransgressionsNotFoundDialog(true);
        });
        expect(result.current.showTransgressionsNotFoundDialog).toBe(true);
    });
});
