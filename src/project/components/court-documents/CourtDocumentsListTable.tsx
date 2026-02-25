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
import { Stack, Tooltip, useTheme } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { SortOrder, stableSort } from '../../utils/Sort.ts';
import { toTitleCase } from '../../../framework/utils';
import tinycolor from 'tinycolor2';
import TmTypography from '../../../framework/components/typography/TmTypography.tsx';
import { useCallback } from "react";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import TmButton from '../../../framework/components/button/TmButton.tsx';
import TmIconButton from '../../../framework/components/button/TmIconButton.tsx';

export interface CourtDocumentsListTable {
    courtDate: string;
    courtName: string;
    noticeNo: string;
    plateNo: string;
    offenderName?: string;
    status: string;
    offenderIdNo?: string;
    courtDocument?: string;
}

interface HeadCell {
    id: keyof CourtDocumentsListTable;
    label: string;
    numeric: boolean;
}

type CourtDocumentsListTableProps = {
    rows: CourtDocumentsListTable[];
    searchValue: string;
    files?: Map<string, File | null>;
    onCourtCaseClick: (transgression: CourtDocumentsListTable) => void;
    onFileChange?: (noticeNo: string, file: File) => void;
    onDeleteFile?: (noticeNo: string) => void;
    showCourtDocumentColumn?: boolean
}

