import CourtRegisterPage from "./court-register-manager/CourtRegisterPage";
import RegisterOfControlDocumentPage from "./register-of-control-documents-manager/RegisterOfControlDocumentPage";
import { t } from "i18next";
import { ROUTE_NAMES } from "../../Routing";
import CourtResultPage from "../court-results/court-result-manager/CourtResultPage";
import TmResponsiveTabSelect, { TmResponsiveTabSelectItem } from "../../components/tab/ResponsiveTabSelect";
import { useMemo } from "react";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import CancelContemptOfCourtFeePage from "../court-results/court-result-manager/cancel-contempt-of-court-fee-manager/CancelContemptOfCourtFeePage";
import AuthService from "../../../framework/auth/authService";
import CourtSchedulePage from "./court-schedule/CourtSchedulePage";

const COURT_REGISTER_TAB: string = 'courtRegisterTab';
const CONTROL_DOCUMENTS_TAB: string = 'controlDocumentsTab';
const COURT_RESULTS_TAB: string = 'courtResultsTab';
const CANCEL_CONTEMPT_OF_COURT_TAB: string = 'cancelContemptOfCourtTab';
const COURT_SCHEDULE_TAB: string = 'courtScheduleTab';

function CourtDocumentsPage() {
    const tabMenuItems: TmResponsiveTabSelectItem[] = [
        {
            id: COURT_REGISTER_TAB,
            label: t('courtRegister'),
            route: ROUTE_NAMES.courtRegister,
            component: <CourtRegisterPage />
        },
        {
            id: CONTROL_DOCUMENTS_TAB,
            label: t('controlDocuments'),
            route: ROUTE_NAMES.controlDocuments,
            component: <RegisterOfControlDocumentPage />
        },
    ]
    if (AuthService.hasRoles(["COURTRESULT_MAINTAIN", "COURTRESULT_VIEW"])) {
        tabMenuItems.push({
            id: COURT_RESULTS_TAB,
            label: t('courtResults'),
            route: ROUTE_NAMES.courtResults,
            component: <CourtResultPage />
        })
    }

    if (AuthService.hasRoles(['CANCELCONTEMPTOFCOURT_MAINTAIN'])) {
        tabMenuItems.push({
            id: CANCEL_CONTEMPT_OF_COURT_TAB,
            label: t('cancelContemptOfCourtFee'),
            route: ROUTE_NAMES.cancelContemptOfCourtFee,
            component: <CancelContemptOfCourtFeePage />
        })
    }

    if (AuthService.hasRoles(['COURTSCHEDULE_MAINTAIN'])) {
        tabMenuItems.push({
            id: COURT_SCHEDULE_TAB,
            label: t('courtSchedule.tabHeading'),
            route: ROUTE_NAMES.courtSchedule,
            component: <CourtSchedulePage />
        })
    }

    return (
        <SecuredContent
            accessRoles={useMemo(() => ['COURTREGISTER_MAINTAIN', 'COURT_VIEW'], [])}
        >
            <TmResponsiveTabSelect entryPath={ROUTE_NAMES.courtDocuments} items={tabMenuItems}></TmResponsiveTabSelect>
        </SecuredContent>
    )
}

export default CourtDocumentsPage;
