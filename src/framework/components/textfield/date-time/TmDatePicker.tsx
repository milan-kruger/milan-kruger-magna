import { LocalizationProvider, DesktopDatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { memo, useContext } from 'react';
import { ConfigContext } from '../../../config/ConfigContext';
import { useTheme } from '@mui/material';
import { getSharedSxStyles } from '../../../utils/SharedStyles';

type Props = {
    testid: string;
    label: string;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    dateValue: Dayjs | null;
    setDateValue: (date: Dayjs | null) => void;
    alternative?: boolean;
    readonly?: boolean;
} & DatePickerProps;

const TmDatePicker = ({ testid, label, required, error, helperText, dateValue, setDateValue, alternative, readonly, ...props }: Props) => {
    const theme = useTheme();
    const config = useContext(ConfigContext);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <span id={testid} data-testId={testid}>
                <DesktopDatePicker
                    {...props}
                    sx={{
                        ...getSharedSxStyles({
                            alternative,
                            readonly,
                            dateValue,
                            error: error,
                            theme,
                            props,
                        }),
                        ...(props.disabled && !readonly && {
                            '& .MuiPickersSectionList-root span': {
                                WebkitTextFillColor: theme.palette.text.disabled,
                            },
                        }),
                    }}
                    slotProps={{
                        ...props.slotProps,
                        textField: {
                            size: 'small',
                            fullWidth: true,
                            variant: 'standard',
                            id: testid + 'Input',
                            inputProps: {
                                id: testid,
                                'data-testid': testid

                            },
                            required: required,
                            error: error,
                            helperText: helperText !== ' ' ? <span id={testid + 'ErrorMessage'}>{helperText}</span> : ' '
                        },
                        openPickerButton: {
                            id: testid + 'OpenPicker'
                        },
                        previousIconButton: {
                            id: testid + 'PreviousMonth'
                        },
                        nextIconButton: {
                            id: testid + 'NextMonth'
                        },
                        switchViewButton: {
                            id: testid + 'YearPicker'
                        }
                    }}
                    label={label}
                    value={dateValue ? dayjs(dateValue) : null}
                    onChange={(newValue) => {
                        setDateValue(newValue);
                    }}
                    format={config.dateTime.dateFormat}
                />
            </span>
        </LocalizationProvider>
    );
};

export default memo(TmDatePicker);
