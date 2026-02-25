import '../mocks/mui.vi.mock';
import '../mocks/i18next.vi.mock';

import { cleanup, renderHook, waitFor } from '@testing-library/react'
import useCourtResultManager from '../../hooks/court-results/CourtResultManager';
import dayjs from 'dayjs';
import { MockData } from '../mocks/MockData';
import { act } from 'react';

const mockNavigate = vi.fn();

const mockProvideCourtCaseList = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({
        courtCaseList: [MockData.getCourtCaseList],
        courtRegisterFound: true
    })
}));
const mockInitialiseCourtDocuments = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({
        courts: [MockData.getCourts],
        adjudicationTimeFence: 3
    })
}));

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("../../redux/api/transgressionsApi.ts", async () => {
    const actual = await vi.importActual("../../redux/api/transgressionsApi");

    return {
        ...actual,
        useInitialiseCourtDocumentsMutation: vi.fn(() => [mockInitialiseCourtDocuments, { isLoading: false, reset() {} }]),
        useProvideCourtCaseListMutation: vi.fn(() => [mockProvideCourtCaseList, { isLoading: false, reset() {} }])
    };
});

describe("CourtResultManager", () => {

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test('should set showNoCourtRegisterFound to true if court register is not found', async () => {
        mockProvideCourtCaseList.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({
                courtCaseList: [],
                courtRegisterFound: false
            })
        });

        const { result } = renderHook(() => useCourtResultManager());

        expect(result.current.showNoCourtRegisterFound).toBe(false);

        await act(async () => {
            await result.current.generateCourtResults('High Court', 'Room 101', dayjs('2025-03-05'));
        });

        expect(result.current.showNoCourtRegisterFound).toBe(true); // After calling generateCourtResults
    })

    test('should call retrieveCourtCaseList with correct data and navigate on success', async () => {
        mockProvideCourtCaseList.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({
                courtCaseList: [MockData.getCourtCaseList],
                courtRegisterFound: true
            })
        });

        const { result } = renderHook(() => useCourtResultManager());

        const mockDate = dayjs('2025-03-05');
        const courtName = 'High Court';
        const courtRoom = 'Room 101';

        expect(result.current.generateCourtResults).toBeDefined();  // Ensure the function exists!

        await act(async () => {
            result.current.generateCourtResults(courtName, courtRoom, mockDate);
        });

        await waitFor(() =>
            expect(mockProvideCourtCaseList).toHaveBeenCalledWith(expect.objectContaining({
                provideCourtCaseListRequest: {
                    courtName,
                    courtRoom,
                    courtDate: "2025-03-05"
                }
            }))
        );

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith("court-case-list", expect.objectContaining({
                state: expect.objectContaining({
                    courtCaseList: expect.arrayContaining([MockData.getCourtCaseList]),
                    courtData: expect.objectContaining({
                        courtName,
                        courtRoom,
                        courtDate: "2025-03-05"
                    }),
                    courts: []
                })
            }))
        );
    });

});
