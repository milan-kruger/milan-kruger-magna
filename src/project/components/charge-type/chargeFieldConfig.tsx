import { ReactNode } from 'react';
import { InputAdornment, Stack, SxProps, Theme } from '@mui/material';
import TmTextField from '../../../framework/components/textfield/TmTextField';
import TmNumberField from '../../../framework/components/textfield/TmNumberField';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { ChargeType } from '../../enum/ChargeType';

/**
 * Field configuration type for charge type dialog fields
 */
export type FieldConfig = {
    type: 'text' | 'number';
    label: string;
    testid: string;
    value: number | string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (value: any) => void;
    required: boolean;
    error: boolean | ((values: ChargeFieldValues) => boolean);
    helperText?: string | ((values: ChargeFieldValues) => string);
    width?: string;
    unit?: string;
    inputMode?: 'numeric' | 'decimal' | 'text';
    pattern?: string;
    labelStyle?: SxProps<Theme>;
    inputStyle?: SxProps<Theme>;
    /** Special validation for height combination */
    crossFieldError?: (values: ChargeFieldValues) => boolean;
};

/**
 * All values needed for field validation and rendering
 */
export type ChargeFieldValues = {
    vehicleHeight?: number;
    allowedHeight?: number;
    numberOfLamps?: number;
    roadTravelledOn?: string;
    numberOfTyres?: number;
    vehicleLength?: number;
    numberOfPersons?: number;
    numberOfPanels?: number;
};

/**
 * Props for rendering a single field
 */
export type RenderFieldProps = {
    config: FieldConfig;
    values: ChargeFieldValues;
    defaultLabelStyle: SxProps<Theme>;
    defaultInputPadding: SxProps<Theme>;
    t: (key: string) => string;
};

/**
 * Configuration for field groups (like HEIGHT which has multiple fields)
 */
export type FieldGroupConfig = {
    fields: FieldConfig[];
    /** Whether this group shows a calculated result */
    showCalculation?: boolean;
    calculationLabel?: string;
    calculate?: (values: ChargeFieldValues) => number | null;
};

/**
 * Mapping of charge types to their field configurations
 */
export type ChargeFieldConfigMap = {
    [key in ChargeType]?: FieldGroupConfig;
};

/**
 * Create the field configuration map
 */
