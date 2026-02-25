import { Box, Stack } from "@mui/material";
import { useMemo } from "react";
import { t } from "i18next";
import { CancelOutlined } from "@mui/icons-material";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import TmTypography from "../../../framework/components/typography/TmTypography";
import CourtDocumentsListSearch from "../../components/court-documents/CourtDocumentsListSearch";
import CourtDocumentsListTable from "../../components/court-documents/CourtDocumentsListTable";
import TmButton from "../../../framework/components/button/TmButton";
import useWarrantOfArrestRegisterManager from "../../hooks/warrant-of-arrest/WarrantOfArrestRegisterManager";
import { useLocation } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import AuthService from "../../../framework/auth/authService";

const WarrantOfArrestRegisterListPage = () => {
  const location = useLocation();

  const disableButton = useMemo(() => {
    return location.state.disablePrintButton
  }, [location]);

  const getRows = useMemo(() => {
    return location.state.warrantList || []
  }, [location]);

  const warrantOfArrestRequest = useMemo(() => {
    return location.state.warrantOfArrestRequest
  }, [location]);

  const {
    searchValue,
    handleSearchCourtCase,
    handleWarrantArrestClick,
    finaliseWarrantOfArrestRegister,
    handleOnExit,
    isLoading
  } = useWarrantOfArrestRegisterManager();

  const handlePrint = () => {
    finaliseWarrantOfArrestRegister(warrantOfArrestRequest);
  };

  useHotkeys(
    "ALT+P",
    () => {
      handlePrint();
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enabled: AuthService.hasRole('WARRANTOFARRESTREGISTER_MAINTAIN'),
      description: String(t("printWarrantOfArrestRegister")),
    }
  );

  return (
    <SecuredContent
      accessRoles={useMemo(() => ['WARRANTOFARRESTREGISTER_MAINTAIN', 'WARRANTOFARRESTREGISTER_VIEW'], [])}
    >
      <>
        {
          isLoading ? <TmLoadingSpinner testid={'warrantOfArrestRegisterLoadingSpinner'} /> :
            <Box margin={10} textAlign='left' paddingX={15} paddingTop={5}>
              <TmTypography testid="warrantOfArrestRegisterList" variant='h6' color='primary' marginBottom={10} fontWeight="bold">
                {t('warrantOfArrestRegister')}
              </TmTypography>
              <CourtDocumentsListSearch buttonHeading="printRegister" disableButton={disableButton} onSearchValue={handleSearchCourtCase}
                onClickButton={() => finaliseWarrantOfArrestRegister(warrantOfArrestRequest)} />
              <CourtDocumentsListTable rows={getRows} searchValue={searchValue} onCourtCaseClick={handleWarrantArrestClick} />
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

export default WarrantOfArrestRegisterListPage;
