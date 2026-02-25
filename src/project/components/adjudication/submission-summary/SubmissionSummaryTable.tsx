import React, { SyntheticEvent, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { removeUnderscores } from "../../../../framework/utils";
import { SubmissionSummaryDto } from "../../../redux/api/transgressionsApi";
import { ConfigContext } from "../../../../framework/config/ConfigContext";
import dayJs from "dayjs";
import { SortOrder, stableSort } from "../../../utils/Sort.ts";
import dayjs from "dayjs";
import useAdjudicationManager from "../../../hooks/adjudication/AdjudicationManager.tsx";

export interface SubmissionData {
    courtDate: string;
    courtName: string;
    noticeNumber: string;
    offenderName?: string;
    submissionStatus: string;
    block: string;
    courtResult: boolean;
}

interface HeadCell {
    id: keyof SubmissionData;
    label: string;
    numeric: boolean;
}

type SubmissionListTableProps = {
    submissionSummaries: SubmissionSummaryDto[];
}

const SubmissionSummaryTable = ({ submissionSummaries }: SubmissionListTableProps) => {
    const { t } = useTranslation();
    const [order] = useState<SortOrder>('asc');
    const [orderByCourtDate] = useState<keyof SubmissionData>('courtDate');
    const [orderByNoticeNumber] = useState<keyof SubmissionData>('noticeNumber');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const config = useContext(ConfigContext);

    const { checkDisplayBlockResult } = useAdjudicationManager();

    const handleChangePage = useCallback((_event: SyntheticEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
        setPage(newPage);
    }, [setPage]);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value));
        setPage(0);
    }, [setRowsPerPage, setPage]);

    const SubmissionHeadCells: HeadCell[] = [
        { id: 'courtDate', numeric: false, label: t('courtDate') },
        { id: 'courtName', numeric: true, label: t('courtName') },
        { id: 'noticeNumber', numeric: false, label: t('noticeNo') },
        { id: 'offenderName', numeric: false, label: t('offenderName') },
        { id: 'submissionStatus', numeric: false, label: t('submissionStatus') },
        { id: 'block', numeric: false, label: t('block') },
    ];

    const visibleRows = React.useMemo(() => {
        // Transform rows to include computed 'block' value
        const transformedRows = submissionSummaries.map(row => {
            const courtDate = new Date(row.courtDate).toISOString();
            const blockDisplayText = checkDisplayBlockResult(row.courtResult, dayjs(), dayjs(courtDate));

            return {
                ...row,
                block: blockDisplayText,
                courtResult: row.courtResult,
            };
        });

        const sortedRowsByCourtDate = stableSort(transformedRows, order, orderByCourtDate);
        const sortedRowsByNoticeNumber = Object.values(sortedRowsByCourtDate.reduce((out, curr) => {
            const key = curr.courtDate;
            out[key] ||= [];
            out[key].push(curr as SubmissionData);
            return out;
        }, {} as Record<string, SubmissionData[]>))
            .map((items) => stableSort(items, order, orderByNoticeNumber)).flatMap(group => group);

        return sortedRowsByNoticeNumber.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [order, orderByCourtDate, orderByNoticeNumber, page, rowsPerPage, submissionSummaries, checkDisplayBlockResult]);

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
                        <TableHead>
                            <TableRow>
                                {SubmissionHeadCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={'left'}
                                        padding={'normal'}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleRows.map((row, index) => (
                                <TableRow key={index} hover tabIndex={-1} sx={{ cursor: 'pointer' }}>
                                    <TableCell id='submissionListCourtDateTime' align='left'>{dayJs(row.courtDate).format(config.dateTime.dateFormat)}</TableCell>
                                    <TableCell id='submissionListCourtName' align='left'>{row.courtName}</TableCell>
                                    <TableCell id='submissionListNoticeNo' align='left'>{row.noticeNumber}</TableCell>
                                    <TableCell id='submissionListOffenderName' align='left'>{row.offenderName ?? ''}</TableCell>
                                    <TableCell id='submissionListStatus' align='left'>{t(removeUnderscores(String(row.submissionStatus)))}</TableCell>
                                    <TableCell id='submissionListBlock' align='left'>{row.block}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={submissionSummaries.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage={t('labelRowsPerPage')}
                    labelDisplayedRows={({ from, to, count}) => `${from} - ${to} ${t('of')} ${count}`}
                />
            </Paper>
        </Box>
    );
};

export default SubmissionSummaryTable;