function CourtDocumentsListTable({ rows, searchValue, files, onCourtCaseClick, onFileChange, onDeleteFile, showCourtDocumentColumn: showDocumentTypeColumn }: Readonly<CourtDocumentsListTableProps>) {
    const { t } = useTranslation();
    const theme = useTheme();

    const [order, setOrder] = React.useState<SortOrder>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof CourtDocumentsListTable>('courtDate');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const fileInputRefs = React.useRef(new Map<string, HTMLInputElement | null>());

    const handleRequestSort = (property: keyof CourtDocumentsListTable) => {
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

    let CourtCaseHeadCells: HeadCell[] = [
        { id: 'courtDate', numeric: false, label: t('courtDate') },
        { id: 'courtName', numeric: false, label: t('courtName') },
        { id: 'noticeNo', numeric: false, label: t('noticeNo') },
        { id: 'plateNo', numeric: false, label: t('plateNo') },
        { id: 'offenderName', numeric: false, label: t('offenderName') },
        { id: 'status', numeric: false, label: t('status') },
    ];

    // Remove "status" if showDocumentTypeColumn is true
    if (showDocumentTypeColumn) {
        CourtCaseHeadCells = CourtCaseHeadCells.filter(
        (cell) => cell.id !== "status"
        );
    }

    // Check if the showDocumentTypeColumn is required and add the "documentType" column dynamically
    if (showDocumentTypeColumn) {
        CourtCaseHeadCells.push(
        { id: "offenderIdNo", numeric: false, label: t("offenderIdNo") },
        { id: "courtDocument", numeric: false, label: t("courtDocument") }
        );
    }

    const visibleRows = React.useMemo(() => {
        const filteredRows = rows.filter(row => {
            return row.courtDate.toString().includes(searchValue)
                || row.noticeNo.toLowerCase().includes(searchValue.toLowerCase())
                || row.offenderName?.toLowerCase().includes(searchValue.toLowerCase())
                || row.plateNo.toLowerCase().includes(searchValue.toLowerCase())
                || row.courtName.toLowerCase().includes(searchValue.toLowerCase())
                || row.status.toLowerCase().includes(searchValue.toLowerCase())
                || row.offenderIdNo?.toLowerCase().includes(searchValue.toLowerCase());
        });

        return stableSort(filteredRows, order, orderBy).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    }, [order, orderBy, page, rowsPerPage, rows, searchValue]
    );

    const handleClickRow = (courtCase: CourtDocumentsListTable) => {
        onCourtCaseClick(courtCase);
    }

    const copyCell = (event: React.MouseEvent, val: string) => {
        event.stopPropagation();
        navigator.clipboard.writeText(val);
    }

    const handleUploadClick = useCallback((noticeNo: string) => {
        const fileInputRef = fileInputRefs.current.get(noticeNo);
        if (fileInputRef) {
            const clickEvent = new MouseEvent("click", { bubbles: false });
            fileInputRef.dispatchEvent(clickEvent);
        }
    }, []);

    const handleDeleteClick = useCallback((noticeNo: string) => {
        onDeleteFile?.(noticeNo);
    }, [onDeleteFile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            const noticeNo = event.target.id;
            onFileChange?.(noticeNo, file);
        }
    }

    const isUploadDisabled = (transgressionStatus: string) =>
        !["WARRANT_OF_ARREST_PRINTED", "WARRANT_OF_ARREST_AUTHORISED"].includes(transgressionStatus);

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
                                        onClick={() => { handleClickRow(row) }}
                                        tabIndex={-1}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell id='courtCaseListCourtDate' align='left'>{row.courtDate}</TableCell>
                                        <TableCell id='courtCaseListCourtName' align='left'>{row.courtName}</TableCell>
                                        <TableCell id='courtCaseListNoticeNo' align='left'>
                                            <Tooltip title={<><ContentCopyIcon sx={{ fontSize: 'inherit' }} /> {t('copyNoticeNumber')}</>} followCursor>
                                                <div style={{ width: 'fit-content', cursor: 'copy' }} onClick={(event) => { copyCell(event, row.noticeNo) }}>
                                                    {row.noticeNo}
                                                </div>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell id='courtCaseListPlateNo' align='left'>{row.plateNo}</TableCell>
                                        <TableCell id='courtCaseListOffenderName' align='left'>{toTitleCase(row.offenderName ?? '')}</TableCell>
                                        {!showDocumentTypeColumn && (
                                            <TableCell id="courtCaseListStatus" align="left">
                                                <TmTypography
                                                testid="courtCaseListStatusBold"
                                                fontWeight={"500"}
                                                >
                                                {toTitleCase(t(row.status))}
                                                </TmTypography>
                                            </TableCell>
                                        )}
                                        {showDocumentTypeColumn && (
                                            <>
                                                <TableCell id="courtCaseListOffenderIdNo" align="left">
                                                    {row.offenderIdNo || ""}
                                                </TableCell>
                                                <TableCell id="courtCaseListCourtDocument" align="left">
                                                <>
                                                    <input id={row.noticeNo} type="file" style={{ display: "none" }} onChange={handleFileChange} ref={(ref) => {
                                                        if (ref) {
                                                            fileInputRefs.current.set(row.noticeNo, ref);
                                                        }
                                                    }} />
                                                    {files?.get(row.noticeNo) && files?.get(row.noticeNo)?.name ? (
                                                        <Stack direction="row" gap={2}>
                                                            <TmTypography testid="uploadedDocument">
                                                                {files?.get(row.noticeNo)?.name}
                                                            </TmTypography>
                                                            <TmIconButton
                                                                testid="uploadFileButton"
                                                                color='primary'
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleUploadClick(row.noticeNo);
                                                                }}
                                                            >
                                                                <UploadFileIcon />
                                                            </TmIconButton>
                                                            <TmIconButton
                                                                testid="deleteFileButton"
                                                                color='primary'
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleDeleteClick(row.noticeNo);
                                                                }}
                                                            >
                                                                <DeleteIcon />
                                                            </TmIconButton>
                                                        </Stack>
                                                    ) : (
                                                        <TmButton
                                                        testid='woaUpload'
                                                            variant="contained"
                                                            color="primary"
                                                            disabled={isUploadDisabled(row.status)}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleUploadClick(row.noticeNo);
                                                            }}
                                                        >
                                                            {t("upload")}
                                                        </TmButton>
                                                    )}
                                                </>
                                                </TableCell>
                                            </>
                                        )}
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

export default CourtDocumentsListTable;
