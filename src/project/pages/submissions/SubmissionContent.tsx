import { Box, Grid, Typography, useTheme } from "@mui/material"
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs, { Dayjs } from "dayjs"
import { Fragment } from "react/jsx-runtime"
import tinycolor from "tinycolor2"
import SubmissionDetails, { SubmissionDetailsData } from "../../components/submission/SubmissionDetails"
import { ChangeEvent, useContext } from "react"
import { SubmissionContext } from "./SubmissionContext"
import { useTranslation } from "react-i18next"
import { ConfigContext } from "../../../framework/config/ConfigContext"
import { OverloadTransgressionDto, RtqsTransgressionDto, TransgressionConfiguration } from "../../redux/api/transgressionsApi"
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { toTitleCase } from "../../../framework/utils"

const SubmissionContent = () => {

    const { t } = useTranslation();
    const theme = useTheme();

    const {
        submissionDate,
        submissionReason,
        transgression,
        transgressionConfig,
        submission,
        submissionDeadline,
        submissionAlreadyExists,
        submissionDateError,
        searchValueError,
        resetFields,
        resetSearch,
        setSubmissionDate,
        setSubmissionReason,
        checkSubmissionDateValidity,
    } = useContext(SubmissionContext);
    const configContext = useContext(ConfigContext);

    const validDateFeedback = () => {
        if (submissionDateError === t('submissionDateRequired') || submissionDateError === undefined) {
            return t('submissionDateHelperText');
        }
        else {
            return submissionDateError;
        }
    }

    const handleSubmissionDateChange = (date: Dayjs | null) => {
        setSubmissionDate(date ?? undefined);
        checkSubmissionDateValidity(date ?? undefined);
    };

    const handleSubmissionReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setSubmissionReason(event.target.value);
    };

    const getMaxDate = (submissionDeadline: string | number | dayjs.Dayjs | Date | null | undefined, transgressionDate: string | number | dayjs.Dayjs | Date | null | undefined) => {
        const today = dayjs();
        const deadlineDate = dayjs(submissionDeadline);
        const transgressionDateObj = dayjs(transgressionDate);

        if (deadlineDate.isBefore(today) && transgressionDateObj.isBefore(today)) {
            return deadlineDate.endOf('day');
        }
        return today;
    };

    const submissionDetailsData: SubmissionDetailsData = {
        submissionAlreadyExists: submissionAlreadyExists as boolean,
        noticeNumber: submission?.noticeNumber as string ?? transgression?.noticeNumber?.number as string,
        transgressionDate: submission ? dayjs(submission?.transgressionDate).format(configContext.dateTime.dateFormat) :
            dayjs(transgression?.transgressionDate).format(configContext.dateTime.dateFormat),
        offenderName: submission?.offenderName ?? transgression?.driver?.firstNames + ' ' + transgression?.driver?.surname,
        transgressionStatus: submission?.transgressionStatus as string ?? transgression?.status as string,
        submissionDeadline: dayjs(submissionDeadline).format(configContext.dateTime.dateFormat),
        submissionDate: submissionDate as Dayjs,
        submissionDateValid: !submissionDateError && !!submissionDate,
        submissionStatus: submission?.submissionStatus as string,
        submissionRegistrationDate: submission && dayjs(submission.submissionRegistrationDate).format(configContext.dateTime.dateFormat),
        submissionOutcome: submission?.submissionOutcomes,
        submissionReason: submissionReason ?? '',
        transgression: transgression as OverloadTransgressionDto | RtqsTransgressionDto,
        transgressionConfig: transgressionConfig as TransgressionConfiguration,
    };

    return (
        <>
            {(transgression || submission) && (
                <Fragment>
                    <Box borderTop={1} borderColor="divider" mt={2} pt={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <span id="submissionDate" data-testId="submissionDate">
                                        <DesktopDatePicker
                                            label={t('submissionDate')}
                                            onChange={handleSubmissionDateChange}
                                            value={submissionDate ?? null}
                                            disabled={submissionAlreadyExists}
                                            format={configContext.dateTime.dateFormat}
                                            minDate={dayjs(transgression?.transgressionDate).startOf('day')}
                                            maxDate={getMaxDate(submissionDeadline, transgression?.transgressionDate)}
                                            sx={{
                                                marginTop: 2,
                                                background: submissionDateError ? tinycolor(theme.palette.error.light).darken(10).setAlpha(0.20).toRgbString() : 'inherit'
                                            }}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    required: true,
                                                    error: !!submissionDateError,
                                                    helperText: "",
                                                    id: 'submissionDateInput',
                                                    inputProps: {
                                                        id: 'submissionDate',
                                                        'data-testid': 'submissionDate'
                                                    }
                                                },
                                                openPickerButton: {
                                                    id: 'submissionDate' + 'OpenPicker'
                                                },
                                                previousIconButton: {
                                                    id: 'submissionDate' + 'PreviousMonth'
                                                },
                                                nextIconButton: {
                                                    id: 'submissionDate' + 'NextMonth'
                                                },
                                                switchViewButton: {
                                                    id: 'submissionDate' + 'YearPicker'
                                                }
                                            }}

                                        />
                                    </span>
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                    </Box>
                    {
                        submissionAlreadyExists ? <br /> :
                            <label style={{ color: (validDateFeedback() === t('submissionDateHelperText')) ? 'inherit' : theme.palette.error.main }}
                                id='dateFeedbackLabel'>
                                {validDateFeedback()}
                            </label>
                    }
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <SubmissionDetails
                                componentData={submissionDetailsData}
                                onSubmissionReasonChange={handleSubmissionReasonChange}
                                onResetSearch={resetSearch}
                                onResetFields={resetFields}
                            />
                        </Grid>

                        {(submissionDetailsData.submissionAlreadyExists) &&
                            <Grid id="submissionRegisteredGrid" size={{ xs: 12, md: 4 }} textAlign={"center"} display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>
                                <CheckCircleOutlineIcon color="success" sx={{ fontSize: "100px" }} id="submissionRegisteredIcon" />
                                <Typography id="submissionRegistered" variant='h6'>{toTitleCase(t('submissionRegistered'))}</Typography>
                                <Typography id="submissionRegistrationDate" variant='h6'>{submissionDetailsData.submissionRegistrationDate}</Typography>
                            </Grid>
                        }
                    </Grid>
                </Fragment>
            )}
            {(searchValueError && !transgression && !submission) && (
                <Box mt={2} borderBottom={1} borderColor='divider'>
                    <label style={{ color: theme.palette.error.main }} id='feedbackLabel'>
                        {searchValueError}
                    </label>
                </Box>
            )}
            {(!searchValueError && !transgression && !submission) && (
                <Box mt={2} borderTop={1} borderColor='divider'>
                    <label id='feedbackLabel'>
                        {t('findTransgressionHelperText')}
                    </label>
                </Box>
            )}
        </>
    );
};

export default SubmissionContent;
