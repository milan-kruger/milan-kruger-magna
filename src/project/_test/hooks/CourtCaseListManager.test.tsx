import '../mocks/i18next.vi.mock';

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import useCourtCaseListManager from '../../hooks/court-results/CourtCaseListManager';
import { ConfigContext, initialConfigContextState } from '../../../framework/config/ConfigContext';
import {
    Court,
    CourtCaseEntry,
    useProvideCourtResultSummaryMutation,
    useRetrieveTransgressionDetailsMutation,
} from '../../redux/api/transgressionsApi';
import { initialConfigState } from '../mocks/config.mock';
import { MockData } from '../mocks/MockData';

// Mock API hooks
vi.mock('../../redux/api/transgressionsApi.ts', async () => {
    const actual = await vi.importActual('../../redux/api/transgressionsApi');
    return {
        ...actual,
        useProvideCourtResultSummaryMutation: vi.fn(),
        useRetrieveTransgressionDetailsMutation: vi.fn(),
    };
});

// Mock utilities
vi.mock('react-hotkeys-hook', () => ({ useHotkeys: vi.fn() }));

// Mock router
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

let mockProvideCourtResultSummary = vi.fn();
let mockRetrieveTransgressionDetails = vi.fn();

const createMutationMock = (resolvedValue: unknown) =>
    vi.fn(() => ({
        unwrap: vi.fn().mockResolvedValue(resolvedValue),
    }));

beforeEach(() => {
    mockProvideCourtResultSummary = createMutationMock({
        courtResultSummaries: [MockData.getCourtResultSummary],
    });

    mockRetrieveTransgressionDetails = createMutationMock({
        transgressionDetails: [MockData.getTransgression],
    });

    vi.mocked(useProvideCourtResultSummaryMutation).mockReturnValue([
        mockProvideCourtResultSummary,
        { isLoading: false, reset: () => { } },
    ]);

    vi.mocked(useRetrieveTransgressionDetailsMutation).mockReturnValue([
        mockRetrieveTransgressionDetails,
        { isLoading: false, reset: () => { } },
    ]);
});

const mockState = {
    ...initialConfigContextState,
    ...initialConfigState,
    dateTime: {
        dateFormat: 'YYYY-MM-DD',
        ampmClock: false,
        timeFormat: 'HH:mm',
        dateTimeSecondsFormat: 'HH:mm:ss',
        dateTimeFormat: 'YYYY-MM-DD HH:mm',
    },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigContext.Provider value={mockState}>
        <MemoryRouter>{children}</MemoryRouter>
    </ConfigContext.Provider>
);

const courtCaseList: CourtCaseEntry[] = [
    {
        noticeNumber: '123',
        offenderName: 'John Doe',
        plateNumber: 'ABC123',
        transgressionStatus: 'ISSUED',
        courtDate: '2024-06-01',
        courtName: 'Pretoria',
    },
];

const courtData = {
    courtDate: '2024-06-01',
    courtName: 'Pretoria',
    courtRoom: 'A',
};

const setSearchValue = vi.fn();
const setDisableHistoryButton = vi.fn();

const courts: Court[] = [
    {
        courtName: 'Pretoria',
        courtCode: '',
        authorityCodes: [],
        districtCode: '',
        districtName: '',
        address: {
            addressType: '',
            country: '',
            lineOne: '',
            lineTwo: undefined,
            lineThree: undefined,
            code: undefined,
            city: '',
        },
        courtRooms: [],
    },
];

const createHook = () =>
    renderHook(
        () =>
            useCourtCaseListManager(
                courtCaseList,
                setSearchValue,
                courtData,
                setDisableHistoryButton,
                courts
            ),
        { wrapper }
    );

