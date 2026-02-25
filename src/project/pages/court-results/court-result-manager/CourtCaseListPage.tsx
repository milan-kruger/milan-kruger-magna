import { Box, Stack } from "@mui/material";
import { useState, useMemo } from "react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import useCourtCaseListManager from "../../../hooks/court-results/CourtCaseListManager";
import CourtDocumentsListSearch from "../../../components/court-documents/CourtDocumentsListSearch";
import { useLocation } from "react-router-dom";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import { t } from "i18next";
import TmButton from "../../../../framework/components/button/TmButton";
import { CancelOutlined } from "@mui/icons-material";
import TmLoadingSpinner from "../../../../framework/components/progress/TmLoadingSpinner";
import CourtDocumentsListTable from "../../../components/court-documents/CourtDocumentsListTable";

const CourtCaseListPage = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [disableHistoryButton, setDisableHistoryButton] = useState<boolean>(true)

  const location = useLocation();
  const courtCaseList = useMemo(() => {
    return location.state.courtCaseList || {}
  }, [location]);

  const courtData = useMemo(() => {
    return location.state.courtData || {}
  }, [location]);

  const courts = useMemo(() => {
    return location.state.courts ?? []
  }, [location]);

  const {
    getRows,
    handleSearchCourtCase,
    handleCourtCaseClick,
    handleOnClickViewHistory,
    handleOnExit,
    isLoading
  } = useCourtCaseListManager(courtCaseList, setSearchValue, courtData, setDisableHistoryButton, courts);

  return (
    <SecuredContent accessRoles={useMemo(() => ['COURTRESULT_MAINTAIN', 'COURTRESULT_VIEW'], [])}>
      <>
        {
          isLoading ? <TmLoadingSpinner testid={'courtCaseListLoadingSpinner'} /> :
            <Box margin={10} textAlign='left' paddingX={5} paddingTop={5}>
              <TmTypography testid="courtCaseList" variant='h6' color='primary' marginBottom={10} fontWeight="bold">
                {t('courtCaseList')}
              </TmTypography>
              <CourtDocumentsListSearch buttonHeading="viewHistory" disableButton={disableHistoryButton} onSearchValue={handleSearchCourtCase} onClickButton={handleOnClickViewHistory} />
              <CourtDocumentsListTable rows={getRows()} searchValue={searchValue}
                onCourtCaseClick={handleCourtCaseClick} />
              <Stack width={100} justifySelf={"end"} marginTop={20}>
                <TmButton startIcon={<CancelOutlined />} testid="btnExit" title={t("exit")}
                  onClick={() => handleOnExit()} variant="text">
                  {t("exit")}
                </TmButton>
              </Stack>
            </Box>
        }
      </>
    </SecuredContent>
  );
}

export default CourtCaseListPage;
