// Main service hook
export { useTransgressionDetailsService } from './useTransgressionDetailsService';

// Individual hooks for more granular usage
export { useTransgressionDialogs } from './useTransgressionDialogs';
export { useTransgressionHandlers } from './useTransgressionHandlers';
export { useTransgressionHotkeys } from './useTransgressionHotkeys';

// Types
export type {
    VehicleWeighDetailsRef,
    DialogStates,
    TransgressionHandlerConfig,
    TransgressionHandlers,
    HotkeyConfig,
    CaptureComponentProps
} from './types';