import { Box, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Theme, useMediaQuery, useTheme } from "@mui/material";
import TmLoadingSpinner from "../../../../framework/components/progress/TmLoadingSpinner";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import useNoticeNumberManager from "../../../hooks/aarto/NoticeNumberManager";
import { useTranslation } from "react-i18next";
import { SortOrder, stableSort } from "../../../utils/Sort";
import React, { useEffect } from "react";
import { visuallyHidden } from '@mui/utils';
import { MdOutlineInventory } from "react-icons/md";
import TmButton from "../../../../framework/components/button/TmButton";
import RequestNoticeNumbersFormPage from "./RequestNoticeNumbersFormPage";

export interface NoticeNumberData {
    noticeType: string;
    remainingNoticeNumbers: number;
}
interface HeadCell {
    id: keyof NoticeNumberData;
    label: string;
    numeric: boolean;
}

function NoticeNumbersListPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const { t } = useTranslation();
    const subHeading = t('noticeManagement.requestNoticeNumbers.subHeading');

    const [order, setOrder] = React.useState<SortOrder>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof NoticeNumberData>('noticeType');

    const handleRequestSort = (property: keyof NoticeNumberData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const headCells: HeadCell[] = [
        { id: 'noticeType', numeric: false, label: t('noticeManagement.requestNoticeNumbers.noticeTypeColumn') },
        { id: 'remainingNoticeNumbers', numeric: true, label: t('noticeManagement.requestNoticeNumbers.remainingNoticeNumbersColumn') },
    ];

    const manager = useNoticeNumberManager();

    const {
        isLoading,
        rows,
        fetchNoticeNumbers,
        showForm,
        handleRequestNoticeNumbers
    } = manager;

    useEffect(() => {
        fetchNoticeNumbers();
    }, [fetchNoticeNumbers]);

    const visibleRows = React.useMemo(() => {
        return stableSort(rows, order, orderBy);
    }, [order, orderBy, rows]);

    if (showForm) {
        return <RequestNoticeNumbersFormPage manager={manager} />;
    }

    return (
        <>
            {isLoading ? <TmLoadingSpinner testid={"loadingSpinner"} /> :
                <Box px={20} py={15} maxWidth={1000} m="15px auto">

                    <Grid container spacing={5}>
                        <Grid size={{ md: 7, xs: 12 }}>
                            <TmTypography testid="requestNoticeNumberSubHeading" variant="body1" color={theme.palette.text.primary} mb={15}>{subHeading}</TmTypography>

                            <TableContainer sx={{ border: 2, borderColor: theme.palette.primary.main, borderRadius: 1 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {headCells.map((headCell) => (
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
                                                    hover
                                                    tabIndex={-1}
                                                    key={row.noticeType}
                                                >
                                                    <TableCell id='noticeType' align='left'>{row.noticeType}</TableCell>
                                                    <TableCell id='remainingNoticeNumbers' align='left'>{row.remainingNoticeNumbers}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Grid>

                        <Grid size={{ md: 5, xs: 12 }}>
                            <Box textAlign={"center"} sx={{
                                width: '100%',
                                marginTop: isMobile ? 5 : 25,
                                position: 'relative'
                            }}>
                                <Stack alignItems="center">
                                    <MdOutlineInventory color={theme.palette.primary.main}
                                        style={{ margin: '0 auto', fontSize: '130px' }} />

                                    <TmButton
                                        testid={"requestNoticeNumbersButton"}
                                        onClick={() => handleRequestNoticeNumbers()}
                                        disabled={isLoading}
                                        color={"primary"}
                                        variant={"contained"}
                                        size={"small"}
                                    >
                                        {t('noticeManagement.requestNoticeNumbers.requestNumbersButton')}
                                    </TmButton>
                                </Stack>
                            </Box>
                        </Grid>

                    </Grid>

                </Box>
            }
        </>
    );
}

export default NoticeNumbersListPage;
