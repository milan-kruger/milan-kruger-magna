import { Box, Grid, Theme, Typography, useMediaQuery, useTheme } from "@mui/material";
import TmTypography from "../../../framework/components/typography/TmTypography";
import { t } from "i18next";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import TmCheckboxAutocomplete from "../../../framework/components/textfield/TmCheckboxAutocomplete";
import TmDatePicker from "../../../framework/components/textfield/date-time/TmDatePicker";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import TmButton from "../../../framework/components/button/TmButton";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import { ReactNode } from "react";
import dayjs, { Dayjs } from "dayjs";
import { localiseCourtName } from "../../../framework/utils";
import { CyclePeriod } from "../../enum/CyclePeriod";

type Props = {
    isLoading: boolean;
    courtNameList: string[];
    courtName: string | null;
    handleCourtNameChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
    courtNameError: () => boolean;
    courtRoomList: string[];
    courtRoom: string | null;
    handleCourtRoomChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
    courtRoomError: () => boolean;
    handleFromDateChange: (date: Dayjs | null) => void;
    fromDate: dayjs.Dayjs | null;
    fromDateList: dayjs.Dayjs[];
    fromDateError: () => boolean;
    handleToDateChange: (date: Dayjs | null) => void;
    toDate: dayjs.Dayjs | null;
    toDateList: dayjs.Dayjs[];
    toDateError: () => boolean;
    scheduleDaysList: string[];
    scheduleDays: string[];
    handleScheduleDaysChange: (event: React.SyntheticEvent<Element, Event>, newValue: string[]) => void;
    scheduleDaysError: () => boolean;
    cycleList: string[];
    cycle: string | null;
    handleCycleChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
    cycleError: () => boolean;
    repeatEvery: number;
    handleRepeatEveryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    repeatEveryError: () => boolean;
    occursOnList: string[];
    occursOn: string | null;
    handleOccursOnChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
    occursOnError: () => boolean;
    handleGenerate: () => void;
    handleView: () => void;
    generateDisabled: boolean;
    errorMessage: string | null;
    maxCourtDate?: dayjs.Dayjs;
    helperTextMessage?: string;
}

