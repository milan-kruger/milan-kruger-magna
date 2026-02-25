import { useCallback, useEffect, useState } from "react";
import { LoadCharge, Money, RtqsCharge, SpeedCharge } from "../../redux/api/transgressionsApi";
import TmChargeSearch from "./ChargeSearch";
import { useVehicleParameters } from '../../hooks/prosecution/useVehicleParameters';
import { useChargeOperations } from '../../hooks/prosecution/useChargeOperations';
import { ChargeRow } from './ChargeRow';

/**
 * Simplified RTQS charge representation for UI.
 * Stores raw charge data that will be compiled into snapshots by the backend.
 *
 */
export type TmRtqsCharge = {
    isNew: boolean;
    /** The raw charge from chargebook */
    actualCharge?: LoadCharge | RtqsCharge | SpeedCharge;
    isAlternative: boolean;
    chargeId: string;
    chargeCode: string;
    chargeTitle?: string;
    fineAmount: Money;
    plateNumber?: string;
    linkedTo?: string;
    linkedToIndex?: number;
    supervisorApproval: boolean;
    chargePrevSupervisorApproval: boolean;
    /** Tracks if charge was updated in the current edit session (not just loaded from backend) */
    updatedInSession?: boolean;

    // Vehicle-specific attributes (sparse - only populated when needed)
    allowedHeight?: number;
    vehicleHeight?: number;
    numberOfLamps?: number;
    roadTravelledOn?: string;
    numberOfTyres?: number;
    vehicleLength?: number;
    numberOfPersons?: number;
    numberOfPanels?: number;
};

type Props = {
    captureCharges: TmRtqsCharge[];
    updateCharges: (value: TmRtqsCharge[]) => void;
    charges: (RtqsCharge | LoadCharge | SpeedCharge)[];
    onValidate: (isValid: boolean) => void;
    disableEdit: boolean;
    supervisorAuthRequired: boolean;
    newTransgression: boolean;
    allowArrestCase: boolean;
    arrestCaseFineAmount?: Money;
    steeringVehiclePlateNumber: string;
};

/**
 * TmChargeListEdit Component
 *
 * Manages a list of up to 3 charges for an RTQS transgression:
 * - Charge 1 (required)
 * - Charge 2 (optional)
 * - Charge 3 (optional, can be marked as alternative to charge 1 or 2)
 *
 */
const TmChargeListEdit = ({ captureCharges, updateCharges, charges, onValidate, disableEdit,
    supervisorAuthRequired, newTransgression, allowArrestCase, arrestCaseFineAmount, steeringVehiclePlateNumber }: Props) => {

    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [firstChargeValid, setfirstChargeValid] = useState(false);
    const [secondChargeValid, setsecondChargeValid] = useState(false);
    const validationArray = Array(captureCharges.length).fill({ required: false, isValid: false, isDirty: false });

    // Vehicle attribute state - used by ChargeSearch dialog for special charge types
    const vehicleParams = useVehicleParameters();

    // Charge operations - immutable updates for charge array (use parent updateCharges directly)
    const chargeOps = useChargeOperations(captureCharges, updateCharges);

    const validateField = useCallback((index: number, required: boolean, isValid: boolean, isDirty: boolean) => {
        validationArray[index] = { required: required, isValid: isValid, isDirty: isDirty };
    }, [validationArray]);

    const checkFirstCharge = useCallback((captureCharges: TmRtqsCharge[]) => {
        const firstCharge = captureCharges.at(0);
        const firstChargeHasValue = !firstCharge?.isNew && firstCharge?.chargeCode !== '';
        const isFirstChargeValid = validationArray[0]?.required === true && validationArray[0]?.isValid === true;
        const result = firstChargeHasValue && isFirstChargeValid;
        setfirstChargeValid(result);
    }, [validationArray]);

    const checkSecondCharge = useCallback((captureCharges: TmRtqsCharge[]) => {
        const firstCharge = captureCharges.at(1);
        const firstChargeHasValue = !firstCharge?.isNew && firstCharge?.chargeCode !== '';
        const isFirstChargeValid = validationArray[1]?.required === true && validationArray[1]?.isValid === true;
        setsecondChargeValid(firstChargeHasValue && isFirstChargeValid);
    }, [validationArray]);

    const triggerValidation = useCallback(() => {
        const firstFieldValid = validationArray[0]?.required === true && validationArray[0]?.isValid === true;
        const requiredFields = validationArray.filter((field) => field.required);
        const requiredFieldsValid = requiredFields.every((field) => field.isValid === true);
        onValidate(firstFieldValid && requiredFieldsValid);
    }, [validationArray, onValidate]);

    useEffect(() => {
        triggerValidation();
        checkFirstCharge(captureCharges);
        checkSecondCharge(captureCharges);
    }, [triggerValidation, checkFirstCharge, checkSecondCharge, captureCharges]);


    return (
        <>
            {
                captureCharges.map((charge: TmRtqsCharge, index: number) =>
                (
                    <ChargeRow
                        charge={charge}
                        index={index}
                        setSelectedIndex={setSelectedIndex}
                        setOpen={setOpen}
                        firstChargeValid={firstChargeValid}
                        secondChargeSet={!captureCharges[1].isNew}
                        secondChargeValid={secondChargeValid}
                        updateCharges={captureCharges}
                        key={`charge-${index+1}`}
                        validateField={validateField}
                        triggerValidation={triggerValidation}
                        supervisorAuthRequired={supervisorAuthRequired}
                        disableEdit={disableEdit}
                        newTransgression={newTransgression}
                        allowArrestCase={allowArrestCase}
                        arrestCaseFineAmount={arrestCaseFineAmount}
                        onTransferCanEdit={(data) => {
                            chargeOps.updatePrevSupervisorApproval(index, data);
                        }}
                        transferredPrevSupervisorApproval={captureCharges[index].chargePrevSupervisorApproval}
                        resetVehicleParameters={vehicleParams.resetAll}
                        steeringVehiclePlateNumber={steeringVehiclePlateNumber}
                        chargeOps={chargeOps}
                    />
                ))
            }

            <TmChargeSearch testId="chargeSearch" open={open} setOpen={setOpen}
                itemIndex={selectedIndex}
                updateCharges={captureCharges}
                setUpdateCharges={updateCharges}
                charges={charges}
                supervisorApprovalCopy={disableEdit ? false : captureCharges[selectedIndex]?.chargePrevSupervisorApproval}
                allowedHeight={vehicleParams.allowedHeight}
                vehicleHeight={vehicleParams.vehicleHeight}
                numberOfLamps={vehicleParams.numberOfLamps}
                roadTravelledOn={vehicleParams.roadTravelledOn}
                numberOfTyres={vehicleParams.numberOfTyres}
                vehicleLength={vehicleParams.vehicleLength}
                numberOfPersons={vehicleParams.numberOfPersons}
                numberOfPanels={vehicleParams.numberOfPanels}
                setVehicleHeight={vehicleParams.setVehicleHeight}
                setAllowedHeight={vehicleParams.setAllowedHeight}
                setNumberOfLamps={vehicleParams.setNumberOfLamps}
                setRoadTravelledOn={vehicleParams.setRoadTravelledOn}
                setNumberOfTyres={vehicleParams.setNumberOfTyres}
                setVehicleLength={vehicleParams.setVehicleLength}
                setNumberOfPersons={vehicleParams.setNumberOfPersons}
                setNumberOfPanels={vehicleParams.setNumberOfPanels}
            />
        </>

    )
}

export default TmChargeListEdit;
