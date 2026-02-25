/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import useSubmissionManager from "../../hooks/submissions/SubmissionManager";
import { SubmissionDto } from "../../redux/api/transgressionsApi";
import { SubmissionContext } from "../../pages/submissions/SubmissionContext";
import dayjs from "dayjs";
import { act, PropsWithChildren } from "react";

const mockSearchValue = "NOTICE123";
const mockSetSearchValue = vi.fn();
const mockResetFields = vi.fn();
const mockSetSubmissionDate = vi.fn();
const mockSetSubmissionReason = vi.fn();
const mockSetTransgression = vi.fn();
const mockSetTransgressionConfig = vi.fn();
const mockSetSubmission = vi.fn();
const mockSetSubmissionDeadline = vi.fn();
const mockSetSubmissionAlreadyExists = vi.fn();
const mockSetSearchValueError = vi.fn();
const mockCheckSubmissionDateValidity = vi.fn();

const mockRetrieveSubmissionRequest = vi.fn();

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('../../redux/api/transgressionsApi', () => ({
    useRetrieveSubmissionByNoticeNumberMutation: () => [mockRetrieveSubmissionRequest, { isLoading: false }]
}));

const createWrapper = (contextOverrides?: Record<string, unknown>) => {
    const defaultContext = {
        submissionDate: undefined,
        submissionReason: undefined,
        searchValue: mockSearchValue,
        transgression: undefined,
        transgressionConfig: undefined,
        submission: undefined,
        submissionDeadline: undefined,
        submissionAlreadyExists: undefined,
        submissionDateError: undefined,
        searchValueError: undefined,
        resetFields: mockResetFields,
        resetSearch: vi.fn(),
        setSubmissionDate: mockSetSubmissionDate,
        setSubmissionReason: mockSetSubmissionReason,
        setSearchValue: mockSetSearchValue,
        setTransgression: mockSetTransgression,
        setTransgressionConfig: mockSetTransgressionConfig,
        setSubmission: mockSetSubmission,
        setSubmissionDeadline: mockSetSubmissionDeadline,
        setSubmissionAlreadyExists: mockSetSubmissionAlreadyExists,
        setSubmissionDateError: vi.fn(),
        setSearchValueError: mockSetSearchValueError,
        checkSubmissionDateValidity: mockCheckSubmissionDateValidity,
    };
    const mergedContext = { ...defaultContext, ...contextOverrides };
    return ({ children }: PropsWithChildren) => (
        <SubmissionContext.Provider value={mergedContext as any}>
            {children}
        </SubmissionContext.Provider>
    );
};

describe("SubmissionManager", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("handleSearchChange", () => {

        test('should update search value', () => {
            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            act(() => {
                result.current.handleSearchChange("ChangedValue");
            });

            expect(mockSetSearchValue).toHaveBeenCalledWith("ChangedValue");
        });
    });

    describe("handleSearch - transgression found", () => {

        test('should clear search value error when transgression is found', async () => {
            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({ transgression: {} })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockSetSearchValueError).toHaveBeenCalledWith(undefined);
        });

        test('should reset fields and set transgression details on successful search', async () => {
            const mockTransgression = { id: 'T1' };
            const mockConfig = { id: 'C1' };

            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({
                    transgression: mockTransgression,
                    transgressionConfiguration: mockConfig,
                    submission: undefined,
                    submissionDeadline: '2025-07-01',
                })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockResetFields).toHaveBeenCalled();
            expect(mockSetTransgression).toHaveBeenCalledWith(mockTransgression);
            expect(mockSetTransgressionConfig).toHaveBeenCalledWith(mockConfig);
            expect(mockSetSubmission).toHaveBeenCalledWith(undefined);
            expect(mockSetSubmissionDeadline).toHaveBeenCalledWith('2025-07-01');
            expect(mockSetSubmissionAlreadyExists).toHaveBeenCalledWith(false);
        });
    });

    describe("handleSearch - transgression not found", () => {

        test('should set error to transgressionNotIssuedToRegisterSubmission when not issued', async () => {
            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({ transgression: undefined, transgressionStatusIsIssued: false })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockSetSearchValueError).toHaveBeenCalledWith("transgressionNotIssuedToRegisterSubmission");
        });

        test('should set error to transgressionNotFound when issued but no transgression', async () => {
            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({ transgression: undefined, transgressionStatusIsIssued: true })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockSetSearchValueError).toHaveBeenCalledWith("transgressionNotFound");
        });
    });

    describe("handleSearch - submission found", () => {

        test('should set submission details when submission exists', async () => {
            const mockSubmission = {
                submissionDate: '2025-05-23',
                submissionDeadline: '2025-06-23',
                submissionReason: 'Reason',
            } as SubmissionDto;

            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({
                    transgression: {},
                    submission: mockSubmission,
                })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockSetSubmissionDate).toHaveBeenCalledWith(dayjs('2025-05-23'));
            expect(mockSetSubmissionDeadline).toHaveBeenCalledWith('2025-06-23');
            expect(mockSetSubmissionReason).toHaveBeenCalledWith('Reason');
        });

        test('should call checkSubmissionDateValidity when submission exists', async () => {
            const mockSubmission = {
                submissionDate: '2025-05-23',
                submissionDeadline: '2025-06-23',
                submissionReason: 'Reason',
            } as SubmissionDto;

            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({
                    transgression: {},
                    submission: mockSubmission,
                })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockCheckSubmissionDateValidity).toHaveBeenCalledWith(dayjs('2025-05-23'));
        });

        test('should set submissionAlreadyExists to true when submission exists', async () => {
            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({
                    transgression: {},
                    submission: { submissionDate: '2025-05-23' } as SubmissionDto,
                })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockSetSubmissionAlreadyExists).toHaveBeenCalledWith(true);
        });
    });

    describe("handleSearch - error", () => {

        test('should reset fields, transgression and submission when an error occurs', async () => {
            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.reject({})
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockResetFields).toHaveBeenCalled();
            expect(mockSetTransgression).toHaveBeenCalledWith(undefined);
            expect(mockSetTransgressionConfig).toHaveBeenCalledWith(undefined);
            expect(mockSetSubmission).toHaveBeenCalledWith(undefined);
            expect(mockSetSubmissionDeadline).toHaveBeenCalledWith(undefined);
            expect(mockSetSearchValueError).toHaveBeenCalledWith("findTransgressionError");
        });
    });

    describe("returned values", () => {

        test('should return searchValue from context', () => {
            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            expect(result.current.searchValue).toBe("NOTICE123");
        });

        test('should return searchValue from context override', () => {
            const { result } = renderHook(() => useSubmissionManager(), {
                wrapper: createWrapper({ searchValue: "OVERRIDE456" })
            });

            expect(result.current.searchValue).toBe("OVERRIDE456");
        });

        test('should send correct notice number in retrieve request', async () => {
            mockRetrieveSubmissionRequest.mockReturnValue({
                unwrap: () => Promise.resolve({ transgression: {} })
            });

            const { result } = renderHook(() => useSubmissionManager(), { wrapper: createWrapper() });

            await act(async () => {
                result.current.handleSearch();
            });

            expect(mockRetrieveSubmissionRequest).toHaveBeenCalledWith({
                retrieveSubmissionRequest: {
                    noticeNumber: "NOTICE123"
                }
            });
        });
    });
});
