import { Box, Stack, SxProps, Theme, useTheme } from "@mui/material";
import { SnapshotRtqsCharge, SubmissionOutcomeDto } from "../../redux/api/transgressionsApi";
import TmTypography from "../../../framework/components/typography/TmTypography";
import { removeUnderscores, titleCaseWord, toCamelCaseWords } from "../../../framework/utils";
import { t } from "i18next";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import { ReactNode, useCallback, useEffect } from "react";
import TmNumberField from "../../../framework/components/textfield/TmNumberField";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { TSubmissionOutcomeDto } from "../../pages/adjudication/AdjudicateSubmissionContextProvider";
import { Grid } from "@mui/material";

const idPrefix = 'submissionOutcome';

type Props = {
    index: number;
    outcome: TSubmissionOutcomeDto;
    readonly: boolean;
    sx?: SxProps<Theme>;
    alternativeCharge?: SnapshotRtqsCharge;
    setValidation?: (index: number, valid: boolean) => void;
    updateOutcome?: (outcome: SubmissionOutcomeDto, result: "WITHDRAWN" | "DECLINED" | "ALTERNATIVE_CHARGE" | "DISCOUNTED" | undefined, discountAmount: number) => void;
}

const AdjudicationOutcome = ({ index, outcome, readonly, sx, alternativeCharge, setValidation, updateOutcome }: Props) => {
    const theme = useTheme();
    const outcomeOptions = ["WITHDRAWN", "DECLINED", "DISCOUNTED"];
    if (alternativeCharge) {
        outcomeOptions.push("ALTERNATIVE_CHARGE");
    }

    const {
        control,
        formState,
        setError,
        watch,
        setValue
    } = useForm<{
        captureResult: "WITHDRAWN" | "DECLINED" | "ALTERNATIVE_CHARGE" | "DISCOUNTED",
        discountAmount: number
    }>({
        mode: 'onChange',
        defaultValues: {
            captureResult: readonly ? outcome.submissionResult ?? undefined : undefined,
            discountAmount: readonly ? outcome.discountAmount?.amount ?? 0 : 0
        }
    })

    const watchChanges = watch();
    const outcomeResult = watchChanges.captureResult;
    const discountAmount = watchChanges.discountAmount;


    useEffect(() => {
        setError('captureResult', { type: 'required', })
        setError('discountAmount', { type: 'required', })
    }, [setError]);

    useEffect(() => {
        if (formState) {
            setValidation?.(index, formState.isValid);
        }
    }, [watchChanges, formState, setValidation, index, outcomeResult, watch, outcome]);

    /* eslint-disable react-hooks/exhaustive-deps*/
    useEffect(() => {
        if (updateOutcome && !readonly) {
            updateOutcome(outcome as SubmissionOutcomeDto, outcomeResult, discountAmount);
        }
    }, [outcomeResult, discountAmount, readonly]);
    /* eslint-enable */

    const newFineAmount = useCallback((): number => {
        if (outcome?.snapshotCharge?.fineAmount) {
            if (watch('discountAmount')) {
                return outcome.snapshotCharge.fineAmount.amount - watch('discountAmount');
            }
            return outcome.snapshotCharge.fineAmount.amount;
        }
        return 0;
    }, [watch, outcome]);

    return (
        <Box id={toCamelCaseWords(idPrefix, index.toString())} sx={{ ...sx }} border={1} borderColor={theme.palette.grey[500]} borderRadius={3} padding={'15px'}>
            <Grid container direction={'row'} gap={6} alignItems={'start'} marginBottom={5}>
                <Grid size={{ xs: 12, md: 1.2 }}>
                    <TmTypography testid="chargeNumber" sx={{ minWidth: 'fit-content' }} fontSize={'0.875rem'}>
                        {t('charge')} {index + 1}
                    </TmTypography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TmTypography
                        testid="chargeDescription"
                        fontWeight={'bold'}
                        fontSize='0.875rem'
                        color={watchChanges.captureResult === "ALTERNATIVE_CHARGE" ? theme.palette.grey[500] : 'inherit'}
                        sx={{
                            textDecoration: watchChanges.captureResult === "ALTERNATIVE_CHARGE" ? 'line-through' : 'initial',
                        }}
                    >
                        {outcome.snapshotCharge?.chargeCode} {outcome.snapshotCharge?.chargeShortDescription}
                    </TmTypography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TmTypography
                        testid="fineAmount"
                        fontWeight={'bold'}
                        fontSize={'0.875rem'}
                        display={'inline'}
                        minWidth={'fit-content'}
                        color={watchChanges.captureResult === "ALTERNATIVE_CHARGE" ? theme.palette.grey[500] : 'inherit'}
                        sx={{
                            textDecoration: watchChanges.captureResult === "ALTERNATIVE_CHARGE" ? 'line-through' : 'initial',
                        }}>
                        {t('amountPayable')} {index + 1}: {outcome.snapshotCharge?.fineAmount?.currency} {outcome.snapshotCharge?.fineAmount?.amount}
                    </TmTypography>
                </Grid>
            </Grid>

            <Grid container direction={'row'} justifyContent={'space-between'}>
                <Grid size={{ xs: 12, sm: 4, md: 4 }} marginBottom={5}>
                    <Controller
                        name="captureResult"
                        control={control}
                        rules={{ required: t("fieldRequired", { field: t("captureResult") }) }}
                        render={({ field: { onBlur, value }, fieldState: { error } }) => (
                            <TmAutocomplete
                                testid={'captureResult' + index}
                                id={'captureResult' + index}
                                label={t('captureResult')}
                                options={outcomeOptions}
                                renderInput={(): ReactNode => { return <></>; }}
                                alternative={false} showtooltippopup={false}
                                sx={{
                                    flex: 1,
                                    fontWeight: 'bold',
                                    maxWidth: 250
                                }}
                                required={true}
                                onChange={(_event, val) => {
                                    setValue('captureResult', val, { shouldValidate: true, shouldDirty: true });
                                }}
                                onBlur={onBlur}
                                value={value ?? null}
                                error={!!error}
                                helperText={error?.message}
                                readOnly={readonly}
                                getOptionLabel={(option: "WITHDRAWN" | "DECLINED" | "ALTERNATIVE_CHARGE" | "DISCOUNTED") => {
                                    return t(removeUnderscores(option)).split(' ')
                                        .map((word) => titleCaseWord(word))
                                        .join(' ');
                                }}
                            ></TmAutocomplete>
                        )}
                    />
                </Grid>

                { watchChanges.captureResult === "ALTERNATIVE_CHARGE" &&
                    <Grid container direction={'row'} gap={6} alignItems={'start'} marginBottom={5}>
                        <Grid size={{ xs: 12, md: 1.2 }}>
                            <TmTypography testid="altCharge" minWidth='fit-content' fontSize={'0.875rem'}>
                                {t('altCharge')}
                            </TmTypography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TmTypography testid="altChargeDescription" fontWeight={'bold'} fontSize={'0.875rem'}>
                                {alternativeCharge?.chargeCode} {alternativeCharge?.chargeShortDescription}
                            </TmTypography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>

                            <TmTypography
                                    testid="altChargeAmount"
                                    fontWeight={'bold'}
                                    display={'inline'}
                                    minWidth={'fit-content'}
                                    fontSize={'0.875rem'}>
                                    {t('amountPayable')} {index + 1}: { alternativeCharge?.fineAmount?.currency} {alternativeCharge?.fineAmount?.amount}
                                </TmTypography>
                        </Grid>
                    </Grid>
                }

                {watchChanges.captureResult === "DISCOUNTED" && <Grid size={{ xs: 12, sm: 7, md: 7 }} direction={'column'} gap={2}>
                        <Controller
                            name="discountAmount"
                            control={control}
                            rules={{
                                required: { value: true, message: t("fieldRequired", { field: t("discountAmount") }) },
                                min: { value: 1, message: t("fieldInvalid", { field: t("discountAmount") }) },
                                max: { value: outcome.snapshotCharge?.fineAmount?.amount ?? Number.MAX_VALUE, message: t("fieldInvalid", { field: t("discountAmount") }) }
                            }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Stack >
                                    <Grid container direction={'row'} alignItems={'center'}>
                                        <Grid size={{ xs: 6, md: 5 }}>
                                            <TmTypography testid="discount" fontWeight={'bold'}>
                                                {t('discountAmount')}* =
                                            </TmTypography>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 6 }}>
                                            <TmNumberField
                                                testid={'discountAmount' + index}
                                                value={value}
                                                label={t("discountAmount")}
                                                error={!!error}
                                                onChange={(val) => {
                                                    onChange(val);
                                                }}
                                                disabled={readonly}
                                            ></TmNumberField>
                                        </Grid>
                                    </Grid>
                                    <TmTypography
                                        testid="discountAmountError"
                                        fontSize={13}
                                        color={theme.palette.error.main}
                                        textAlign={'end'}
                                    >
                                        {error?.message}
                                    </TmTypography>
                                </Stack>
                            )}
                        />
                        {
                            (!readonly && !formState.errors?.discountAmount) &&
                            <Stack id="newFine" direction={'row'} gap={2}>
                                <TmTypography testid="newFineCurrency">
                                    {t('newFineAmount')} = {outcome.snapshotCharge?.fineAmount?.currency}
                                </TmTypography>
                                <NumericFormat
                                    id={'newFineAmount' + index}
                                    value={newFineAmount()}
                                    displayType={"text"}
                                    decimalScale={2}
                                ></NumericFormat>
                            </Stack>
                        }
                    </Grid>
                }
            </Grid>
        </Box>
    )
}

export default AdjudicationOutcome;
