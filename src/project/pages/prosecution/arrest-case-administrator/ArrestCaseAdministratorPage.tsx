import { ChangeEvent, useMemo } from "react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import ArrestCaseAdministratorContextProvider from "./ArrestCaseAdministratorContextProvider";
import { Stack, useTheme } from "@mui/material";
import CaptureCorrectionReasonHeader from "../../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonHeader";
import CaptureCorrectionReasonContent from "../../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonContent";
import CaptureCorrectionReasonActions from "../../../components/prosecution/arrest-case-administrator/CaptureCorrectionReasonActions";
import { useLocation } from "react-router-dom";
import TmAuthenticationDialog from "../../../../framework/components/dialog/TmAuthenticationDialog";
import { t } from "i18next";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckIcon from "@mui/icons-material/Check";
import TmLoadingSpinner from "../../../../framework/components/progress/TmLoadingSpinner";
import { toCamelCaseWords } from "../../../../framework/utils";
import TmDialog from "../../../../framework/components/dialog/TmDialog";
import useArrestCaseAdministratorManager from "../../../hooks/prosecution/ArrestCaseAdministratorManager";

const PAGE_NAME = "arrestCaseAdministrator";

const Page = () => {
  const location = useLocation();
  const transgressionDetails = location.state.transgressionDetails;
  const sequenceNumber = location.state.sequenceNumber;
  const {
    submitCorrectionReason,
    closeCaptureCorrectionReason,
    closeDialogs,
    showAuthorizationDialog,
    supervisorUsername,
    setSupervisorUsername,
    supervisorPassword,
    setSupervisorPassword,
    handleCorrectionPending,
    isLoading,
    showReweighDialog,
    showAuthErrorDialog,
    notApproved,
    isErrorAuthentication
 } = useArrestCaseAdministratorManager(transgressionDetails, sequenceNumber);
  const theme = useTheme();

  return (
    <Stack
      sx={{
        paddingX: 35,
        paddingTop: 20,
        paddingBottom: 5,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#FAE5E5"
            : theme.palette.background.default,
      }}
      flex={1}
      gap={10}
    >
      {isLoading ? (
        <TmLoadingSpinner testid={toCamelCaseWords(PAGE_NAME, "spinner")} />
      ) : (
        <>
          <CaptureCorrectionReasonHeader testId={PAGE_NAME} />
          <CaptureCorrectionReasonContent
            testId={PAGE_NAME}
            charges={transgressionDetails.charges}
            vehicleCharges={transgressionDetails.vehicleCharges}
            sx={{ marginTop: 2 }}
          />
          <CaptureCorrectionReasonActions
            testId={PAGE_NAME}
            onSubmit={submitCorrectionReason}
            onCancel={closeCaptureCorrectionReason}
          />
        </>
      )}

      <TmAuthenticationDialog
        testid={toCamelCaseWords(PAGE_NAME, "supervisorDialog")}
        isOpen={showAuthorizationDialog}
        onCancel={closeDialogs}
        title=""
        message={t("supervisorCorrectionDialogMessage")}
        message2={t("supervisorCorrectionReason")}
        username={supervisorUsername}
        password={supervisorPassword}
        cancelLabel={t("cancel")}
        confirmLabel={t("confirm")}
        medium={true}
        cancelIcon={<CancelOutlinedIcon />}
        confirmIcon={<CheckIcon />}
        onConfirm={handleCorrectionPending}
        handlePasswordOnChange={(value: string) => {
          setSupervisorPassword(value);
        }}
        handleUsernameOnChange={(event: ChangeEvent<HTMLInputElement>) => {
          setSupervisorUsername(event.target.value?.toUpperCase());
        }}
        isAuthenticationError={isErrorAuthentication || notApproved}
      />

      <TmDialog
        testid={toCamelCaseWords(PAGE_NAME, "reWeighDialog")}
        title=""
        message={t("reweighRequired")}
        isOpen={showReweighDialog}
        cancelLabel={t("close")}
        cancelIcon={<CancelOutlinedIcon />}
        onCancel={closeCaptureCorrectionReason}
      />

      <TmDialog
          testid={'authErrorDialog'}
          title={t('authOverridePermissionDenied')}
          message={t('authOverridePermissionDeniedMessage')}
          isOpen={showAuthErrorDialog}
          cancelLabel={t('close')}
          cancelIcon={<CancelOutlinedIcon />}
          onCancel={closeDialogs}
      />
    </Stack>
  );
};

const ArrestCaseAdministratorPage = () => {
  return (
    <SecuredContent
      accessRoles={useMemo(() => ['TRANSGRESSION_MAINTAIN'], [])}
    >
      <ArrestCaseAdministratorContextProvider>
        <Page />
      </ArrestCaseAdministratorContextProvider>
    </SecuredContent>
  );
};

export default ArrestCaseAdministratorPage;
