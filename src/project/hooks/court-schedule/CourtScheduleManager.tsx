import dayjs, { Dayjs } from "dayjs";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Court, useProvideCourtMutation, useGenerateCourtScheduleMutation } from "../../redux/api/transgressionsApi";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import { ScheduleWeekdays } from "../../enum/ScheduleWeekdays";
import { CyclePeriod } from "../../enum/CyclePeriod";
import { OccursOn } from "../../enum/OccursOn";
import { ROUTE_NAMES } from "../../Routing";
import { PrintDocumentsState } from "../printing/PrintDocumentsManager";

const SCHEDULE_DAYS_LIST = Object.values(ScheduleWeekdays);
const CYCLE_LIST = Object.values(CyclePeriod);
const OCCURS_ON_LIST = Object.values(OccursOn);

// Exclude "ALL" from the actual weekdays type sent to backend
type ActualWeekdaysType = Exclude<`${ScheduleWeekdays}`, "ALL">;
type CyclePeriodType = `${CyclePeriod}`;
type OccursOnType = `${OccursOn}`;

const CourtScheduleManager = () => {
    const config = useContext(ConfigContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [provideCourt, { isLoading: isProvideCourtLoading }] = useProvideCourtMutation();
    const [generateCourtSchedule, { isLoading: isGenerateLoading }] = useGenerateCourtScheduleMutation();
    const [isLoading, setIsLoading] = useState(false);

    const [courts, setCourts] = useState<Court[]>([]);
    const [courtNameList, setCourtNameList] = useState<string[]>([]);
    const [courtRoomList, setCourtRoomList] = useState<string[]>([]);
    const [fromDateList, setFromDateList] = useState<Dayjs[]>([]);
    const [toDateList, setToDateList] = useState<Dayjs[]>([]);

    const [courtName, setCourtName] = useState<string | null>(null);
    const [courtRoom, setCourtRoom] = useState<string | null>(null);
    const [fromDate, setFromDate] = useState<Dayjs | null>(null);
    const [toDate, setToDate] = useState<Dayjs | null>(null);

    const [scheduleDays, setScheduleDays] = useState<string[]>([]);
    const [cycle, setCycle] = useState<string | null>(null);
    const [repeatEvery, setRepeatEvery] = useState<number>(1);
    const [occursOn, setOccursOn] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(isProvideCourtLoading || isGenerateLoading);
    }, [isProvideCourtLoading, isGenerateLoading]);

    useEffect(() => {
        provideCourt({
            provideCourtRequest: {
                authorityCodes: [config.tenancy.tenant]
            }
        }).unwrap().then((response) => {
            const courtList = response.courts ?? [];
            setCourts(courtList);
            setCourtNameList(courtList.map((court: Court) => court.courtName));
        });
    }, [provideCourt, config.tenancy.tenant]);

    const courtNameError = () => !courtName;
    const courtRoomError = () => !courtRoom;
    const fromDateError = () => !fromDate;
    const toDateError = () => !toDate;
    const scheduleDaysError = () => scheduleDays.length === 0;
    const cycleError = () => !cycle;
    const repeatEveryError = () => repeatEvery < 1;
    const occursOnError = () => cycle === "MONTH" && !occursOn;

    const generateDisabled = courtNameError() || courtRoomError() || fromDateError() || toDateError()
        || scheduleDaysError() || cycleError() || repeatEveryError() || occursOnError();

    const handleCourtNameChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
        setCourtName(newValue);
        setCourtRoom(null);
        setFromDate(null);
        setToDate(null);
        setFromDateList([]);
        setToDateList([]);
        setErrorMessage(null);
        setCourtRoomList(courts.find((court: Court) =>
            court.courtName === newValue
        )?.courtRooms.map((courtRoom) => courtRoom.room) ?? []);
    };

    const handleCourtRoomChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
        setCourtRoom(newValue);
        setFromDate(null);
        setToDate(null);
        setToDateList([]);

        const bookingDates = courts.find((court: Court) =>
            court.courtName === courtName
        )?.courtRooms.find((courtRoom) =>
            courtRoom.room === newValue
        )?.courtRoomBookings
            .filter((booking) => booking.remainingCapacity > 0)
            .map((booking) => dayjs(booking.operatingDate)) ?? [];

        setFromDateList(bookingDates);
    };

    const handleFromDateChange = (date: Dayjs | null) => {
        setFromDate(date);
        setToDate(null);

        if (date) {
            setToDateList(fromDateList.filter((d) => d.isAfter(date) || d.isSame(date, 'day')));
        } else {
            setToDateList([]);
        }
    };

    const handleToDateChange = (date: Dayjs | null) => {
        setToDate(date);
    };

    const handleScheduleDaysChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string[]) => {
        if (newValue.includes("ALL") && !scheduleDays.includes("ALL")) {
            setScheduleDays(SCHEDULE_DAYS_LIST);
        } else if (!newValue.includes("ALL") && scheduleDays.includes("ALL")) {
            setScheduleDays([]);
        } else {
            const withoutAll = newValue.filter((day) => day !== "ALL");
            if (withoutAll.length === SCHEDULE_DAYS_LIST.length - 1) {
                setScheduleDays(SCHEDULE_DAYS_LIST);
            } else {
                setScheduleDays(withoutAll);
            }
        }
    };

    const handleCycleChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
        setCycle(newValue);
        // Clear occursOn when switching to WEEK cycle as it's not needed
        if (newValue === CyclePeriod.WEEK) {
            setOccursOn(null);
        }
    };

    const handleRepeatEveryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        setRepeatEvery(isNaN(value) ? 1 : Math.max(1, value));
    };

    const handleOccursOnChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
        setOccursOn(newValue);
    };

    const handleGenerate = async () => {
        if (!courtName || !courtRoom || !fromDate || !toDate) return;

        // Get the selected court
        const selectedCourt = courts.find((court) => court.courtName === courtName);
        if (!selectedCourt) return;

        // Get the selected court room
        const selectedCourtRoom = selectedCourt.courtRooms.find((room) => room.room === courtRoom);
        if (!selectedCourtRoom) return;

        // Build the request with all required fields
        // If "ALL" is selected, send all individual weekdays (excluding "ALL" itself)
        const actualScheduleDays = scheduleDays.includes(ScheduleWeekdays.ALL)
            ? SCHEDULE_DAYS_LIST.filter((day) => day !== ScheduleWeekdays.ALL)
            : scheduleDays;

        const request = {
            dateFrom: fromDate.format("YYYY-MM-DD"),
            dateTo: toDate.format("YYYY-MM-DD"),
            scheduleDays: actualScheduleDays as ActualWeekdaysType[],
            cycle: cycle as CyclePeriodType,
            occursOn: occursOn as OccursOnType | undefined,
            repeatEvery: repeatEvery,
            court: selectedCourt,
            courtRoom: selectedCourtRoom,
            courtRoomBookings: selectedCourtRoom.courtRoomBookings,
        };

        try {
            const response = await generateCourtSchedule({
                generateCourtScheduleRequest: request,
            }).unwrap();

            // Check if the generation was successful
            if (response.encodedPdf === null) {
                setErrorMessage(t("courtSchedule.noFeasibleDatesError"));
                return;
            }

            // Clear any previous error messages
            setErrorMessage(null);

            // Navigate to print documents page with the PDF
            if (response.encodedPdf) {
                navigate(`/${ROUTE_NAMES.printDocuments}`, {
                    state: {
                        printDocumentsState: {
                            accessRoles: ['COURTSCHEDULE_MAINTAIN'],
                            printHeader: t('courtSchedule.printCourtSchedule'),
                            confirmMessage: t("courtSchedule.confirmCourtSchedulePrintedMessage"),
                            documents: [
                                {
                                    label: t('courtSchedule.printCourtSchedule'),
                                    id: "courtSchedule",
                                    type: "COURT_SCHEDULE",
                                    base64: [response.encodedPdf],
                                }
                            ],
                        } as PrintDocumentsState
                    }
                });
            }
        } catch (error) {
            console.error("Failed to generate court schedule:", error);
            setErrorMessage(t("courtSchedule.generateError"));
        }
    };

    const handleView = () => {
        // implement view existing schedule
    };

    return {
        isLoading,
        courtNameList,
        courtRoomList,
        courtName,
        courtNameError,
        handleCourtNameChange,
        courtRoom,
        courtRoomError,
        handleCourtRoomChange,
        fromDate,
        fromDateList,
        fromDateError,
        handleFromDateChange,
        toDate,
        toDateList,
        toDateError,
        handleToDateChange,
        scheduleDaysList: SCHEDULE_DAYS_LIST,
        scheduleDays,
        handleScheduleDaysChange,
        scheduleDaysError,
        cycleList: CYCLE_LIST,
        cycle,
        handleCycleChange,
        cycleError,
        repeatEvery,
        handleRepeatEveryChange,
        repeatEveryError,
        occursOnList: OCCURS_ON_LIST,
        occursOn,
        handleOccursOnChange,
        occursOnError,
        handleGenerate,
        handleView,
        generateDisabled,
        errorMessage,
    };
};

export default CourtScheduleManager;
