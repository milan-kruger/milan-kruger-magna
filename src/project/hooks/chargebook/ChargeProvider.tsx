import { useCallback, useEffect, useState } from "react";
import { LoadCharge, LoadChargeDto, Money, RtqsCharge, RtqsChargeDto, SnapshotLoadChargeDto, SnapshotRtqsChargeDto, SnapshotSpeedChargeDto, SpeedCharge, useProvideSnapshotChargeMutation } from "../../redux/api/transgressionsApi";
import { JsonObjectType } from "../../enum/JsonObjectType";

export const RtqsChargePlaceholder: RtqsCharge = {
    type: "RtqsCharge",
    chargeId: "",
    chargeCode: "",
    fineAmount: {
        amount: 0,
        currency: "ZAR"
    },
    chargebook: {
        chargebookId: "",
        active: false,
        defaultChargebook: true,
        startDate: "",
        chargebookType: "RTQS",
        legislation: {
            legislationId: "",
            legislationType: "CPA",
            country: "",
            maximumAllowableCharges: 0,
            active: true
        }
    },
    chargeShortDescription: "",
};

const useChargeProvider = () => {
    const [provideSnapshotChargeMutation, { isLoading: isLoadingProvideSnapshotCharge }] = useProvideSnapshotChargeMutation();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(isLoadingProvideSnapshotCharge);
    }, [isLoadingProvideSnapshotCharge])

    const provideSnapshotCharge = useCallback((arrestCaseFineAmount: Money, allowArrestCase: boolean,
        alternativeChargeSelected: boolean, plateNumber: string, mainCharge: LoadCharge | RtqsCharge | SpeedCharge | undefined,
        allowedHeight?: number, vehicleHeight?: number, numberOfLamps?: number, alternativeCharge?: LoadCharge | RtqsCharge | SpeedCharge | undefined,
        roadTravelledOn?: string, numberOfTyres?: number, vehicleLength?: number, numberOfPersons?: number, numberOfPanels?: number,
        steeringVehiclePlateNumber?: string
    ): Promise<SnapshotLoadChargeDto | SnapshotRtqsChargeDto | SnapshotSpeedChargeDto> => {
        let castAlternativeCharge: LoadChargeDto | RtqsChargeDto;
        let castMainCharge: LoadChargeDto | RtqsChargeDto;
        if (alternativeCharge && alternativeCharge.type === JsonObjectType.LoadCharge) {
            castAlternativeCharge = { ...alternativeCharge, type: JsonObjectType.LoadChargeDto } as LoadChargeDto;
        } else if (alternativeCharge && alternativeCharge.type === JsonObjectType.RtqsCharge) {
            castAlternativeCharge = { ...alternativeCharge, type: JsonObjectType.RtqsChargeDto } as RtqsChargeDto;
        }

        if (mainCharge && mainCharge.type === JsonObjectType.LoadCharge) {
            castMainCharge = { ...mainCharge, type: JsonObjectType.LoadChargeDto } as LoadChargeDto;
        } else if (mainCharge && mainCharge.type === JsonObjectType.RtqsCharge) {
            castMainCharge = { ...mainCharge, type: JsonObjectType.RtqsChargeDto } as RtqsChargeDto;
        }

        return new Promise((resolve, reject) => {
            provideSnapshotChargeMutation({
                provideSnapshotChargeRequest: {
                    allowArrestCase,
                    alternativeChargeSelected,
                    arrestCaseFineAmount,
                    plateNumber,
                    mainCharge: castMainCharge,
                    alternativeCharge: castAlternativeCharge,
                    allowedHeight: allowedHeight,
                    vehicleHeight: vehicleHeight,
                    numberOfLamps: numberOfLamps,
                    roadTravelledOn: roadTravelledOn,
                    numberOfTyres: numberOfTyres,
                    lengthOfVehicle: parseFloat(String(vehicleLength)),
                    numberOfPersons: numberOfPersons,
                    numberOfPanels: numberOfPanels,
                    steeringVehiclePlateNumber
                }
            }).unwrap().then((response) => {
                const cloned = JSON.parse(JSON.stringify(response.snapshotCharge));
                if (cloned?.alternativeCharge === null) {
                    cloned.alternativeCharge = false;
                }
                resolve(cloned);
            }).catch((error) => {
                reject(error);
            })
        })
    }, [provideSnapshotChargeMutation]);

    return {
        provideSnapshotCharge,
        isLoading
    }
}

export default useChargeProvider;
