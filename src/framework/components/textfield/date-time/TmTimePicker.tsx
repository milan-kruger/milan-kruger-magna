import { useTheme } from '@mui/material';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import React, { memo, useContext } from 'react';
import { ConfigContext } from '../../../config/ConfigContext';

type Props = {
    testid: string;
    label: string;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    timeValue: Dayjs | null;
    setTimeValue: React.Dispatch<React.SetStateAction<Dayjs | null>>;
    readonly?: boolean;
} & TimePickerProps;

const TmTimePicker = ({ testid, label, required, error, helperText, timeValue, setTimeValue, readonly, ...props }: Props) => {
    const theme = useTheme();
    const config = useContext(ConfigContext);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                {...props}
                sx={{
                    ...props.sx,
                    '& .MuiInputLabel-root': {
                        color: readonly && timeValue !== null ? `${theme.palette.text.primary} !important` : undefined
                    },
                    '& .MuiInputBase-input': {
                        WebkitTextFillColor: readonly ? `${theme.palette.text.primary} !important` : undefined
                    },
                    '& .MuiInputBase-root.MuiInput-root.Mui-disabled::before': {
                        borderBottom: readonly ? 'none' : undefined
                    },
                    '& .MuiInputBase-root.MuiInput-root' : {
                        height: '1.4375em'
                    },
                    '& .MuiButtonBase-root': {
                        display: readonly ? 'none' : 'inherit'
                    }
                }}
                slotProps={{
                    ...props.slotProps,
                    textField: {
                        size: 'small',
                        fullWidth: true,
                        variant: 'standard',
                        inputProps: {
                            id: testid,
                        },
                        required: required,
                        error: error,
                        helperText: helperText !== ' ' ? <span id={testid+'ErrorMessage'}>{helperText}</span> : ' ',
                    },
                    openPickerButton: {
                        id: testid+'OpenPicker'
                    }
                }}
                label={label}
                value={timeValue ? dayjs(timeValue) : null}
                onChange={(newValue) => {
                    setTimeValue(newValue);
                }}
                format={config.dateTime.timeFormat}
                ampm={config.dateTime.ampmClock}
            />
        </LocalizationProvider>
    );
};

export default memo(TmTimePicker);
