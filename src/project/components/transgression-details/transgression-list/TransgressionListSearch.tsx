import { Grid, Theme, useMediaQuery } from "@mui/material"
import TmDatePicker from "../../../../framework/components/textfield/date-time/TmDatePicker"
import TmButton from "../../../../framework/components/button/TmButton"
import TmAutocomplete from "../../../../framework/components/textfield/TmAutocomplete"
import TmSearch from "../../../../framework/components/list/TmSearch"
import dayjs, { Dayjs } from "dayjs"
import { useTranslation } from "react-i18next"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { TransgressionStatus } from "../../../enum/TransgressionStatus"
import { RetrieveOverloadTransgressionListApiArg } from "../../../redux/api/transgressionsApi"
import TmTextField from "../../../../framework/components/textfield/TmTextField"
import { useHotkeys } from "react-hotkeys-hook"

type TransgressionListSearchProps = {
  onFindTransgressions: (findTransgressionCriteria: RetrieveOverloadTransgressionListApiArg) => void
  onSearchTransgression: (searchValue: string) => void
}

function TransgressionListSearch({ onFindTransgressions, onSearchTransgression }: TransgressionListSearchProps) {


  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const statuses: TransgressionStatus[] = Object.values(TransgressionStatus);
  const [plateNo, setPlateNo] = useState<string>('');
  const [status, setStatus] = useState<TransgressionStatus>('' as TransgressionStatus);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [invalidFromDateMessage, setInvalidFromDateMessage] = useState<string>('');
  const [invalidToDateMessage, setInvalidToDateMessage] = useState<string>('');
  const [fromDateError, setFromDateError] = useState(false);
  const [toDateError, setToDateError] = useState(false);

  const handlePlateNoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const uppercasedValue = event.target.value.toUpperCase();
    setPlateNo(uppercasedValue);
  }

  const handleStatusChange = (_event: React.SyntheticEvent<Element, Event>, value: string | null,): void => {
    if (value != null) {
      setStatus(value as TransgressionStatus);
    } else {
      setStatus('' as TransgressionStatus);
    }
  };

  const handleFromDateChange = (date: Dayjs | null): void => {
    if (date != null) {
      setFromDate(date?.toDate());
      setFromDateError(false);
    } else {
      setFromDateError(true);
    }
  };

  const handleToDateChange = (date: Dayjs | null): void => {
    if (date != null) {
      setToDate(date?.toDate());
      setToDateError(false);
    } else {
      setToDateError(true);
    }
  };

  const handleFind = () => {
    const findTransgressionCriteria: RetrieveOverloadTransgressionListApiArg = {
      plateNumber: plateNo,
      fromDate: dayjs(fromDate).format('YYYY-MM-DDT00:00:00'),
      toDate: dayjs(toDate).format('YYYY-MM-DDT23:59:59'),
      status: status.replace(/ /g, '_') as TransgressionStatus,
      page: 0,
      pageSize: -1,
      sortDirection: "DESC",
      sortFields: ["transgressionDate"],
    };
    onFindTransgressions(findTransgressionCriteria);
  };

  const handleSearch = (searchValue: string): void => {
    onSearchTransgression(searchValue);
  };

  const getOptionLabel = useCallback(
    (option: string) => {
      return t(option);
    },
    [t]
  );

  useEffect(() => {
    if (fromDate && toDate) {
      if (dayjs(fromDate).isAfter(dayjs(toDate))) {
        setInvalidFromDateMessage(t('invalidDateRange'));
      } else if (dayjs(fromDate).isAfter(dayjs(new Date()))) {
        setInvalidFromDateMessage(t('futureDateNotAllowed'));
      } else {
        setInvalidFromDateMessage('');
      }

      if (dayjs(toDate).isBefore(dayjs(fromDate))) {
        setInvalidToDateMessage(t('invalidDateRange'));
      } else if (dayjs(toDate).isAfter(dayjs(new Date()))) {
        setInvalidToDateMessage(t('futureDateNotAllowed'));
      } else {
        setInvalidToDateMessage('');
      }
    }
  }, [fromDate, toDate, t]);

  // Hot keys
  useHotkeys("CTRL+F", () =>
    handleFind(), { preventDefault: true, enableOnFormTags: true, description: t("find") ?? undefined });

  return (
    <Grid container spacing={10} marginBottom={20}>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TmDatePicker
          testid={"dateFrom"}
          label={t('dateFrom')}
          setDateValue={handleFromDateChange}
          disableFuture
          dateValue={dayjs(fromDate)}
          helperText={invalidFromDateMessage}
          error={invalidFromDateMessage !== '' || fromDateError}
          required={true}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TmDatePicker
          testid={"dateTo"}
          label={t('dateTo')}
          setDateValue={handleToDateChange}
          disableFuture
          dateValue={dayjs(toDate)}
          helperText={invalidToDateMessage}
          error={invalidToDateMessage !== '' || toDateError}
          required={true}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TmTextField
          testid={"plateNo"}
          label={t('plateNo')}
          fullWidth
          onChange={handlePlateNoChange}
          value={plateNo}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <TmAutocomplete
          testid={"transgressionStatus"}
          label={t("status")}
          renderInput={(): ReactNode => { return }}
          options={statuses.map(status => status)}
          value={status}
          onChange={handleStatusChange}
          error={false}
          alternative={true}
          getOptionLabel={getOptionLabel}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 2 }}>
        <TmButton
          testid={"findTransgressions"}
          onClick={handleFind}
          color={"primary"}
          variant={"contained"}
          size={"large"}
          fullWidth={isMobile}
          disabled={fromDateError || toDateError}
        >
          {t('find')}
        </TmButton>
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <TmSearch
          testid={'searchTransgression'}
          searchValue={""}
          fullWidth
          onDebouncedChange={handleSearch}
        />
      </Grid>
    </Grid>
  )
}

export default TransgressionListSearch;
