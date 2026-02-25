import { useState, useMemo, useContext } from "react";
import {
    Badge,
    Box,
    Collapse,
    Divider,
    Fab,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { AdjudicationEvent, AdjudicationEventType } from "./wsClient";
import { useTranslation } from "react-i18next";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import dayjs from "dayjs";

type Props = {
    events: AdjudicationEvent[];
    onClear: () => void;
};

const AdjudicationEventLog = ({ events, onClear }: Props) => {
    const [open, setOpen] = useState(false);
    const [seenCount, setSeenCount] = useState(0);
    const theme = useTheme();
    const { t } = useTranslation();

    const configContext = useContext(ConfigContext);

    const unseenCount = useMemo(() => Math.max(0, events.length - seenCount), [events.length, seenCount]);

    const handleToggle = () => {
        if (!open) {
            setSeenCount(events.length);
        }
        setOpen((prev) => !prev);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const EVENT_CONFIG: Record<AdjudicationEventType, { label: string; icon: typeof GavelIcon; color: string }> = {
        [AdjudicationEventType.ADJUDICATION_STARTED]: { label: t("adjudicationStarted"), icon: GavelIcon, color: "info.main" },
        [AdjudicationEventType.ADJUDICATION_COMPLETED]: { label: t("adjudicationCompleted"), icon: CheckCircleIcon, color: "success.main" },
        [AdjudicationEventType.ADJUDICATION_CANCELLED]: { label: t("adjudicationCancelled"), icon: CancelIcon, color: "warning.main" },
        [AdjudicationEventType.USER_CONNECTED]: { label: t("userConnected"), icon: LoginIcon, color: "info.main" },
        [AdjudicationEventType.USER_DISCONNECTED]: { label: t("userDisconnected"), icon: LogoutIcon, color: "text.secondary" },
    };

    const getEventDescription = (event: AdjudicationEvent): string => {
        switch (event.eventType) {
            case AdjudicationEventType.ADJUDICATION_STARTED:
                return `${event.username} ${t("startedAdjudicating")} ${event.updatedNoticeNumber} → ${event.newStatus}`;
            case AdjudicationEventType.ADJUDICATION_COMPLETED:
                return `${event.username} ${t("completedAdjudicationFor")} ${event.updatedNoticeNumber} → ${event.newStatus}`;
            case AdjudicationEventType.ADJUDICATION_CANCELLED:
                return `${event.username} ${t("abortedAdjudicationFor")} ${event.updatedNoticeNumber} → ${event.newStatus}`;
            case AdjudicationEventType.USER_CONNECTED:
                return `${event.username} ${t("joinedTheSession")}`;
            case AdjudicationEventType.USER_DISCONNECTED:
                return `${event.username} ${t("leftTheSession")}`;
            default:
                return `${event.username}: ${event.eventType}`;
        }
    }

    return (
        <Box sx={{ position: "fixed", bottom: 24, right: 24,
        zIndex: theme.zIndex.snackbar, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <Collapse in={open} unmountOnExit>
                <Paper
                    elevation={6}
                    sx={{
                        width: 380,
                        maxHeight: 400,
                        mb: 2,
                        borderRadius: 2,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            px: 2,
                            py: 1.5,
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight={600}>
                            {t("adjudicationActivityLog")}
                        </Typography>

                        <Stack direction="row" gap={0.5}>
                            {events.length > 0 && (
                                <IconButton
                                    id="clearEventLog"
                                    size="small"
                                    onClick={onClear}
                                    sx={{ color: theme.palette.primary.contrastText }}
                                >
                                    <DeleteSweepIcon fontSize="small" />
                                </IconButton>
                            )}
                            <IconButton
                                id="closeEventLog"
                                size="small"
                                onClick={handleClose}
                                sx={{ color: theme.palette.primary.contrastText }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Box sx={{ overflowY: "auto", flex: 1 }}>
                        {events.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
                                { t("noActivitiesYet") }
                            </Typography>
                        ) : (
                            <List dense disablePadding>
                                {[...events].reverse().map((event, index) => {
                                    const config = EVENT_CONFIG[event.eventType];
                                    const Icon = config?.icon ?? GavelIcon;
                                    const color = config?.color ?? "text.primary";

                                    const eventKey = `${event.timestamp}-${event.eventType}-${event.updatedNoticeNumber ?? ""}`;

                                    return (
                                        <Box key={eventKey}>
                                            {index > 0 && <Divider variant="inset" component="li" />}

                                            <ListItem sx={{ alignItems: "flex-start", py: 1, px: 2 }}>
                                                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                                    <Icon fontSize="small" sx={{ color }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {config?.label ?? event.eventType}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Stack component="span">
                                                            <Typography variant="caption" component="span" color="text.secondary">
                                                                {getEventDescription(event)}
                                                            </Typography>
                                                            <Typography variant="caption" component="span" color="text.disabled">
                                                                {dayjs(event.timestamp).format(configContext.dateTime.timeFormat)}
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                />
                                            </ListItem>
                                        </Box>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </Paper>
            </Collapse>

            <Fab
                id="toggleEventLog"
                color="primary"
                size="medium"
                onClick={handleToggle}
                sx={{ boxShadow: 4 }}
            >
                <Badge badgeContent={unseenCount} color="error" max={99}>
                    <LibraryBooksIcon />
                </Badge>
            </Fab>
        </Box>
    );
}

export default AdjudicationEventLog;
