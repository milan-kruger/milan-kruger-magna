import { Select, Tooltip, useTheme } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import TmMenuItem from '../menu/TmMenuItem';
import TmSearch from './TmSearch';
import toCamelCase, { toCamelCaseWords } from '../../utils';

type Props = {
    testid: string;
    searchValue: string;
    filterValues: string[];
    onDebouncedChange: (value: string) => void;
    selectedValue: string;
    onChangeFilter: (value: string) => void;
}

export default memo(function TmAdvancedSearch({ testid, searchValue, filterValues, onDebouncedChange, selectedValue, onChangeFilter }: Props) {
    const theme = useTheme();
    const { t } = useTranslation();
    const findSelectedValue = filterValues.find(value => value === selectedValue);
    return (
        <>
            <Tooltip title={t(selectedValue)} arrow placement='top-start'>
                <Select
                    id={`${testid}AdvSearchSelect`}
                    style={{
                        height: 40,
                        width: 110,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        color: theme.palette.primary.contrastText,
                        backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark,
                        textAlign: 'left'
                    }}
                    value={findSelectedValue ?? 'all'}
                    onChange={event => onChangeFilter(event.target.value)}
                >
                    {filterValues.map((filterValue) => (
                        <TmMenuItem
                            testid={toCamelCaseWords(testid, toCamelCase(t(filterValue)), 'AdvSearch')}
                            key={filterValue}
                            value={filterValue}
                        >
                            {t(filterValue)}
                        </TmMenuItem>
                    ))}
                </Select>
            </Tooltip>
            <TmSearch
                testid={testid}
                searchValue={searchValue}
                onDebouncedChange={onDebouncedChange}
                sx={{
                    "& .MuiInputBase-root": {
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0
                    }
                }}
            />
        </>
    );
});
