import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteObject } from 'react-router-dom';
import ErrorPage from '../framework/error/ErrorPage';
import CourtDocumentsPage from './pages/court-documents/CourtDocumentsPage';
import CaptureCourtResultPage from './pages/court-results/court-result-manager/CaptureCourtResultPage';
import CourtCaseListPage from './pages/court-results/court-result-manager/CourtCaseListPage';
import CourtResultHistoryPage from './pages/court-results/court-result-manager/CourtResultHistoryPage';
import PrintDocumentsPage from './pages/printing/PrintDocumentsPage';
import PrintTransgressionPage from "./pages/printing/PrintTransgressionPage";
import ArrestCaseAdministratorPage from './pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorPage';
import CaptureTransgressionPage from './pages/prosecution/overload-transgression-manager/CaptureTransgressionPage';
import TransgressionDetailPage from './pages/prosecution/overload-transgression-manager/TransgressionDetailPage';
import ProsecuteTransgressionPage from './pages/prosecution/prosecute-transgression/ProsecuteTransgressionPage';
import CaptureRtqsTransgression from './pages/prosecution/rtqs-transgression-manager/CaptureRtqsTransgression';
import SubmissionAdjudicationPage from './pages/submissions/SubmissionAdjudicationPage';
import TransgressionListPage from './pages/transgression-details/TransgressionListPage';
import WarrantOfArrestListPage from './pages/warrantofarrest/WarrantOfArrestListPage';
import WarrantOfArrestRegisterListPage from './pages/warrantofarrest/WarrantOfArrestRegisterListPage';
import WarrantOfArrestTabPage from './pages/warrantofarrest/WarrantOfArrestTabPage';
import ManualPaymentsPage from './pages/payments/ManualPaymentsPage';
import RtqsTransgressionDetailsPage from './pages/prosecution/rtqs-transgression-manager/RtqsTransgressionDetails';
import NoticeManagementPage from './pages/aarto/notice-management/NoticeManagementPage';
import BarcodeScanner from './pages/mobile-transgressions/BarcodeScanner.tsx';

export const ROUTE_NAMES = {
  captureTransgressionsRoute: "prosecuteTransgression/captureTransgression",
  prosecuteTransgressionRoute: "prosecuteTransgression/ccv?/:sequenceNumber?",
  print: "print",
  printAll: "print/all",
  transgressions: "transgressions",
  overloadTransgression: "transgressions/overload-transgression",
  rtqsTransgression: "transgressions/rtqs-transgression",
  transgressionDetailsRoute: "transgression-details",
  captureCorrectionReason: "prosecuteTransgression/capture-correction-reason",
  submissionAdjudication: "submission-adjudication",
  adjudicateFindCourt: "submission-adjudication/find-court",
  adjudicateSubmission: "submission-adjudication/adjudicate-submission/:noticeNumber",
  submissionSummary: "submission-adjudication/submission-summary",
  printDocuments: "documents/print",
  courtDocuments: "court-documents",
  courtRegister: "court-documents/court-register",
  controlDocuments: "court-documents/control-documents",
  courtResults: "court-documents/court-results",
  courtCaseList: "court-documents/court-results/court-case-list",
  courtResultHistory: "court-documents/court-results/court-result-history",
  captureCourtResults: "court-documents/court-results/court-case-list/capture-court-results",
  warrantOfArrestTab: "warrant-of-arrest-tab",
  warrantsOfArrestRegister: "warrant-of-arrest-tab/warrants-of-arrest-register",
  warrantOfArrestRegisterList: "warrant-of-arrest-tab/warrants-of-arrest-register/warrant-of-arrest-register-list",
  warrantOfArrestList: "warrant-of-arrest-tab/warrants-of-arrest/warrant-of-arrest-list",
  warrantsOfArrest: "warrant-of-arrest-tab/warrants-of-arrest",
  cancelContemptOfCourtFee: "court-documents/cancel-contempt-of-court-fee",
  rtqsTransgressionCreate: "transgressions/rtqs-transgression/create",
  rtqsTransgressionDetails: "transgressions/rtqs-transgression/details",
  manualPayments: "manual-payments",
  noticeManagement: "notice-management",
  noticeNumbersList: "notice-management/notice-numbers-list",
  requestNoticeNumbers: "notice-management/request-notice-numbers",
  courtSchedule: "court-documents/court-schedule",
  mobileTransgressions: "mobile-transgressions"
};

