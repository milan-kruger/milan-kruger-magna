import { Dispatch, RefObject, SetStateAction } from "react";
import { NavigateFunction } from "react-router-dom";
import { TFunction } from "i18next";
import { FormState } from "../../redux/transgression/transgressionSlice";
import { TransgressionDto } from "../../redux/api/transgressionsApi";
import { CancelTransgressionRef } from "../../components/cancel-transgression/CancelTransgressionDialog";
import { RedirectType } from "../../enum/RedirectType";

export interface VehicleWeighDetailsRef {
    onEdit: () => void;
    onGetTransgression: () => TransgressionDto;
    onDisableEdit: () => void;
    isOnEditable: () => boolean;
    onUpdateVehicleWeighDetails?: (noticeNumber: string) => void;
}

export interface DialogStates {
    exitDialogState: boolean;
    setExitDialogState: Dispatch<SetStateAction<boolean>>;
    openDialogState: boolean;
    setOpenDialogState: Dispatch<SetStateAction<boolean>>;
    openHistoryDialog: boolean;
    setOpenHistoryDialog: Dispatch<SetStateAction<boolean>>;
    openCancelTransgressionDialog: boolean;
    setOpenCancelTransgressionDialog: Dispatch<SetStateAction<boolean>>;
}

export interface TransgressionHandlerConfig {
    form: FormState;
    childRef: RefObject<VehicleWeighDetailsRef>;
    cancelTransgressionRef: RefObject<CancelTransgressionRef>;
    navigate: NavigateFunction;
    routeName: string;
    redirectType: RedirectType;
    isUpdating: boolean;
    setIsUpdating: Dispatch<SetStateAction<boolean>>;
    transgression?: TransgressionDto;
    noticeNo?: string;
}

export interface TransgressionHandlers {
    handleOpenSaveDialog: () => void;
    closeSaveDialog: () => void;
    closeExitDialog: () => void;
    handleOpenExitDialog: () => void;
    handleReprint: () => void;
    updateTransgression: () => void;
    handleOpenHistoryDialog: () => void;
    handleConfirmHistoryDialogClose: () => void;
    cancelTransgression: () => void;
    handleConfirmCancelTransgressionDialogClose: () => void;
    handleEdit: (isEditing: boolean) => void;
    handleDiscardConfirmDialog: () => void;
}

export interface HotkeyConfig {
    handlers: TransgressionHandlers;
    isUpdating: boolean;
    t: TFunction;
    hasTransgressionMaintain?: boolean;
    hasPrintingMaintain?: boolean;
}

export interface CaptureComponentProps {
    exitDialogState?: boolean;
    openDialogState?: boolean;
    handleOpenSaveDialog?: () => void;
    handleOpenExitDialog?: () => void;
    handleOpenHistoryDialog?: () => void;
    handleReprint?: () => void;
    closeSaveDialog?: () => void;
    closeExitDialog?: () => void;
    handleDiscardConfirmDialog?: () => void;
    handleOpenCancelDialog?: () => void;
    handleEdit?: (isEditing: boolean) => void;
    setFormChargesValid?: Dispatch<SetStateAction<boolean>>;
}