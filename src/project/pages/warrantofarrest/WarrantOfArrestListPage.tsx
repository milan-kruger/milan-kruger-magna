import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Theme, useMediaQuery, useTheme } from "@mui/material";
import { ChangeEvent, useEffect, useMemo } from "react";
import { t } from "i18next";
import { CancelOutlined } from "@mui/icons-material";
import { useLocation } from "react-router-dom";

import TmButton from "../../../framework/components/button/TmButton";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import TmTypography from "../../../framework/components/typography/TmTypography";
import TransgressionContextProvider from "../prosecution/overload-transgression-manager/CaptureTransgressionContext";
import useWarrantOfArrestManager, { SearchWarrantsOfArrestDetails } from "../../hooks/warrant-of-arrest/WarrantOfArrestManager";
import CourtDocumentsListSearch from "../../components/court-documents/CourtDocumentsListSearch";
import CourtDocumentsListTable from "../../components/court-documents/CourtDocumentsListTable";
import CaptureCourtResultsDetails from "../../components/court-results/CaptureCourtResultsDetails";
import CaptureCourtResultsForm from "../../components/court-results/CaptureCourtResultsForm";
import { selectForm } from "../../redux/capture-court-result/CaptureCourtResultSlice";
import { useAppSelector } from "../../../framework/redux/hooks";
import PrintIcon from '@mui/icons-material/Print';
import TmAuthenticationDialog from "../../../framework/components/dialog/TmAuthenticationDialog";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { WarrantOfArrest } from "../../redux/api/transgressionsApi";
import { useHotkeys } from "react-hotkeys-hook";

function WarrantOfArrestListPage() {
  return (
    <SecuredContent
      accessRoles={useMemo(
        () => ["WARRANTOFARREST_MAINTAIN", "WARRANTOFARREST_VIEW"],
        []
      )}
    >
      <TransgressionContextProvider>
        <WarrantOfArrestPage />
      </TransgressionContextProvider>
    </SecuredContent>
  );
}

