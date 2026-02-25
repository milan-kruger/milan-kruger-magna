import { ReactNode, useMemo, useState } from "react";
import { ArrestCaseAdministratorContext } from "./ArrestCaseAdministratorContext";

type Props = {
    children: Readonly<ReactNode>
}

export default function ArrestCaseAdministratorContextProvider({ children }: Props) {
    const [incorrectVehicleConfig, setIncorrectVehicleConfig] = useState(false);

    const checkIncorrectVehicleConfig = (checked: boolean) => {
        setIncorrectVehicleConfig(checked);
    }

    const contextValue = useMemo(() => ({
        incorrectVehicleConfig,
        checkIncorrectVehicleConfig
    }), [incorrectVehicleConfig]);

    return (
        <ArrestCaseAdministratorContext.Provider value={contextValue}>
            {children}
        </ArrestCaseAdministratorContext.Provider>
    );
}