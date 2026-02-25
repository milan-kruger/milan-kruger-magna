import { Grid, Stack, SxProps, Theme } from '@mui/material';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { FieldGroupConfig, ChargeFieldValues, renderField } from './chargeFieldConfig';

type ChargeFieldGroupProps = {
    config: FieldGroupConfig;
    values: ChargeFieldValues;
    defaultLabelStyle: SxProps<Theme>;
    defaultInputPadding: SxProps<Theme>;
    styleHeightFields: SxProps<Theme>;
    t: (key: string) => string;
};

/**
 * ChargeFieldGroup Component
 *
 * Renders a group of fields for a charge type based on configuration.
 * Handles both simple fields and complex field groups (like HEIGHT with calculations).
 */
export const ChargeFieldGroup = ({
    config,
    values,
    defaultLabelStyle,
    defaultInputPadding,
    styleHeightFields,
    t
}: ChargeFieldGroupProps) => {
    return (
        <Grid container gap={1} alignItems="end">
            {config.fields.map((fieldConfig) => (
                <Grid
                    key={fieldConfig.testid}
                    size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                    paddingBottom={2}
                >
                    {renderField({
                        config: fieldConfig,
                        values,
                        defaultLabelStyle,
                        defaultInputPadding,
                        t
                    })}
                </Grid>
            ))}

            {/* Show calculation result if configured (e.g., over-height) */}
            {config.showCalculation && config.calculate && config.calculationLabel && (
                <Grid
                    size={{ xs: 12, sm: 12, md: 10, lg: 10 }}
                    paddingBottom={2}
                    sx={{ width: '100%', borderTop: '2px solid #ccc', paddingTop: '10px' }}
                >
                    <Stack direction="row" alignItems="center">
                        <TmTypography
                            sx={styleHeightFields}
                            testid="chargeDetailsOverHeight"
                        >
                            {config.calculationLabel}
                        </TmTypography>
                        <Stack direction="row" sx={{ position: 'relative', width: '66%' }}>
                            <TmTypography
                                sx={{ width: 120, paddingLeft: '1.5rem' }}
                                testid="chargeDetailsOverHeightValue"
                            >
                                {config.calculate(values)}
                            </TmTypography>
                            <TmTypography
                                testid="lengthUnit"
                                sx={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: 'text.secondary'
                                }}
                            >
                                mm
                            </TmTypography>
                        </Stack>
                    </Stack>
                </Grid>
            )}
        </Grid>
    );
};
