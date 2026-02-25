import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChangeEvent, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

type CustomProps = TextFieldProps & {
    testid: string;
    searchValue: string;
    onDebouncedChange: (value: string) => void;
}

type Props = CustomProps & Pick<TextFieldProps, Exclude<keyof TextFieldProps, 'value'>>;

export default memo(function TmSearch(props: Props) {
    const { searchValue, onDebouncedChange } = props;
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => setSearchQuery(searchValue), [searchValue]);
    const debouncedSearchQuery = useDebouncedCallback((newValue) => {
        onDebouncedChange(newValue);
    }, 500);
    const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const newSearchQuery = event.target.value;
        setSearchQuery(newSearchQuery);
        debouncedSearchQuery(newSearchQuery)
    }, [debouncedSearchQuery]);
    const textFieldProps: Partial<Props> = { ...props };
    delete textFieldProps['searchValue'];
    delete textFieldProps['onDebouncedChange'];
    delete textFieldProps['value'];
    delete textFieldProps['testid'];
    return (
        <AnimatedTextField
            placeholder={t('searchPlaceholder') ?? '...'}
            size='small'
            value={searchQuery}
            onChange={handleOnChange}
            inputProps={{
                id: props.testid,
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position='start'>
                        <SearchIcon />
                    </InputAdornment>
                )
            }}
            {...textFieldProps}
        />
    );
});

const AnimatedTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-input': {
        transition: theme.transitions.create('width'),
        width: '100%'
    }
}));
