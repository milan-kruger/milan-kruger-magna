import { Stack } from "@mui/material";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import { ReactNode } from "react";
import TmDatePicker from "../../../framework/components/textfield/date-time/TmDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { t } from "i18next";
import { CourtDocumentsView } from "../../enum/CourtDocumentsView";
import { localiseCourtName } from "../../../framework/utils";

type Props = {
    courtNameList: string[];
    courtName: string | null;
    handleCourtNameChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
    courtNameError: () => boolean;
    courtRoomList: string[];
    courtRoom: string | null;
    handleCourtRoomChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
    courtRoomError: () => boolean;
    handleCourtDateChange: (date: Dayjs | null) => void;
    courtDate: dayjs.Dayjs | null;
    courtDateList: dayjs.Dayjs[];
    courtDateError: () => boolean;
    view: CourtDocumentsView;
    maxCourtDate?: dayjs.Dayjs;
    helperTextMessage?: string;
}

const CourtDocumentDetails = ({ courtNameList, courtName, handleCourtNameChange, courtNameError,
    courtRoomList, courtRoom, handleCourtRoomChange, courtRoomError, handleCourtDateChange, courtDate, courtDateList,
    courtDateError, view, maxCourtDate, helperTextMessage
}: Props) => {

    return (
        <Stack spacing={view !== CourtDocumentsView.CONTROL_DOCUMENTS ? 25 : 10}>
            <TmAutocomplete
                testid={"courtName"}
                label={t("courtName")}
                renderInput={(): ReactNode => { return }}
                options={courtNameList}
                value={courtName}
                onChange={handleCourtNameChange}
                error={courtNameError()}
                required={true}
                getOptionLabel={(courtName: string) => localiseCourtName(courtName)}

            />
            <TmAutocomplete
                testid={"courtRoom"}
                label={t("courtRoom")}
                renderInput={(): ReactNode => { return }}
                options={courtRoomList}
                value={courtRoom}
                onChange={handleCourtRoomChange}
                error={courtRoomError()}
                required={true}
                disabled={!courtName}
            />
            <TmDatePicker
                sx={{ minHeight: "51px" }}
                testid={"courtDate"}
                label={t('courtDate')}
                setDateValue={handleCourtDateChange}
                dateValue={courtDate}
                maxDate={maxCourtDate ?? undefined}
                required={true}
                disabled={!courtRoom}
                shouldDisableDate={(date: Dayjs) => {
                    return !courtDateList.some((courtDate) => courtDate.isSame(date, 'day'));
                }}
                shouldDisableMonth={(date: Dayjs) => {
                    return !courtDateList.some((courtDate) => courtDate.isSame(date, 'month'));
                }}
                shouldDisableYear={(date: Dayjs) => {
                    return !courtDateList.some((courtDate) => courtDate.isSame(date, 'year'));
                }}
                error={courtDateError()}
                helperText={helperTextMessage}
            />
        </Stack>
    );
}

export default CourtDocumentDetails;
