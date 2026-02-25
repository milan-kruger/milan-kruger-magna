import { useMemo } from "react";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import TmResponsiveTabSelect, { TmResponsiveTabSelectItem } from "../../components/tab/ResponsiveTabSelect";
import { t } from "i18next";
import WarrantOfArrestRegisterPage from "./WarrantOfArrestRegisterPage";
import { ROUTE_NAMES } from "../../Routing";
import WarrantOfArrestPage from "./WarrantOfArrestPage";

const WarrantOfArrestTabPage = () => {
    const tabMenuItems: TmResponsiveTabSelectItem[] = [
        {
            id: "warrantsOfArrestRegister",
            label: t('warrantOfArrestRegister'),
            route: ROUTE_NAMES.warrantsOfArrestRegister,
            component: <WarrantOfArrestRegisterPage />
        },
        {
            id: "warrantsOfArrest",
            label: t('warrantOfArrest'),
            route: ROUTE_NAMES.warrantsOfArrest,
            component: <WarrantOfArrestPage />
        }
    ]
    return (
        <SecuredContent
            accessRoles={useMemo(() => ['WARRANTOFARRESTREGISTER_MAINTAIN', 'WARRANTOFARRESTREGISTER_VIEW', 'WARRANTOFARREST_VIEW', 'WARRANTOFARREST_MAINTAIN'], [])}>
            <TmResponsiveTabSelect entryPath={ROUTE_NAMES.warrantOfArrestTab} items={tabMenuItems}></TmResponsiveTabSelect>
        </SecuredContent>
    );
}

export default WarrantOfArrestTabPage;
