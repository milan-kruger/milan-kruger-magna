import {
  FormControlLabel,
  Stack,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import { toCamelCaseWords } from "../../../../framework/utils";
import { t } from "i18next";
import TmCheckbox from "../../../../framework/components/selection/TmCheckbox";
import { Charge, VehicleChargeDto } from "../../../redux/api/transgressionsApi";
import { useContext } from "react";
import { Theme } from "@emotion/react";
import useCaptureCorrectionReasonChargeMapper from "../../../hooks/prosecution/arrest-case-administrator/CaptureCorrectionReasonChargeMapper";
import { NumericFormat } from "react-number-format";
import { ArrestCaseAdministratorContext } from "../../../pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorContext";

type Props = {
  testId: string;
  charges: Charge[];
  vehicleCharges: VehicleChargeDto[];
  sx?: SxProps<Theme> | undefined;
};

const CaptureCorrectionReasonContent = ({
  testId,
  charges,
  vehicleCharges,
  sx,
}: Props) => {
  const theme = useTheme();
  const arrestCaseContext = useContext(ArrestCaseAdministratorContext);

  const [captureCorrectionReasonCharges] =
    useCaptureCorrectionReasonChargeMapper(charges, vehicleCharges);

  const tableHeadings: { id: string; label: string }[] = [
    { id: "chargeCode", label: t("chargeCode") },
    { id: "amountPayable", label: t("amountPayable") },
    { id: "chargeDescription", label: t("chargeDescription") },
    { id: "percentage", label: t("percentage") },
    { id: "actualMass", label: t("actualMass") },
    { id: "permissibleMass", label: t("permissibleMass") },
  ];

  const onCorrectionReason = (event: React.ChangeEvent<HTMLInputElement>) => {
    arrestCaseContext.checkIncorrectVehicleConfig(event.target.checked);
  };

  return (
    <Stack sx={sx}>
      <Stack>
        <TmTypography
          testid={toCamelCaseWords(testId, "label")}
          fontWeight={"bold"}
        >
          {t("correctionReasonLabel")}:
        </TmTypography>
        <FormControlLabel
          label={t("incorrectVehicleConfiguration")}
          checked={arrestCaseContext.incorrectVehicleConfig}
          control={
            <TmCheckbox
              testid="correctionReasonRadioBtn"
              onChange={onCorrectionReason}
            />
          }
        />
      </Stack>
      <Stack marginTop={15}>
        <TableContainer
          sx={{
            border: "solid 2px",
            borderRadius: "5px",
            borderColor: theme.palette.error.main,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {tableHeadings.map((heading) => (
                  <TableCell key={heading.id}>
                    <TmTypography
                      testid={toCamelCaseWords(testId, heading.id)}
                      fontWeight={"bold"}
                    >
                      {heading.label}
                    </TmTypography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {captureCorrectionReasonCharges.map((charge) => (
                <TableRow
                  key={charge.chargeId}
                  sx={{
                    borderTop: "solid 2px",
                    borderColor: theme.palette.error.main,
                  }}
                >
                  <TableCell key="chargeCode">{charge.chargeCode}</TableCell>
                  <TableCell key="fineAmount">{charge.fineAmount}</TableCell>
                  <TableCell key="chargeDescription">
                    {charge.chargeDescription}
                  </TableCell>
                  <TableCell key="percentage">
                    <NumericFormat
                      value={charge.percentage}
                      displayType={"text"}
                      decimalScale={2}
                      suffix="%"
                      />
                  </TableCell>
                  <TableCell key="actualMass">{charge.actualMass}</TableCell>
                  <TableCell key="permissibleMass">
                    {charge.permissibleMass}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
};

export default CaptureCorrectionReasonContent;
