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
import { Tooltip, useTheme } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { SortOrder, stableSort } from '../../utils/Sort.ts';
import { toTitleCase } from '../../../framework/utils';
import tinycolor from 'tinycolor2';
import TmTypography from '../../../framework/components/typography/TmTypography.tsx';

export interface CourtResultHistoryListData {
    courtDate: string;
    courtName: string;
    noticeNo: string;
    plateNo: string;
    offenderName: string;
    status: string;
    courtResult: string;
}

interface HeadCell {
    id: keyof CourtResultHistoryListData;
    label: string;
    numeric: boolean;
}

type CourtResultHistoryTableProps = {
    rows: CourtResultHistoryListData[];
    searchValue: string;
    onRowClick: (noticeNumber: string) => void;
}

function CourtResultHistoryTable({ rows, searchValue, onRowClick }: CourtResultHistoryTableProps) {
    const { t } = useTranslation();
    const theme = useTheme();

    const [order, setOrder] = React.useState<SortOrder>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof CourtResultHistoryListData>('courtDate');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (property: keyof CourtResultHistoryListData) => {
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

    const CourtCaseHeadCells: HeadCell[] = [
        { id: 'courtDate', numeric: false, label: t('courtDate') },
        { id: 'courtName', numeric: false, label: t('courtName') },
        { id: 'noticeNo', numeric: false, label: t('noticeNo') },
        { id: 'plateNo', numeric: false, label: t('plateNo') },
        { id: 'offenderName', numeric: false, label: t('offenderName') },
        { id: 'status', numeric: false, label: t('status') },
        { id: 'courtResult', numeric: false, label: t('courtResult') },
    ];

    const visibleRows = React.useMemo(() => {
        const filteredRows = rows.filter(row => {
            return row.courtDate.toString().includes(searchValue)
                || row.noticeNo.toLowerCase().includes(searchValue.toLowerCase())
                || row.offenderName.toLowerCase().includes(searchValue.toLowerCase())
                || row.plateNo.toLowerCase().includes(searchValue.toLowerCase())
                || row.courtName.toLowerCase().includes(searchValue.toLowerCase())
                || row.status.toLowerCase().includes(searchValue.toLowerCase())
                || row.courtResult.toLowerCase().includes(searchValue.toLowerCase());
        });

        return stableSort(filteredRows, order, orderBy).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    }, [order, orderBy, page, rowsPerPage, rows, searchValue]
    );

    const handleClickRow = (noticeNumber: string) => {
        onRowClick(noticeNumber);
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
                                {CourtCaseHeadCells.map((headCell) => (
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
                        <TableBody sx={{
                            "& .MuiTableRow-root:hover": {
                                backgroundColor: tinycolor(theme.palette.primary.main).setAlpha(.20).toRgbString()
                            }
                        }}>
                            {visibleRows.map((row) => {
                                return (
                                    <TableRow
                                        key={row.noticeNo}
                                        hover
                                        onClick={() => { handleClickRow(row.noticeNo) }}
                                        tabIndex={-1}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell id='courtResultHistoryCourtDate' align='left'>{row.courtDate}</TableCell>
                                        <TableCell id='courtResultHistoryCourtName' align='left'>{row.courtName}</TableCell>
                                        <TableCell id='courtResultHistoryNoticeNo' align='left'>
                                            <Tooltip title={<><ContentCopyIcon sx={{ fontSize: 'inherit' }} /> {t('copyNoticeNumber')}</>} followCursor>
                                                <div style={{ width: 'fit-content', cursor: 'copy' }} onClick={(event) => { copyCell(event, row.noticeNo) }}>
                                                    {row.noticeNo}
                                                </div>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell id='courtResultHistoryPlateNo' align='left'>{row.plateNo}</TableCell>
                                        <TableCell id='courtResultHistoryOffenderName' align='left'>{toTitleCase(row.offenderName)}</TableCell>
                                        <TableCell id='courtResultHistoryStatus' align='left'>
                                            <TmTypography testid='courtResultHistoryStatusBold'>
                                                {toTitleCase(t(row.status))}
                                            </TmTypography>
                                        </TableCell>
                                        <TableCell id='courtResultHistoryCourtResult' align='left'>
                                            <TmTypography testid='courtResultHistoryStatusBold' fontWeight={"500"}>
                                                {toTitleCase(t(row.courtResult))}
                                            </TmTypography>
                                        </TableCell>
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
        </Box >
    );
}

export default CourtResultHistoryTable;
