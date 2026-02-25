import {
    Box,
    Button,
    Dialog,
    Paper,
    Stack,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Theme,
    useMediaQuery
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { OverloadTransgressionDto, RtqsTransgressionDto, TransgressionEntry } from "../../redux/api/transgressionsApi";
import TransgressionView from "../submission/TransgressionView";
import TmButton from "../../../framework/components/button/TmButton";
import CancelIcon from "@mui/icons-material/Cancel";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import { SortOrder, stableSort } from "../../utils/Sort.ts";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import useTransgressionHistoryManager from "../../hooks/transgression-history/TransgressionHistoryManager.tsx";

export interface TransgressionHistoryData {
    noticeNo: string;
    dateTime: string;
    doneBy: string;
    authorisedBy: string;
    transgressionVersion: number;
    status: string;
    comment: string;
}

interface HeadCell {
    id: keyof TransgressionHistoryData;
    label: string;
    numeric: boolean;
}

type TransgressionHistoryTableProps = {
    rows: TransgressionHistoryData[];
    entries: TransgressionEntry[];
}

function TransgressionHistoryTable({ rows, entries }: TransgressionHistoryTableProps) {
    const { t } = useTranslation();
    const { page, setPage, rowsPerPage, setRowsPerPage, viewTransgression, setViewTransgression,
        onNextEntry, onPreviousEntry, onSelectedEntry, isLoading, selectedVersionNo, selectedTransgression,
        previousData, selectedHistoryEntry, hasFieldUpdates, selectedHistoryEntryIndex, findTransgressionConfigurationResponse
    } = useTransgressionHistoryManager(entries);
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

    const [order] = React.useState<SortOrder>('desc');
    const [orderBy] = React.useState<keyof TransgressionHistoryData>('noticeNo');
    const handleChangePage = (_event: React.SyntheticEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
        setPage(newPage);
    };
    const handleCloseTransgressionView = () => {
        setViewTransgression(false);
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const TransgressionsHeadCells: HeadCell[] = [
        { id: 'noticeNo', numeric: false, label: t('noticeNo') },
        { id: 'dateTime', numeric: false, label: t('dateTime') },
        { id: 'doneBy', numeric: false, label: t('doneBy') },
        { id: 'authorisedBy', numeric: false, label: t('authorisedBy') },
        { id: 'transgressionVersion', numeric: true, label: t('version') },
        { id: 'status', numeric: false, label: t('status') },
        { id: 'comment', numeric: false, label: t('comment') },
    ];

    const maxTransgressionVersion = Math.max(...rows.map(row => row.transgressionVersion));

    const visibleRows = React.useMemo(() => {
        return stableSort(rows, order, orderBy).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    }, [order, orderBy, page, rowsPerPage, rows]);

    const getTransgressionHistoryTranslation = (comment: string) => {
        // Normalize newlines and split into individual lines
        const lines = comment.split(/\r?\n/).map(line => line.trim()).filter(line => line !== "");

        // Translate each line if a match exists, otherwise keep original
        const translatedLines = lines.map(line => {
            // Match pattern: "Charge X: YYY ChargeStatus"
            const chargeMatch = line.match(/Charge (\d+): (\d+) (\w+)/);
            if (chargeMatch) {
                const chargeNumber = chargeMatch[1];  // Charge number
                const chargeCode = chargeMatch[2];    // Charge code
                const chargeStatus = chargeMatch[3];  // ChargeStatus (Withdrawn, Declined, etc.)

                // Translate charge status if available
                return `${t('charge')} ${chargeNumber}: ${chargeCode} ${t(chargeStatus)}`;
            }

            // Translate general comments
            return t(line);
        });

        // Join back using new lines
        return translatedLines.join("\n");
    };

    const TransgressionViewWrapper = ({ children }: { children: React.ReactNode }) => (
        <Box
            sx={{
                padding: '10px 5px',
                overflow: 'auto',   // Handle overflow if content exceeds height
                flex: 1,            // Take up available space above the Close button
                display: "grid",
                height: "78vh"
            }}
        >
            {children}
        </Box>
    );

    const NavButton = styled(Button)({
        borderRadius: '0px',
    });

    const PreviousButton = <NavButton
        id={'transgressionViewPrevious'}
        startIcon={<ArrowBackIosIcon />}
        onClick={() => onPreviousEntry()}
        disabled={selectedVersionNo <= 1 && selectedHistoryEntryIndex < 1}
        size='small'
        variant="contained"
        sx={{ justifyContent: 'end' }}
    />;

    const NextButton = <NavButton
        id={'transgressionViewForward'}
        startIcon={<ArrowForwardIosIcon />}
        onClick={() => onNextEntry()}
        disabled={selectedVersionNo >= maxTransgressionVersion && !(selectedHistoryEntryIndex < entries.length - 1)}
        size='small'
        variant="contained"
    />;

    return (
        <Box sx={{ width: '100%' }}>
            <Paper variant="outlined" sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={'medium'}
                    >
                        <TableHead>
                            <TableRow>
                                {TransgressionsHeadCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={'left'}
                                        padding={'normal'}
                                        sortDirection={orderBy === headCell.id ? order : false}
                                    >{headCell.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                return (
                                    <TableRow
                                        key={(index + 1)}
                                        hover
                                        tabIndex={-1}
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => onSelectedEntry(row.noticeNo, row.transgressionVersion, index)}
                                    >
                                        <TableCell id='transgressionHistoryNoticeNo' align='left'>{row.noticeNo}</TableCell>
                                        <TableCell id='transgressionHistoryDateTime' align='left'>{row.dateTime}</TableCell>
                                        <TableCell id='transgressionHistoryDoneBy' align='left'>{row.doneBy}</TableCell>
                                        <TableCell id='transgressionHistoryAuthorisedBy' align='left'>{row.authorisedBy}</TableCell>
                                        <TableCell id='transgressionHistoryVersion' align='left'>{row.transgressionVersion}</TableCell>
                                        <TableCell id='transgressionHistoryStatus' align='left'>{t(row.status)}</TableCell>
                                        <TableCell id='transgressionHistoryComment' align='left' style={{ whiteSpace: 'pre-line' }}>
                                            {getTransgressionHistoryTranslation(row.comment)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage={t('labelRowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) => `${from} - ${to} ${t('of')} ${count}`}
                />
            </Paper>

            <Dialog
                id={'transgressionViewDialog'}
                open={viewTransgression}
                PaperProps={{
                    sx: {
                        borderRadius: '10px',
                        maxWidth: '1280px',
                        width: '100%',      // Full width for responsiveness
                        maxHeight: '90vh',  // Prevent overflow on smaller screens
                        height: 'auto',     // Allow height to adjust to content
                        display: 'flex',    // Stack children vertically
                        flexDirection: 'column',
                        overflow: isLoading ? 'visible' : 'auto',
                        margin: isMobile ? 5 : 0,
                    },
                }}
                sx={{ margin: 'auto' }}
                onClose={handleCloseTransgressionView}
                fullScreen
            >
                {(isLoading) ?
                    <TmLoadingSpinner testid="loadingSpinner" />
                    :
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch',
                        }}
                    >
                        {!isMobile && PreviousButton}
                        <Box width="100%">
                            <TransgressionViewWrapper>
                                <TransgressionView
                                    transgression={selectedTransgression ?? {} as OverloadTransgressionDto | RtqsTransgressionDto}
                                    previousTransgression={previousData as OverloadTransgressionDto | RtqsTransgressionDto}
                                    transgressionVersion={selectedVersionNo}
                                    hasFieldUpdates={hasFieldUpdates}
                                    historyEntry={selectedHistoryEntry}
                                    transgressionConfig={findTransgressionConfigurationResponse?.transgressionConfigurations?.[0]}
                                />
                            </TransgressionViewWrapper>
                            <Stack sx={{
                                padding: isMobile ? 0 : '5px 5px 15px 50px',
                                display: 'flex',         // Align close button to the right
                                justifyContent: isMobile ? 'space-between' : 'flex-end',
                                alignItems: isMobile ? 'normal' : 'flex-end',
                                flexDirection: isMobile ? 'row' : 'column',
                            }}>
                                {isMobile && PreviousButton}
                                <TmButton
                                    testid='closeButton'
                                    startIcon={<CancelIcon />}
                                    size="large"
                                    onClick={handleCloseTransgressionView}
                                    sx={{ float: 'none' }}

                                >
                                    {t("close")}
                                </TmButton>
                                {isMobile && NextButton}
                            </Stack>
                        </Box>
                        {!isMobile && NextButton}
                    </Box>
                }
            </Dialog>
        </Box>
    );
}

export default TransgressionHistoryTable;