export const createChargeFieldConfig = (
    handlers: {
        onChangeVehicleHeight: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onChangeAllowedHeight: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onChangeRoadTravelledOn: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onChangeLamps: (value: number) => void;
        onChangeTyres: (value: number) => void;
        onChangeNumberOfPersons: (value: number) => void;
        onChangeNumberOfPanels: (value: number) => void;
        onChangeVehicleLength: (e: React.ChangeEvent<HTMLInputElement>) => void;
    },
    values: ChargeFieldValues,
    styleHeightFields: SxProps<Theme>,
    t: (key: string) => string
): ChargeFieldConfigMap => ({
    [ChargeType.HEIGHT]: {
        fields: [
            {
                type: 'text',
                label: t('vehicleHeightLabel'),
                testid: 'vehicleHeight',
                value: values.vehicleHeight,
                onChange: handlers.onChangeVehicleHeight,
                required: true,
                error: !values.vehicleHeight || values.vehicleHeight <= 0,
                width: '50%',
                unit: 'mm',
                inputMode: 'numeric',
                labelStyle: styleHeightFields,
                inputStyle: {
                    height: '100%',
                    '& .MuiInputBase-input.MuiOutlinedInput-input': {
                        padding: '0px 20px 0px 0px !important'
                    }
                }
            },
            {
                type: 'text',
                label: t('allowedHeightLabel'),
                testid: 'allowedHeight',
                value: values.allowedHeight,
                onChange: handlers.onChangeAllowedHeight,
                required: true,
                error: (vals: ChargeFieldValues) =>
                    !vals.allowedHeight ||
                    vals.allowedHeight <= 0 ||
                    (vals.vehicleHeight !== undefined && vals.allowedHeight >= vals.vehicleHeight),
                helperText: (vals: ChargeFieldValues) =>
                    vals.vehicleHeight !== undefined &&
                    vals.allowedHeight !== undefined &&
                    vals.allowedHeight !== 0 &&
                    vals.vehicleHeight !== 0 &&
                    vals.allowedHeight >= vals.vehicleHeight
                        ? t('allowedHeightValidationMessage')
                        : '',
                width: '50%',
                unit: 'mm',
                inputMode: 'numeric',
                labelStyle: styleHeightFields,
                inputStyle: {
                    height: '100%',
                    '& .MuiInputBase-input.MuiOutlinedInput-input': {
                        padding: '0px 20px 0px 0px !important'
                    }
                }
            }
        ],
        showCalculation: true,
        calculationLabel: t('overHeightLabel'),
        calculate: (vals: ChargeFieldValues) => {
            if (
                vals.vehicleHeight !== undefined &&
                vals.allowedHeight !== undefined &&
                vals.vehicleHeight !== 0 &&
                vals.allowedHeight !== 0
            ) {
                return vals.vehicleHeight - vals.allowedHeight;
            }
            return null;
        }
    },
    [ChargeType.LAMP]: {
        fields: [
            {
                type: 'number',
                label: t('numberOfLamps'),
                testid: 'numberOfLamps',
                value: values.numberOfLamps,
                onChange: handlers.onChangeLamps,
                required: true,
                error: !values.numberOfLamps || values.numberOfLamps <= 0,
                width: '20%',
                inputStyle: {
                    '& .MuiInputBase-input.MuiOutlinedInput-input': {
                        padding: '8px !important'
                    }
                }
            }
        ]
    },
    [ChargeType.ROAD]: {
        fields: [
            {
                type: 'text',
                label: t('roadTravelledOn'),
                testid: 'roadTravelledOn',
                value: values.roadTravelledOn,
                onChange: handlers.onChangeRoadTravelledOn,
                required: true,
                error: !values.roadTravelledOn || values.roadTravelledOn === '',
                width: '120px',
                inputMode: 'numeric',
                pattern: '[0-9]*'
            }
        ]
    },
    [ChargeType.TYRE]: {
        fields: [
            {
                type: 'number',
                label: t('numberOfTyres'),
                testid: 'numberOfTyres',
                value: values.numberOfTyres,
                onChange: handlers.onChangeTyres,
                required: true,
                error: !values.numberOfTyres || values.numberOfTyres <= 0,
                width: '20%',
                inputStyle: {
                    height: '100%',
                    '& .MuiInputBase-input.MuiOutlinedInput-input': {
                        padding: '8px !important'
                    }
                }
            }
        ]
    },
    [ChargeType.LENGTH]: {
        fields: [
            {
                type: 'text',
                label: t('lengthOfVehicle'),
                testid: 'lengthOfVehicle',
                value: values.vehicleLength,
                onChange: handlers.onChangeVehicleLength,
                required: true,
                error: !values.vehicleLength || values.vehicleLength <= 0,
                width: '50%',
                unit: 'm',
                inputMode: 'decimal',
                pattern: '^\\d*(\\.\\d{0,1})?$',
                inputStyle: {
                    height: '100%',
                    '& .MuiInputBase-input.MuiOutlinedInput-input': {
                        padding: '0px 20px 0px 0px !important'
                    }
                }
            }
        ]
    },
    [ChargeType.PERSON]: {
        fields: [
            {
                type: 'number',
                label: t('numberOfPersons'),
                testid: 'numberOfPersons',
                value: values.numberOfPersons,
                onChange: handlers.onChangeNumberOfPersons,
                required: true,
                error: !values.numberOfPersons || values.numberOfPersons <= 0,
                width: '20%',
                inputStyle: {
                    '& .MuiInputBase-input.MuiOutlinedInput-input': {
                        padding: '8px !important'
                    }
                }
            }
        ]
    },
    [ChargeType.PANEL]: {
        fields: [
            {
                type: 'number',
                label: t('numberOfPanels'),
                testid: 'numberOfPanels',
                value: values.numberOfPanels,
                onChange: handlers.onChangeNumberOfPanels,
                required: true,
                error: !values.numberOfPanels || values.numberOfPanels <= 0,
                width: '20%',
                inputStyle: {
                    '& .MuiInputBase-input.MuiOutlinedInput-input': {
                        padding: '8px !important'
                    }
                }
            }
        ]
    }
});

/**
 * Render a single field based on its configuration
 */
export const renderField = ({ config, values, defaultLabelStyle }: RenderFieldProps): ReactNode => {
    const error = typeof config.error === 'function' ? config.error(values) : config.error;
    const helperText = typeof config.helperText === 'function' ? config.helperText(values) : config.helperText;

    // Helper to capitalize first letter for testid
    const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <Stack direction="row" alignItems="center" key={config.testid}>
            <TmTypography
                sx={config.labelStyle || defaultLabelStyle}
                testid={config.testid ? `chargeDetails${capitalizeFirst(config.testid)}` : ''}
            >
                {config.label} {config.required && <span>*</span>}
            </TmTypography>
            {config.type === 'number' ? (
                <TmNumberField
                    testid={config.testid}
                    value={config.value as number}
                    label=""
                    required={config.required}
                    error={error}
                    sx={{
                        width: config.width,
                        ...config.inputStyle
                    }}
                    onChange={config.onChange}
                    disabled={false}
                />
            ) : (
                <TmTextField
                    testid={config.testid}
                    value={config.value}
                    onChange={config.onChange}
                    disabled={false}
                    required={config.required}
                    error={error}
                    helperText={helperText}
                    sx={{
                        width: config.width,
                        ...config.inputStyle
                    }}
                    slotProps={
                        config.inputMode || config.pattern
                            ? {
                                  input: {
                                      inputMode: config.inputMode,
                                      inputProps: config.pattern
                                          ? {
                                                pattern: config.pattern
                                            }
                                          : undefined
                                  }
                              }
                            : undefined
                    }
                    endadornment={
                        config.unit ? (
                            <InputAdornment position="end" style={{ textTransform: 'lowercase' }}>
                                {config.unit}
                            </InputAdornment>
                        ) : undefined
                    }
                />
            )}
        </Stack>
    );
};
