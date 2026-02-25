import { TextField, TextFieldProps, Tooltip, styled, TooltipProps, tooltipClasses, useTheme } from '@mui/material';
import type { JSX } from 'react';
import { memo, useMemo } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import { useTranslation } from 'react-i18next';
import { getSharedSxStyles } from '../../utils/SharedStyles';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        fontSize: theme.typography.pxToRem(12),
    },
}));

type CustomProps = {
    readonly?: boolean;
};

const StyledTextField = styled(TextField, {
    shouldForwardProp: (prop) => prop !== 'readonly',
})<CustomProps>(({ theme, readonly, value }) => ({
    '& .MuiInputLabel-root': {
        color: readonly && !(typeof value === 'string' && value.trim().length === 0) ? `${theme.palette.text.primary} !important` : undefined,
    },
    '& .MuiInputBase-input': {
        WebkitTextFillColor: readonly ? `${theme.palette.text.primary} !important` : undefined,
    },
    '& .MuiInputBase-root.MuiInput-root.Mui-disabled::before': {
        borderBottom: readonly ? 'none' : undefined,
    },
}));

// alternative: small label, slighter larger input font size
type Props = {
    testid: string;
    helperText?: string;
    startAdornment?: JSX.Element;
    endadornment?: JSX.Element;
    label?: string;
    alternative?: boolean;
    maxLength?: number;
    disabled?: boolean;
    isUpdateOnWeigh?: boolean;
    showTooltipPopup?: boolean;
} & CustomProps & TextFieldProps;

function TmTextField({ isUpdateOnWeigh, showTooltipPopup = false, variant = 'standard', ...props }: Props) {
    const { alternative, startAdornment, endadornment, testid, maxLength, ...otherProps } = props;
    const newProps = { ...otherProps };
    if (!newProps.value || (typeof newProps.value === 'string' && newProps.value.trim().length === 0)) {
        newProps.value = '';
    }
    const theme = useTheme();

    const { t } = useTranslation();

    const tooltipValue = useMemo(() => {
        if (alternative && newProps.value && !newProps.disabled) {
            return <span style={{ fontSize: 'medium' }}>{newProps.value.toString()}</span>
        } else if (newProps.value && isUpdateOnWeigh && showTooltipPopup) {
            return (
                <span style={{ fontSize: 'medium', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px', color: '#FF851A' }}>
                        <ErrorIcon />
                    </span>
                    {t('tooltipForWeighInfo')}
                </span>
            )
        } else {
            return '';
        }
    }, [alternative, newProps.value, newProps.disabled, isUpdateOnWeigh, showTooltipPopup, t]);

    const tooltipSx = useMemo(() => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: showTooltipPopup && isUpdateOnWeigh ? '#fff' : '',
            color: showTooltipPopup && isUpdateOnWeigh ? 'rgba(0, 0, 0, 0.87)' : '',
            maxWidth: showTooltipPopup && isUpdateOnWeigh ? 220 : 'unset',
            border: showTooltipPopup && isUpdateOnWeigh ? '1px solid #000' : ''
        }
    }), [showTooltipPopup, isUpdateOnWeigh]);

    const sxStyles = useMemo(() => getSharedSxStyles({
        alternative,
        error: props.error,
        theme,
        props,
    }), [alternative, props.error, props.sx, theme]);

    return (
        <HtmlTooltip
            sx={tooltipSx}
            title={tooltipValue}
            arrow
            placement='right-start'
            disableInteractive
        >
            <StyledTextField
                {...newProps}
                size='small'
                variant={variant}
                slotProps={{
                    ...otherProps.slotProps,
                    input: {
                        ...otherProps.slotProps?.input,
                        id: testid,
                        autoComplete: 'off',
                        startAdornment: startAdornment,
                        endAdornment: endadornment,
                        style: { textTransform: "uppercase" },
                    },
                    htmlInput: {
                        maxLength: maxLength,
                        form: {
                            autoComplete: 'off'
                        },
                        "data-testid": testid,
                    },
                }}
                sx={sxStyles}
                helperText={props.helperText !== ' ' ? <span id={testid + 'ErrorMessage'}>{props.helperText}</span> : ' '}
            />
        </HtmlTooltip>
    );
}

export default memo(TmTextField);
