import { useMemo } from "react";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import TmResponsiveTabSelect, { TmResponsiveTabSelectItem } from "../../components/tab/ResponsiveTabSelect";
import { ROUTE_NAMES } from "../../Routing";
import { t } from "i18next";
import OverloadTransgressionList from "./OverloadTransgressionListPage";
import RTQSTransgressionList from "./RTQSTransgressionListPage";
import AuthService from "../../../framework/auth/authService";
import { Role } from "../../auth/roles.ts";

const OVERLOAD_LIST_TAB: string = 'overloadListTab';
const RTQS_LIST_TAB: string = 'rtqsListTab';


function TransgressionListPage() {
    const tabMenuItems: TmResponsiveTabSelectItem[] = [];

    if (AuthService.hasRoles(["TRANSGRESSION_MAINTAIN", "TRANSGRESSIONDETAILS_VIEW"])) {
        tabMenuItems.push({
            id: OVERLOAD_LIST_TAB,
            label: t('overloadTransgression'),
            route: ROUTE_NAMES.overloadTransgression,
            component: <OverloadTransgressionList />
        })
    }

    if (AuthService.hasRoles(["RTQSTRANSGRESSION_MAINTAIN", "RTQSTRANSGRESSION_VIEW"]) && AuthService.isFeatureEnabled('RTQS_TRANSGRESSIONS')) {
        tabMenuItems.push({
            id: RTQS_LIST_TAB,
            label: t('rtqsTransgression'),
            route: ROUTE_NAMES.rtqsTransgression,
            component: <RTQSTransgressionList />
        }
        )
    }
    return (
        <SecuredContent
            accessRoles={useMemo(() =>
                    (['TRANSGRESSIONDETAILS_VIEW', 'TRANSGRESSION_MAINTAIN'] as Role[])
                        .concat(AuthService.isFeatureEnabled('RTQS_TRANSGRESSIONS') ?
                            ['RTQSTRANSGRESSION_MAINTAIN', 'RTQSTRANSGRESSION_VIEW'] as Role[] :
                            []
                        )
                , [])}
        >
            <TmResponsiveTabSelect entryPath={ROUTE_NAMES.transgressions} items={tabMenuItems}></TmResponsiveTabSelect>
        </SecuredContent>
    )
}

export default TransgressionListPage;
