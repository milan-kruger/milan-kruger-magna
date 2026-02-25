import { useState } from "react";
import { DialogStates } from "./types";

export const useTransgressionDialogs = (): DialogStates => {
    const [exitDialogState, setExitDialogState] = useState(false);
    const [openDialogState, setOpenDialogState] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [openCancelTransgressionDialog, setOpenCancelTransgressionDialog] = useState(false);

    return {
        exitDialogState,
        setExitDialogState,
        openDialogState,
        setOpenDialogState,
        openHistoryDialog,
        setOpenHistoryDialog,
        openCancelTransgressionDialog,
        setOpenCancelTransgressionDialog
    };
};