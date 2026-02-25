
import { TablePagination, TablePaginationProps } from '@mui/material';
import { memo, useEffect } from 'react';
import { toCamelCaseWords } from '../../utils';

type Props = {
    testid: string;
    pageSizes: number[];
} & TablePaginationProps

// type PageOptions = {
//     value: number;
//     label: any;
// }

const TmPagination = ({ testid, pageSizes, ...props }: Props) => {
    // TODO: Revisit MUI documentation later if MUI added extra props to add page selector and first and last page button id
    // const rowsPerPageOptions: PageOptions[] = [];
    // pageSizes.forEach((row: number) => {
    //     rowsPerPageOptions.push({
    //         value: row,
    //         label: <span id={toCamelCaseWords(row.toString(), 'PageSizeOption')}>{row.toString()}</span>
    //     })
    // });
    useEffect(() => {
        const firstPageButton = document.querySelector('[aria-label="Go to first page"]');
        const lastPageButton = document.querySelector('[aria-label="Go to last page"]');
        // const pageSize25 = document.querySelector('[data-value="25"]');
        firstPageButton?.setAttribute('id', toCamelCaseWords(testid, 'FirstPageButton'));
        lastPageButton?.setAttribute('id', toCamelCaseWords(testid, 'LastPageButton'));
        // pageSize25?.setAttribute('id', toCamelCaseWords(testid, 'PageItem', '25'));
    }, [testid]);
    return (
        <TablePagination
            {...props}
            id={testid}
            component='div'
            showFirstButton
            showLastButton
            // rowsPerPageOptions={rowsPerPageOptions}
            backIconButtonProps={{'id': toCamelCaseWords(testid, 'BackPageButton')} as any}
            nextIconButtonProps={{'id': toCamelCaseWords(testid, 'NextPageButton')} as any}
            SelectProps={{inputProps:{'id': toCamelCaseWords(testid, 'SelectPage')}}}
        />
    )};

export default memo(TmPagination)