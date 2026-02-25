import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../framework/redux/hooks";
import { selectForm } from "../../redux/transgression/transgressionSlice";
import { useTransgressionDialogs } from "./useTransgressionDialogs";
import { useTransgressionHandlers } from "./useTransgressionHandlers";
import { useTransgressionHotkeys } from "./useTransgressionHotkeys";
import { CaptureComponentProps, TransgressionHandlerConfig, VehicleWeighDetailsRef } from "./types";
import { CancelTransgressionRef } from "../../components/cancel-transgression/CancelTransgressionDialog";
import { RedirectType } from "../../enum/RedirectType";
import { TransgressionDto } from "../../redux/api/transgressionsApi";

interface UseTransgressionDetailsServiceConfig {
    routeName: string;
    redirectType: RedirectType;
    childRef: RefObject<VehicleWeighDetailsRef>;
    cancelTransgressionRef: RefObject<CancelTransgressionRef>;
    noticeNo?: string;
    transgression?: TransgressionDto;
    hasTransgressionMaintain?: boolean;
    hasPrintingMaintain?: boolean;
    setFormChargesValid?: Dispatch<SetStateAction<boolean>>;
}

export const useTransgressionDetailsService = (config: UseTransgressionDetailsServiceConfig) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const form = useAppSelector(selectForm);
    const [isUpdating, setIsUpdating] = useState(false);

    const dialogStates = useTransgressionDialogs();

    const handlerConfig: TransgressionHandlerConfig = {
        form,
        childRef: config.childRef,
        cancelTransgressionRef: config.cancelTransgressionRef,
        navigate,
        routeName: config.routeName,
        redirectType: config.redirectType,
        isUpdating,
        setIsUpdating,
        transgression: config.transgression,
        noticeNo: config.noticeNo
    };

    const handlers = useTransgressionHandlers(handlerConfig, dialogStates);

    useTransgressionHotkeys({
        handlers,
        isUpdating,
        t,
        hasTransgressionMaintain: config.hasTransgressionMaintain,
        hasPrintingMaintain: config.hasPrintingMaintain
    });

    const buildCaptureComponentProps = (): CaptureComponentProps => ({
        exitDialogState: dialogStates.exitDialogState,
        openDialogState: dialogStates.openDialogState,
        handleOpenSaveDialog: handlers.handleOpenSaveDialog,
        handleOpenExitDialog: handlers.handleOpenExitDialog,
        handleOpenHistoryDialog: handlers.handleOpenHistoryDialog,
        handleReprint: handlers.handleReprint,
        closeSaveDialog: handlers.closeSaveDialog,
        closeExitDialog: handlers.closeExitDialog,
        handleDiscardConfirmDialog: handlers.handleDiscardConfirmDialog,
        handleOpenCancelDialog: handlers.cancelTransgression,
        handleEdit: handlers.handleEdit,
        setFormChargesValid: config.setFormChargesValid
    });

    return {
        // States
        form,
        isUpdating,
        location,

        // Dialog states
        ...dialogStates,

        // Handlers
        ...handlers,

        // Utility functions
        buildCaptureComponentProps
    };
};
