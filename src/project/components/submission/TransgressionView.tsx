import { Box, Stack, SxProps, useMediaQuery, useTheme, Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { memo, useCallback, useContext } from "react";
import TmTypography from "../../../framework/components/typography/TmTypography";
import dayjs from "dayjs";
import { OverloadTransgressionDto, RtqsTransgressionDto, SnapshotLoadCharge, SnapshotRtqsCharge, SnapshotSpeedCharge, TransgressionConfiguration, TransgressionEntry } from "../../redux/api/transgressionsApi";
import TransgressionViewField from "./TransgressionViewField";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import { removeUnderscores } from "../../../framework/utils";
import tinycolor from "tinycolor2";
import { Theme } from "@mui/system";
import { t } from "i18next";
import { JsonObjectType } from "../../enum/JsonObjectType";
import { displayBusinessSection, displayDriverSection, displayField, displayOperatorSection, displayResidentialSection, displayVehicleSection } from "../../utils/TransgressionHelpers";

type ChargeRowProps = {
    charge: SnapshotLoadCharge | SnapshotRtqsCharge | SnapshotSpeedCharge;
    index: number;
    previousTransgression: OverloadTransgressionDto | RtqsTransgressionDto | undefined;
    transgression: OverloadTransgressionDto | RtqsTransgressionDto;
    diffStyle: SxProps<Theme>;
    charges: (SnapshotLoadCharge | SnapshotRtqsCharge | SnapshotSpeedCharge)[];
}

const ChargeRow = ({ charge, index, previousTransgression, transgression, diffStyle, charges }: ChargeRowProps) => {
    const getName = useCallback(() => {
        let name = `${t('charge')} ${index + 1}`;
        if (charge.type === JsonObjectType.SnapshotRtqsCharge) {
            const rtqsCharge = charge as SnapshotRtqsCharge;
            name = rtqsCharge.alternativeCharge ? t('altCharge') : name;
        }

        return name;
    }, [index, charge]);

    const getLinkedTo = useCallback(() => {
        if (charge.type === JsonObjectType.SnapshotRtqsCharge) {
            const rtqsCharge = charge as SnapshotRtqsCharge;

            if (rtqsCharge.alternativeCharge) {
                const linkIndex = charges.findIndex(ch => ch.chargeCode === rtqsCharge.mainChargeCode);
                return `${t('linkedTo')}: ${t('charge')} ${linkIndex + 1}`
            }

            return '';
        }

        return '';
    }, [charge, charges]);

    return (
        <TmTypography testid={`charge${index + 1}`} fontWeight="bold" key={index + 1}>
            <Box
                component="span"
                sx={
                    previousTransgression &&
                        (!previousTransgression?.snapshotCharges?.[index])
                        ? diffStyle
                        : {}
                }
            >
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 7 }}>
                        {getName()}: {charge.chargeCode} {charge.chargeTitle}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }} paddingLeft={4}>
                        {t('amountPayable')} {index + 1}:{" "}
                        <Box
                            component="span"
                            sx={
                                !(previousTransgression &&
                                    (!previousTransgression?.snapshotCharges?.[index])) &&
                                    (previousTransgression &&
                                        (!previousTransgression?.snapshotCharges?.[index] ||
                                            transgression?.snapshotCharges?.[index].fineAmount.amount !==
                                            previousTransgression?.snapshotCharges?.[index].fineAmount.amount))
                                    ? diffStyle
                                    : {}
                            }
                        >
                            {charge.fineAmount?.currency} {charge.fineAmount?.amount}
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        {t('plateNumber')} {charge.plateNumber}
                        {' '}
                        {getLinkedTo()}
                    </Grid>
                </Grid>
            </Box>
        </TmTypography>
    )
}

type Props = {
    transgression: OverloadTransgressionDto | RtqsTransgressionDto,
    transgressionConfig?: TransgressionConfiguration,
    previousTransgression?: OverloadTransgressionDto | RtqsTransgressionDto,
    transgressionVersion?: number,
    hasFieldUpdates?: boolean,
    historyEntry?: TransgressionEntry,
}

