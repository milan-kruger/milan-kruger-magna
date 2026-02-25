import {
  Charge,
  VehicleChargeDto,
} from "../../../redux/api/transgressionsApi";
import { t } from "i18next";

export type CaptureCorrectionReasonCharge = {
  chargeId: string | undefined;
  chargeCode: string;
  fineAmount: string;
  chargeDescription: string | undefined;
  percentage: number | undefined;
  actualMass: number | undefined;
  permissibleMass: number | undefined;
};

const useCaptureCorrectionReasonChargeMapper = (
  charges: Charge[],
  vehicleCharges: VehicleChargeDto[]
): readonly [CaptureCorrectionReasonCharge[]] => {
  const captureCorrectionReasonCharges: CaptureCorrectionReasonCharge[] = [];

  for (let i = 0; i < charges.length; i++) {
    // Vehicle charges are always in the same order as charges. Ordered in the backend.
    const vehicleCharge = vehicleCharges[i];

    if (vehicleCharge) {
      const fineAmount =
        charges[i].fineAmount && charges[i].fineAmount?.amount as number > 0
          ? `${charges[i].fineAmount?.currency} ${charges[i].fineAmount?.amount}`
          : t("arrest");
      const captureCorrectionReasonCharge: CaptureCorrectionReasonCharge = {
        chargeId: charges[i].chargeId,
        chargeCode: charges[i].chargeCode,
        fineAmount: fineAmount,
        chargeDescription: charges[i].chargeTitle,
        percentage: vehicleCharge.overloadMassPercentage,
        actualMass: vehicleCharge.actualMass,
        permissibleMass: vehicleCharge.permissible,
      };

      captureCorrectionReasonCharges.push(captureCorrectionReasonCharge);
    }
  }

  return [captureCorrectionReasonCharges] as const;
};

export default useCaptureCorrectionReasonChargeMapper;
