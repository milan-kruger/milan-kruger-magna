import { memo } from "react";
import { SnapshotCharge, SnapshotRtqsCharge, VehicleChargeDto } from "../../redux/api/transgressionsApi";
import { Box, Grid, Stack, SxProps, Theme, useMediaQuery } from "@mui/material";
import TmTypography from "../../../framework/components/typography/TmTypography";
import { toCamelCaseWords } from "../../../framework/utils";
import { NumericFormat } from "react-number-format";
import { t } from "i18next";
import { JsonObjectType } from "../../enum/JsonObjectType";

type Props = {
  testid: string;
  charges: SnapshotCharge[];
  vehicleCharges: VehicleChargeDto[];
  sx?: SxProps<Theme>;
};

function TmChargeList({ testid, charges, sx, vehicleCharges }: Readonly<Props>) {
  const isLaptop = useMediaQuery<Theme>((theme) => theme.breakpoints.up('md'));

  const chargesDetailsCss = {
    opacity: "60%",
    fontSize: isLaptop ? '0.95rem' : '0.85rem',
    display: "inline"
  }

  const getPlateNumber = (index: number, charge: SnapshotCharge) => {
    if (!vehicleCharges || vehicleCharges.length === 0) {
      return charge.plateNumber;
    }

    // Vehicle charges are always in the same order as charges. Due to using ArrayList in the backend.
    return vehicleCharges[index]?.plateNumber ?? "";
  };

  const getChargeNo = (charge: SnapshotCharge, index: number) => {
    if (charge.type === JsonObjectType.SnapshotRtqsCharge &&
      (charge as SnapshotRtqsCharge).alternativeCharge) {
      return t("altCharge")
    }
    return `${t('charge')} ${index + 1}`;
  }

  const ChargeDetails = ({ charge, index }: { charge: SnapshotCharge; index: number }) => (
    <Box>
      <TmTypography
        fontWeight="bold"
        sx={chargesDetailsCss}
        testid={toCamelCaseWords("transgressions", "chargeName", index.toString())}
      >
        {getChargeNo(charge, index)}:
      </TmTypography>
      <TmTypography
        fontWeight="bold"
        sx={chargesDetailsCss}
        testid={toCamelCaseWords("transgressions", "chargeDescription", index.toString())}
      >
        {` ${charge.chargeCode} ${charge.chargeTitle}`}
      </TmTypography>
    </Box>
  );

  const ChargeAmount = ({ charge, index }: { charge: SnapshotCharge; index: number }) => (
    <Box marginLeft={2}>
      <TmTypography
        fontWeight="bold"
        display={"inline"}
        marginLeft={4}
        sx={chargesDetailsCss}
        testid={toCamelCaseWords("transgressions", "chargeCurrency", index.toString())}
      >
        {t('amountPayable')} {index + 1}:
      </TmTypography>
      <TmTypography
        fontWeight="bold"
        display={"inline"}
        marginLeft={2}
        sx={chargesDetailsCss}
        testid={toCamelCaseWords("transgressions", "chargeAmount", index.toString())}
      >
        {charge.fineAmount?.currency}
        <NumericFormat
          style={{
            border: "none",
            fontWeight: "bold",
            fontSize: "inherit",
            marginLeft: 5,
            display: "inline",
          }}
          thousandSeparator=" "
          allowNegative={false}
          decimalScale={0}
          fixedDecimalScale
          disabled
          readOnly
          value={charge.fineAmount?.amount}
          displayType="text"
        />
      </TmTypography>
      {" "}
      <TmTypography
        fontWeight="bold"
        display="inline"
        marginLeft={4}
        sx={chargesDetailsCss}
        testid={toCamelCaseWords("transgressions", "plateNumber", index.toString())}
      >
        {getPlateNumber(index, charge)}
      </TmTypography>
    </Box>
  );

  const ChargeItem = ({ charge, index }: { charge: SnapshotCharge; index: number }) => (
    <Grid container>
      <Grid size={{ xs: 12, md: 7, lg: 8, xl: 6 }}>
        <ChargeDetails charge={charge} index={index} />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4, xl: 6 }}>
        <ChargeAmount charge={charge} index={index} />
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Stack id={testid} sx={sx} spacing={5} data-testid={testid}>
        {charges.map((charge, index) => (
          <ChargeItem key={charge.chargeId} charge={charge} index={index} />
        ))}
      </Stack>
    </Box>
  );
}

export default memo(TmChargeList);
