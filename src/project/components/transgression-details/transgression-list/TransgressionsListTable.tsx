import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { SortOrder, stableSort } from "../../../utils/Sort.ts";
import { TransgressionType } from '../../../enum/TransgressionType.ts';
import AuthService from "../../../../framework/auth/authService";

export interface TransgressionData {
    date: string;
    sequenceNo?: number;
    noticeNo: string;
    plateNo: string;
    offenderName?: string;
    status: string;
}
interface HeadCell {
    id: keyof TransgressionData;
    label: string;
    numeric: boolean;
}

type TransgressionListTableProps = {
    rows: TransgressionData[];
    searchValue: string;
    onTransgressionClick: (transgression: TransgressionData) => void;
    transgressionType: TransgressionType
}

function TransgressionsListTable({ rows, searchValue, onTransgressionClick, transgressionType }: Readonly<TransgressionListTableProps>) {
    const { t } = useTranslation();

    const [order, setOrder] = React.useState<SortOrder>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof TransgressionData>('date');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (property: keyof TransgressionData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_event: React.SyntheticEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    let TransgressionsHeadCells: HeadCell[] = [
        { id: 'date', numeric: false, label: t('date') },
        { id: 'sequenceNo', numeric: true, label: t('sequenceNo') },
        { id: 'noticeNo', numeric: false, label: t('noticeNo') },
        { id: 'plateNo', numeric: false, label: t('plateNo') },
        { id: 'offenderName', numeric: false, label: t('offenderName') },
        { id: 'status', numeric: false, label: t('status') },
    ];

    // Remove sequence number if it RTQS transgression
    if (transgressionType === TransgressionType.RTQS && AuthService.isFeatureEnabled('RTQS_TRANSGRESSIONS')) {
        TransgressionsHeadCells = TransgressionsHeadCells.filter(
            (cell) => cell.id !== "sequenceNo"
        );
    }

    const visibleRows = React.useMemo(() => {
        const filteredRows = rows.filter(row => {
            return row.sequenceNo?.toString().includes(searchValue)
                || row.noticeNo.toLowerCase().includes(searchValue.toLowerCase())
                || row.offenderName?.toLowerCase().includes(searchValue.toLowerCase())
                || row.plateNo.toLowerCase().includes(searchValue.toLowerCase())
                || row.date.toLowerCase().includes(searchValue.toLowerCase())
                || row.status.toLowerCase().includes(searchValue.toLowerCase());
        });

        return stableSort(filteredRows, order, orderBy).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    }, [order, orderBy, page, rowsPerPage, rows, searchValue]
    );

    const handleClickRow = (transgression: TransgressionData) => {
        onTransgressionClick(transgression);
    }

    const copyCell = (event: React.MouseEvent, val: string) => {
        event.stopPropagation();
        navigator.clipboard.writeText(val);
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
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
                                    >
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={() => { handleRequestSort(headCell.id) }}
                                        >
                                            {headCell.label}
                                            {orderBy === headCell.id ? (
                                                <Box component="span" sx={visuallyHidden}>
                                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                </Box>
                                            ) : null}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleRows.map((row) => {
                                return (
                                    <TableRow
                                        key={row.noticeNo}
                                        hover
                                        onClick={() => { handleClickRow(row) }}
                                        tabIndex={-1}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell id='transgressionListDateTime' align='left'>{row.date}</TableCell>
                                        {transgressionType === TransgressionType.OVERLOAD &&
                                            <TableCell id='transgressionListSequenceNo' align='left'>{row.sequenceNo}</TableCell>
                                        }
                                        <TableCell id='transgressionListNoticeNo' align='left'>
                                            <Tooltip title={<><ContentCopyIcon sx={{ fontSize: 'inherit' }} /> {t('copyNoticeNumber')}</>} followCursor>
                                                <div style={{ width: 'fit-content', cursor: 'copy' }} onClick={(event) => { copyCell(event, row.noticeNo) }}>
                                                    {row.noticeNo}
                                                </div>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell id='transgressionListPlateNo' align='left'>{row.plateNo}</TableCell>
                                        <TableCell id='transgressionListOffenderName' align='left'>{row.offenderName}</TableCell>
                                        <TableCell id='transgressionListStatus' align='left'>{t(row.status)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
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
        </Box>
    );
}

export default TransgressionsListTable;