export default function useProjectRoutes(): RouteObject[] {
  const { t } = useTranslation();

  const loaderCaptureTransgression = useCallback(() => t("captureTransgression"), [t]);
  const loaderProsecuteTransgression = useCallback(() => t("prosecuteTransgression"), [t]);
  const printTransgressionLoader = useCallback(() => t("printTransgression"), [t]);
  const transgressionDetailsLoader = useCallback(() => t("transgressionDetails"), [t]);
  const captureCorrectionReasonLoader = useCallback(() => t("captureCorrectionReason"), [t]);
  const submissionAdjudicationLoader = useCallback(() => t("submissionAdjudication"), [t]);
  const adjudicateSubmissionLoader = useCallback(() => t("submissionAdjudication"), [t]);
  const submissionSummaryLoader = useCallback(() => t("submissionAdjudication"), [t]);
  const adjudicateFindCourtLoader = useCallback(() => t("submissionAdjudication"), [t]);
  const courtDocumentsLoader = useCallback(() => t("courtDocuments"), [t]);
  const printDocumentsLoader = useCallback(() => t("warrantOfArrestPrint"), [t]);
  const courtRegisterLoader = useCallback(() => t("courtRegister"), [t]);
  const controlDocumentLoader = useCallback(() => t("controlDocuments"), [t]);
  const courtResultsLoader = useCallback(() => t("courtResults"), [t]);
  const captureCourtResultsLoader = useCallback(() => t("captureCourtResults"), [t]);
  const courtCaseListLoader = useCallback(() => t("courtCaseList"), [t]);
  const courtResultHistoryLoader = useCallback(() => t("courtResultHistory"), [t]);
  const warrantOfArrestRegisterListLoader = useCallback(() => t("warrantOfArrestRegisterList"), [t]);
  const warrantOfArrestListLoader = useCallback(() => t("warrantOfArrestList"), [t]);
  const warrantOfArrestTabLoader = useCallback(() => t("warrantOfArrest"), [t]);
  const warrantsOfArrestRegisterLoader = useCallback(() => t("warrantsOfArrestRegister"), [t]);
  const warrantsOfArrestLoader = useCallback(() => t("warrantOfArrest"), [t]);
  const cancelContemptOfCourtFeeLoader = useCallback(() => t("cancelContemptOfCourtFee"), [t]);
  const transgressionsLoader = useCallback(() => t("transgression"), [t]);
  const overloadTransgressionsListLoader = useCallback(() => t("overloadTransgressionList"), [t]);
  const rtqsTransgressionsListLoader = useCallback(() => t("rtqsTransgressionList"), [t]);
  const rtqsTransgressionsCreateLoader = useCallback(() => t("rtqsTransgression"), [t]);
  const rtqsTransgressionsDetailsLoader = useCallback(() => t("rtqsTransgressionDetails"), [t]);
  const manualPaymentLoader = useCallback(() => t("manualPayments"), [t]);
  const noticeManagementLoader = useCallback(() => t("noticeManagement.heading"), [t]);
  const requestNoticeNumbersLoader = useCallback(() => t("requestNoticeNumber"), [t]);
  const courtScheduleLoader = useCallback(() => t("courtSchedule"), [t]);
  const mobileTransgressionsLoader = useCallback(() => t("barcodeScanner.title"), [t]);

  // Routes
  return ([
    {
      id: ROUTE_NAMES.transgressions,
      path: `${ROUTE_NAMES.transgressions}`,
      element: <TransgressionListPage />,
      errorElement: <ErrorPage />,
      loader: transgressionsLoader,
    },
    {
      id: ROUTE_NAMES.overloadTransgression,
      path: ROUTE_NAMES.overloadTransgression,
      element: <TransgressionListPage />,
      errorElement: <ErrorPage />,
      loader: overloadTransgressionsListLoader
    },
    {
      id: ROUTE_NAMES.rtqsTransgression,
      path: ROUTE_NAMES.rtqsTransgression,
      element: <TransgressionListPage />,
      errorElement: <ErrorPage />,
      loader: rtqsTransgressionsListLoader
    },
    {
      id: ROUTE_NAMES.transgressionDetailsRoute,
      path: `${ROUTE_NAMES.transgressionDetailsRoute}/:noticeNo`,
      element: <TransgressionDetailPage />,
      errorElement: <ErrorPage />,
      loader: transgressionDetailsLoader
    },
    {
      id: ROUTE_NAMES.prosecuteTransgressionRoute,
      path: ROUTE_NAMES.prosecuteTransgressionRoute,
      element: <ProsecuteTransgressionPage />,
      errorElement: <ErrorPage />,
      loader: loaderProsecuteTransgression
    },
    {
      id: ROUTE_NAMES.captureTransgressionsRoute,
      path: `${ROUTE_NAMES.captureTransgressionsRoute}/:sequenceNumber`,
      element: <CaptureTransgressionPage />,
      errorElement: <ErrorPage />,
      loader: loaderCaptureTransgression
    },
    {
      id: ROUTE_NAMES.print,
      path: `${ROUTE_NAMES.print}/:noticeNumber/:redirect`,
      element: <PrintTransgressionPage />,
      loader: printTransgressionLoader,
      errorElement: <ErrorPage />,
    },
    {
      id: ROUTE_NAMES.printAll,
      path: `${ROUTE_NAMES.printAll}/:noticeNumber/:redirect`,
      element: <PrintTransgressionPage />,
      loader: printTransgressionLoader,
      errorElement: <ErrorPage />,
    },
    {
      id: ROUTE_NAMES.captureCorrectionReason,
      path: `${ROUTE_NAMES.captureCorrectionReason}`,
      element: <ArrestCaseAdministratorPage />,
      errorElement: <ErrorPage />,
      loader: captureCorrectionReasonLoader
    },
    {
      id: ROUTE_NAMES.submissionAdjudication,
      path: `${ROUTE_NAMES.submissionAdjudication}`,
      element: <SubmissionAdjudicationPage />,
      errorElement: <ErrorPage />,
      loader: submissionAdjudicationLoader,
    },
    {
      id: ROUTE_NAMES.adjudicateSubmission,
      path: `${ROUTE_NAMES.adjudicateSubmission}`,
      element: <SubmissionAdjudicationPage />,
      errorElement: <ErrorPage />,
      loader: adjudicateSubmissionLoader,
    },
    {
      id: ROUTE_NAMES.adjudicateFindCourt,
      path: `${ROUTE_NAMES.adjudicateFindCourt}`,
      element: <SubmissionAdjudicationPage />,
      errorElement: <ErrorPage />,
      loader: adjudicateFindCourtLoader,
    },
    {
      id: ROUTE_NAMES.submissionSummary,
      path: `${ROUTE_NAMES.submissionSummary}`,
      element: <SubmissionAdjudicationPage />,
      errorElement: <ErrorPage />,
      loader: submissionSummaryLoader,
    },
    {
      id: ROUTE_NAMES.courtDocuments,
      path: `${ROUTE_NAMES.courtDocuments}`,
      element: <CourtDocumentsPage />,
      errorElement: <ErrorPage />,
      loader: courtDocumentsLoader,
    },
    {
      id: ROUTE_NAMES.courtRegister,
      path: `${ROUTE_NAMES.courtRegister}`,
      element: <CourtDocumentsPage />,
      errorElement: <ErrorPage />,
      loader: courtRegisterLoader,
    },
    {
      id: ROUTE_NAMES.controlDocuments,
      path: `${ROUTE_NAMES.controlDocuments}`,
      element: <CourtDocumentsPage />,
      errorElement: <ErrorPage />,
      loader: controlDocumentLoader,
    },
    {
      id: ROUTE_NAMES.courtResults,
      path: `${ROUTE_NAMES.courtResults}`,
      element: <CourtDocumentsPage />,
      errorElement: <ErrorPage />,
      loader: courtResultsLoader,
    },
    {
      id: ROUTE_NAMES.printDocuments,
      path: `${ROUTE_NAMES.printDocuments}`,
      element: <PrintDocumentsPage />,
      loader: printDocumentsLoader,
      errorElement: <ErrorPage />,
    },
    {
      id: ROUTE_NAMES.captureCourtResults,
      path: `${ROUTE_NAMES.captureCourtResults}/:noticeNo`,
      element: <CaptureCourtResultPage />,
      errorElement: <ErrorPage />,
      loader: captureCourtResultsLoader
    },
    {
      id: ROUTE_NAMES.courtCaseList,
      path: ROUTE_NAMES.courtCaseList,
      element: <CourtCaseListPage />,
      errorElement: <ErrorPage />,
      loader: courtCaseListLoader
    },
    {
      id: ROUTE_NAMES.courtResultHistory,
      path: ROUTE_NAMES.courtResultHistory,
      element: <CourtResultHistoryPage />,
      errorElement: <ErrorPage />,
      loader: courtResultHistoryLoader
    },
    {
      id: ROUTE_NAMES.warrantOfArrestTab,
      path: ROUTE_NAMES.warrantOfArrestTab,
      element: <WarrantOfArrestTabPage />,
      errorElement: <ErrorPage />,
      loader: warrantOfArrestTabLoader
    },
    {
      id: ROUTE_NAMES.warrantsOfArrestRegister,
      path: ROUTE_NAMES.warrantsOfArrestRegister,
      element: <WarrantOfArrestTabPage />,
      errorElement: <ErrorPage />,
      loader: warrantsOfArrestRegisterLoader
    },
    {
      id: ROUTE_NAMES.warrantsOfArrest,
      path: ROUTE_NAMES.warrantsOfArrest,
      element: <WarrantOfArrestTabPage />,
      errorElement: <ErrorPage />,
      loader: warrantsOfArrestLoader
    },
    {
      id: ROUTE_NAMES.warrantOfArrestRegisterList,
      path: ROUTE_NAMES.warrantOfArrestRegisterList,
      element: <WarrantOfArrestRegisterListPage />,
      errorElement: <ErrorPage />,
      loader: warrantOfArrestRegisterListLoader
    },
    {
      id: ROUTE_NAMES.warrantOfArrestList,
      path: ROUTE_NAMES.warrantOfArrestList,
      element: <WarrantOfArrestListPage />,
      errorElement: <ErrorPage />,
      loader: warrantOfArrestListLoader
    },
    {
      id: ROUTE_NAMES.cancelContemptOfCourtFee,
      path: ROUTE_NAMES.cancelContemptOfCourtFee,
      element: <CourtDocumentsPage />,
      errorElement: <ErrorPage />,
      loader: cancelContemptOfCourtFeeLoader
    },
    {
      id: ROUTE_NAMES.rtqsTransgressionCreate,
      path: ROUTE_NAMES.rtqsTransgressionCreate,
      element: <CaptureRtqsTransgression />,
      errorElement: <ErrorPage />,
      loader: rtqsTransgressionsCreateLoader
    },
    {
      id: ROUTE_NAMES.rtqsTransgressionDetails,
      path: `${ROUTE_NAMES.rtqsTransgressionDetails}/:noticeNumber`,
      element: <RtqsTransgressionDetailsPage />,
      errorElement: <ErrorPage />,
      loader: rtqsTransgressionsDetailsLoader
    },
    {
      id: ROUTE_NAMES.manualPayments,
      path: ROUTE_NAMES.manualPayments,
      element: <ManualPaymentsPage />,
      errorElement: <ErrorPage />,
      loader: manualPaymentLoader
    },
    {
      id: ROUTE_NAMES.noticeManagement,
      path: ROUTE_NAMES.noticeManagement,
      element: <NoticeManagementPage />,
      errorElement: <ErrorPage />,
      loader: noticeManagementLoader
    },
    {
      id: ROUTE_NAMES.requestNoticeNumbers,
      path: ROUTE_NAMES.requestNoticeNumbers,
      element: <NoticeManagementPage />,
      errorElement: <ErrorPage />,
      loader: requestNoticeNumbersLoader
    },
    {
      id: ROUTE_NAMES.courtSchedule,
      path: `${ROUTE_NAMES.courtSchedule}`,
      element: <CourtDocumentsPage />,
      errorElement: <ErrorPage />,
      loader: courtScheduleLoader,
    },
    {
      id: ROUTE_NAMES.mobileTransgressions,
      path: ROUTE_NAMES.mobileTransgressions,
      element: <BarcodeScanner />,
      errorElement: <ErrorPage />,
      loader: mobileTransgressionsLoader,
    },
  ]);
};
