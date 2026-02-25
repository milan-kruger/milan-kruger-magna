import { Box, Stack, useTheme } from "@mui/material";
import { t } from "i18next";
import TmTypography from "../../../framework/components/typography/TmTypography";
import { OverloadTransgressionDto, RtqsTransgressionDto, SnapshotCharge, SnapshotChargeDto, SnapshotLoadChargeDto, SnapshotRtqsCharge, SnapshotRtqsChargeDto, SubmissionDto } from "../../redux/api/transgressionsApi";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useState } from "react";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import AdjudicationOutcome from "./AdjudicationOutcome";
import { AdjudicateSubmissionContext } from "../../pages/adjudication/AdjudicateSubmissionContext";
import TmButton from "../../../framework/components/button/TmButton";
import { TSubmissionOutcomeDto } from "../../pages/adjudication/AdjudicateSubmissionContextProvider";
import { JsonObjectType } from "../../enum/JsonObjectType";

type Props = {
    submission: SubmissionDto | undefined;
    outcomes: TSubmissionOutcomeDto[] | undefined;
    transgression: OverloadTransgressionDto | RtqsTransgressionDto | undefined;
    readonly: boolean;
}

const TmAdjudicationOutcomes = ({ submission, outcomes, transgression, readonly }: Props) => {
    const configContext = useContext(ConfigContext);
    const adjudicationContext = useContext(AdjudicateSubmissionContext);

    const theme = useTheme();
    const [formValid, setFormValid] = useState(false);

    const [formFields, setFormFields] = useState<{
        valid: boolean;
    }[]>();

    useEffect(() => {
        if (submission && outcomes) {
            const fields = outcomes.map(() => {
                return {
                    valid: false
                }
            });
            setFormFields(fields);
        }
    }, [submission, outcomes, transgression]);

    const setFieldValidation = useCallback((index: number, valid: boolean) => {
        if (formFields?.at(index)) {
            formFields[index].valid = valid;
        }
        if (formFields?.every(field => field.valid === true)) {
            setFormValid(true)
        } else {
            setFormValid(false)
        }
    }, [formFields, setFormValid]);

    const getAlternativeCharge = (snapshotCharge: SnapshotCharge) => {
        if (transgression?.type === JsonObjectType.RtqsTransgressionDto) {
            return transgression?.snapshotCharges?.filter(c => (
                (c as SnapshotRtqsCharge).mainChargeCode === snapshotCharge.chargeCode && (c as SnapshotRtqsCharge).alternativeCharge)
            )[0] as SnapshotRtqsCharge;
        }
    }

    return (
        <>
            <Box border={1} borderColor={theme.palette.grey[500]} borderRadius={3} flex={1} height={'100%'}
                paddingX={10} paddingTop={5}>
                <Stack gap={5}>
                    <TmTypography testid="courtDate" fontSize={20} fontWeight={'bold'}>
                        {t('courtDate')}: {dayjs(submission?.courtDate).format(configContext.dateTime.dateFormat)}
                    </TmTypography>
                    <TmTypography testid="captureSubmissionResults" fontSize={18} fontWeight={'bold'}>
                        {t('captureSubmissionResults')}
                    </TmTypography>
                </Stack>
                <Stack marginTop={7}>
                    {outcomes?.map((outcome, index) => <AdjudicationOutcome
                        sx={{ paddingBottom: 0, marginY: 5 }}
                        index={index}
                        outcome={outcome}
                        setValidation={setFieldValidation}
                        updateOutcome={adjudicationContext.updateOutcomes}
                        readonly={readonly}
                        key={index + 1}
                        alternativeCharge={getAlternativeCharge(outcome.snapshotCharge as SnapshotChargeDto | SnapshotLoadChargeDto | SnapshotRtqsChargeDto)}
                    />)}
                </Stack>
            </Box>
            {
                !readonly &&
                <Box display={'flex'} alignItems={'end'} justifyContent={'end'} marginTop={5}>
                    <Stack direction={'row'} gap={5}>
                        <TmButton
                            testid="submitAdjudication"
                            variant="contained"
                            disabled={!formValid}
                            onClick={() => { adjudicationContext.setIsAdjudicating(true) }}
                        >
                            {t('submitAdjudication')}
                        </TmButton>
                        <TmButton
                            testid="cancelAdjudication"
                            variant="contained"
                            onClick={() => { adjudicationContext.setOpenCancelDialog(true) }}
                        >
                            {t('cancel')}
                        </TmButton>
                    </Stack>
                </Box>
            }
        </>
    );
}

export default TmAdjudicationOutcomes;