function WarrantOfArrestPage() {
  const location = useLocation();
  const {
    isLoading,
    searchValue,
    files,
    getRows,
    showAuthorizationPopup,
    supervisorUsername,
    supervisorPassword,
    onDeleteFile,
    setShowAuthorizationPopup,
    setSupervisorPassword,
    setSupervisorUsername,
    authoriseDeleteFile,
    onPrint,
    onFileChange,
    handleOnExit,
    handleSearchCourtCase,
    handleWarrantOfArrestClick,
    refetchWarrantsOfArrestList,
    showWarrantDetails,
    closeWarrantOfArrestDetails,
    courtResult,
    warrantsToPrint,
    isErrorAuthentication,
    notApproved
  } = useWarrantOfArrestManager();

  const theme = useTheme();
  const isMobile = useMediaQuery<Theme>(theme.breakpoints.down('md'));

  const containerBorderStyle = {
    columnGap: isMobile ? 5 : 10,
    display: 'flex',
    flexFlow: 'wrap',
    flexDirection: isMobile ? 'column' : 'row',
    border: `2px solid ${theme.palette.primary.main}`,
    padding: '5px',
    borderRadius: '5px',
    margin: '0 0 10px',
  }

  const containerBorderBox2 = {
    border: `2px solid ${theme.palette.primary.main}`,
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px'
  }

  const fieldWith = '18em';
  const form = useAppSelector(selectForm);

  const searchDetails = useMemo(() => {
    return location.state.searchDetails as SearchWarrantsOfArrestDetails;
  }, [location]);

  const disableButton = useMemo(() => {
    return location.state.disablePrintButton;
  }, [location]);


  const getWarrantNumbers = useMemo(() => {
    return location.state.warrantList.map((warrant: WarrantOfArrest) => warrant.warrantNumber?.number || warrant.capturedWarrantNumber);
  }, [location]);

  useEffect(() => {
    if (searchDetails) {
      // refetch the updated warrant list when the component is mounted
      refetchWarrantsOfArrestList(searchDetails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useHotkeys(
    "ALT+P",
    () => {
      if (showWarrantDetails && warrantsToPrint && warrantsToPrint.length > 0) {
        if (warrantsToPrint && warrantsToPrint.length > 0) {
          onPrint(warrantsToPrint);
        }
      } else {
        onPrint(getWarrantNumbers);
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      description: String(t("printWarrantOfArrestHotKey")),
    }
  );

  useHotkeys(
    "ALT+E",
    () => {
      if (showWarrantDetails) {
        closeWarrantOfArrestDetails();
      } else {
        handleOnExit()
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      description: String(t("closePage")),
    }
  );

  return (
    <>
      {isLoading ? (
        <TmLoadingSpinner testid={"warrantOfArrestLoadingSpinner"} />
      ) : (
        <Box margin={10} textAlign="left" paddingX={15} paddingTop={5}>
          <TmTypography
            testid="warrantOfArrestList"
            variant="h6"
            color="primary"
            marginBottom={10}
            fontWeight="bold"
          >
            {t("warrantOfArrest")}
          </TmTypography>
          <CourtDocumentsListSearch
            buttonHeading="printWarrant"
            disableButton={disableButton}
            onSearchValue={handleSearchCourtCase}
            onClickButton={() => onPrint(getWarrantNumbers)}
          />
          <CourtDocumentsListTable
            rows={getRows}
            searchValue={searchValue}
            onCourtCaseClick={handleWarrantOfArrestClick}
            onFileChange={onFileChange}
            onDeleteFile={onDeleteFile}
            files={files}
            showCourtDocumentColumn={true}
          />
          <Stack width={100} justifySelf={"end"} marginTop={20}>
            <TmButton
              startIcon={<CancelOutlined />}
              testid="btnExit"
              title={t("exit")}
              onClick={() => handleOnExit()}
              variant="text"
            >
              {t("exit")}
            </TmButton>
          </Stack>

          <Dialog id="warrantDetailsDailog"
            open={showWarrantDetails} onClose={closeWarrantOfArrestDetails} fullScreen
            sx={{ padding: isMobile ? 10 : 30 }}
            PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle>
              <Stack>
                <TmTypography testid="dialogTitle" variant="h6" fontWeight={"bold"} color="primary">
                  {t("warrantDetails")}
                </TmTypography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack direction="column">
                {(courtResult) &&
                  <CaptureCourtResultsDetails
                    courtResult={courtResult}
                    sx={containerBorderStyle}
                    transgressionDetails={{
                      noticeNumber: courtResult.noticeNumber,
                      offenderName: courtResult.offenderName ?? "",
                      plateNumber: courtResult.plateNumber,
                      identificationNumber: courtResult.identificationNumber ?? "",
                    }}
                  />}
                {courtResult &&
                  <CaptureCourtResultsForm
                    testIdPrefix={'warrantDetailsForm'}
                    sx={containerBorderBox2}
                    fieldWith={fieldWith}
                    form={form}
                    courtResult={courtResult}
                    readonly={true}
                    transgressionDetails={{
                      noticeNumber: courtResult.noticeNumber,
                      status: courtResult.transgressionStatus,
                      courtAppearanceDate: courtResult.courtDate,
                      snapshotCharges: courtResult.snapshotCharges,
                      totalAmountPayable: courtResult.amountPaid?.amount ?? 0,
                      paymentReference: courtResult.receiptNumber ?? ''
                    }}
                  />}
              </Stack>
            </DialogContent>
            <DialogActions>
              <TmButton testid="btnPrintWarrantOfArrest"
                title={t("printWarrantOfArrest")}
                onClick={() => { if (courtResult?.warrantNumber) onPrint([courtResult.warrantNumber]) }}
                variant="text"
                startIcon={<PrintIcon />}>
                <TmTypography testid="btnPrintWarrantOfArrestText">{t("printWarrantOfArrest")}</TmTypography>
              </TmButton>

              <TmButton testid="btnClose"
                title={t("close")}
                onClick={closeWarrantOfArrestDetails}
                variant="text"
                startIcon={<CancelOutlined />}>
                <TmTypography testid="btnCloseText">{t("close")}</TmTypography>
              </TmButton>
            </DialogActions>
          </Dialog>
          <TmAuthenticationDialog
            testid="supervisorAuthorizationDialog"
            isOpen={showAuthorizationPopup}
            onCancel={() => { setShowAuthorizationPopup(false) }}
            title={t('deleteSignedWarrant')}
            message={t('deleteSignedWarrantSupervisorAuthorisation')}
            message2={""}
            username={supervisorUsername}
            password={supervisorPassword}
            cancelLabel={t('cancel')}
            confirmLabel={t('confirm')}
            medium={true}
            cancelIcon={<CancelOutlinedIcon />}
            confirmIcon={<CheckIcon />}
            onConfirm={() => {
              authoriseDeleteFile(supervisorUsername, supervisorPassword);
            }}

            handlePasswordOnChange={(value: string) => {
              setSupervisorPassword(value);
            }}

            handleUsernameOnChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSupervisorUsername(event.target.value?.toUpperCase())
            }}
            isAuthenticationError={isErrorAuthentication || notApproved}
          />
        </Box>
      )}
    </>
  );
}

export default WarrantOfArrestListPage;
