import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, useTheme } from "@mui/material";
import { toCamelCaseWords } from "../../../framework/utils";
import { t } from "i18next";
import TransgressionHistoryTable, { TransgressionHistoryData } from "./TransgressionHistoryTable";
import TmButton from "../../../framework/components/button/TmButton";
import CancelIcon from "@mui/icons-material/Cancel";
import { useHotkeys } from "react-hotkeys-hook";
import { RetrieveTransgressionHistoryApiArg, useRetrieveTransgressionHistoryQuery } from "../../redux/api/transgressionsApi";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import { ConfigContext } from "../../../framework/config/ConfigContext.tsx";

type TransgressionHistoryDialogProps = {
    testid: string;
    isOpen: boolean;
    noticeNo: string | undefined;
    onCancel: () => void;
}

function TransgressionHistoryDialog({ testid, isOpen, onCancel, noticeNo }: TransgressionHistoryDialogProps) {

    const configContext = useContext(ConfigContext);

    const [rows, setRows] = useState<TransgressionHistoryData[] | undefined>([]);
    const theme = useTheme();
    useHotkeys('ESCAPE', () => onCancel(), { preventDefault: true, enableOnFormTags: true, description: t('cancelDialog') ?? undefined });

    const handleCloseDialog = () => {
        onCancel();
    };

    const [request, setRequest] = useState<RetrieveTransgressionHistoryApiArg>({
      noticeNumber: "",
    });

    const { data, isLoading } = useRetrieveTransgressionHistoryQuery(request, {
        skip: !isOpen || (request.noticeNumber === "" || request.noticeNumber === undefined),
        refetchOnMountOrArgChange: true
    });

    useEffect(() => {
        if (isOpen) {
            setRequest({
                noticeNumber: noticeNo ?? "",
            });
        }
    }, [isOpen, setRequest, noticeNo]);

    useEffect(() => {
        if (data) {
            setRows(data?.transgressionEntries.map((entry) => {
                return {
                    noticeNo: data.noticeNumber,
                    dateTime: dayjs(entry.dateTime).format(configContext.dateTime.dateTimeFormat),
                    doneBy: entry.doneBy,
                    authorisedBy: entry.authorisedBy,
                    transgressionVersion: entry.transgressionVersion,
                    status: entry.status,
                    comment: entry.comments?.map((comment) => comment).join('\n'),
                } as TransgressionHistoryData;
            }));
        }
    }, [data, configContext]);

    return (
        <Dialog
            id={toCamelCaseWords(testid, 'dialog')}
            open={isOpen}
            onClose={handleCloseDialog}
            fullWidth={true}
            maxWidth='lg'
        >
            <DialogTitle
                id={toCamelCaseWords(testid, 'dialogTitle')}
                style={{ color: theme.palette.primary.main }}
            >
                {t('transgressionHistory')}
            </DialogTitle>

            <DialogContent>
                <DialogContentText style={{ marginBottom: '15px', color: theme.palette.text.primary }}>
                    {t('transgressionHistorySubTitle')}
                </DialogContentText>
                {
                    isLoading ?
                    <Grid container sx={{ display: 'flex', alignItems: 'center', mr: '-1px', flex: 'auto' }}>
                        <TmLoadingSpinner testid={toCamelCaseWords('transgressionHistorySubTitle')} />
                    </Grid> :
                    <TransgressionHistoryTable
                    entries={data?.transgressionEntries ?? []}
                    rows={rows as TransgressionHistoryData[]} />
                }
            </DialogContent>

            <DialogActions>
                <TmButton
                    testid={toCamelCaseWords(testid, 'dialogCloseButton')}
                    startIcon={<CancelIcon />}
                    onClick={onCancel}
                >
                    {t('close')}
                </TmButton>
            </DialogActions>
        </Dialog>
    )
}

export default TransgressionHistoryDialog;
