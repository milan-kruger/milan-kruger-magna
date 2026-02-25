/* eslint-disable @typescript-eslint/no-explicit-any */
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, InputAdornment, Stack, TextField, styled } from '@mui/material';
import React, { memo, useRef } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

export const StyledNumberInput = styled(TextField)(() => ({
    '& .MuiInputBase-root': {
        padding: 0
    }
}));

export const TmAddButton = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.grey[500],
    padding: '0px 5px',
    width: 'fit-content',
    minWidth: '0px',
    height: '1.8em',
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
    '& .MuiSvgIcon-root': {
        color: theme.palette.grey[700]
    },
    '& .MuiSvgIcon-root:hover': {
        color: theme.palette.primary.main
    }
}));

export const TmMinusButton = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.grey[500],
    padding: '0px 5px',
    width: 'fit-content',
    minWidth: '0px',
    height: '1.8em',
    borderTopLeftRadius: '0px !important',
    borderTopRightRadius: '0px !important',
    '& .MuiSvgIcon-root': {
        color: theme.palette.grey[700]
    },
    '& .MuiSvgIcon-root:hover': {
        color: theme.palette.primary.main
    }
}));

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
                thousandSeparator
                valueIsNumericString
                allowNegative={false}
            />
        );
    }
);

type Props = {
    showEndAdornment?: boolean,
    showStartAdornment?: boolean,
    minimumValue?: number,
    startAdornment?:string,
    step?: number;
    maxLength?: number;
    testid: string;
    label: string;
    placeholder?: string;
    value?: number;
    required?: boolean;
    variant?: 'outlined' | 'standard' | 'filled';
    error?: boolean;
    sx?: object;
    helperText?: string;
    disabled?: boolean;
    onChange: (value: number) => void;
}

function TmNumberField({
    showEndAdornment = true,
    showStartAdornment = false,
    startAdornment,
    minimumValue,
    step,
    maxLength,
    testid,
    label,
    placeholder,
    value,
    required,
    variant,
    error,
    sx,
    helperText,
    disabled,
    onChange
}: Readonly<Props>) {

    const numberValue = value ?? 0;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Number(event.target.value));
    };

    const textInput = useRef<HTMLInputElement>(null);

    const handleIncrement = () => {
        if (textInput.current) {
            textInput.current.focus();
        }
        const incrementedValue = numberValue + 1;
        onChange(incrementedValue);
    };

    const handleDecrement = () => {
        if (textInput.current) {
            textInput.current.focus();
        }
        if (numberValue > 0) {
            const decrementedValue = numberValue - 1;
            onChange(decrementedValue);
        }
    };

    return (
        <StyledNumberInput
            size='small'
            required={required}
            variant={variant}
            label={label}
            placeholder={placeholder}
            value={numberValue}
            onChange={handleInputChange}
            onFocus={(event) => event.target.select()}
            error={error}
            sx={sx}
            helperText={helperText !== ' ' ? <span id={testid + 'ErrorMessage'}>{helperText}</span> : ' '}
            disabled={disabled}
            inputRef={textInput}
            slotProps={{
                htmlInput: {
                    id: testid,
                    maxLength: maxLength,
                    step: step,
                    min: minimumValue
                },
                input: {
                    inputComponent: NumericFormatCustom as any,
                    startAdornment: showStartAdornment && (
                        <InputAdornment position='start' sx={{mb:2}}>
                            {startAdornment}
                        </InputAdornment>
                    ),
                    endAdornment: showEndAdornment && (
                        <InputAdornment position='end' sx={{ mr: 2 }}>
                            <Stack>
                                <TmAddButton
                                    sx={{
                                        right: -2,
                                        height: 18
                                    }}
                                    id={`${testid}IncrementButton`}
                                    variant='outlined'
                                    onClick={handleIncrement}
                                >
                                    <AddIcon fontSize='small' />
                                </TmAddButton>
                                <TmMinusButton
                                    sx={{
                                        right: -2,
                                        height: 18
                                    }}
                                    id={`${testid}DecrementButton`}
                                    variant='outlined'
                                    onClick={handleDecrement}
                                >
                                    <RemoveIcon fontSize='small' />
                                </TmMinusButton>
                            </Stack>
                        </InputAdornment>
                    )
                }

            }}
        />
    );
}

export default memo(TmNumberField);
