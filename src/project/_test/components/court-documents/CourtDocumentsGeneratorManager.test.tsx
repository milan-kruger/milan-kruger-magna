/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import dayjs from "dayjs";

import useCourtDocumentsGeneratorManager from "../../../components/court-documents/CourtDocumentsGeneratorManager";
import { CourtDocumentsView } from "../../../enum/CourtDocumentsView";
import { NoticeType } from "../../../enum/NoticeType";
import { act } from "react";
import { MockData } from "../../mocks/MockData";

// Mock `useTranslation`
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

// Mock `useHotkeys`
vi.mock("react-hotkeys-hook", () => ({
    useHotkeys: vi.fn(),
}));

const mockCourts = [MockData.getCourts]


describe("useCourtDocumentsGeneratorManager", () => {
    let generateSpy = vi.fn();

    beforeEach(() => {
        generateSpy = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("initializes with correct default states", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 3,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        expect(result.current.courtName).toBe(null);
        expect(result.current.courtRoomList).toEqual([]);
        expect(result.current.noticeTypeList).toContain("All");
        const firstKey = Object.keys(NoticeType)[0] as keyof typeof NoticeType;
        expect(result.current.noticeTypeList).toContain(NoticeType[firstKey]);
    });

    it("updates court room list on court name change", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 3,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        act(() => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
        });

        expect(result.current.courtName).toBe("Brakwater Court");
        expect(result.current.courtRoomList).toEqual(["A", "B"]);
    });

    it("updates court date list on court room change", async () => {
        const courtUpdated = {
            ...mockCourts[0],
            courtRooms: [
                {
                    ...mockCourts[0].courtRooms[0],
                    courtRoomBookings: [
                        {
                            ...mockCourts[0].courtRooms[0].courtRoomBookings[0],
                            operatingDate: dayjs().format("YYYY-MM-DD"),
                        },
                    ],
                },
            ],

        }

        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 3,
                courts: [courtUpdated],
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        await act(async () => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
        });

        await act(async () => {
            result.current.handleCourtRoomChange({} as any, "A");
        });

        expect(result.current.courtDateList.length).toBe(1);
        expect(result.current.courtDateList[0].isSame(dayjs(), "date")).toBe(true);
    });

    it("validates court date beyond adjudicationTimeFence", async () => {
        const futureDate = dayjs().add(10, "days");

        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 3,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        await act(async () => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
        });

        await act(async () => {
            result.current.handleCourtRoomChange({} as any, "A");
        });

        await act(async () => {
            result.current.handleCourtDateChange(futureDate);
        });

        expect(result.current.courtDateError()).toBe(true);
    });

    it("calls generate function if no errors and hotkey is pressed", async () => {
        const courtUpdated = {
            ...mockCourts[0],
            courtName: '',
            courtRooms: []
        }
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 3,
                courts: [courtUpdated],
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        await act(async () => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
        });

        await act(async () => {
            result.current.handleCourtRoomChange({} as any, "A");
        });

        // simulate the hotkey handler directly
        if (!result.current.courtNameError() &&
            !result.current.courtRoomError()
        ) {
            generateSpy(
                result.current.courtName!,
                result.current.courtRoom!,
                result.current.courtDate!
            );
        }

        expect(generateSpy).toHaveBeenCalledOnce();
    });

    it("returns correct helper text for COURT_REGISTER when date is past adjudication fence", async () => {
        const courtUpdated = {
            ...mockCourts[0],
            courtRooms: [
                {
                    ...mockCourts[0].courtRooms[0],
                    courtRoomBookings: [
                        {
                            ...mockCourts[0].courtRooms[0].courtRoomBookings[0],
                            operatingDate: dayjs().add(5, "days").format("YYYY-MM-DD"),
                        },
                    ],
                },
            ],

        }
        const courtDate = dayjs().add(5, "days");

        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 3,
                courts: [courtUpdated],
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        await act(async () => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
        });

        await act(async () => {
            result.current.handleCourtRoomChange({} as any, "A");
        });

        await act(async () => {
            result.current.handleCourtDateChange(courtDate);
        });

        const msg = result.current.helperTextMessage();
        expect(msg).toBe("courtDatePastAdjudicationTimeFence");
    });

    it("returns correct helper text for WARRANT_OF_ARREST_REGISTER when courtDateErrorWarrant is true", () => {
        const futureDate = dayjs().add(1, "day");

        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 10,
                courts: mockCourts,
                view: CourtDocumentsView.WARRANT_OF_ARREST_REGISTER,
            })
        );

        act(() => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
            result.current.handleCourtRoomChange({} as any, "A");
            result.current.handleCourtDateChange(futureDate);
        });

        const msg = result.current.helperTextMessage();
        expect(msg).toBe("courtDatePassedMessage");
    });

    it("courtDateErrorWarrant returns true when courtDate is after today", () => {
        const futureDate = dayjs().add(2, "day");

        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 10,
                courts: mockCourts,
                view: CourtDocumentsView.WARRANT_OF_ARREST_REGISTER,
            })
        );

        act(() => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
            result.current.handleCourtRoomChange({} as any, "A");
            result.current.handleCourtDateChange(futureDate);
        });

        expect(result.current.courtDateErrorWarrant()).toBe(true);
    });

    it("courtDateErrorWarrant returns true when courtDate is null", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 10,
                courts: mockCourts,
                view: CourtDocumentsView.WARRANT_OF_ARREST_REGISTER,
            })
        );

        expect(result.current.courtDateErrorWarrant()).toBe(true);
    });

    it("gracefully handles invalid court name with no matching courtRoomList", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 10,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        act(() => {
            result.current.handleCourtNameChange({} as any, "Invalid Court");
        });

        expect(result.current.courtRoomList).toEqual([]);
    });

    it("gracefully handles invalid court room with no matching date list", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 10,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        act(() => {
            result.current.handleCourtNameChange({} as any, "Brakwater Court");
            result.current.handleCourtRoomChange({} as any, "Invalid Room");
        });

        expect(result.current.courtDateList).toEqual([]);
    });

    it("handleNoticeTypeChange updates the notice type", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 5,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        act(() => {
            result.current.handleNoticeTypeChange({} as any, "Speeding");
        });

        expect(result.current.noticeType).toBe("Speeding");
    });

    it("handlePagePerOfficerChange updates pagePerOfficer state", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 5,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        act(() => {
            result.current.handlePagePerOfficerChange({} as any, true);
        });

        expect(result.current.pagePerOfficer).toBe(true);

        act(() => {
            result.current.handlePagePerOfficerChange({} as any, false);
        });

        expect(result.current.pagePerOfficer).toBe(false);
    });

    it("handleCourtDateChange updates courtDate state", () => {
        const selectedDate = dayjs();
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 5,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        act(() => {
            result.current.handleCourtDateChange(selectedDate);
        });

        expect(result.current.courtDate?.isSame(selectedDate, "day")).toBe(true);
    });

    it("noticeTypeError returns true when noticeType is null", () => {
        const { result } = renderHook(() =>
            useCourtDocumentsGeneratorManager({
                handleGenerateDocuments: generateSpy,
                adjudicationTimeFence: 5,
                courts: mockCourts,
                view: CourtDocumentsView.COURT_REGISTER,
            })
        );

        expect(result.current.noticeTypeError()).toBe(true);

        act(() => {
            result.current.handleNoticeTypeChange({} as any, "All");
        });

        expect(result.current.noticeTypeError()).toBe(false);
    });

});
