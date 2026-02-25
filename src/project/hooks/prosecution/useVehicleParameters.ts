import { useState } from 'react';

/**
 * Custom hook to manage vehicle parameter state for charge types.
 * These parameters are used by special charge types (LoadCharge, SpeedCharge, etc.)
 * that require additional vehicle-specific information.
 *
 * @returns Object containing all vehicle parameter states and their setters
 */
export const useVehicleParameters = () => {
    const [vehicleHeight, setVehicleHeight] = useState<number | undefined>();
    const [allowedHeight, setAllowedHeight] = useState<number | undefined>();
    const [numberOfLamps, setNumberOfLamps] = useState<number | undefined>();
    const [roadTravelledOn, setRoadTravelledOn] = useState<string | undefined>();
    const [numberOfTyres, setNumberOfTyres] = useState<number | undefined>();
    const [vehicleLength, setVehicleLength] = useState<number | undefined>();
    const [numberOfPersons, setNumberOfPersons] = useState<number | undefined>();
    const [numberOfPanels, setNumberOfPanels] = useState<number | undefined>();

    /**
     * Reset all vehicle parameters to undefined.
     * Typically called when opening a charge search dialog.
     */
    const resetAll = () => {
        setVehicleHeight(undefined);
        setAllowedHeight(undefined);
        setNumberOfLamps(undefined);
        setRoadTravelledOn(undefined);
        setNumberOfTyres(undefined);
        setVehicleLength(undefined);
        setNumberOfPersons(undefined);
        setNumberOfPanels(undefined);
    };

    return {
        vehicleHeight,
        setVehicleHeight,
        allowedHeight,
        setAllowedHeight,
        numberOfLamps,
        setNumberOfLamps,
        roadTravelledOn,
        setRoadTravelledOn,
        numberOfTyres,
        setNumberOfTyres,
        vehicleLength,
        setVehicleLength,
        numberOfPersons,
        setNumberOfPersons,
        numberOfPanels,
        setNumberOfPanels,
        resetAll
    };
};