const CourtScheduleForm = (props: Props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const pageName = 'courtSchedule';

    return (
        <>
            {props.isLoading ? <TmLoadingSpinner testid="courtScheduleLoadingSpinner" /> :
                <Box px={isMobile ? 20 : 50} py={15} border={3} borderColor={theme.palette.primary.main} borderRadius={5}
                    maxWidth={1000} m="15px auto">
                    <TmTypography testid="courtScheduleHeading" data-testid="courtScheduleHeading" variant="h4" color="primary" mb={5}>{t(`${pageName}.courtScheduleHeading`)}</TmTypography>
                    <TmTypography testid="courtScheduleSubHeading" variant="body1" color={theme.palette.text.primary} mb={5}>{t(`${pageName}.courtScheduleSubHeading`)}</TmTypography>

                    <Box display="flex" alignItems="center" mb={15}>
                        <TmTypography testid="selectExistingSchedule" variant="body1" color={theme.palette.text.primary} mr={10}>{t(`${pageName}.selectExistingSchedule`)}</TmTypography>
                        <TmButton testid="viewScheduleButton" variant="contained" color="primary" onClick={props.handleView}>
                            {t(`${pageName}.view`)}
                        </TmButton>
                    </Box>

                    <Grid container spacing={10}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TmAutocomplete
                                testid={"courtName"}
                                label={t("courtName")}
                                renderInput={(): ReactNode => { return }}
                                options={props.courtNameList}
                                value={props.courtName}
                                onChange={props.handleCourtNameChange}
                                error={props.courtNameError()}
                                required={true}
                                getOptionLabel={(courtName: string) => localiseCourtName(courtName)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TmAutocomplete
                                testid={"courtRoom"}
                                label={t("courtRoom")}
                                renderInput={(): ReactNode => { return }}
                                options={props.courtRoomList}
                                value={props.courtRoom}
                                onChange={props.handleCourtRoomChange}
                                error={props.courtRoomError()}
                                required={true}
                                disabled={!props.courtName}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TmDatePicker
                                sx={{ minHeight: "51px" }}
                                testid={"fromDate"}
                                label={t(`${pageName}.fromDate`)}
                                setDateValue={props.handleFromDateChange}
                                dateValue={props.fromDate}
                                maxDate={props.maxCourtDate ?? undefined}
                                required={true}
                                disabled={!props.courtRoom}
                                shouldDisableDate={(date: Dayjs) => {
                                    return !props.fromDateList.some((courtDate) => courtDate.isSame(date, 'day'));
                                }}
                                shouldDisableMonth={(date: Dayjs) => {
                                    return !props.fromDateList.some((courtDate) => courtDate.isSame(date, 'month'));
                                }}
                                shouldDisableYear={(date: Dayjs) => {
                                    return !props.fromDateList.some((courtDate) => courtDate.isSame(date, 'year'));
                                }}
                                error={props.fromDateError()}
                                helperText={props.helperTextMessage}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TmDatePicker
                                sx={{ minHeight: "51px" }}
                                testid={"toDate"}
                                label={t(`${pageName}.toDate`)}
                                setDateValue={props.handleToDateChange}
                                dateValue={props.toDate}
                                maxDate={props.maxCourtDate ?? undefined}
                                required={true}
                                disabled={!props.fromDate}
                                shouldDisableDate={(date: Dayjs) => {
                                    return !props.toDateList.some((courtDate) => courtDate.isSame(date, 'day'));
                                }}
                                shouldDisableMonth={(date: Dayjs) => {
                                    return !props.toDateList.some((courtDate) => courtDate.isSame(date, 'month'));
                                }}
                                shouldDisableYear={(date: Dayjs) => {
                                    return !props.toDateList.some((courtDate) => courtDate.isSame(date, 'year'));
                                }}
                                error={props.toDateError()}
                                helperText={props.helperTextMessage}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={10} alignItems="flex-end">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TmCheckboxAutocomplete
                                testid={"scheduleDays"}
                                label={t(`${pageName}.scheduleDays`)}
                                renderInput={(): ReactNode => { return }}
                                options={props.scheduleDaysList}
                                value={props.scheduleDays}
                                onChange={props.handleScheduleDaysChange}
                                error={props.scheduleDaysError()}
                                required={true}
                                disabled={!props.courtRoom}
                                limitTags={2}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TmAutocomplete
                                testid={"cycle"}
                                label={t(`${pageName}.cycle`)}
                                renderInput={(): ReactNode => { return }}
                                options={props.cycleList}
                                value={props.cycle}
                                onChange={props.handleCycleChange}
                                error={props.cycleError()}
                                required={true}
                                disabled={!props.courtRoom}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TmTextField
                                testid={"repeatEvery"}
                                label={t(`${pageName}.repeatEvery`)}
                                type="number"
                                value={props.repeatEvery}
                                onChange={props.handleRepeatEveryChange}
                                error={props.repeatEveryError()}
                                required={true}
                                disabled={!props.courtRoom}
                                sx={{ width: '100%' }}
                            />
                        </Grid>
                        {props.cycle === CyclePeriod.MONTH && (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <TmAutocomplete
                                    testid={"occursOn"}
                                    label={t(`${pageName}.occursOn`)}
                                    renderInput={(): ReactNode => { return }}
                                    options={props.occursOnList}
                                    value={props.occursOn}
                                    onChange={props.handleOccursOnChange}
                                    error={props.occursOnError()}
                                    required={true}
                                    disabled={!props.courtRoom}
                                />
                            </Grid>
                        )}
                    </Grid>

                    <Box display="flex" flexDirection="column" alignItems="center" mt={15}>
                        <TmButton
                            testid="generateScheduleButton"
                            variant="contained"
                            color="primary"
                            disabled={props.generateDisabled}
                            onClick={props.handleGenerate}
                        >
                            {t(`${pageName}.generate`)}
                        </TmButton>
                        {props.errorMessage && (
                            <Typography sx={{ marginTop: 10 }} color={theme.palette.error.main}>
                                {props.errorMessage}
                            </Typography>
                        )}
                    </Box>
                </Box>
            }
        </>
    );
};

export default CourtScheduleForm;
