import { createContext } from "react";

interface ArrestCaseAdministratorContextInterface {
  incorrectVehicleConfig: boolean,
  checkIncorrectVehicleConfig: (checked: boolean) => void
}

export const ArrestCaseAdministratorContext = createContext({
  incorrectVehicleConfig: false,
  checkIncorrectVehicleConfig: () => {}
} as ArrestCaseAdministratorContextInterface);
