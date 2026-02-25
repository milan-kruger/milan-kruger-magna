import TransgressionContextProvider from "./CaptureTransgressionContext";
import {
  Box
} from "@mui/material";
import { useAppSelector } from "../../../../framework/redux/hooks";
import CaptureTransgressionPageEdit from "./CaptureTransgressionPageEdit";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { selectForm } from "../../../redux/transgression/transgressionSlice";
import NavigationBlocker from "../../../components/NavigationBlocker";
import { ROUTE_NAMES } from "../../../Routing";

function CaptureTransgressionPage() {
  return (
    <SecuredContent
      accessRoles={useMemo(() => ['TRANSGRESSIONDETAILS_VIEW', 'TRANSGRESSION_MAINTAIN'], [])}
    >
      <TransgressionContextProvider>
        <Page />
      </TransgressionContextProvider>
    </SecuredContent>

  );
}

function Page() {
  const { t } = useTranslation();
  const [exitDialogState, setOpenExitDialog] = useState(false);
  const [openDialogState, setOpenSaveDialog] = useState(false);
  const form = useAppSelector(selectForm);

  const breakpoints = {
    flex: {
      xs: "100%",
      sm: "calc(50% - 50px)",
      md: "calc(33% - 50px)",
      lg: "calc(25% - 50px)"
    },
  };

  const handleOpenSaveDialog = () => {
    setOpenSaveDialog(true);
  };

  const handleOpenExitDialog = () => {
    setOpenExitDialog(true);
  };

  const closeSaveDialog = () => {
    setOpenSaveDialog(false);
  };

  const closeExitDialog = () => {
    setOpenExitDialog(false);
  };

  const handleDirtyCheck = () => {
    if (!form.validationErrors) {
      handleOpenSaveDialog();
    }
  }

  // Hot keys
  useHotkeys("CTRL+S", () => handleDirtyCheck(), { preventDefault: true, enableOnFormTags: true, description: t("saveChangesList") ?? undefined });

  useHotkeys('CTRL+E', () => {
    handleOpenExitDialog();
  }, { preventDefault: true, enableOnFormTags: true, description: t('cancelTransgressionsPage') ?? undefined });

  return (
    <NavigationBlocker allowedFromPaths={[ROUTE_NAMES.prosecuteTransgressionRoute, ROUTE_NAMES.transgressions, ROUTE_NAMES.captureCorrectionReason]}>
      <Box sx={{
        display: "flex",
        flexWrap: "wrap",
        padding: "10px 20px 20px 20px",
      }}>
        <Box sx={breakpoints}>
          <CaptureTransgressionPageEdit handleOpenSaveDialog={handleOpenSaveDialog} openDialogState={openDialogState}
            handleOpenExitDialog={handleOpenExitDialog} exitDialogState={exitDialogState} closeSaveDialog={closeSaveDialog} closeExitDialog={closeExitDialog} />
        </Box>
      </Box>
    </NavigationBlocker>

  );
}

export default CaptureTransgressionPage;
