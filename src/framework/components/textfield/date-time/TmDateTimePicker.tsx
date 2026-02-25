import { useTheme } from '@mui/material';
import { DateTimePickerProps, DesktopDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { memo, useContext } from 'react';
import { ConfigContext } from '../../../config/ConfigContext';

type Props = {
    testid: string;
    label: string;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    dateTimeValue: Dayjs | null;
    setDateTimeValue: (date: Dayjs | null) => void;
    alternative?: boolean;
    readonly?: boolean;
} & DateTimePickerProps;

const TmDateTimePicker = ({ testid, label, required, error, helperText, dateTimeValue, setDateTimeValue, readonly, ...props }: Props) => {
    const theme = useTheme();
    const config = useContext(ConfigContext);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDateTimePicker
                {...props}
                sx={{
                    ...props.sx,
                    '& .MuiInputLabel-root': {
                        color: readonly && dateTimeValue !== null ? `${theme.palette.text.primary} !important` : undefined
                    },
                    '& .MuiInputBase-input': {
                        WebkitTextFillColor: readonly ? `${theme.palette.text.primary} !important` : undefined
                    },
                    '& .MuiInputBase-root.MuiInput-root.Mui-disabled::before': {
                        borderBottom: readonly ? 'none' : undefined
                    },
                    '& .MuiButtonBase-root': {
                        display: readonly ? 'none' : 'inherit'
                    },
                    '& .MuiInputBase-root.MuiInput-root' : {
                        height: '1.4375em'
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
                            button: {
                                id: 'your-button-testid', // Change 'your-button-testid' to an appropriate value
                            },
                        },
                        required: required,
                        error: error,
                        helperText: helperText !== ' ' ? <span id={testid+'ErrorMessage'}>{helperText}</span> : ' '
                    },
                    openPickerButton: {
                        id: testid+'OpenPicker'
                    },
                    previousIconButton: {
                        id: testid+'PreviousMonth'
                    },
                    nextIconButton: {
                        id: testid+'NextMonth'
                    },
                    switchViewButton: {
                        id: testid + 'YearPicker'
                    }
                }}
                label={label}
                value={dateTimeValue ? dayjs(dateTimeValue) : null}
                onChange={(newValue: Dayjs | null) => {
                    setDateTimeValue(newValue);
                }}
                format={config.dateTime.dateTimeFormat}
                ampm={config.dateTime.ampmClock}
            />
        </LocalizationProvider>
    );
};

export default memo(TmDateTimePicker);