const TransgressionView = ({ transgression, previousTransgression, hasFieldUpdates = true, transgressionVersion = 0, historyEntry, transgressionConfig }: Props) => {

    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

    const configContext = useContext(ConfigContext);

    const headingsFontSize = '1.2rem';
    const containerBorderStyle = {
        paddingLeft: '10px',
        paddingTop: '10px',
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: '5px',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : tinycolor(theme.palette.warning.dark).lighten(63).toRgbString()
    }

    type Selector<T = string | undefined> = (transgression: OverloadTransgressionDto | RtqsTransgressionDto) => T;

    //Highlight the TransgressionViewField if the value has changed between the current and previous transgression
    function createFieldProps<T extends string | string[] | undefined>(
        selector: Selector<T>,
        comparator: Selector<T> = selector
    ): { value: string | string[] | undefined; sx: SxProps<Theme> } {
        let includeFieldUpdates = hasFieldUpdates;
        const value = selector(transgression);
        if (selector.toString().includes('o.status')) {
            includeFieldUpdates = true;

        }
        const highlight = includeFieldUpdates &&
            transgressionVersion !== 0 &&
            previousTransgression !== undefined &&
            comparator(transgression) !== comparator(previousTransgression)

        return { value, sx: highlight ? diffStyle : {} };
    }

    const diffStyle: SxProps<Theme> = {
        backgroundColor: tinycolor(theme.palette.success.light).setAlpha(0.2).toRgbString(),
        marginBottom: '2px',
        borderRadius: '4px',
        border: '2px solid ' + theme.palette.success.light,
        padding: '0px 5px',
    };

    return (
        <Box padding={'10px 10px'} overflow={'auto'}>

            {/* Transgression Details Section */}
            <Grid container spacing={10} marginBottom={2}>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TmTypography testid='plateNumberLabel' fontWeight={"bold"}>
                        {t('plateNumber')}
                    </TmTypography>
                    <TmTypography testid='plateNumber'>
                        {transgression.vehicle?.plateNumber}
                    </TmTypography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TmTypography testid='transgressionDateLabel' fontWeight={"bold"}>
                        {t('transgressionDate')}
                    </TmTypography>
                    <TmTypography testid='transgressionDate'>
                        {dayjs(transgression.transgressionDate).format(configContext.dateTime.dateTimeFormat)}
                    </TmTypography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TmTypography testid='transgressionStatusLabel' fontWeight={"bold"}>
                        {t('transgressionStatus')}
                    </TmTypography>
                    <TmTypography
                        testid='transgressionStatus'
                        sx={createFieldProps((o) => o.status).sx}
                    >
                        {t(transgression.status as string)}
                    </TmTypography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TmTypography testid='transgressionOfficerLabel' fontWeight={"bold"}>
                        {t('transgressionOfficer')}
                    </TmTypography>
                    <TmTypography testid='transgressionOfficer'>
                        {`${transgression.officerName} ${transgression.officerSurname}`}
                    </TmTypography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TmTypography testid={'transgressionTeamLabel'} fontWeight={"bold"}
                    >
                        {t('transgressionTeam')}
                    </TmTypography>
                    <TmTypography testid={'transgressionTeam'}>
                        {t('Unknown')}
                    </TmTypography>
                </Grid>
            </Grid>

            {
                (historyEntry && historyEntry.comments) &&
                <>
                    <TmTypography
                        testid='comments'
                        fontWeight='bold'
                        color={theme.palette.primary.main}
                        fontSize={headingsFontSize}>
                        {t('comments')}
                    </TmTypography>
                    <Box sx={diffStyle} paddingBottom={5}>
                        {historyEntry?.comments?.map((comment, index) =>
                            <TmTypography testid={`historyComment${index}`} key={`historyComment${index+1}`}>{t(comment)}</TmTypography>
                        )}
                    </Box>
                </>
            }

            {/* Vehicle Section */}
            {displayVehicleSection(transgressionConfig) && (
                <>
                    <TmTypography
                        testid='vehicleTitle'
                        fontWeight='bold'
                        color={theme.palette.primary.main}
                        fontSize={headingsFontSize}>
                        {t('vehicleTitle')}
                    </TmTypography>
                    <Box sx={containerBorderStyle}>
                        <Grid container spacing={10} marginBottom={2}>
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.vehicleType) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='vehicleMake'
                                        label={t('vehicleMake')}
                                        {...createFieldProps((o) => o.vehicle?.vehicleMake ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.vehicleModel) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='vehicleModel'
                                        label={t('vehicleModel')}
                                        {...createFieldProps((o) => o.vehicle?.vehicleModel ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.colour) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='vehicleColour'
                                        label={t('vehicleColour')}
                                        {...createFieldProps((o) => o.vehicle?.colour ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.origin) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='origin'
                                        label={t('origin')}
                                        {...createFieldProps((o) => o.route?.originOfCargo ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.destination) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='destination'
                                        label={t('destination')}
                                        {...createFieldProps((o) => o.route?.destinationOfCargo ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.cargo) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='cargo'
                                        label={t('cargo')}
                                        {...createFieldProps((o) => o.route?.cargo ?? undefined)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </>
            )}

            {/* Operator Section */}
            {displayOperatorSection(transgressionConfig) && (
                <>
                    <TmTypography
                        testid='operatorTitle'
                        fontWeight='bold'
                        color={theme.palette.primary.main}
                        fontSize={headingsFontSize}>
                        {t('operatorTitle')}
                    </TmTypography>
                    <Box sx={containerBorderStyle}>
                        <Grid container spacing={10} marginBottom={2}>
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.operatorName) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='tripsDepotIdentifier'
                                        label={t('depotNumber')}
                                        {...createFieldProps((o) => o.operator?.depots?.at(0)?.tripsDepotIdentifier ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.depotName) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='depotName'
                                        label={t('depotName')}
                                        {...createFieldProps((o) => o.operator?.depots?.at(0)?.name ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.operatorName) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='operatorName'
                                        label={t('operatorName')}
                                        {...createFieldProps((o) => o.operator?.name ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.operatorDiscNumber) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='operatorDiscNumber'
                                        label={t('operatorDiscNumber')}
                                        {...createFieldProps((o) => o.operator?.operatorDiscNumber ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.emailAddress) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='emailAddress'
                                        label={t('emailAddress')}
                                        {...createFieldProps((o) => o.operator?.depots?.at(0)?.emails?.at(0)?.emailAddress ?? undefined)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </>
            )}

            {/* Driver Section */}
            {displayDriverSection(transgressionConfig) && (
                <>
                    <TmTypography
                        testid='driverTitle'
                        fontWeight='bold'
                        color={theme.palette.primary.main}
                        fontSize={headingsFontSize}>
                        {t('driverTitle')}
                    </TmTypography>
                    <Box sx={containerBorderStyle}>
                        <Grid container spacing={10}>
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.driverName) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='driverName'
                                        label={t('driverName')}
                                        {...createFieldProps((o) => o.driver?.firstNames ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.driverSurname) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='driverSurname'
                                        label={t('driverSurname')}
                                        {...createFieldProps((o) => o.driver?.surname ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.identificationType) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='identificationType'
                                        label={t('identificationType')}
                                        {...createFieldProps(
                                            (o) => removeUnderscores(o.driver?.identification?.idType ?? "" as string),
                                            (o) => o.driver?.identification?.idType ?? undefined)
                                        }
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.identificationNumber) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='identificationNumber'
                                        label={t('identificationNumber')}
                                        {...createFieldProps((o) => o.driver?.identification?.number ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.idCountryOfIssue) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='countryOfIssue'
                                        label={t('countryOfIssue')}
                                        {...createFieldProps((o) => o.driver?.identification?.countryOfIssue ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.dateOfBirth) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='dateOfBirth'
                                        label={t('dateOfBirth')}
                                        {...createFieldProps(
                                            (o) => dayjs(o.driver?.dateOfBirth).format(configContext.dateTime.dateFormat),
                                            (o) => o.driver?.dateOfBirth)
                                        }
                                    />
                                </Grid>
                            )}
                        </Grid>
                        <Grid container spacing={10}>
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.gender) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='gender'
                                        label={t('gender')}
                                        {...createFieldProps((o) => o.driver?.gender ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.occupation) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='occupation'
                                        label={t('driverOccupation')}
                                        {...createFieldProps((o) => o.driver?.occupation ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.contactNumberType) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='contactNumberType'
                                        label={t('contactNumberType')}
                                        {...createFieldProps((o) => o.driver?.contactNumber?.contactNumberType ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.contactNumber) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='dialingCode'
                                        label={t('dialingCode')}
                                        {...createFieldProps((o) => o.driver?.contactNumber?.dialingCode ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.contactNumber) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='contactNumber'
                                        label={t('contactNumber')}
                                        {...createFieldProps((o) => o.driver?.contactNumber?.number ?? undefined)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                        <Grid container spacing={10} marginBottom={2}>
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.licenceCountryOfIssue) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='drivingLicenceCountryOfIssue'
                                        label={t('driverCountryOfIssueLicence')}
                                        {...createFieldProps((o) => o.driver?.countryOfIssue ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.licenceCode) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='drivingLicenceCode'
                                        label={t('driverLicenceCode')}
                                        {...createFieldProps((o) => o.driver?.licenceCode ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.licenceNumber) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='drivingLicenceNo'
                                        label={t('driverLicenceNo')}
                                        {...createFieldProps((o) => o.driver?.licenceNumber ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.prDPCode) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='PrdpCode'
                                        label={t('driverPrdpCode')}
                                        {...createFieldProps((o) => o.driver?.prDPCodes ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.prDPNumber) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='prdpNo'
                                        label={t('driverPrdpNo')}
                                        {...createFieldProps((o) => o.driver?.prDPNumber ?? undefined)}
                                    />
                                </Grid>
                            )}
                            { displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.trn) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='trn'
                                        label={t('trn')}
                                        {...createFieldProps((o) => o.driver?.trn ?? undefined)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </>
            )}

            {/* Residential Address Section */}
            {displayResidentialSection(transgressionConfig) && (
                <>
                    <TmTypography
                        testid='residentialAddressTitle'
                        fontWeight='bold'
                        color={theme.palette.primary.main}
                        fontSize={headingsFontSize}>
                        {t('residentialHeading')}
                    </TmTypography>
                    <Box sx={containerBorderStyle}>
                        <Grid container spacing={10} marginBottom={2}>
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.residentialAddressLine1) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='residentialAddress'
                                        label={t('address')}
                                        {...createFieldProps((o) => o.driver?.residentialAddressLine1 ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.residentialAddressLine2) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='residentialAddressLine2'
                                        label={t('addressLine2')}
                                        {...createFieldProps((o) => o.driver?.residentialAddressLine2 ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.residentialCity) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='residentialCity'
                                        label={t('city')}
                                        {...createFieldProps((o) => o.driver?.residentialCity ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.residentialPostalCode) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='residentialPostalCode'
                                        label={t('addressPostalCode')}
                                        {...createFieldProps((o) => o.driver?.residentialPostalCode ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.residentialCountry) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='residentialCountry'
                                        label={t('country')}
                                        {...createFieldProps((o) => o.driver?.residentialCountry ?? undefined)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </>
            )}

            {/* Business Address Section */}
            {displayBusinessSection(transgressionConfig) && (
                <>
                    <TmTypography
                        testid='businessAddressTitle'
                        fontWeight='bold'
                        color={theme.palette.primary.main}
                        fontSize={headingsFontSize}>
                        {t('businessAddressHeading')}
                    </TmTypography>
                    <Box sx={containerBorderStyle}>
                        <Grid container spacing={10} marginBottom={2}>
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.businessAddressLine1) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='businessAddress'
                                        label={t('address')}
                                        {...createFieldProps((o) => o.operator?.businessAddressLine1 ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.businessAddressLine2) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='businessAddressLine2'
                                        label={t('addressLine2')}
                                        {...createFieldProps((o) => o.operator?.businessAddressLine2 ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.businessCity) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='businessCity'
                                        label={t('city')}
                                        {...createFieldProps((o) => o.operator?.businessCity ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.businessPostalCode) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='businessPostalCode'
                                        label={t('addressPostalCode')}
                                        {...createFieldProps((o) => o.operator?.businessPostalCode ?? undefined)}
                                    />
                                </Grid>
                            )}
                            {displayField(transgressionConfig?.displayOptionalFields ?? false, transgressionConfig?.businessCountry) && (
                                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                                    <TransgressionViewField
                                        testId='businessCountry'
                                        label={t('country')}
                                        {...createFieldProps((o) => o.operator?.businessCountry ?? undefined)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </>
            )}

            {/* Charge Details Section */}
            <TmTypography
                testid='chargeTitle'
                fontWeight='bold'
                color={theme.palette.primary.main}
                fontSize={headingsFontSize}>
                {t('chargesHeading')}
            </TmTypography>
            <Box sx={containerBorderStyle} padding={5}>
                <Stack direction='column' gap={isMobile ? 5 : 1}>
                    {transgression.snapshotCharges?.map((charge, index) => {
                        return (
                            <ChargeRow
                                key={index+charge.chargeCode}
                                charge={charge}
                                index={index}
                                previousTransgression={previousTransgression}
                                transgression={transgression}
                                diffStyle={diffStyle}
                                charges={transgression.snapshotCharges}
                            />
                        )
                    })}
                </Stack>
            </Box>
        </Box>
    );
}

export default memo(TransgressionView);
