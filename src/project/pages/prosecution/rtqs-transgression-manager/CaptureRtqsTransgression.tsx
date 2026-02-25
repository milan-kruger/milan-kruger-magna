import { useMemo, useState } from "react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import TransgressionContextProvider from "../overload-transgression-manager/CaptureTransgressionContext";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../framework/redux/hooks";
import { selectForm } from "../../../redux/transgression/transgressionSlice";
import { useHotkeys } from "react-hotkeys-hook";
import { Box } from "@mui/material";
import CaptureRtqsTransgressionPageEdit from "./CaptureRtqsTransgressionPageEdit";
import AuthService from "../../../../framework/auth/authService";
import { Role } from "../../../auth/roles.ts";

function CaptureRtqsTransgression() {
    return (
        <SecuredContent
            accessRoles={useMemo(() =>
                    (AuthService.isFeatureEnabled('RTQS_TRANSGRESSIONS') ?
                            ["RTQSTRANSGRESSION_MAINTAIN", "RTQSTRANSGRESSION_VIEW"] :
                            []
                    ) as Role[]
                , [])}
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
    const [chargesValid, setChargesValid] = useState(false);

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
        if (!form.validationErrors && chargesValid) {
            handleOpenSaveDialog();
        }
    }

    // Hot keys
    useHotkeys("CTRL+S", () => handleDirtyCheck(), { preventDefault: true, enableOnFormTags: true, description: t("saveChangesList") ?? undefined });

    useHotkeys('CTRL+E', () => {
        handleOpenExitDialog();
    }, { preventDefault: true, enableOnFormTags: true, description: t('cancelTransgressionsPage') ?? undefined });

    return (
        <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            padding: "10px 20px 20px 20px",
        }}>
            <Box sx={breakpoints}>
                <CaptureRtqsTransgressionPageEdit
                    handleOpenSaveDialog={handleOpenSaveDialog}
                    openDialogState={openDialogState}
                    handleOpenExitDialog={handleOpenExitDialog}
                    exitDialogState={exitDialogState}
                    closeSaveDialog={closeSaveDialog}
                    closeExitDialog={closeExitDialog}
                    setFormChargesValid={setChargesValid}
                />
            </Box>
        </Box>

    );
}

export default CaptureRtqsTransgression;
