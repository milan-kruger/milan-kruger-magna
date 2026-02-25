import { useCallback, useRef, useEffect } from 'react';
import { LoadCharge, RtqsCharge, SpeedCharge } from '../../redux/api/transgressionsApi';
import { TmRtqsCharge } from '../../components/prosecution/ChargeListEdit';
import { RtqsChargePlaceholder } from '../chargebook/ChargeProvider';

/**
 * Custom hook to manage charge operations (add, update, delete).
 * Provides immutable update operations for charge arrays.
 * Uses refs to maintain stable callback identity across renders.
 *
 * @param charges - Current array of charges
 * @param setCharges - Function to update the charges array
 * @returns Object containing charge manipulation operations
 */
export const useChargeOperations = (
    charges: TmRtqsCharge[],
    setCharges: (charges: TmRtqsCharge[]) => void
) => {
    // Use refs to store latest values without triggering callback recreation
    const chargesRef = useRef(charges);
    const setChargesRef = useRef(setCharges);

    // Keep refs up to date
    useEffect(() => {
        chargesRef.current = charges;
        setChargesRef.current = setCharges;
    }, [charges, setCharges]);

    /**
     * Updates a specific charge at the given index.
     * Creates a new array and charge object to maintain immutability.
     */
    const updateChargeAtIndex = useCallback((
        index: number,
        updates: Partial<TmRtqsCharge>
    ) => {
        const currentCharges = chargesRef.current;
        const updatedCharges = [...currentCharges];
        updatedCharges[index] = {
            ...updatedCharges[index],
            ...updates
        };
        setChargesRef.current(updatedCharges);
        chargesRef.current = updatedCharges;
    }, []); // Empty deps - stable callback

    /**
     * Updates the plate number for a charge at the given index.
     */
    const updatePlateNumber = useCallback((index: number, plateNumber: string) => {
        const currentCharges = chargesRef.current;
        const currentCharge = currentCharges[index];

        // Only update if plate number actually changed
        if (currentCharge.plateNumber === plateNumber) {
            return; // No change needed
        }

        const updatedCharges = [...currentCharges];
        updatedCharges[index] = {
            ...updatedCharges[index],
            plateNumber
        };
        setChargesRef.current(updatedCharges);
        chargesRef.current = updatedCharges;
    }, []);

    /**
     * Updates alternative charge linking information.
     */
    const updateAlternativeCharge = useCallback((
        index: number,
        mainCharge: LoadCharge | RtqsCharge | SpeedCharge | undefined,
        linkToIndex: number,
        plateNumber?: string,
        isAlternative: boolean = true
    ) => {
        const currentCharges = chargesRef.current;
        const updatedCharges = [...currentCharges];
        updatedCharges[index] = {
            ...updatedCharges[index],
            isAlternative,
            linkedTo: mainCharge?.chargeCode,
            linkedToIndex: linkToIndex,
            ...(plateNumber && { plateNumber })
        };
        setChargesRef.current(updatedCharges);
        chargesRef.current = updatedCharges;
    }, []);

    /**
     * Resets an alternative charge to non-alternative state.
     */
    const resetAlternativeCharge = useCallback((
        index: number,
        isAlternative: boolean
    ) => {
        const currentCharges = chargesRef.current;
        const currentCharge = currentCharges[index];

        // Only update if values actually changed to prevent infinite loops
        if (currentCharge.isAlternative === isAlternative &&
            currentCharge.linkedTo === undefined &&
            currentCharge.linkedToIndex === undefined) {
            return; // No change needed
        }

        const updatedCharges = [...currentCharges];
        updatedCharges[index] = {
            ...updatedCharges[index],
            isAlternative,
            linkedTo: undefined,
            linkedToIndex: undefined
        };
        setChargesRef.current(updatedCharges);
        chargesRef.current = updatedCharges;
    }, []);

    /**
     * Clears a charge at the given index, resetting it to placeholder state.
     * Also clears any alternative charge links that reference the cleared charge.
     */
    const clearCharge = useCallback((
        index: number,
        defaultSupervisorApproval: boolean,
        defaultPrevSupervisorApproval: boolean,
        defaultPlateNumber: string
    ) => {
        const currentCharges = chargesRef.current;
        const updatedCharges = [...currentCharges];
        const lastCharge = updatedCharges[updatedCharges.length - 1];
        const deleteCharge = updatedCharges[index];

        // Clear alternative charge link if it references the charge being deleted
        if (lastCharge && lastCharge?.linkedTo === deleteCharge.chargeCode) {
            updatedCharges[updatedCharges.length - 1] = {
                ...lastCharge,
                linkedTo: undefined,
                linkedToIndex: undefined
            };
            // Note: State update below will propagate changes to all rows automatically
        }

        // Reset charge to placeholder with correct supervisor approval values
        updatedCharges[index] = {
            ...RtqsChargePlaceholder,
            isNew: true,
            isAlternative: false,
            supervisorApproval: defaultSupervisorApproval,
            chargePrevSupervisorApproval: defaultPrevSupervisorApproval,
            plateNumber: defaultPlateNumber,
            updatedInSession: false
        };

        setChargesRef.current(updatedCharges);
        chargesRef.current = updatedCharges;
    }, []);

    /**
     * Updates supervisor approval status for a charge.
     */
    const updateSupervisorApproval = useCallback((
        index: number,
        supervisorApproval: boolean
    ) => {
        const currentCharges = chargesRef.current;
        const currentCharge = currentCharges[index];

        // Only update if supervisor approval actually changed
        if (currentCharge.supervisorApproval === supervisorApproval) {
            return; // No change needed
        }

        const updatedCharges = [...currentCharges];
        updatedCharges[index] = {
            ...updatedCharges[index],
            supervisorApproval
        };
        setChargesRef.current(updatedCharges);
        chargesRef.current = updatedCharges;
    }, []);

    /**
     * Updates previous supervisor approval status for a charge.
     */
    const updatePrevSupervisorApproval = useCallback((
        index: number,
        chargePrevSupervisorApproval: boolean
    ) => {
        const currentCharges = chargesRef.current;
        const currentCharge = currentCharges[index];

        // Only update if prev supervisor approval actually changed
        if (currentCharge.chargePrevSupervisorApproval === chargePrevSupervisorApproval) {
            return; // No change needed
        }

        const updatedCharges = [...currentCharges];
        updatedCharges[index] = {
            ...updatedCharges[index],
            chargePrevSupervisorApproval
        };
        setChargesRef.current(updatedCharges);
        chargesRef.current = updatedCharges;
    }, []);

    /**
     * Saves current form plate number to charge object before opening search dialog.
     * This prevents losing user input during charge selection.
     */
    const savePlateNumberBeforeSearch = useCallback((
        index: number,
        plateNumber: string | undefined
    ) => {
        if (plateNumber !== undefined) {
            const currentCharges = chargesRef.current;
            const currentCharge = currentCharges[index];

            // Only update if plate number actually changed
            if (currentCharge.plateNumber === plateNumber) {
                return; // No change needed
            }

            const updatedCharges = [...currentCharges];
            updatedCharges[index] = {
                ...updatedCharges[index],
                plateNumber
            };
            setChargesRef.current(updatedCharges);
            chargesRef.current = updatedCharges;
        }
    }, []);

    return {
        updateChargeAtIndex,
        updatePlateNumber,
        updateAlternativeCharge,
        resetAlternativeCharge,
        clearCharge,
        updateSupervisorApproval,
        updatePrevSupervisorApproval,
        savePlateNumberBeforeSearch
    };
};
