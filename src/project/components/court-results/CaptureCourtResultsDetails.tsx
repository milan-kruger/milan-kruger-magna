import { Stack, Theme, useMediaQuery } from "@mui/material";
import { Grid } from "@mui/material";
import { t } from "i18next";
import { CourtResult } from "../../redux/api/transgressionsApi";
import TmTypography from "../../../framework/components/typography/TmTypography";
import toCamelCase, { toCamelCaseWords } from "../../../framework/utils";

type Props = {
    transgressionDetails?: {
        noticeNumber: string,
        offenderName: string,
        plateNumber: string,
        identificationNumber: string
    };
    sx: object;
    courtResult?: CourtResult;
}

const CaptureCourtResultsDetails = ({ transgressionDetails, sx, courtResult }: Readonly<Props>) => {
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

    return (
        <Grid container sx={sx} spacing={2}>
            {[
                {
                    label: t('noticeNo'),
                    value: courtResult?.noticeNumber ? courtResult.noticeNumber : transgressionDetails?.noticeNumber,
                    testidLabel: t('noticeNoLabel'),
                    testidValue: 'noticeNo',
                    size: { xs: 12, md: 4, lg: 3 }
                },
                {
                    label: t('offenderName'),
                    value: courtResult?.offenderName ? courtResult.offenderName : transgressionDetails?.offenderName,
                    testidLabel: t('offenderNameLabel'),
                    testidValue: 'offenderName',
                    size: { xs: 12, md: 2, lg: 3 }
                },
                {
                    label: t('plateNo'),
                    value: courtResult?.plateNumber ? courtResult.plateNumber : transgressionDetails?.plateNumber,
                    testidLabel: t('plateNoLabel'),
                    testidValue: 'plateNo',
                    size: { xs: 12, md: 2 }
                },
                {
                    label: t('identificationNo'),
                    value: transgressionDetails?.identificationNumber,
                    testidLabel: t('identificationNoLabel'),
                    testidValue: 'identificationNo',
                    size: { xs: 12, md: 3 }
                },
            ].map(({ label, value, testidLabel, testidValue, size }, index) => (
                <Grid key={index} size={size}>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={isMobile ? 0 : 2}>
                        <TmTypography
                            testid={toCamelCaseWords('editHeading', toCamelCase(testidLabel))}
                            fontWeight="bold"
                        >
                            {label}
                        </TmTypography>
                        <TmTypography testid={toCamelCaseWords('editHeading', toCamelCase(testidValue))}>
                            {value}
                        </TmTypography>
                    </Stack>
                </Grid>
            ))}
        </Grid>
    )
}

export default CaptureCourtResultsDetails;
