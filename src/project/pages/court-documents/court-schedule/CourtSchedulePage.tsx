import { Box } from "@mui/material";
import dayjs from "dayjs";
import CourtScheduleManager from "../../../hooks/court-schedule/CourtScheduleManager";
import CourtScheduleForm from "../../../components/court-schedule/CourtScheduleForm";

function CourtSchedulePage() {

    const {
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
        scheduleDaysList,
        scheduleDays,
        handleScheduleDaysChange,
        scheduleDaysError,
        cycleList,
        cycle,
        handleCycleChange,
        cycleError,
        repeatEvery,
        handleRepeatEveryChange,
        repeatEveryError,
        occursOnList,
        occursOn,
        handleOccursOnChange,
        occursOnError,
        handleGenerate,
        handleView,
        generateDisabled,
        errorMessage,
    } = CourtScheduleManager();

    return (
        <Box width={"100%"}>
            <CourtScheduleForm
                isLoading={isLoading}
                courtNameList={courtNameList}
                courtName={courtName}
                handleCourtNameChange={handleCourtNameChange}
                courtNameError={courtNameError}
                courtRoomList={courtRoomList}
                courtRoom={courtRoom}
                handleCourtRoomChange={handleCourtRoomChange}
                courtRoomError={courtRoomError}
                fromDate={fromDate}
                fromDateList={fromDateList}
                fromDateError={fromDateError}
                handleFromDateChange={handleFromDateChange}
                toDate={toDate}
                toDateList={toDateList}
                toDateError={toDateError}
                handleToDateChange={handleToDateChange}
                scheduleDaysList={scheduleDaysList}
                scheduleDays={scheduleDays}
                handleScheduleDaysChange={handleScheduleDaysChange}
                scheduleDaysError={scheduleDaysError}
                cycleList={cycleList}
                cycle={cycle}
                handleCycleChange={handleCycleChange}
                cycleError={cycleError}
                repeatEvery={repeatEvery}
                handleRepeatEveryChange={handleRepeatEveryChange}
                repeatEveryError={repeatEveryError}
                occursOnList={occursOnList}
                occursOn={occursOn}
                handleOccursOnChange={handleOccursOnChange}
                occursOnError={occursOnError}
                handleGenerate={handleGenerate}
                handleView={handleView}
                generateDisabled={generateDisabled}
                errorMessage={errorMessage}
                maxCourtDate={dayjs().add(1, 'year').endOf('day')}
            />
        </Box>
    )
}

export default CourtSchedulePage;
