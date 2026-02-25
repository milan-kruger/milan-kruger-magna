import { renderHook } from "@testing-library/react";
import { act, PropsWithChildren } from "react";
import useAdjudicationManager from "../../hooks/adjudication/AdjudicationManager";
import { Address, Court, SubmissionSummaryDto } from "../../redux/api/transgressionsApi";
import { AdjudicateSubmissionContext, AdjudicateSubmissionContextInterface } from "../../pages/adjudication/AdjudicateSubmissionContext";
import dayjs from "dayjs";

const mockNavigate = vi.fn();

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({
        state: { courtNames: ["Test Court"] },
        pathname: '/test'
    })
}));

const mockProvideSubmissionSummary = vi.fn();
const mockStartNextAdjudication = vi.fn();

vi.mock('../../redux/api/transgressionsApi', () => ({
    useInitialiseAdjudicationQuery: () => ({ data: undefined, isLoading: false }),
    useProvideSubmissionSummaryMutation: () => [mockProvideSubmissionSummary, { isLoading: false }],
    useStartNextAdjudicationMutation: () => [mockStartNextAdjudication, { isLoading: false }]
}));

const createMockCourt = (
    courtName: string,
    courtCode: string,
    authorityCode: string,
    districtCode: string,
    districtName: string
): Court => ({
    courtName,
    courtCode,
    courtRooms: [],
    authorityCodes: [authorityCode],
    districtCode,
    districtName,
    address: {} as Address
});

const mockCourts = [
    createMockCourt("Gobabis Court", "GC", "AUTH1", "DIST1", "DISTRICT1"),
    createMockCourt("Brakwater Court", "BC", "AUTH2", "DIST2", "DISTRICT2")
];

const mockSetSubmissionSummaries = vi.fn();

const createWrapper = (contextOverrides?: Partial<AdjudicateSubmissionContextInterface>) => {
    const defaultContext: AdjudicateSubmissionContextInterface = {
        submission: undefined,
        outcomes: undefined,
        transgression: undefined,
        transgressionConfig: undefined,
        isLoading: false,
        adjudicateSubmission: vi.fn(),
        isAdjudicating: false,
        setIsAdjudicating: vi.fn(),
        isCaptured: false,
        setIsCaptured: vi.fn(),
        cancelAdjudication: vi.fn(),
        updateOutcomes: vi.fn(),
        isCanceling: false,
        setIsCanceling: vi.fn(),
        startAdjudication: vi.fn(),
        initiateNextAdjudication: vi.fn(),
        allSubmissionsAdjudicated: false,
        endAdjudication: vi.fn(),
        openCancelDialog: false,
        setOpenCancelDialog: vi.fn(),
        submissionSummaries: [],
        setSubmissionSummaries: mockSetSubmissionSummaries,
        sessionId: undefined,
        setSessionId: vi.fn(),
    };
    const mergedContext = { ...defaultContext, ...contextOverrides };
    return ({ children }: PropsWithChildren) => (
        <AdjudicateSubmissionContext.Provider value={mergedContext}>
            {children}
        </AdjudicateSubmissionContext.Provider>
    );
};

const createMockSubmissionSummary = (overrides: Partial<SubmissionSummaryDto> = {}): SubmissionSummaryDto => ({
    courtDate: new Date().toISOString(),
    noticeNumber: "N001",
    offenderName: "Test Offender",
    submissionStatus: "REGISTERED",
    courtName: "Test Court",
    courtResult: true,
    ...overrides
});