describe('useCourtCaseListManager', () => {
    test('should initialize and return expected handlers', () => {
        mockProvideCourtResultSummary.mockReturnValue({
            unwrap: () => Promise.resolve({ courtResultSummaries: [] }),
        });

        const { result } = createHook();

        expect(typeof result.current.getRows).toBe('function');
        expect(typeof result.current.handleSearchCourtCase).toBe('function');
        expect(typeof result.current.handleCourtCaseClick).toBe('function');
        expect(typeof result.current.handleOnClickViewHistory).toBe('function');
        expect(typeof result.current.handleOnExit).toBe('function');
        expect(result.current.isLoading).toBe(false);
    });

    test('should call setSearchValue when handleSearchCourtCase is called', async () => {
        const { result } = createHook();

        await act(async () => {
            result.current.handleSearchCourtCase('search');
        });

        expect(setSearchValue).toHaveBeenCalledWith('search');
    });

    test('should call setDisableHistoryButton(true) if no courtResultSummaries', async () => {
        mockProvideCourtResultSummary.mockReturnValue({
            unwrap: () => Promise.resolve({ courtResultSummaries: [] }),
        });

        createHook();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(setDisableHistoryButton).toHaveBeenCalledWith(true);
    });

    test('should call setDisableHistoryButton(false) if courtResultSummaries exist', async () => {
        mockProvideCourtResultSummary.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    courtResultSummaries: [
                        {
                            noticeNumber: '123',
                            offenderName: 'John Doe',
                            plateNumber: 'ABC123',
                            transgressionStatus: 'Open',
                            courtDate: '2024-06-01',
                            courtName: 'Pretoria',
                            courtOutcome: 'Guilty',
                        },
                    ],
                }),
        });

        await act(async () => {
            createHook();
        });

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(setDisableHistoryButton).toHaveBeenCalledWith(false);
    });

    test('should trigger details retrieval and navigate on handleCourtCaseClick', async () => {
        const mockNavigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        mockRetrieveTransgressionDetails.mockReturnValue({
            unwrap: () => Promise.resolve({ transgression: { noticeNumber: '123', offenderName: 'John Doe' } }),
        });

        const { result } = createHook();

        await act(async () => {
            result.current.handleCourtCaseClick({
                noticeNo: '123',
                offenderName: 'John Doe',
                plateNo: 'ABC123',
                status: 'Open',
                courtDate: '2024-06-01',
                courtName: 'Pretoria',
            });
        });

        expect(mockRetrieveTransgressionDetails).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(
            '/court-documents/court-results/court-case-list/capture-court-results/123',
            expect.anything()
        );
    });

    test('should return correct rows from getRows', async () => {
        const { result } = createHook();
        let rows: ReturnType<typeof result.current.getRows> = [];

        await act(async () => {
            rows = result.current.getRows();
        });

        expect(rows[0]).toMatchObject({
            courtDate: '2024-06-01',
            courtName: 'Pretoria',
            noticeNo: '123',
            offenderName: 'John Doe',
            plateNo: 'ABC123',
            status: 'ISSUED',
        });
    });

    test('should navigate to court-result-history with court result data', async () => {
        const mockSetDisableHistoryButton = vi.fn();
        const mockNavigate = vi.fn();
        const mockSetSearchValue = vi.fn();

        const mockResponse = {
            courtResultSummaries: [
                {
                    noticeNumber: '123',
                    offenderName: 'John Doe',
                    plateNumber: 'ABC123',
                    transgressionStatus: 'Open',
                    courtDate: '2024-06-01',
                    courtName: 'Pretoria',
                    courtOutcome: 'Guilty',
                },
            ],
        };

        mockProvideCourtResultSummary = createMutationMock({ courtResultSummaries: mockResponse.courtResultSummaries });

        vi.mocked(useProvideCourtResultSummaryMutation).mockReturnValue([
            mockProvideCourtResultSummary,
            { isLoading: false, reset: () => { } },
        ]);
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        const { result } = renderHook(() =>
            useCourtCaseListManager([], mockSetSearchValue, courtData, mockSetDisableHistoryButton, courts)
        );

        await waitFor(() => {
            expect(mockSetDisableHistoryButton).toHaveBeenCalledWith(false);
        });

        act(() => {
            result.current.handleOnClickViewHistory();
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            '/court-documents/court-results/court-result-history',
            {
                state: {
                    courtResultHistory: [
                        {
                            noticeNo: '123',
                            offenderName: 'John Doe',
                            plateNo: 'ABC123',
                            status: 'Open',
                            courtDate: '01/06/2024',
                            courtName: 'Pretoria',
                            courtResult: 'Guilty',
                        },
                    ],
                },
            }
        );
    });
});
