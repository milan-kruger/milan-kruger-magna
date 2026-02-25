/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import { Autocomplete, AutocompleteProps, Box, InputAdornment, styled, TextField, useTheme, useMediaQuery } from '@mui/material';
import Flag from 'react-world-flags';
import { memo, Suspense, useCallback, useEffect, useState } from 'react';
import tinycolor from 'tinycolor2';
import TmLoadingSpinner from '../../progress/TmLoadingSpinner';
import { fieldsWidth } from '../../../utils';
import { getSharedSxStyles } from '../../../utils/SharedStyles';

type CustomProps = {
    readonly?: boolean;
}

const StyledAutocomplete = styled(Autocomplete, {
    shouldForwardProp: (prop) => prop !== 'readonly',
})<CustomProps>(({ theme, readonly, value }) => ({
    '& .MuiInputLabel-root': {
        color: readonly && value !== null ? `${theme.palette.text.primary} !important` : undefined
    },
    '& .MuiInputBase-input': {
        WebkitTextFillColor: readonly ? `${theme.palette.text.primary} !important` : undefined
    },
    '& .MuiInputBase-root.MuiInput-root.Mui-disabled::before': {
        borderBottom: readonly ? 'none' : undefined
    },
    '& .MuiAutocomplete-endAdornment': {
        display: readonly ? 'none' : 'inherit'
    }
}));

type Props = {
    label: string;
    testid: string;
    required?: boolean;
    error?: boolean;
    alternative?: boolean;
    helperText?: string;
    getOptionLabel: (option: any) => string;
    setCountryLookup: (event: any, lookup: any) => void;
} & CustomProps & AutocompleteProps<any, boolean, boolean, boolean>

function TmCountrySelector({ label, testid, required, error, alternative, helperText, setCountryLookup, ...props }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [lookupCode, setLookupCode] = useState<string | undefined>(props.value?.lookupCode);
    const onChangeCountry = useCallback((event: any, value: any) => {
        setCountryLookup(event, value);
        setLookupCode(value?.lookupCode);
    }, [setCountryLookup])
    useEffect(() => {
        if (props.value?.lookupCode) {
            setLookupCode(props.value.lookupCode);
        }
        else {
            setLookupCode(undefined);
        }
    }, [props.value])
    return (
        <StyledAutocomplete
            {...props as any}
            autoHighlight
            value={props.value}
            sx={{
                width: fieldsWidth(isMobile),
                ...props.sx,
                '& .MuiInputBase-root': {
                    backgroundColor: error ? tinycolor(theme.palette.error.light).setAlpha(0.20).toRgbString() : 'inherit'
                },
                '& label': {
                    fontSize: '1em'
                }
            }}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    required={required}
                    label={label}
                    variant='standard'
                    error={error}
                    helperText={helperText !== ' ' ? <span id={testid + 'ErrorMessage'}>{helperText}</span> : ' '}
                    slotProps={{
						htmlInput: {
							...params.inputProps,
							id: testid,
						},
                        input: {
                            ...params.InputProps,
                            startAdornment: lookupCode ? (
                                <InputAdornment position='start'>
                                    <Suspense fallback={<TmLoadingSpinner testid='weighPageLoading' size={20} />}>
                                        <Flag
                                            code={lookupCode}
                                            width={25}
                                            style={{ boxShadow: '0px 0px 1px 1px #7f7f7f', width: '1.4rem', height: 'auto' }}
                                            fallback={<HelpCenterOutlinedIcon style={{ alignSelf: 'center', marginLeft: 1, marginRight: 2 }} />}
                                        />
                                    </Suspense>
                                </InputAdornment>
                            ) : null
                        }
					}}
                    sx={getSharedSxStyles({
                        alternative: alternative ?? true,
                        error: error,
                        theme,
                        readonly: props.readonly
                    })}
                />
            )}
            renderOption={(props, option: any) => {
                const { key, ...otherProps } = props;
                return (
                    <Box
                        key={key}
                        {...otherProps}
                        component='li'
                        sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                        id={testid + option.lookupValue.replace(/\s/g, '').trim()}
                    >
                        <Suspense fallback={<TmLoadingSpinner testid='weighPageLoading' size={20} />}>
                            <Flag
                                code={option.lookupCode}
                                width={25}
                                style={{ boxShadow: '0px 0px 1px 1px #7f7f7f', width: '1.4rem', height: 'auto' }}
                                fallback={<HelpCenterOutlinedIcon style={{ alignSelf: 'center', marginLeft: 1, marginRight: 2 }} />}
                            />
                        </Suspense>
                        {option.lookupCode + ' - ' + option.lookupValue}
                    </Box>
                );
            }}
            onChange={onChangeCountry}
        />
    );
}

export default memo(TmCountrySelector);