describe("AdjudicationManager", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Court selection", () => {

        test('should retrieve court names', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });
            let courts: string[] = [];

            act(() => {
                result.current.setCourts(mockCourts);
            });
            act(() => {
                courts = result.current.getCourtNames();
            });

            expect(courts).toEqual(["All Courts", "Gobabis Court", "Brakwater Court"]);
        });

        test('should reset court selection', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            act(() => {
                result.current.setSelectedCourts(["Gobabis Court"]);
            });
            act(() => {
                result.current.resetCourtSelection();
            });

            expect(result.current.selectedCourts).toEqual([]);
        });

        test('should add all courts to selected courts when "All Courts" is selected', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            act(() => {
                result.current.setCourts(mockCourts);
            });
            act(() => {
                result.current.handleCourtSelection(["All Courts"]);
            });

            expect(result.current.selectedCourts).toEqual(["Gobabis Court", "Brakwater Court"]);
        });

        test('should set selected courts to the selected value', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            act(() => {
                result.current.handleCourtSelection(["Gobabis Court"]);
            });

            expect(result.current.selectedCourts).toEqual(["Gobabis Court"]);
        });

        test('should return only "All Courts" when no courts are set', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });
            let courts: string[] = [];

            act(() => {
                courts = result.current.getCourtNames();
            });

            expect(courts).toEqual(["All Courts"]);
        });
    });

    describe("checkDisplayBlockResult", () => {

        test('should return "courtResultsRequired" when court result is false and current date is after court date', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const currentDate = dayjs('2025-06-15');
            const courtDate = dayjs('2025-06-10');

            let blockResult = '';
            act(() => {
                blockResult = result.current.checkDisplayBlockResult(false, currentDate, courtDate);
            });

            expect(blockResult).toBe('courtResultsRequired');
        });

        test('should return empty string when court result is true', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const currentDate = dayjs('2025-06-15');
            const courtDate = dayjs('2025-06-10');

            let blockResult = '';
            act(() => {
                blockResult = result.current.checkDisplayBlockResult(true, currentDate, courtDate);
            });

            expect(blockResult).toBe('');
        });

        test('should return empty string when current date is before court date', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const currentDate = dayjs('2025-06-05');
            const courtDate = dayjs('2025-06-10');

            let blockResult = '';
            act(() => {
                blockResult = result.current.checkDisplayBlockResult(false, currentDate, courtDate);
            });

            expect(blockResult).toBe('');
        });
    });

    describe("sortSubmissionSummaries", () => {

        test('should filter out non-REGISTERED submissions', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const summaries: SubmissionSummaryDto[] = [
                createMockSubmissionSummary({ noticeNumber: "N001", submissionStatus: "PENDING_ADJUDICATION", courtDate: "2099-01-15T00:00:00.000Z" }),
                createMockSubmissionSummary({ noticeNumber: "N002", submissionStatus: "REGISTERED", courtDate: "2099-01-15T00:00:00.000Z" }),
                createMockSubmissionSummary({ noticeNumber: "N003", submissionStatus: "ADJUDICATED", courtDate: "2099-01-15T00:00:00.000Z" }),
            ];

            let sorted: SubmissionSummaryDto[] | undefined;
            act(() => {
                sorted = result.current.sortSubmissionSummaries(summaries);
            });

            expect(sorted).toHaveLength(1);
            expect(sorted![0].noticeNumber).toBe("N002");
        });

        test('should sort registered submissions by court date ascending', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const summaries: SubmissionSummaryDto[] = [
                createMockSubmissionSummary({ noticeNumber: "N001", courtDate: "2099-03-15T00:00:00.000Z" }),
                createMockSubmissionSummary({ noticeNumber: "N002", courtDate: "2099-01-10T00:00:00.000Z" }),
                createMockSubmissionSummary({ noticeNumber: "N003", courtDate: "2099-02-20T00:00:00.000Z" }),
            ];

            let sorted: SubmissionSummaryDto[] | undefined;
            act(() => {
                sorted = result.current.sortSubmissionSummaries(summaries);
            });

            expect(sorted).toHaveLength(3);
            expect(sorted![0].noticeNumber).toBe("N002");
            expect(sorted![1].noticeNumber).toBe("N003");
            expect(sorted![2].noticeNumber).toBe("N001");
        });

        test('should sort by notice number ascending when court dates are the same', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const sameDate = "2099-06-15T00:00:00.000Z";
            const summaries: SubmissionSummaryDto[] = [
                createMockSubmissionSummary({ noticeNumber: "N003", courtDate: sameDate }),
                createMockSubmissionSummary({ noticeNumber: "N001", courtDate: sameDate }),
                createMockSubmissionSummary({ noticeNumber: "N002", courtDate: sameDate }),
            ];

            let sorted: SubmissionSummaryDto[] | undefined;
            act(() => {
                sorted = result.current.sortSubmissionSummaries(summaries);
            });

            expect(sorted).toHaveLength(3);
            expect(sorted![0].noticeNumber).toBe("N001");
            expect(sorted![1].noticeNumber).toBe("N002");
            expect(sorted![2].noticeNumber).toBe("N003");
        });

        test('should filter out submissions requiring court results (courtResult false and past court date)', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const pastDate = "2020-01-01T00:00:00.000Z";
            const futureDate = "2099-06-15T00:00:00.000Z";

            const summaries: SubmissionSummaryDto[] = [
                createMockSubmissionSummary({ noticeNumber: "N001", courtDate: pastDate, courtResult: false }),
                createMockSubmissionSummary({ noticeNumber: "N002", courtDate: futureDate, courtResult: true }),
                createMockSubmissionSummary({ noticeNumber: "N003", courtDate: futureDate, courtResult: false }),
            ];

            let sorted: SubmissionSummaryDto[] | undefined;
            act(() => {
                sorted = result.current.sortSubmissionSummaries(summaries);
            });

            expect(sorted).toHaveLength(2);
            expect(sorted![0].noticeNumber).toBe("N002");
            expect(sorted![1].noticeNumber).toBe("N003");
        });

        test('should return undefined when no valid submissions exist', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            const summaries: SubmissionSummaryDto[] = [
                createMockSubmissionSummary({ noticeNumber: "N001", submissionStatus: "PENDING_ADJUDICATION" }),
            ];

            let sorted: SubmissionSummaryDto[] | undefined;
            act(() => {
                sorted = result.current.sortSubmissionSummaries(summaries);
            });

            expect(sorted).toBeUndefined();
        });
    });

    describe("handleFindCourts", () => {

        test('should navigate to submission summary page when no form errors', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            act(() => {
                result.current.setSelectedCourts(["Gobabis Court"]);
            });
            act(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result.current.handleFindCourts({ errors: {} } as any);
            });

            expect(mockNavigate).toHaveBeenCalledWith(
                '/submission-adjudication/submission-summary',
                {
                    replace: true,
                    state: { courtNames: ["Gobabis Court"] }
                }
            );
        });

        test('should not navigate when form has courtNames errors', () => {
            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            act(() => {

                result.current.handleFindCourts({
                    errors: { courtNames: { type: 'required', message: 'Required' } }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any);
            });

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe("handleCourtsSubmissions", () => {

        test('should call provideSubmissionSummary with correct parameters', () => {
            mockProvideSubmissionSummary.mockReturnValue({
                unwrap: () => Promise.resolve({ submissionSummaries: [] })
            });

            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            act(() => {
                result.current.handleCourtsSubmissions();
            });

            expect(mockProvideSubmissionSummary).toHaveBeenCalledWith({
                provideSubmissionSummaryRequest: {
                    submissionStatuses: ["PENDING_ADJUDICATION", "REGISTERED"],
                    courtNames: ["Test Court"],
                    currentDate: expect.any(String),
                }
            });
        });

        test('should set submission summaries when context has empty list and response has summaries', async () => {
            const mockSummaries = [createMockSubmissionSummary()];
            mockProvideSubmissionSummary.mockReturnValue({
                unwrap: () => Promise.resolve({ submissionSummaries: mockSummaries })
            });

            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleCourtsSubmissions();
            });

            expect(mockSetSubmissionSummaries).toHaveBeenCalledWith(mockSummaries);
        });

        test('should not set submission summaries when context already has summaries', async () => {
            const existingSummaries = [createMockSubmissionSummary({ noticeNumber: "EXISTING" })];
            const newSummaries = [createMockSubmissionSummary({ noticeNumber: "NEW" })];

            mockProvideSubmissionSummary.mockReturnValue({
                unwrap: () => Promise.resolve({ submissionSummaries: newSummaries })
            });

            const { result } = renderHook(() => useAdjudicationManager(), {
                wrapper: createWrapper({ submissionSummaries: existingSummaries })
            });

            await act(async () => {
                result.current.handleCourtsSubmissions();
            });

            expect(mockSetSubmissionSummaries).not.toHaveBeenCalled();
        });
    });

    describe("handleNextSubmission", () => {

        test('should call startNextAdjudication and navigate on response', async () => {
            const mockResponse = {
                submissionSummary: createMockSubmissionSummary({ noticeNumber: "N100" }),
                submission: {},
                transgression: {}
            };

            mockStartNextAdjudication.mockReturnValue({
                unwrap: () => Promise.resolve(mockResponse)
            });

            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.handleNextSubmission();
            });

            expect(mockStartNextAdjudication).toHaveBeenCalledWith({
                startNextAdjudicationRequest: {
                    courtNames: ["Test Court"],
                }
            });

            expect(mockNavigate).toHaveBeenCalledWith(
                '/submission-adjudication/adjudicate-submission/N100',
                {
                    replace: true,
                    state: {
                        submissions: mockResponse.submissionSummary,
                        transgressionDetails: mockResponse.transgression,
                        submissionDetails: mockResponse.submission,
                        courtNames: ["Test Court"]
                    }
                }
            );
        });

        test('should not navigate when response is falsy', async () => {
            mockStartNextAdjudication.mockReturnValue({
                unwrap: () => Promise.resolve(null)
            });

            const { result } = renderHook(() => useAdjudicationManager(), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.handleNextSubmission();
            });

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
