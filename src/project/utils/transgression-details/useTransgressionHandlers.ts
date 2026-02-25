import { useCallback, useEffect, useState } from "react";
import { DialogStates, TransgressionHandlerConfig, TransgressionHandlers } from "./types";
import { TransgressionDto } from "../../redux/api/transgressionsApi";

export const useTransgressionHandlers = (
    config: TransgressionHandlerConfig,
    dialogStates: DialogStates
): TransgressionHandlers => {
    const {
        form,
        childRef,
        cancelTransgressionRef,
        navigate,
        routeName,
        redirectType,
        isUpdating,
        setIsUpdating,
        transgression,
        noticeNo
    } = config;

    const [transgressionState, setTransgressionState] = useState<TransgressionDto>(
        transgression ?? ('' as unknown as TransgressionDto)
    );

    const {
        setExitDialogState,
        setOpenDialogState,
        setOpenHistoryDialog,
        setOpenCancelTransgressionDialog
    } = dialogStates;

    const handleOpenSaveDialog = useCallback(() => {
        if (form.isDirty && !form.validationErrors && isUpdating) {
            setOpenDialogState(true);
        }
    }, [form.isDirty, form.validationErrors, isUpdating, setOpenDialogState]);

    const closeSaveDialog = useCallback(() => {
        setOpenDialogState(false);
    }, [setOpenDialogState]);

    const closeExitDialog = useCallback(() => {
        setExitDialogState(false);
    }, [setExitDialogState]);

    const handleOpenExitDialog = useCallback(() => {
        if (childRef.current?.isOnEditable() && form.isDirty) {
            setExitDialogState(true);
        } else if (childRef.current?.isOnEditable()) {
            setIsUpdating(false);
            childRef.current.onDisableEdit();
        } else {
            navigate(`/${routeName}`);
        }
    }, [childRef, form.isDirty, setExitDialogState, setIsUpdating, navigate, routeName]);

    const handleReprint = useCallback(() => {
        if (noticeNo) {
            navigate(`/print/${noticeNo}/${redirectType}`, {
                state: {
                    status: transgressionState?.status
                }
            });
        }
    }, [noticeNo, navigate, redirectType, transgressionState]);

    const updateTransgression = useCallback(() => {
        if (childRef.current) {
            childRef.current.onEdit();
        }
    }, [childRef]);

    const handleOpenHistoryDialog = useCallback(() => {
        if (noticeNo) {
            setOpenHistoryDialog(true);
        }
    }, [noticeNo, setOpenHistoryDialog]);

    const handleConfirmHistoryDialogClose = useCallback(() => {
        setOpenHistoryDialog(false);
    }, [setOpenHistoryDialog]);

    const cancelTransgression = useCallback(() => {
        if (cancelTransgressionRef.current) {
            cancelTransgressionRef.current.clearFields();
        }
        setOpenCancelTransgressionDialog(true);
    }, [cancelTransgressionRef, setOpenCancelTransgressionDialog]);

    const handleConfirmCancelTransgressionDialogClose = useCallback(() => {
        setOpenCancelTransgressionDialog(false);
    }, [setOpenCancelTransgressionDialog]);

    const handleEdit = useCallback((isEditing: boolean) => {
        setIsUpdating(isEditing);
    }, [setIsUpdating]);

    const handleDiscardConfirmDialog = useCallback(() => {
        if (closeExitDialog) {
            closeExitDialog();
        }
        if (childRef.current) {
            handleEdit(false);
            childRef.current.onDisableEdit();
        }
    }, [closeExitDialog, childRef, handleEdit]);

    useEffect(() => {
        if (childRef.current) {
            const updatedTransgression = childRef.current.onGetTransgression();
            setTransgressionState(updatedTransgression);
        }
    }, [childRef, transgression]);

    return {
        handleOpenSaveDialog,
        closeSaveDialog,
        closeExitDialog,
        handleOpenExitDialog,
        handleReprint,
        updateTransgression,
        handleOpenHistoryDialog,
        handleConfirmHistoryDialogClose,
        cancelTransgression,
        handleConfirmCancelTransgressionDialogClose,
        handleEdit,
        handleDiscardConfirmDialog
    };
};