import { useMemo } from "react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import TmResponsiveTabSelect, { TmResponsiveTabSelectItem } from "../../../components/tab/ResponsiveTabSelect";
import { ROUTE_NAMES } from "../../../Routing";
import { t } from "i18next";
import { Role } from "../../../auth/roles";
import AuthService from "../../../../framework/auth/authService";
import NoticeNumbersListPage from "./NoticeNumbersListPage";

const REQUEST_NOTICE_NUMBER: string = 'requestNoticeNumberTab';

function NoticeManagementPage() {
    const tabMenuItems: TmResponsiveTabSelectItem[] = [];

    if (AuthService.hasRoles(["AARTONOTICENUMBER_MAINTAIN"]) && AuthService.isFeatureEnabled('AARTO_MANAGEMENT')) {
        tabMenuItems.push({
            id: REQUEST_NOTICE_NUMBER,
            label: t('noticeManagement.requestNoticeNumbers.tabHeading'),
            route: ROUTE_NAMES.requestNoticeNumbers,
            component: <NoticeNumbersListPage />
        })
    }

    return (
        <SecuredContent
            accessRoles={useMemo(() =>
                /** NOTE: add roles for notice management!! **/
                ([] as Role[])
                    /**Only allow this role when AARTO is enable */
                    .concat(AuthService.isFeatureEnabled('AARTO_MANAGEMENT') ?
                        ['AARTONOTICENUMBER_MAINTAIN'] as Role[] :
                        []
                    )
                , [])}
        >
            <TmResponsiveTabSelect entryPath={ROUTE_NAMES.noticeManagement} items={tabMenuItems}></TmResponsiveTabSelect>
        </SecuredContent>
    );

}

export default NoticeManagementPage;
