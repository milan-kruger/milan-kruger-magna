import { Box, Container } from "@mui/material";
import { useTranslation } from "react-i18next";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import { useMemo, useState } from "react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import CaptureCourtResults from "../../../components/court-results/CaptureCourtResults";
import useCaptureCourtResultsManager from "../../../hooks/court-results/CaptureCourtResultsManager";
import TmDialog from "../../../../framework/components/dialog/TmDialog";
import { CancelOutlined } from "@mui/icons-material";
import { Location, useLocation } from "react-router-dom";
import RouteGuardWrapper from "../../../components/RouteGuard";

type PageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location: Location<any>;
}

const Page = ({ location }: PageProps) => {

  const { t } = useTranslation();
  const [showConfirmResults, setShowConfirmResults] = useState(false);
  const [showDiscardChanges, setShowDiscardChanges] = useState(false);

  const courts = useMemo(() => {
    return (location?.state?.courts ?? []);
  }, [location]);

  const {
    transgressionDetails,
    generateWarrantNumber,
    onSubmitResults,
    onCancelCourtResults,
    onConfirmResults,
    onDiscardChanges,
    courtDateList,
    roomContemptOfCourtFee,
    isLoading
  } = useCaptureCourtResultsManager(setShowConfirmResults, setShowDiscardChanges, courts);

  return (
    <SecuredContent accessRoles={useMemo(() => ['COURTRESULT_MAINTAIN', 'COURTRESULT_VIEW'], [])}>
      <Container maxWidth={false} disableGutters sx={{ margin: '0 auto', width: '100%' }}>
        <Box margin={10} textAlign='left'>
          <TmTypography testid={'captureCourtResults'} variant='h5' color='primary' marginBottom={10} fontWeight={"500"}>
            {t('captureCourtResults')}
          </TmTypography>

          <CaptureCourtResults
            transgressionDetails={transgressionDetails}
            onSubmitResults={onSubmitResults}
            onCancelCourtResults={onCancelCourtResults}
            showWarrantNumber={generateWarrantNumber}
            courtDateList={courtDateList}
            contemptOfCourtFee={roomContemptOfCourtFee} />

          <TmDialog
            testid={"confirmCourtResultsDialog"}
            title={t("confirmResults")}
            message={t("confirmCourtResultsMessage")}
            isOpen={showConfirmResults}
            cancelLabel={t("cancel")}
            cancelIcon={<CancelOutlined />}
            onCancel={() => setShowConfirmResults(false)}
            onConfirm={onConfirmResults}
            confirmLabel={t("confirm")}
            showConfirmButton={true}
            isLoading={isLoading}
          />

          <TmDialog
            testid={"cancelCourtResultsDialog"}
            title={t("exitDialogTitle")}
            message={t("discardChangesMessage")}
            isOpen={showDiscardChanges}
            cancelLabel={t("cancel")}
            cancelIcon={<CancelOutlined />}
            onConfirm={onDiscardChanges}
            confirmLabel={t("confirm")}
            onCancel={() => setShowDiscardChanges(false)}
            showConfirmButton={true}
          />
        </Box>
      </Container>

    </SecuredContent>

  );
}

const CaptureCourtResultPage = () => {
  const location = useLocation();

  return (
    <RouteGuardWrapper state={location.state} defaultUrl="/court-documents/court-results/court-case-list">
      <Page location={location} />
    </RouteGuardWrapper>
  )
}

export default CaptureCourtResultPage;
