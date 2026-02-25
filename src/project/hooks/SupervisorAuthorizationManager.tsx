import { useCallback, useContext } from "react";
import { AuthoriseSupervisorOverrideRequest, AuthoriseSupervisorOverrideResponse, useAuthoriseSupervisorOverrideMutation } from "../redux/api/transgressionsApi";
import { ConfigContext } from "../../framework/config/ConfigContext";

export type AuthorizationRole = "ROLE_CANCELTRANSGRESSION_OVERRIDE" | "ROLE_UPDATETRANSGRESSION_OVERRIDE"
    | "ROLE_CORRECTARRESTCASE_OVERRIDE" | "ROLE_CANCELCONTEMPTOFCOURT_OVERRIDE" | "ROLE_DELETESIGNEDWARRANTOFARREST_OVERRIDE";

const useSupervisorAuthorizationManager = () => {
    const [authorize, { isLoading, isError, reset }] = useAuthoriseSupervisorOverrideMutation();
    const config = useContext(ConfigContext);

    const onSupervisorAuthorization = useCallback((supervisorUsername: string, supervisorPassword: string, role: AuthorizationRole, reason: string): Promise<boolean> => {
        return new Promise((resolve) => {
            reset();
            const request: AuthoriseSupervisorOverrideRequest = {
                username: supervisorUsername,
                password: btoa(supervisorPassword),
                role: role,
                authorityCode: config.tenancy.tenant,
                reason: reason
            }

            authorize({ authoriseSupervisorOverrideRequest: request }).then((response) => {
                if ((response as { data: AuthoriseSupervisorOverrideResponse }).data !== undefined) {
                    const approval = (response as { data: AuthoriseSupervisorOverrideResponse }).data;
                    resolve(approval.approved);
                }
            });

        });
    }, [authorize, config, reset]);

    return { onSupervisorAuthorization, isLoading, isError, reset };
};

export default useSupervisorAuthorizationManager;
