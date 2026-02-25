import { Grid } from "@mui/material"
import TmSearch from "../../../framework/components/list/TmSearch"
import TmButton from "../../../framework/components/button/TmButton";
import { useTranslation } from "react-i18next";

type CourtDocumentsListSearchProps = {
  onSearchValue: (searchValue: string) => void
  onClickButton: () => void
  buttonHeading: string;
  disableButton: boolean,
}

function CourtDocumentsListSearch({ onSearchValue, onClickButton, buttonHeading, disableButton = false }: Readonly<CourtDocumentsListSearchProps>) {
  const { t } = useTranslation();

  const handleSearch = (searchValue: string): void => {
    onSearchValue(searchValue);
  };

  return (
    <Grid container spacing={10} marginBottom={10}>
      <Grid size={{ xs: 12, md: 3 }}>
        <TmSearch
          testid={'searchCourtCase'}
          data-testid="searchCourtCase"
          searchValue={""}
          fullWidth
          onDebouncedChange={handleSearch}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 9 }}>
        <TmButton
          testid="viewCaseListHistory"
          size="large"
          onClick={onClickButton}
          variant="contained"
          disabled={disableButton}
          sx={{ float: 'right' }}
          showTooltip={disableButton}
          toolTipMessage={t("gracePeriodMessage")}>
          {t(buttonHeading)}
        </TmButton>
      </Grid>
    </Grid>
  )
}

export default CourtDocumentsListSearch;
