import { memo, useMemo, useState } from "react";
import TmDocumentPreview from "../../components/printing/TmDocumentPreview";
import { Stack, Theme, useMediaQuery } from "@mui/material";
import TmDocumentTypeSelector, { AllDocumentTypes } from "../../components/printing/TmDocumentTypeSelector";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import { CancelOutlined, CheckCircleOutline } from "@mui/icons-material";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import FocusTrap from "@mui/material/Unstable_TrapFocus";
import usePrintTransgressionManager from "../../hooks/printing/PrintTransgressionManager";
import { useTranslation } from "react-i18next";

function PrintTransgressionPage() {

  const [openDialog, setOpenDialog] = useState(false);
  const { t } = useTranslation();

  const {
    base64,
    isPrintAll,
    isArrestCase,
    printDocuments,
    chargeSheetIsLoading,
    transgressionIsLoading,
    chargeSheetIsError,
    transgressionIsError,
    transgressionIsSuccess,
    chargeSheetIsSuccess,
    transgressionDocumentTypeOptions,
    getDocumentTypeOptions,
    onPrintSuccessful,
    setPreviewDocumentType,
    setSelectedDocuments,
    printAll,
    print,
    exit,
    isLoading,
    allDocumentsRequired
  } = usePrintTransgressionManager(setOpenDialog);
  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const isLaptop = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'));

  return (
    <SecuredContent
      accessRoles={useMemo(() => ['TRANSGRESSION_MAINTAIN', 'TRANSGRESSIONDETAILS_VIEW'], [])}
    >
      <FocusTrap open>
        <Stack
          direction={"row"}>
          <TmDialog
            testid="confirmPrintDialog"
            cancelIcon={<CancelOutlined />}
            cancelLabel={t("cancel")}
            confirmIcon={<CheckCircleOutline />}
            confirmLabel={t("confirm")}
            title={t("confirmPrint")}
            message={t("confirmTransgressionPrintedMessage")}
            onConfirm={onPrintSuccessful}
            onCancel={() => {
              setOpenDialog(false);
            }}
            isOpen={openDialog}
            showConfirmButton={true}
            isLoading={isLoading}
          />
          <Stack
            direction={isMobile ? "column" : "row"}
            sx={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 6fr", width: "100%" }}
          >
            <Stack>
              <TmDocumentTypeSelector
                testId="documentType"
                printHeader={isArrestCase ? t("printChargeSheet") : t("printTransgression")}
                documentTypeOptions={getDocumentTypeOptions(transgressionDocumentTypeOptions)}
                setPreviewDocumentType={setPreviewDocumentType}
                setPrintDocumentTypes={setSelectedDocuments as (documentType: AllDocumentTypes ) => void}
                printDocumentTypes={printDocuments}
                selectionEnabled={!isPrintAll}
                width={(document.documentElement.clientWidth / 100) * (isLaptop ? 30 : 20)}
              />
            </Stack>
            <Stack>
              {transgressionIsLoading || chargeSheetIsLoading ? (
                <Stack alignItems={"center"}>
                  <TmLoadingSpinner testid="loadingRenderedDocument"></TmLoadingSpinner>
                </Stack>
              ) : !(transgressionIsError || chargeSheetIsError) && (transgressionIsSuccess || chargeSheetIsSuccess) && base64 !== "" && (
                <TmDocumentPreview
                  testId="renderedPdf"
                  data={base64}
                  printAllCallBack={printAll}
                  printCallBack={print}
                  showPrintButton={!isPrintAll || isArrestCase || !allDocumentsRequired}
                  showPrintAllButton={!isArrestCase && allDocumentsRequired}
                  disablePrintButton={printDocuments.length === 0 && !isArrestCase}
                  exitCallBack={exit}
                  width={(document.documentElement.clientWidth / 100) * (isLaptop ? 70 : 80)}
                  tabletScale={2}
                ></TmDocumentPreview>
              )}
            </Stack>
          </Stack>
        </Stack>
      </FocusTrap>
    </SecuredContent>
  );
}

export default memo(PrintTransgressionPage);
