import dayjs, { Dayjs } from "dayjs";
import { useCallback, useState } from "react";
import { Court } from "../../redux/api/transgressionsApi";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "react-i18next";
import { CourtDocumentsView } from "../../enum/CourtDocumentsView";
import { NoticeType } from "../../enum/NoticeType";

type Props = {
    handleGenerateDocuments: (courtName: string, courtRoom: string, courtDate: Dayjs) => void;
    adjudicationTimeFence: number;
    courts: Court[];
    view: CourtDocumentsView;
}

const useCourtDocumentsGeneratorManager =
    ({ handleGenerateDocuments, adjudicationTimeFence, courts, view }: Props) => {

        const { t } = useTranslation();

        // Field States
        const [courtName, setCourtName] = useState<string | null>(null);
        const [courtRoom, setCourtRoom] = useState<string | null>(null);
        const [courtDate, setCourtDate] = useState<Dayjs | null>(null);
        const [noticeType, setNoticeType] = useState<string | null>(null);
        const [pagePerOfficer, setPagePerOfficer] = useState<boolean>(false);

        // Validations
        const courtNameError = () => { return !courtName; }
        const courtRoomError = () => { return !courtRoom; }
        const courtDateError = () => {
            return !courtDate ||
                !courtDateList.some((date) => date.isSame(courtDate, 'date')) ||
                courtDate.isAfter(dayjs().add(adjudicationTimeFence!, 'days'));
        }

        const courtDateErrorWarrant = () => {
            return !courtDate || courtDate?.isAfter(dayjs()) ||
            !courtDateList.some((date) => date.isSame(courtDate, 'date'))
        }
        const noticeTypeError = () => { return !noticeType; }

        // Data
        const [courtRoomList, setCourtRoomList] = useState<string[]>([]);
        const [courtDateList, setCourtDateList] = useState<Dayjs[]>([]);
        const [noticeTypeList] = useState<string[]>(["All"].concat(Object.values(NoticeType)));

        // Handlers
        const handleCourtNameChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
            setCourtName(newValue);
            setCourtRoom(null);
            setCourtDate(null);
            setCourtRoomList(courts.find((court: Court) =>
                court.courtName === newValue
            )?.courtRooms.map((courtRoom) => courtRoom.room) || []);
        }

        const handleCourtRoomChange = (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
            setCourtRoom(newValue);
            setCourtDate(null);
            setCourtDateList(courts.find((court: Court) =>
                court.courtName === courtName
            )?.courtRooms.find((courtRoom) =>
                courtRoom.room === newValue
            )?.courtRoomBookings.map((courtRoomBooking) => dayjs(courtRoomBooking.operatingDate)) || []);
        }

        const handleCourtDateChange = (date: Dayjs | null) => {
            setCourtDate(date);
        }

        const handleNoticeTypeChange = (_event: React.SyntheticEvent<Element, Event>, value: string | null) => {
            setNoticeType(value);
        }

        const handlePagePerOfficerChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            setPagePerOfficer(checked);
        }

        const helperTextMessage = () => {
            switch (view) {
                case CourtDocumentsView.COURT_REGISTER:
                    return courtDate?.isAfter(dayjs().add(adjudicationTimeFence!, 'days')) &&
                        courtDateList.some((date) => date.isSame(courtDate, 'date')) ?
                        t('courtDatePastAdjudicationTimeFence') : ''
                case CourtDocumentsView.WARRANT_OF_ARREST_REGISTER:
                    if (courtDate && courtDateErrorWarrant()) {
                        return t("courtDatePassedMessage")
                    }
            }

        };

        const getHotKeyDescription = useCallback(() => {
            switch (view) {
                case CourtDocumentsView.COURT_REGISTER:
                    return t("generateCourtRegister") ?? undefined;
                case CourtDocumentsView.CONTROL_DOCUMENTS:
                    return t("generateRegisterOfControlDocuments") ?? undefined;
                case CourtDocumentsView.COURT_RESULTS:
                    return t("submit") ?? undefined;
                case CourtDocumentsView.WARRANT_OF_ARREST_REGISTER:
                    return t("generateWarrantsOfArrestRegister") ?? undefined;
                default:
                    return undefined;
            }
        }, [t, view]);

        useHotkeys(view === CourtDocumentsView.COURT_RESULTS ? "ALT+S" : "CTRL+G", () => {
            if (!courtNameError() && !courtRoomError() && !courtDateError()) {
                handleGenerateDocuments(courtName!, courtRoom!, courtDate!)
            }
        }, {
            preventDefault: true,
            enableOnFormTags: true,
            description: getHotKeyDescription(),
        });

        return {
            courtName,
            courtRoom,
            courtDate,
            noticeType,
            pagePerOfficer,
            courtNameError,
            courtRoomError,
            courtDateError,
            noticeTypeError,
            courtRoomList,
            courtDateList,
            noticeTypeList,
            handleCourtNameChange,
            handleCourtRoomChange,
            handleCourtDateChange,
            handleNoticeTypeChange,
            handlePagePerOfficerChange,
            helperTextMessage,
            courtDateErrorWarrant
        }
    }

export default useCourtDocumentsGeneratorManager;
