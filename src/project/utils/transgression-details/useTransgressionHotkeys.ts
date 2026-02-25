import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "./types";
import AuthService from "../../../framework/auth/authService";

export const useTransgressionHotkeys = (config: HotkeyConfig): void => {
    const {
        handlers,
        isUpdating,
        t,
        hasTransgressionMaintain = true,
        hasPrintingMaintain = true
    } = config;

    // Exit hotkey
    useHotkeys('CTRL+E', () => {
        handlers.handleOpenExitDialog();
    }, {
        preventDefault: true,
        enableOnFormTags: true,
        description: t('cancelTransgressionsPage') ?? undefined
    });

    // Update transgression hotkey
    useHotkeys("ALT+U", () => handlers.updateTransgression(), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: !isUpdating && hasTransgressionMaintain && (
            AuthService.hasRole('TRANSGRESSION_MAINTAIN') ||
            AuthService.hasRole('RTQSTRANSGRESSION_MAINTAIN')
        ),
        description: t("updateTransgression") ?? undefined,
    });

    // Cancel transgression hotkey
    useHotkeys("ALT+C", () => handlers.cancelTransgression(), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: !isUpdating && hasTransgressionMaintain && (
            AuthService.hasRole('TRANSGRESSION_MAINTAIN') ||
            AuthService.hasRole('RTQSTRANSGRESSION_MAINTAIN')
        ),
        description: t("cancelTransgression") ?? undefined
    });

    // History hotkey
    useHotkeys("ALT+H", () => handlers.handleOpenHistoryDialog(), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: !isUpdating,
        description: t("transgressionHistory") ?? undefined,
    });

    // Print hotkey
    useHotkeys("ALT+P", () => handlers.handleReprint(), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: !isUpdating && hasPrintingMaintain && AuthService.hasRole('TRANSGRESSIONPRINTING_MAINTAIN'),
        description: t("goToPrint") ?? undefined,
    });

    // Save hotkey
    useHotkeys("CTRL+S", () => handlers.handleOpenSaveDialog(), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: isUpdating && hasTransgressionMaintain && (
            AuthService.hasRole('TRANSGRESSION_MAINTAIN') ||
            AuthService.hasRole('RTQSTRANSGRESSION_MAINTAIN')
        ),
        description: t("saveChanges") ?? undefined
    });
};
