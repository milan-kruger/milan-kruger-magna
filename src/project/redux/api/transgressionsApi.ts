import { transgressionsBaseSplitApi as api } from "./transgressionsBaseApi";
export const addTagTypes = [
  "Submission",
  "Warrant Of Arrest",
  "Warrant Of Arrest Register",
  "FE form validations",
  "TransgressionHistory",
  "Transgression",
  "Successful Payment",
  "RenderedTransgressionDocument",
  "RenderedDocument",
  "PendingProsecution",
  "Payment Confirmation",
  "Payment",
  "Notice Book Management Controller",
  "File Storage",
  "DPO",
  "Court Schedule",
  "CourtResult",
  "Court",
  "RegisterOfControl",
  "Legislation Transgression Charge",
  "Authorise",
  "auth-controller",
  "Adumo",
  "Adjudication",
  "Adjudications Allowance",
  "AARTO Notice Numbers",
  "Replication",
  "Payment Receipt",
  "Notice Number Validator",
  "Legislation",
  "Info",
  "Currency",
  "Country Region",
  "Authority",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      updateSubmissionStatus: build.mutation<
        UpdateSubmissionStatusApiResponse,
        UpdateSubmissionStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/submission/updateSubmissionStatus`,
          method: "PUT",
          body: queryArg.updateSubmissionStatusRequest,
        }),
        invalidatesTags: ["Submission"],
      }),
      uploadSignedWarrantOfArrest: build.mutation<
        UploadSignedWarrantOfArrestApiResponse,
        UploadSignedWarrantOfArrestApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/uploadSignedWarrantOfArrest`,
          method: "POST",
          body: queryArg.uploadSignedWarrantOfArrestRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      updateWarrantOfArrest: build.mutation<
        UpdateWarrantOfArrestApiResponse,
        UpdateWarrantOfArrestApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/updateWarrantOfArrest`,
          method: "POST",
          body: queryArg.updateWarrantOfArrestRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      provideWarrantOfArrestDocuments: build.mutation<
        ProvideWarrantOfArrestDocumentsApiResponse,
        ProvideWarrantOfArrestDocumentsApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/provideWarrantOfArrestDocuments`,
          method: "POST",
          body: queryArg.provideWarrantOfArrestDocumentsRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      provideWarrantOfArrestByWarrantNumber: build.mutation<
        ProvideWarrantOfArrestByWarrantNumberApiResponse,
        ProvideWarrantOfArrestByWarrantNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/provideWarrantOfArrestByWarrantNumber/${queryArg.warrantNumber}`,
          method: "POST",
          params: {
            withdrawn: queryArg.withdrawn,
          },
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      provideWarrantOfArrestByNoticeNumber: build.mutation<
        ProvideWarrantOfArrestByNoticeNumberApiResponse,
        ProvideWarrantOfArrestByNoticeNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/provideWarrantOfArrestByNoticeNumber/${queryArg.noticeNumber}`,
          method: "POST",
          params: {
            withdrawn: queryArg.withdrawn,
          },
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      provideWarrantOfArrestByCourtDetails: build.mutation<
        ProvideWarrantOfArrestByCourtDetailsApiResponse,
        ProvideWarrantOfArrestByCourtDetailsApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/provideWarrantOfArrestByCourtDetails`,
          method: "POST",
          params: {
            courtDate: queryArg.courtDate,
            courtName: queryArg.courtName,
            courtRoom: queryArg.courtRoom,
            withdrawn: queryArg.withdrawn,
          },
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      provideWarrantList: build.mutation<
        ProvideWarrantListApiResponse,
        ProvideWarrantListApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/provideWarrantList`,
          method: "POST",
          body: queryArg.provideWarrantListRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest Register"],
      }),
      generateWarrantOfArrest: build.mutation<
        GenerateWarrantOfArrestApiResponse,
        GenerateWarrantOfArrestApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/generateWarrantOfArrest`,
          method: "POST",
          body: queryArg.generateWarrantOfArrestRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      generateWarrantOfArrestRegister: build.mutation<
        GenerateWarrantOfArrestRegisterApiResponse,
        GenerateWarrantOfArrestRegisterApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/generateWarrantOfArrestRegister`,
          method: "POST",
          body: queryArg.generateWarrantOfArrestRegisterRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest Register"],
      }),
      finalisePrintWarrantOfArrest: build.mutation<
        FinalisePrintWarrantOfArrestApiResponse,
        FinalisePrintWarrantOfArrestApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/finalisePrintWarrantOfArrest`,
          method: "POST",
          body: queryArg.finalisePrintWarrantOfArrestRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      deleteSignedWarrantOfArrest: build.mutation<
        DeleteSignedWarrantOfArrestApiResponse,
        DeleteSignedWarrantOfArrestApiArg
      >({
        query: (queryArg) => ({
          url: `/warrantOfArrest/deleteSignedWarrantOfArrest`,
          method: "POST",
          body: queryArg.deleteSignedWarrantOfArrestRequest,
        }),
        invalidatesTags: ["Warrant Of Arrest"],
      }),
      validateId: build.mutation<ValidateIdApiResponse, ValidateIdApiArg>({
        query: (queryArg) => ({
          url: `/validation/id`,
          method: "POST",
          body: queryArg.validateIdRequest,
        }),
        invalidatesTags: ["FE form validations"],
      }),
      updateWarrantRegisterHistory: build.mutation<
        UpdateWarrantRegisterHistoryApiResponse,
        UpdateWarrantRegisterHistoryApiArg
      >({
        query: (queryArg) => ({
          url: `/transgressionHistory/updateWarrantRegisterHistory`,
          method: "POST",
          body: queryArg.updateTransgressionHistoryRequest,
        }),
        invalidatesTags: ["TransgressionHistory"],
      }),
      updateRegisterOfControlDocumentsHistory: build.mutation<
        UpdateRegisterOfControlDocumentsHistoryApiResponse,
        UpdateRegisterOfControlDocumentsHistoryApiArg
      >({
        query: (queryArg) => ({
          url: `/transgressionHistory/updateRegisterOfControlDocumentsHistory`,
          method: "POST",
          body: queryArg.updateTransgressionHistoryRequest,
        }),
        invalidatesTags: ["TransgressionHistory"],
      }),
      updateCourtRegisterHistory: build.mutation<
        UpdateCourtRegisterHistoryApiResponse,
        UpdateCourtRegisterHistoryApiArg
      >({
        query: (queryArg) => ({
          url: `/transgressionHistory/updateCourtRegisterHistory`,
          method: "POST",
          body: queryArg.updateTransgressionHistoryRequest,
        }),
        invalidatesTags: ["TransgressionHistory"],
      }),
      updateTransgressionStatus: build.mutation<
        UpdateTransgressionStatusApiResponse,
        UpdateTransgressionStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/updateTransgressionStatus`,
          method: "POST",
          body: queryArg.updateTransgressionStatusRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      updateRtqsTransgressionInformation: build.mutation<
        UpdateRtqsTransgressionInformationApiResponse,
        UpdateRtqsTransgressionInformationApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/updateRtqsTransgressionInformation`,
          method: "POST",
          body: queryArg.updateRtqsTransgressionInformationRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      updateOverloadTransgressionInformation: build.mutation<
        UpdateOverloadTransgressionInformationApiResponse,
        UpdateOverloadTransgressionInformationApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/updateOverloadTransgressionInformation`,
          method: "POST",
          body: queryArg.updateOverloadTransgressionInformationRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      retrieveTransgressionDetails: build.mutation<
        RetrieveTransgressionDetailsApiResponse,
        RetrieveTransgressionDetailsApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/retrieveTransgressionDetails`,
          method: "POST",
          body: queryArg.retrieveTransgressionDetailsRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      retrieveRtqsTransgressionInformation: build.mutation<
        RetrieveRtqsTransgressionInformationApiResponse,
        RetrieveRtqsTransgressionInformationApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/retrieveRtqsTransgressionInfo`,
          method: "POST",
          body: queryArg.retrieveRtqsTransgressionInformationRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      retrieveOverloadTransgressionInformation: build.mutation<
        RetrieveOverloadTransgressionInformationApiResponse,
        RetrieveOverloadTransgressionInformationApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/retrieveOverloadTransgressionInfo`,
          method: "POST",
          body: queryArg.retrieveTransgressionInformationRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      generateRtqsTransgression: build.mutation<
        GenerateRtqsTransgressionApiResponse,
        GenerateRtqsTransgressionApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/generateRtqsTransgression`,
          method: "POST",
          body: queryArg.generateRtqsTransgressionRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      generateOverloadTransgression: build.mutation<
        GenerateOverloadTransgressionApiResponse,
        GenerateOverloadTransgressionApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/generateOverloadTransgression`,
          method: "POST",
          body: queryArg.generateOverloadTransgressionRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      cancelTransgression: build.mutation<
        CancelTransgressionApiResponse,
        CancelTransgressionApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/cancelTransgression`,
          method: "POST",
          body: queryArg.cancelTransgressionRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      cancelRtqsTransgression: build.mutation<
        CancelRtqsTransgressionApiResponse,
        CancelRtqsTransgressionApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/cancelRtqsTransgression`,
          method: "POST",
          body: queryArg.cancelRtqsTransgressionRequest,
        }),
        invalidatesTags: ["Transgression"],
      }),
      redirectToFrontend: build.mutation<
        RedirectToFrontendApiResponse,
        RedirectToFrontendApiArg
      >({
        query: (queryArg) => ({
          url: `/successfulPayment/dpo-redirect/${queryArg.noticeNumber}`,
          method: "POST",
        }),
        invalidatesTags: ["Successful Payment"],
      }),
      updateSubmission: build.mutation<
        UpdateSubmissionApiResponse,
        UpdateSubmissionApiArg
      >({
        query: (queryArg) => ({
          url: `/submission/updateSubmission`,
          method: "POST",
          body: queryArg.updateSubmissionRequest,
        }),
        invalidatesTags: ["Submission"],
      }),
      retrieveSubmissionByNoticeNumber: build.mutation<
        RetrieveSubmissionByNoticeNumberApiResponse,
        RetrieveSubmissionByNoticeNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/submission/retrieveSubmissionByNoticeNumber`,
          method: "POST",
          body: queryArg.retrieveSubmissionRequest,
        }),
        invalidatesTags: ["Submission"],
      }),
      registerSubmission: build.mutation<
        RegisterSubmissionApiResponse,
        RegisterSubmissionApiArg
      >({
        query: (queryArg) => ({
          url: `/submission/registerSubmission`,
          method: "POST",
          body: queryArg.registerSubmissionRequest,
        }),
        invalidatesTags: ["Submission"],
      }),
      provideSubmissionSummary: build.mutation<
        ProvideSubmissionSummaryApiResponse,
        ProvideSubmissionSummaryApiArg
      >({
        query: (queryArg) => ({
          url: `/submission/provideSubmissionSummary`,
          method: "POST",
          body: queryArg.provideSubmissionSummaryRequest,
        }),
        invalidatesTags: ["Submission"],
      }),
      provideSubmissionDetails: build.mutation<
        ProvideSubmissionDetailsApiResponse,
        ProvideSubmissionDetailsApiArg
      >({
        query: (queryArg) => ({
          url: `/submission/provideSubmissionDetails`,
          method: "POST",
          body: queryArg.provideSubmissionRequest,
        }),
        invalidatesTags: ["Submission"],
      }),
      provideRenderedTransgressionDocuments: build.mutation<
        ProvideRenderedTransgressionDocumentsApiResponse,
        ProvideRenderedTransgressionDocumentsApiArg
      >({
        query: (queryArg) => ({
          url: `/renderedTransgressionDocument/provideRenderedTransgressionDocument`,
          method: "POST",
          body: queryArg.provideRenderedTransgressionDocumentRequest,
        }),
        invalidatesTags: ["RenderedTransgressionDocument"],
      }),
      provideRenderedChargeSheet: build.mutation<
        ProvideRenderedChargeSheetApiResponse,
        ProvideRenderedChargeSheetApiArg
      >({
        query: (queryArg) => ({
          url: `/renderedDocument/provideRenderedChargeSheet`,
          method: "POST",
          body: queryArg.provideRenderedChargeSheetRequest,
        }),
        invalidatesTags: ["RenderedDocument"],
      }),
      prosecuteTransgression: build.mutation<
        ProsecuteTransgressionApiResponse,
        ProsecuteTransgressionApiArg
      >({
        query: (queryArg) => ({
          url: `/pendingProsecution/prosecuteTransgression/${queryArg.sequenceNumber}`,
          method: "POST",
        }),
        invalidatesTags: ["PendingProsecution"],
      }),
      confirmTransgressionPayment: build.mutation<
        ConfirmTransgressionPaymentApiResponse,
        ConfirmTransgressionPaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/paymentConfirmation/confirmTransgressionPayment`,
          method: "POST",
          body: queryArg.confirmTransgressionPaymentRequest,
        }),
        invalidatesTags: ["Payment Confirmation"],
      }),
      initiatePayment: build.mutation<
        InitiatePaymentApiResponse,
        InitiatePaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/payment/initiatePayment`,
          method: "POST",
          body: queryArg.processPaymentRequest,
        }),
        invalidatesTags: ["Payment"],
      }),
      finalisePayment: build.mutation<
        FinalisePaymentApiResponse,
        FinalisePaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/payment/finalisePayment`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Payment"],
      }),
      addNoticeBook: build.mutation<
        AddNoticeBookApiResponse,
        AddNoticeBookApiArg
      >({
        query: (queryArg) => ({
          url: `/noticeBook/addNoticeBook`,
          method: "POST",
          body: queryArg.addNoticeBookRequest,
        }),
        invalidatesTags: ["Notice Book Management Controller"],
      }),
      processManualPayment: build.mutation<
        ProcessManualPaymentApiResponse,
        ProcessManualPaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/manualPayment/processManualPayment`,
          method: "POST",
          body: queryArg.processManualPaymentRequest,
        }),
        invalidatesTags: ["Payment"],
      }),
      saveFile: build.mutation<SaveFileApiResponse, SaveFileApiArg>({
        query: (queryArg) => ({
          url: `/fileStorage/files`,
          method: "POST",
          body: queryArg.saveFileRequest,
        }),
        invalidatesTags: ["File Storage"],
      }),
      initiateDpoPayment: build.mutation<
        InitiateDpoPaymentApiResponse,
        InitiateDpoPaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/dpo/initiateDpoPayment`,
          method: "POST",
          body: queryArg.initiateDpoPaymentRequest,
        }),
        invalidatesTags: ["DPO"],
      }),
      findDpoPayment: build.mutation<
        FindDpoPaymentApiResponse,
        FindDpoPaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/dpo/findDpoPayment`,
          method: "POST",
          body: queryArg.findDpoPaymentRequest,
        }),
        invalidatesTags: ["DPO"],
      }),
      generateCourtSchedule: build.mutation<
        GenerateCourtScheduleApiResponse,
        GenerateCourtScheduleApiArg
      >({
        query: (queryArg) => ({
          url: `/courtSchedule/generateCourtSchedule`,
          method: "POST",
          body: queryArg.generateCourtScheduleRequest,
        }),
        invalidatesTags: ["Court Schedule"],
      }),
      provideCourtResult: build.mutation<
        ProvideCourtResultApiResponse,
        ProvideCourtResultApiArg
      >({
        query: (queryArg) => ({
          url: `/courtResult/provideCourtResult`,
          method: "POST",
          body: queryArg.provideCourtResultsRequest,
        }),
        invalidatesTags: ["CourtResult"],
      }),
      provideCourtResultSummary: build.mutation<
        ProvideCourtResultSummaryApiResponse,
        ProvideCourtResultSummaryApiArg
      >({
        query: (queryArg) => ({
          url: `/courtResult/provideCourtResultSummary`,
          method: "POST",
          body: queryArg.provideCourtResultSummaryRequest,
        }),
        invalidatesTags: ["CourtResult"],
      }),
      provideCourtCaseList: build.mutation<
        ProvideCourtCaseListApiResponse,
        ProvideCourtCaseListApiArg
      >({
        query: (queryArg) => ({
          url: `/courtResult/provideCourtCaseList`,
          method: "POST",
          body: queryArg.provideCourtCaseListRequest,
        }),
        invalidatesTags: ["CourtResult"],
      }),
      finaliseCourtResult: build.mutation<
        FinaliseCourtResultApiResponse,
        FinaliseCourtResultApiArg
      >({
        query: (queryArg) => ({
          url: `/courtResult/finaliseCourtResult`,
          method: "POST",
          body: queryArg.finaliseCourtResultRequest,
        }),
        invalidatesTags: ["CourtResult"],
      }),
      cancelContemptOfCourt: build.mutation<
        CancelContemptOfCourtApiResponse,
        CancelContemptOfCourtApiArg
      >({
        query: (queryArg) => ({
          url: `/courtResult/cancelContemptOfCourt`,
          method: "POST",
          body: queryArg.cancelContemptOfCourtRequest,
        }),
        invalidatesTags: ["CourtResult"],
      }),
      retrieveTransgression: build.mutation<
        RetrieveTransgressionApiResponse,
        RetrieveTransgressionApiArg
      >({
        query: (queryArg) => ({
          url: `/courtRegister/retrieveTransgression`,
          method: "POST",
          body: queryArg.retrieveTransgressionRequest,
        }),
        invalidatesTags: ["Court"],
      }),
      initialiseCourtDocuments: build.mutation<
        InitialiseCourtDocumentsApiResponse,
        InitialiseCourtDocumentsApiArg
      >({
        query: () => ({
          url: `/courtRegister/initialiseCourtDocuments`,
          method: "POST",
        }),
        invalidatesTags: ["Court"],
      }),
      findCourtRegister: build.mutation<
        FindCourtRegisterApiResponse,
        FindCourtRegisterApiArg
      >({
        query: (queryArg) => ({
          url: `/courtRegister/findCourtRegister`,
          method: "POST",
          body: queryArg.findCourtRegisterRequest,
        }),
        invalidatesTags: ["Court"],
      }),
      finaliseCourtRegister: build.mutation<
        FinaliseCourtRegisterApiResponse,
        FinaliseCourtRegisterApiArg
      >({
        query: (queryArg) => ({
          url: `/courtRegister/finaliseCourtRegister`,
          method: "POST",
          body: queryArg.finaliseCourtRegisterRequest,
        }),
        invalidatesTags: ["Court"],
      }),
      provideCourt: build.mutation<ProvideCourtApiResponse, ProvideCourtApiArg>(
        {
          query: (queryArg) => ({
            url: `/court/provideCourt`,
            method: "POST",
            body: queryArg.provideCourtRequest,
          }),
          invalidatesTags: ["Court"],
        },
      ),
      finaliseRegisterOfControlDocuments: build.mutation<
        FinaliseRegisterOfControlDocumentsApiResponse,
        FinaliseRegisterOfControlDocumentsApiArg
      >({
        query: (queryArg) => ({
          url: `/controlDocuments/finaliseRegisterOfControlDocuments`,
          method: "POST",
          body: queryArg.finaliseRegisterOfControlDocumentsRequest,
        }),
        invalidatesTags: ["RegisterOfControl"],
      }),
      searchCharge: build.mutation<SearchChargeApiResponse, SearchChargeApiArg>(
        {
          query: (queryArg) => ({
            url: `/charge/search`,
            method: "POST",
            body: queryArg.provideChargeRequest,
          }),
          invalidatesTags: ["Legislation Transgression Charge"],
        },
      ),
      provideSnapshotCharge: build.mutation<
        ProvideSnapshotChargeApiResponse,
        ProvideSnapshotChargeApiArg
      >({
        query: (queryArg) => ({
          url: `/charge/provideSnapshotCharge`,
          method: "POST",
          body: queryArg.provideSnapshotChargeRequest,
        }),
        invalidatesTags: ["Legislation Transgression Charge"],
      }),
      authoriseSupervisorOverride: build.mutation<
        AuthoriseSupervisorOverrideApiResponse,
        AuthoriseSupervisorOverrideApiArg
      >({
        query: (queryArg) => ({
          url: `/authorisation/authoriseSupervisorOverride`,
          method: "POST",
          body: queryArg.authoriseSupervisorOverrideRequest,
        }),
        invalidatesTags: ["Authorise"],
      }),
      login: build.mutation<LoginApiResponse, LoginApiArg>({
        query: (queryArg) => ({
          url: `/auth/login`,
          method: "POST",
          body: queryArg.loginRequest,
          headers: {
            "X-Org": queryArg["X-Org"],
            "X-Tnt": queryArg["X-Tnt"],
          },
        }),
        invalidatesTags: ["auth-controller"],
      }),
      initialiseVirtualPayment: build.mutation<
        InitialiseVirtualPaymentApiResponse,
        InitialiseVirtualPaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/adumo/initialiseVirtualPayment`,
          method: "POST",
          body: queryArg.initialiseVirtualPaymentRequest,
        }),
        invalidatesTags: ["Adumo"],
      }),
      startNextAdjudication: build.mutation<
        StartNextAdjudicationApiResponse,
        StartNextAdjudicationApiArg
      >({
        query: (queryArg) => ({
          url: `/adjudication/startNextAdjudication`,
          method: "POST",
          body: queryArg.startNextAdjudicationRequest,
        }),
        invalidatesTags: ["Adjudication"],
      }),
      allowAdjudication: build.mutation<
        AllowAdjudicationApiResponse,
        AllowAdjudicationApiArg
      >({
        query: (queryArg) => ({
          url: `/adjudication/allowAdjudication`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Adjudications Allowance"],
      }),
      adjudicateSubmission: build.mutation<
        AdjudicateSubmissionApiResponse,
        AdjudicateSubmissionApiArg
      >({
        query: (queryArg) => ({
          url: `/adjudication/adjudicateSubmission`,
          method: "POST",
          body: queryArg.adjudicateSubmissionRequest,
        }),
        invalidatesTags: ["Adjudication"],
      }),
      abortAdjudication: build.mutation<
        AbortAdjudicationApiResponse,
        AbortAdjudicationApiArg
      >({
        query: (queryArg) => ({
          url: `/adjudication/abortAdjudication`,
          method: "POST",
          body: queryArg.abortAdjudicationRequest,
        }),
        invalidatesTags: ["Adjudication"],
      }),
      requestNoticeNumber: build.mutation<
        RequestNoticeNumberApiResponse,
        RequestNoticeNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/aarto/requestNoticeNumber`,
          method: "POST",
          body: queryArg.requestNoticeNumberRequest,
        }),
        invalidatesTags: ["AARTO Notice Numbers"],
      }),
      provideAartoNoticeNumber: build.mutation<
        ProvideAartoNoticeNumberApiResponse,
        ProvideAartoNoticeNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/aarto/provideNoticeNumber`,
          method: "POST",
          params: {
            status: queryArg.status,
            chargeCount: queryArg.chargeCount,
          },
        }),
        invalidatesTags: ["AARTO Notice Numbers"],
      }),
      generateNoticeNumbers: build.mutation<
        GenerateNoticeNumbersApiResponse,
        GenerateNoticeNumbersApiArg
      >({
        query: (queryArg) => ({
          url: `/aarto/mock/generateNoticeNumbers`,
          method: "POST",
          body: queryArg.generateNoticeNumberRequest,
        }),
        invalidatesTags: ["AARTO Notice Numbers"],
      }),
      retrieveTransgressionHistory: build.query<
        RetrieveTransgressionHistoryApiResponse,
        RetrieveTransgressionHistoryApiArg
      >({
        query: (queryArg) => ({
          url: `/transgressionHistory/retrieveTransgressionHistory`,
          params: {
            noticeNumber: queryArg.noticeNumber,
          },
        }),
        providesTags: ["TransgressionHistory"],
      }),
      findAllTransgressionEventsBySequencedNumber: build.query<
        FindAllTransgressionEventsBySequencedNumberApiResponse,
        FindAllTransgressionEventsBySequencedNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/transgressionHistory/findAllTransgressionEventsBySequencedNumber/${queryArg.sequenceNumber}`,
        }),
        providesTags: ["TransgressionHistory"],
      }),
      retrieveRtqsTransgressionList: build.query<
        RetrieveRtqsTransgressionListApiResponse,
        RetrieveRtqsTransgressionListApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/retrieveRtqsTransgressionList`,
          params: {
            plateNumber: queryArg.plateNumber,
            fromDate: queryArg.fromDate,
            toDate: queryArg.toDate,
            status: queryArg.status,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sortDirection: queryArg.sortDirection,
            sortFields: queryArg.sortFields,
          },
        }),
        providesTags: ["Transgression"],
      }),
      retrieveOverloadTransgressionList: build.query<
        RetrieveOverloadTransgressionListApiResponse,
        RetrieveOverloadTransgressionListApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/retrieveOverloadTransgressionList`,
          params: {
            plateNumber: queryArg.plateNumber,
            fromDate: queryArg.fromDate,
            toDate: queryArg.toDate,
            status: queryArg.status,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sortDirection: queryArg.sortDirection,
            sortFields: queryArg.sortFields,
          },
        }),
        providesTags: ["Transgression"],
      }),
      findTransgressionStatusBySequenceNumber: build.query<
        FindTransgressionStatusBySequenceNumberApiResponse,
        FindTransgressionStatusBySequenceNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/findTransgressionStatusBySequenceNumber/${queryArg.sequenceNumber}`,
        }),
        providesTags: ["Transgression"],
      }),
      findTransgressionStatusByNoticeNumber: build.query<
        FindTransgressionStatusByNoticeNumberApiResponse,
        FindTransgressionStatusByNoticeNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/findTransgressionStatusByNoticeNumber/${queryArg.noticeNumber}`,
        }),
        providesTags: ["Transgression"],
      }),
      findTransgressionParameter: build.query<
        FindTransgressionParameterApiResponse,
        FindTransgressionParameterApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/findTransgressionParameterByName/${queryArg.name}`,
        }),
        providesTags: ["Transgression"],
      }),
      findTransgressionConfiguration: build.query<
        FindTransgressionConfigurationApiResponse,
        FindTransgressionConfigurationApiArg
      >({
        query: (queryArg) => ({
          url: `/transgression/findTransgressionConfiguration`,
          params: {
            authorityCode: queryArg.authorityCode,
            chargebookType: queryArg.chargebookType,
          },
        }),
        providesTags: ["Transgression"],
      }),
      findSuccessfulPayment: build.query<
        FindSuccessfulPaymentApiResponse,
        FindSuccessfulPaymentApiArg
      >({
        query: (queryArg) => ({
          url: `/successfulPayment/findSuccessfulPayment`,
          params: {
            noticeNumber: queryArg.noticeNumber,
            retryCount: queryArg.retryCount,
          },
        }),
        providesTags: ["Successful Payment"],
      }),
      getStatus: build.query<GetStatusApiResponse, GetStatusApiArg>({
        query: (queryArg) => ({
          url: `/replication/status/${queryArg.checkSum}`,
        }),
        providesTags: ["Replication"],
      }),
      getAboutReplication: build.query<
        GetAboutReplicationApiResponse,
        GetAboutReplicationApiArg
      >({
        query: () => ({ url: `/replication/about` }),
        providesTags: ["Replication"],
      }),
      isTransgressionPending: build.query<
        IsTransgressionPendingApiResponse,
        IsTransgressionPendingApiArg
      >({
        query: (queryArg) => ({
          url: `/pendingProsecution/isPendingProsecution/${queryArg.sequenceNumber}`,
        }),
        providesTags: ["PendingProsecution"],
      }),
      providePaymentRequest: build.query<
        ProvidePaymentRequestApiResponse,
        ProvidePaymentRequestApiArg
      >({
        query: (queryArg) => ({
          url: `/paymentReceipt/paymentReceipt`,
          params: {
            receiptNumber: queryArg.receiptNumber,
          },
        }),
        providesTags: ["Payment Receipt"],
      }),
      findPaymentByNoticeNumber: build.query<
        FindPaymentByNoticeNumberApiResponse,
        FindPaymentByNoticeNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/payment/findPaymentByNoticeNumber`,
          params: {
            noticeNumber: queryArg.noticeNumber,
          },
        }),
        providesTags: ["Payment"],
      }),
      validateNoticeNumber: build.query<
        ValidateNoticeNumberApiResponse,
        ValidateNoticeNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/noticeNumber/validate/${queryArg.noticeNumber}`,
        }),
        providesTags: ["Notice Number Validator"],
      }),
      provideNoticeBook: build.query<
        ProvideNoticeBookApiResponse,
        ProvideNoticeBookApiArg
      >({
        query: (queryArg) => ({
          url: `/noticeBook/provideNoticeBook`,
          params: {
            authorityCode: queryArg.authorityCode,
            noticeBookNumber: queryArg.noticeBookNumber,
            noticeBookType: queryArg.noticeBookType,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sortDirection: queryArg.sortDirection,
            sortFields: queryArg.sortFields,
          },
        }),
        providesTags: ["Notice Book Management Controller"],
      }),
      validateTransgression: build.query<
        ValidateTransgressionApiResponse,
        ValidateTransgressionApiArg
      >({
        query: (queryArg) => ({
          url: `/manualPayment/validateTransgression`,
          params: {
            status: queryArg.status,
            authorityCode: queryArg.authorityCode,
          },
        }),
        providesTags: ["Payment"],
      }),
      findLegislation: build.query<
        FindLegislationApiResponse,
        FindLegislationApiArg
      >({
        query: (queryArg) => ({ url: `/legislation/${queryArg.id}` }),
        providesTags: ["Legislation"],
      }),
      searchLegislation: build.query<
        SearchLegislationApiResponse,
        SearchLegislationApiArg
      >({
        query: (queryArg) => ({
          url: `/legislation/search`,
          params: {
            country: queryArg.country,
            legislationType: queryArg.legislationType,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sortDirection: queryArg.sortDirection,
            sortFields: queryArg.sortFields,
          },
        }),
        providesTags: ["Legislation"],
      }),
      getAbout: build.query<GetAboutApiResponse, GetAboutApiArg>({
        query: () => ({ url: `/info/about` }),
        providesTags: ["Info"],
      }),
      provideFile: build.query<ProvideFileApiResponse, ProvideFileApiArg>({
        query: (queryArg) => ({ url: `/fileStorage/files/${queryArg.fileId}` }),
        providesTags: ["File Storage"],
      }),
      deleteFile: build.mutation<DeleteFileApiResponse, DeleteFileApiArg>({
        query: (queryArg) => ({
          url: `/fileStorage/files/${queryArg.fileId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["File Storage"],
      }),
      provideCurrencyCode: build.query<
        ProvideCurrencyCodeApiResponse,
        ProvideCurrencyCodeApiArg
      >({
        query: () => ({ url: `/currency/provideCurrency` }),
        providesTags: ["Currency"],
      }),
      provideCountryRegion: build.query<
        ProvideCountryRegionApiResponse,
        ProvideCountryRegionApiArg
      >({
        query: (queryArg) => ({
          url: `/countryRegion/provideCountryRegion`,
          params: {
            country: queryArg.country,
            region: queryArg.region,
          },
        }),
        providesTags: ["Country Region"],
      }),
      findCharge: build.query<FindChargeApiResponse, FindChargeApiArg>({
        query: (queryArg) => ({ url: `/charge/${queryArg.id}` }),
        providesTags: ["Legislation Transgression Charge"],
      }),
      allCharges: build.query<AllChargesApiResponse, AllChargesApiArg>({
        query: () => ({ url: `/charge/all` }),
        providesTags: ["Legislation Transgression Charge"],
      }),
      allAuthorityByAuthorityId: build.query<
        AllAuthorityByAuthorityIdApiResponse,
        AllAuthorityByAuthorityIdApiArg
      >({
        query: (queryArg) => ({ url: `/authority/by-id/${queryArg.id}` }),
        providesTags: ["Authority"],
      }),
      allAuthorityByAuthorityCode: build.query<
        AllAuthorityByAuthorityCodeApiResponse,
        AllAuthorityByAuthorityCodeApiArg
      >({
        query: (queryArg) => ({ url: `/authority/by-code/${queryArg.code}` }),
        providesTags: ["Authority"],
      }),
      allAuthorities: build.query<
        AllAuthoritiesApiResponse,
        AllAuthoritiesApiArg
      >({
        query: () => ({ url: `/authority/all` }),
        providesTags: ["Authority"],
      }),
      initialiseAdjudication: build.query<
        InitialiseAdjudicationApiResponse,
        InitialiseAdjudicationApiArg
      >({
        query: () => ({ url: `/adjudication/initialiseAdjudication` }),
        providesTags: ["Adjudication"],
      }),
      removePendingProsecution: build.mutation<
        RemovePendingProsecutionApiResponse,
        RemovePendingProsecutionApiArg
      >({
        query: (queryArg) => ({
          url: `/pendingProsecution/removePendingProsecution/${queryArg.sequenceNumber}`,
          method: "DELETE",
        }),
        invalidatesTags: ["PendingProsecution"],
      }),
      deleteNoticeBook: build.mutation<
        DeleteNoticeBookApiResponse,
        DeleteNoticeBookApiArg
      >({
        query: (queryArg) => ({
          url: `/noticeBook/deleteNoticeBook`,
          method: "DELETE",
          body: queryArg.deleteNoticeBookRequest,
        }),
        invalidatesTags: ["Notice Book Management Controller"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as transgressionsApi };
export type UpdateSubmissionStatusApiResponse =
  /** status 200 OK */ UpdateSubmissionStatusResponse;
export type UpdateSubmissionStatusApiArg = {
  updateSubmissionStatusRequest: UpdateSubmissionStatusRequest;
};
export type UploadSignedWarrantOfArrestApiResponse =
  /** status 200 OK */ UploadSignedWarrantOfArrestResponse;
export type UploadSignedWarrantOfArrestApiArg = {
  uploadSignedWarrantOfArrestRequest: UploadSignedWarrantOfArrestRequest;
};
export type UpdateWarrantOfArrestApiResponse =
  /** status 200 OK */ UpdateWarrantOfArrestResponse;
export type UpdateWarrantOfArrestApiArg = {
  updateWarrantOfArrestRequest: UpdateWarrantOfArrestRequest;
};
export type ProvideWarrantOfArrestDocumentsApiResponse =
  /** status 200 OK */ ProvideWarrantOfArrestDocumentsResponse;
export type ProvideWarrantOfArrestDocumentsApiArg = {
  provideWarrantOfArrestDocumentsRequest: ProvideWarrantOfArrestDocumentsRequest;
};
export type ProvideWarrantOfArrestByWarrantNumberApiResponse =
  /** status 200 OK */ ProvideWarrantOfArrestResponse;
export type ProvideWarrantOfArrestByWarrantNumberApiArg = {
  warrantNumber: string;
  withdrawn?: boolean;
};
export type ProvideWarrantOfArrestByNoticeNumberApiResponse =
  /** status 200 OK */ ProvideWarrantOfArrestResponse;
export type ProvideWarrantOfArrestByNoticeNumberApiArg = {
  noticeNumber: string;
  withdrawn?: boolean;
};
export type ProvideWarrantOfArrestByCourtDetailsApiResponse =
  /** status 200 OK */ ProvideWarrantOfArrestResponse;
export type ProvideWarrantOfArrestByCourtDetailsApiArg = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
  withdrawn?: boolean;
};
export type ProvideWarrantListApiResponse =
  /** status 200 OK */ ProvideWarrantListResponse;
export type ProvideWarrantListApiArg = {
  provideWarrantListRequest: ProvideWarrantListRequest;
};
export type GenerateWarrantOfArrestApiResponse =
  /** status 200 OK */ GenerateWarrantOfArrestResponse;
export type GenerateWarrantOfArrestApiArg = {
  generateWarrantOfArrestRequest: GenerateWarrantOfArrestRequest;
};
export type GenerateWarrantOfArrestRegisterApiResponse =
  /** status 200 OK */ GenerateWarrantOfArrestRegisterResponse;
export type GenerateWarrantOfArrestRegisterApiArg = {
  generateWarrantOfArrestRegisterRequest: GenerateWarrantOfArrestRegisterRequest;
};
export type FinalisePrintWarrantOfArrestApiResponse =
  /** status 200 OK */ FinalisePrintWarrantOfArrestResponse;
export type FinalisePrintWarrantOfArrestApiArg = {
  finalisePrintWarrantOfArrestRequest: FinalisePrintWarrantOfArrestRequest;
};
export type DeleteSignedWarrantOfArrestApiResponse =
  /** status 200 OK */ DeleteSignedWarrantOfArrestResponse;
export type DeleteSignedWarrantOfArrestApiArg = {
  deleteSignedWarrantOfArrestRequest: DeleteSignedWarrantOfArrestRequest;
};
export type ValidateIdApiResponse = /** status 200 OK */ ValidateIdResponse;
export type ValidateIdApiArg = {
  validateIdRequest: ValidateIdRequest;
};
export type UpdateWarrantRegisterHistoryApiResponse =
  /** status 200 OK */ UpdateTransgressionHistoryResponse;
export type UpdateWarrantRegisterHistoryApiArg = {
  updateTransgressionHistoryRequest: UpdateTransgressionHistoryRequest;
};
export type UpdateRegisterOfControlDocumentsHistoryApiResponse =
  /** status 200 OK */ UpdateTransgressionHistoryResponse;
export type UpdateRegisterOfControlDocumentsHistoryApiArg = {
  updateTransgressionHistoryRequest: UpdateTransgressionHistoryRequest;
};
export type UpdateCourtRegisterHistoryApiResponse =
  /** status 200 OK */ UpdateTransgressionHistoryResponse;
export type UpdateCourtRegisterHistoryApiArg = {
  updateTransgressionHistoryRequest: UpdateTransgressionHistoryRequest;
};
export type UpdateTransgressionStatusApiResponse = /** status 200 OK */
  | OverloadTransgression
  | RtqsTransgression
  | SpeedTransgression;
export type UpdateTransgressionStatusApiArg = {
  updateTransgressionStatusRequest: UpdateTransgressionStatusRequest;
};
export type UpdateRtqsTransgressionInformationApiResponse =
  /** status 200 OK */ UpdateRtqsTransgressionInformationResponse;
export type UpdateRtqsTransgressionInformationApiArg = {
  updateRtqsTransgressionInformationRequest: UpdateRtqsTransgressionInformationRequest;
};
export type UpdateOverloadTransgressionInformationApiResponse =
  /** status 200 OK */ UpdateOverloadTransgressionInformationResponse;
export type UpdateOverloadTransgressionInformationApiArg = {
  updateOverloadTransgressionInformationRequest: UpdateOverloadTransgressionInformationRequest;
};
export type RetrieveTransgressionDetailsApiResponse =
  /** status 200 OK */ RetrieveTransgressionDetailsResponse;
export type RetrieveTransgressionDetailsApiArg = {
  retrieveTransgressionDetailsRequest: RetrieveTransgressionDetailsRequest;
};
export type RetrieveRtqsTransgressionInformationApiResponse =
  /** status 200 OK */ RetrieveRtqsTransgressionInformationResponse;
export type RetrieveRtqsTransgressionInformationApiArg = {
  retrieveRtqsTransgressionInformationRequest: RetrieveRtqsTransgressionInformationRequest;
};
export type RetrieveOverloadTransgressionInformationApiResponse =
  /** status 200 OK */ RetrieveTransgressionInformationResponse;
export type RetrieveOverloadTransgressionInformationApiArg = {
  retrieveTransgressionInformationRequest: RetrieveTransgressionInformationRequest;
};
export type GenerateRtqsTransgressionApiResponse =
  /** status 200 OK */ GenerateRtqsTransgressionResponse;
export type GenerateRtqsTransgressionApiArg = {
  generateRtqsTransgressionRequest: GenerateRtqsTransgressionRequest;
};
export type GenerateOverloadTransgressionApiResponse =
  /** status 200 OK */ GenerateOverloadTransgressionResponse;
export type GenerateOverloadTransgressionApiArg = {
  generateOverloadTransgressionRequest: GenerateOverloadTransgressionRequest;
};
export type CancelTransgressionApiResponse =
  /** status 200 OK */ CancelTransgressionResponse;
export type CancelTransgressionApiArg = {
  cancelTransgressionRequest: CancelTransgressionRequest;
};
export type CancelRtqsTransgressionApiResponse =
  /** status 200 OK */ CancelRtqsTransgressionResponse;
export type CancelRtqsTransgressionApiArg = {
  cancelRtqsTransgressionRequest: CancelRtqsTransgressionRequest;
};
export type RedirectToFrontendApiResponse = unknown;
export type RedirectToFrontendApiArg = {
  noticeNumber: string;
};
export type UpdateSubmissionApiResponse =
  /** status 200 OK */ UpdateSubmissionResponse;
export type UpdateSubmissionApiArg = {
  updateSubmissionRequest: UpdateSubmissionRequest;
};
export type RetrieveSubmissionByNoticeNumberApiResponse =
  /** status 200 OK */ RetrieveSubmissionResponse;
export type RetrieveSubmissionByNoticeNumberApiArg = {
  retrieveSubmissionRequest: RetrieveSubmissionRequest;
};
export type RegisterSubmissionApiResponse =
  /** status 200 OK */ RegisterSubmissionResponse;
export type RegisterSubmissionApiArg = {
  registerSubmissionRequest: RegisterSubmissionRequest;
};
export type ProvideSubmissionSummaryApiResponse =
  /** status 200 OK */ ProvideSubmissionSummaryResponse;
export type ProvideSubmissionSummaryApiArg = {
  provideSubmissionSummaryRequest: ProvideSubmissionSummaryRequest;
};
export type ProvideSubmissionDetailsApiResponse =
  /** status 200 OK */ ProvideSubmissionResponse;
export type ProvideSubmissionDetailsApiArg = {
  provideSubmissionRequest: ProvideSubmissionRequest;
};
export type ProvideRenderedTransgressionDocumentsApiResponse =
  /** status 200 OK */ ProvideRenderedTransgressionDocumentResponse;
export type ProvideRenderedTransgressionDocumentsApiArg = {
  provideRenderedTransgressionDocumentRequest: ProvideRenderedTransgressionDocumentRequest;
};
export type ProvideRenderedChargeSheetApiResponse =
  /** status 200 OK */ ProvideRenderedChargeSheetResponse;
export type ProvideRenderedChargeSheetApiArg = {
  provideRenderedChargeSheetRequest: ProvideRenderedChargeSheetRequest;
};
export type ProsecuteTransgressionApiResponse =
  /** status 200 OK */ ProsecuteTransgressionResponse;
export type ProsecuteTransgressionApiArg = {
  sequenceNumber: number;
};
export type ConfirmTransgressionPaymentApiResponse =
  /** status 200 OK */ ConfirmTransgressionPaymentResponse;
export type ConfirmTransgressionPaymentApiArg = {
  confirmTransgressionPaymentRequest: ConfirmTransgressionPaymentRequest;
};
export type InitiatePaymentApiResponse =
  /** status 200 OK */ ProcessPaymentResponse;
export type InitiatePaymentApiArg = {
  processPaymentRequest: ProcessPaymentRequest;
};
export type FinalisePaymentApiResponse = unknown;
export type FinalisePaymentApiArg = {
  body: string;
};
export type AddNoticeBookApiResponse =
  /** status 200 OK */ AddNoticeBookResponse;
export type AddNoticeBookApiArg = {
  addNoticeBookRequest: AddNoticeBookRequest;
};
export type ProcessManualPaymentApiResponse =
  /** status 200 OK */ ProcessManualPaymentResponse;
export type ProcessManualPaymentApiArg = {
  processManualPaymentRequest: ProcessManualPaymentRequest;
};
export type SaveFileApiResponse = /** status 200 OK */ SaveFileResponse;
export type SaveFileApiArg = {
  saveFileRequest: SaveFileRequest;
};
export type InitiateDpoPaymentApiResponse =
  /** status 200 OK */ InitiateDpoPaymentResponse;
export type InitiateDpoPaymentApiArg = {
  initiateDpoPaymentRequest: InitiateDpoPaymentRequest;
};
export type FindDpoPaymentApiResponse =
  /** status 200 OK */ FindDpoPaymentResponse;
export type FindDpoPaymentApiArg = {
  findDpoPaymentRequest: FindDpoPaymentRequest;
};
export type GenerateCourtScheduleApiResponse =
  /** status 200 OK */ GenerateCourtScheduleResponse;
export type GenerateCourtScheduleApiArg = {
  generateCourtScheduleRequest: GenerateCourtScheduleRequest;
};
export type ProvideCourtResultApiResponse =
  /** status 200 OK */ ProvideCourtResultsResponse;
export type ProvideCourtResultApiArg = {
  provideCourtResultsRequest: ProvideCourtResultsRequest;
};
export type ProvideCourtResultSummaryApiResponse =
  /** status 200 OK */ ProvideCourtResultSummaryResponse;
export type ProvideCourtResultSummaryApiArg = {
  provideCourtResultSummaryRequest: ProvideCourtResultSummaryRequest;
};
export type ProvideCourtCaseListApiResponse =
  /** status 200 OK */ ProvideCourtCaseListResponse;
export type ProvideCourtCaseListApiArg = {
  provideCourtCaseListRequest: ProvideCourtCaseListRequest;
};
export type FinaliseCourtResultApiResponse =
  /** status 200 OK */ FinaliseCourtResultResponse;
export type FinaliseCourtResultApiArg = {
  finaliseCourtResultRequest: FinaliseCourtResultRequest;
};
export type CancelContemptOfCourtApiResponse =
  /** status 200 OK */ CancelContemptOfCourtResponse;
export type CancelContemptOfCourtApiArg = {
  cancelContemptOfCourtRequest: CancelContemptOfCourtRequest;
};
export type RetrieveTransgressionApiResponse =
  /** status 200 OK */ RetrieveTransgressionResponse;
export type RetrieveTransgressionApiArg = {
  retrieveTransgressionRequest: RetrieveTransgressionRequest;
};
export type InitialiseCourtDocumentsApiResponse =
  /** status 200 OK */ InitialiseCourtDocumentsResponse;
export type InitialiseCourtDocumentsApiArg = void;
export type FindCourtRegisterApiResponse =
  /** status 200 OK */ FindCourtRegisterResponse;
export type FindCourtRegisterApiArg = {
  findCourtRegisterRequest: FindCourtRegisterRequest;
};
export type FinaliseCourtRegisterApiResponse =
  /** status 200 OK */ FinaliseCourtRegisterResponse;
export type FinaliseCourtRegisterApiArg = {
  finaliseCourtRegisterRequest: FinaliseCourtRegisterRequest;
};
export type ProvideCourtApiResponse = /** status 200 OK */ ProvideCourtResponse;
export type ProvideCourtApiArg = {
  provideCourtRequest: ProvideCourtRequest;
};
export type FinaliseRegisterOfControlDocumentsApiResponse =
  /** status 200 OK */ FinaliseRegisterOfControlDocumentsResponse;
export type FinaliseRegisterOfControlDocumentsApiArg = {
  finaliseRegisterOfControlDocumentsRequest: FinaliseRegisterOfControlDocumentsRequest;
};
export type SearchChargeApiResponse =
  /** status 200 OK */ ProvideChargeResponse;
export type SearchChargeApiArg = {
  provideChargeRequest: ProvideChargeRequest;
};
export type ProvideSnapshotChargeApiResponse =
  /** status 200 OK */ ProvideSnapshotChargeResponse;
export type ProvideSnapshotChargeApiArg = {
  provideSnapshotChargeRequest: ProvideSnapshotChargeRequest;
};
export type AuthoriseSupervisorOverrideApiResponse =
  /** status 200 OK */ AuthoriseSupervisorOverrideResponse;
export type AuthoriseSupervisorOverrideApiArg = {
  authoriseSupervisorOverrideRequest: AuthoriseSupervisorOverrideRequest;
};
export type LoginApiResponse = /** status 200 OK */ LoginResponse;
export type LoginApiArg = {
  "X-Org"?: string;
  "X-Tnt"?: string;
  loginRequest: LoginRequest;
};
export type InitialiseVirtualPaymentApiResponse = /** status 200 OK */ string;
export type InitialiseVirtualPaymentApiArg = {
  initialiseVirtualPaymentRequest: InitialiseVirtualPaymentRequest;
};
export type StartNextAdjudicationApiResponse =
  /** status 200 OK */ StartNextAdjudicationResponse;
export type StartNextAdjudicationApiArg = {
  startNextAdjudicationRequest: StartNextAdjudicationRequest;
};
export type AllowAdjudicationApiResponse =
  /** status 200 OK */ SubmissionSummaryDto[];
export type AllowAdjudicationApiArg = {
  body: SubmissionSummaryDto[];
};
export type AdjudicateSubmissionApiResponse =
  /** status 200 OK */ AdjudicateSubmissionResponse;
export type AdjudicateSubmissionApiArg = {
  adjudicateSubmissionRequest: AdjudicateSubmissionRequest;
};
export type AbortAdjudicationApiResponse =
  /** status 200 OK */ AbortAdjudicationResponse;
export type AbortAdjudicationApiArg = {
  abortAdjudicationRequest: AbortAdjudicationRequest;
};
export type RequestNoticeNumberApiResponse =
  /** status 200 OK */ RequestNoticeNumberResponse;
export type RequestNoticeNumberApiArg = {
  requestNoticeNumberRequest: RequestNoticeNumberRequest;
};
export type ProvideAartoNoticeNumberApiResponse =
  /** status 200 OK */ AartoNoticeNumber[];
export type ProvideAartoNoticeNumberApiArg = {
  status: "AVAILABLE" | "USED";
  chargeCount: number;
};
export type GenerateNoticeNumbersApiResponse =
  /** status 200 OK */ GenerateNoticeNumberResponse;
export type GenerateNoticeNumbersApiArg = {
  generateNoticeNumberRequest: GenerateNoticeNumberRequest;
};
export type RetrieveTransgressionHistoryApiResponse =
  /** status 200 OK */ TransgressionHistory;
export type RetrieveTransgressionHistoryApiArg = {
  noticeNumber: string;
};
export type FindAllTransgressionEventsBySequencedNumberApiResponse =
  /** status 200 OK */ TransgressionHistoryProviderResponse;
export type FindAllTransgressionEventsBySequencedNumberApiArg = {
  sequenceNumber: string;
};
export type RetrieveRtqsTransgressionListApiResponse =
  /** status 200 OK */ PageRtqsTransgressionSummaryDto;
export type RetrieveRtqsTransgressionListApiArg = {
  plateNumber?: string;
  fromDate?: string;
  toDate?: string;
  status?:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  page: number;
  pageSize: number;
  sortDirection: "ASC" | "DESC";
  sortFields: string[];
};
export type RetrieveOverloadTransgressionListApiResponse =
  /** status 200 OK */ PageOverloadTransgressionSummaryDto;
export type RetrieveOverloadTransgressionListApiArg = {
  plateNumber?: string;
  fromDate?: string;
  toDate?: string;
  status?:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  page: number;
  pageSize: number;
  sortDirection: "ASC" | "DESC";
  sortFields: string[];
};
export type FindTransgressionStatusBySequenceNumberApiResponse =
  /** status 200 OK */ FindTransgressionStatusResponse;
export type FindTransgressionStatusBySequenceNumberApiArg = {
  sequenceNumber: number;
};
export type FindTransgressionStatusByNoticeNumberApiResponse =
  /** status 200 OK */ FindTransgressionStatusResponse;
export type FindTransgressionStatusByNoticeNumberApiArg = {
  noticeNumber: string;
};
export type FindTransgressionParameterApiResponse =
  /** status 200 OK */ TransgressionParameter;
export type FindTransgressionParameterApiArg = {
  name:
    | "ALLOW_ADJUDICATION_AFTER_COURT_DATE"
    | "ADJUDICATION_TIME_FENCE"
    | "ADJUDICATION_TIME_LIMIT"
    | "SUBMISSION_DEADLINE"
    | "DAYS_UNTIL_COURT_DATE"
    | "DAYS_UNTIL_PAYMENT_DUE_DATE"
    | "RESPONSIBLE_PERSON"
    | "WARRANT_OF_ARREST_GRACE_PERIOD"
    | "WARRANT_NUMBER_GENERATION"
    | "PAYMENT_BASE_URL"
    | "ALLOW_ARREST_CASE"
    | "ARREST_CASE_FINE_AMOUNT"
    | "ALLOW_ONLINE_PAYMENT"
    | "PRINT_OFFENDER_COPY"
    | "PRINT_CONTROL_COPY"
    | "PRINT_OFFICE_COPY_RED"
    | "PRINT_OFFICE_COPY_GREEN";
};
export type FindTransgressionConfigurationApiResponse =
  /** status 200 OK */ ProvideTransgressionConfigurationResponse;
export type FindTransgressionConfigurationApiArg = {
  authorityCode?: string;
  chargebookType?: "OVERLOAD" | "SPEED" | "RTQS";
};
export type FindSuccessfulPaymentApiResponse =
  /** status 200 OK */ FinaliseSuccessfulPaymentResponse;
export type FindSuccessfulPaymentApiArg = {
  noticeNumber: string;
  retryCount: number;
};
export type GetStatusApiResponse = /** status 200 OK */ ReplicationInfo;
export type GetStatusApiArg = {
  checkSum: string;
};
export type GetAboutReplicationApiResponse =
  /** status 200 OK */ ReplicationInfo;
export type GetAboutReplicationApiArg = void;
export type IsTransgressionPendingApiResponse = /** status 200 OK */ boolean;
export type IsTransgressionPendingApiArg = {
  sequenceNumber: number;
};
export type ProvidePaymentRequestApiResponse =
  /** status 200 OK */ ProvidePaymentReceiptResponse;
export type ProvidePaymentRequestApiArg = {
  receiptNumber: string;
};
export type FindPaymentByNoticeNumberApiResponse =
  /** status 200 OK */ TransgressionPayment[];
export type FindPaymentByNoticeNumberApiArg = {
  noticeNumber: string;
};
export type ValidateNoticeNumberApiResponse =
  /** status 200 OK */ ValidateNoticeNumberResponse;
export type ValidateNoticeNumberApiArg = {
  noticeNumber: string;
};
export type ProvideNoticeBookApiResponse =
  /** status 200 OK */ ProvideNoticeBookResponse;
export type ProvideNoticeBookApiArg = {
  authorityCode?: string;
  noticeBookNumber?: string;
  noticeBookType?: "SECTION_54" | "SECTION_56" | "SECTION_341" | "NOTICE_460";
  page: number;
  pageSize: number;
  sortDirection: "ASC" | "DESC";
  sortFields: string[];
};
export type ValidateTransgressionApiResponse =
  /** status 200 OK */ ValidateTransgressionStatusResponse;
export type ValidateTransgressionApiArg = {
  status: string;
  authorityCode: string;
};
export type FindLegislationApiResponse = /** status 200 OK */ Legislation;
export type FindLegislationApiArg = {
  id: number;
};
export type SearchLegislationApiResponse = /** status 200 OK */ PageLegislation;
export type SearchLegislationApiArg = {
  country: string;
  legislationType: "CPA" | "TTTFP" | "AARTO";
  page: number;
  pageSize: number;
  sortDirection: "ASC" | "DESC";
  sortFields: string[];
};
export type GetAboutApiResponse = /** status 200 OK */ Info;
export type GetAboutApiArg = void;
export type ProvideFileApiResponse = /** status 200 OK */ ProvideFileResponse;
export type ProvideFileApiArg = {
  fileId: string;
};
export type DeleteFileApiResponse = unknown;
export type DeleteFileApiArg = {
  fileId: string;
};
export type ProvideCurrencyCodeApiResponse =
  /** status 200 OK */ CurrencyProviderResponse;
export type ProvideCurrencyCodeApiArg = void;
export type ProvideCountryRegionApiResponse =
  /** status 200 OK */ ProvideCountryRegionResponse;
export type ProvideCountryRegionApiArg = {
  country?: string;
  region?: string;
};
export type FindChargeApiResponse = /** status 200 OK */
  | LoadChargeDto
  | RtqsChargeDto;
export type FindChargeApiArg = {
  id: number;
};
export type AllChargesApiResponse = /** status 200 OK */ (
  | LoadChargeDto
  | RtqsChargeDto
)[];
export type AllChargesApiArg = void;
export type AllAuthorityByAuthorityIdApiResponse =
  /** status 200 OK */ Authority;
export type AllAuthorityByAuthorityIdApiArg = {
  id: string;
};
export type AllAuthorityByAuthorityCodeApiResponse =
  /** status 200 OK */ Authority;
export type AllAuthorityByAuthorityCodeApiArg = {
  code: string;
};
export type AllAuthoritiesApiResponse = /** status 200 OK */ Authority[];
export type AllAuthoritiesApiArg = void;
export type InitialiseAdjudicationApiResponse =
  /** status 200 OK */ InitialiseAdjudicationResponse;
export type InitialiseAdjudicationApiArg = void;
export type RemovePendingProsecutionApiResponse = unknown;
export type RemovePendingProsecutionApiArg = {
  sequenceNumber: number;
};
export type DeleteNoticeBookApiResponse = unknown;
export type DeleteNoticeBookApiArg = {
  deleteNoticeBookRequest: DeleteNoticeBookRequest;
};
export type UpdateSubmissionStatusResponse = {
  updated: boolean;
};
export type UpdateSubmissionStatusRequest = {
  noticeNumber: string;
  newStatus:
    | "PENDING_ADJUDICATION"
    | "ADJUDICATED"
    | "REGISTERED"
    | "CANCELLED";
  adjudicationTime?: string;
  activeAdjudicator?: string;
  activeAdjudicationSessionId?: string;
};
export type UploadSignedWarrantOfArrestResponse = {
  signedWarrantCreated: boolean;
};
export type UploadSignedWarrantOfArrestRequest = {
  warrantNumber: string;
  file: string;
  filename: string;
};
export type UpdateWarrantOfArrestResponse = {
  warrantOfArrestUpdated: boolean;
};
export type UpdateWarrantOfArrestRequest = {
  noticeNumber: string;
};
export type WarrantOfArrestDocumentInformation = {
  unsignedWarrantDocumentId?: string;
  signedWarrantDocumentId?: string;
  warrantNumber: string;
};
export type ProvideWarrantOfArrestDocumentsResponse = {
  unsignedWarrantsOfArrestEncodedPdf?: string;
  file?: string;
  warrantOfArrestDocumentInformation: WarrantOfArrestDocumentInformation[];
};
export type ProvideWarrantOfArrestDocumentsRequest = {
  warrantNumbers: string[];
};
export type Money = {
  /** Currency code in ISO 4217 format */
  currency: string;
  amount: number;
};
export type NoticeNumber = {
  dateCreated: string;
  number: string;
  sequentialNumber: number;
  authorityCode: string;
  amount: Money;
};
export type Axle = {
  position?: number;
};
export type AxleUnit = {
  id?: number;
  wheelConfiguration: string;
  axles: Axle[];
  position: number;
  legalMass?: number;
};
export type Vehicle = {
  position?: number;
  vehicleType?: string;
  colour?: string;
  grossVehicleMass?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleUsage?: string;
  vehicleCategory?: string;
  plateNumber: string;
  vehicleIdentificationNumber?: string;
  cargo?: string;
  axleUnits?: AxleUnit[];
};
export type Identification = {
  primaryId?: boolean;
  number?: string;
  idType?:
    | "NATIONAL_ID"
    | "PASSPORT"
    | "DRIVING_LICENCE"
    | "TRIPS_LEGAL_ENTITY_IDENTIFIER"
    | "TRN";
  countryOfIssue?: string;
};
export type ContactNumber = {
  number?: string;
  dialingCode?: string;
  contactNumberType?: string;
};
export type Address = {
  addressType: string;
  country: string;
  lineOne: string;
  lineTwo?: string;
  lineThree?: string;
  code?: string;
  city: string;
};
export type Email = {
  emailAddress?: string;
  preferredEmail?: boolean;
  verified?: boolean;
};
export type Depot = {
  name: string;
  tripsDepotIdentifier?: string;
  physicalAddress?: Address;
  postalAddress?: Address;
  contactNumber?: ContactNumber;
  emails?: Email[];
};
export type Driver = {
  firstNames?: string;
  surname?: string;
  gender?: string;
  dateOfBirth?: string;
  identification?: Identification;
  contactNumber?: ContactNumber;
  depot?: Depot;
  trn?: string;
  licenceCode?: string;
  licenceNumber?: string;
  prDPCodes?: string[];
  prDPNumber?: string;
  countryOfIssue?: string;
  age?: string;
  residentialAddressLine1?: string;
  residentialAddressLine2?: string;
  residentialCity?: string;
  residentialPostalCode?: string;
  residentialCountry?: string;
  idCountryOfIssue?: string;
  occupation?: string;
};
export type SnapshotCharge = {
  chargeId: string;
  snapshotId: string;
  chargeCode: string;
  chargeTitle?: string;
  chargeShortDescription: string;
  chargeLongDescription?: string;
  chargeRegulation?: string;
  specificRegulation?: string;
  severity?: string;
  demeritPoints?: number;
  fineAmount: Money;
  discountAmount?: Money;
  plateNumber: string;
  type: string;
};
export type SnapshotLoadCharge = {
  type: "SnapshotLoadCharge";
} & SnapshotCharge & {
    vehicleCategory?: string;
    vehicleType?: string;
    combinationVehicle?: boolean;
    vehicleUsage?: string;
    articulatedVehicle?: boolean;
    axleUnit?: boolean;
    numberOfAxles?: string;
    tyreType?: string;
    numberOfTyres?: string;
    permissible?: number;
    minValue: number;
    maxValue: number;
    chargeCategory:
      | "AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "AXLE_UNIT_STANDARD_TIRES_PERMISSIBLE_WEIGH_TEST"
      | "MANUFACTURER_PLATE_PERMISSIBLE_WEIGH_TEST"
      | "STEERING_AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "SUM_OF_PERMISSIBLES_WEIGH_TEST"
      | "MAXIMUM_MASS_WEIGH_TEST"
      | "STEERING_AXLE_UNDERLOAD_WEIGH_TEST"
      | "DRIVING_AXLE_WEIGH_TEST"
      | "ENGINE_POWER_WEIGH_TEST"
      | "GVM_WEIGH_TEST"
      | "GCM_WEIGH_TEST"
      | "BRIDGE_FORMULA_WEIGH_TEST";
  };
export type SnapshotRtqsCharge = {
  type: "SnapshotRtqsCharge";
} & SnapshotCharge & {
    alternativeCharge: boolean;
    mainChargeCode?: string;
    allowedHeight?: number;
    vehicleHeight?: number;
    overHeight?: number;
    numberOfLamps?: number;
    roadTravelledOn?: string;
    numberOfTyres?: number;
    lengthOfVehicle?: number;
    numberOfPersons?: number;
    numberOfPanels?: number;
  };
export type SnapshotSpeedCharge = {
  type: "SnapshotSpeedCharge";
} & SnapshotCharge & {
    speedFrom: number;
    speedTo: number;
    speedLimit: number;
  };
export type Transgression = {
  status:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  transgressionDate: string;
  transgressionLocation: string;
  transgressionVersion: number;
  gpsYCoordinate?: string;
  gpsXCoordinate?: string;
  authorityCode: string;
  noticeNumber: NoticeNumber;
  vehicle: Vehicle;
  driver?: Driver;
  road?: string;
  courtAppearanceDate?: string;
  courtName?: string;
  courtNumber?: string;
  courtCode?: string;
  totalAmountPayable: Money;
  contemptOfCourtFee?: Money;
  locality?: string;
  snapshotCharges: (
    | SnapshotLoadCharge
    | SnapshotRtqsCharge
    | SnapshotSpeedCharge
  )[];
  type: string;
};
export type Operator = {
  name?: string;
  businessAddressLine1?: string;
  businessAddressLine2?: string;
  businessPostalCode?: string;
  businessCity?: string;
  businessCountry?: string;
  operatorDiscNumber?: string;
  depots?: Depot[];
};
export type Route = {
  cargo?: string;
  destinationOfCargo?: string;
  originOfCargo?: string;
};
export type AxleUnitMass = {
  mass: number;
  position: number;
  legalMass?: number;
  overload: "OK" | "WARNING_OVERLOAD";
};
export type VehicleMassMeasurement = {
  axleConfiguration?: number;
  actualMass: number;
  legalMass?: number;
  overloadMassValue?: number;
  axleUnitMasses: AxleUnitMass[];
};
export type OverloadTransgression = {
  type: "OverloadTransgression";
} & Transgression & {
    dialingCode?: string;
    contactNumber?: string;
    contactNumberType?: string;
    emailAddress?: string;
    officerId?: string;
    officerName?: string;
    officerSurname?: string;
    issuingAuthority?: string;
    paymentDueDate?: string;
    paymentReference?: string;
    policeStationDistrict?: string;
    policeStationName?: string;
    noOfPeaceOfficer?: string;
    privateBag?: string;
    town?: string;
    postalCode?: string;
    sequenceNumber: number;
    operator?: Operator;
    route?: Route;
    vehicleMassMeasurement?: VehicleMassMeasurement;
  };
export type RtqsTransgression = {
  type: "RtqsTransgression";
} & Transgression & {
    dialingCode?: string;
    contactNumber?: string;
    contactNumberType?: string;
    emailAddress?: string;
    officerId?: string;
    officerName?: string;
    officerSurname?: string;
    issuingAuthority?: string;
    paymentDueDate?: string;
    paymentReference?: string;
    policeStationDistrict?: string;
    policeStationName?: string;
    noOfPeaceOfficer?: string;
    privateBag?: string;
    town?: string;
    postalCode?: string;
    operator?: Operator;
    route?: Route;
  };
export type SpeedTransgression = {
  type: "SpeedTransgression";
} & Transgression;
export type WarrantNumber = {
  number: string;
  sequentialNumber: number;
  dateCreated: string;
  authorityCode: string;
};
export type ScannedWarrantOfArrest = {
  signedWarrantDocumentId: string;
  active: boolean;
  filename: string;
};
export type WarrantOfArrest = {
  caseNumber: string;
  summonsNumber?: string;
  transgression: OverloadTransgression | RtqsTransgression | SpeedTransgression;
  districtCode: string;
  districtName: string;
  contemptOfCourtFee: Money;
  warrantNumber?: WarrantNumber;
  capturedWarrantNumber?: string;
  withdrawn: boolean;
  scannedWarrantsOfArrest?: ScannedWarrantOfArrest[];
  warrantNumberProvided?: boolean;
};
export type ProvideWarrantOfArrestResponse = {
  warrantsOfArrest?: WarrantOfArrest[];
};
export type NoticeNumberDto = {
  dateCreated: string;
  number: string;
  sequentialNumber: number;
  authorityCode: string;
  amount: Money;
};
export type VehicleDto = {
  position?: number;
  vehicleType?: string;
  colour?: string;
  grossVehicleMass?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleUsage?: string;
  vehicleCategory?: string;
  plateNumber: string;
  vehicleIdentificationNumber?: string;
  cargo?: string;
  axleUnits?: AxleUnit[];
};
export type DriverDto = {
  firstNames?: string;
  surname?: string;
  gender?: string;
  dateOfBirth?: string;
  identification?: Identification;
  contactNumber?: ContactNumber;
  depot?: Depot;
  trn?: string;
  licenceCode?: string;
  licenceNumber?: string;
  prDPCodes?: string[];
  prDPNumber?: string;
  countryOfIssue?: string;
  age?: string;
  residentialAddressLine1?: string;
  residentialAddressLine2?: string;
  residentialCity?: string;
  residentialPostalCode?: string;
  residentialCountry?: string;
  idCountryOfIssue?: string;
  occupation?: string;
};
export type TransgressionDto = {
  status:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  transgressionDate: string;
  transgressionLocation: string;
  transgressionVersion: number;
  gpsYCoordinate?: string;
  gpsXCoordinate?: string;
  authorityCode: string;
  noticeNumber: NoticeNumberDto;
  vehicle: VehicleDto;
  driver?: DriverDto;
  road?: string;
  courtAppearanceDate?: string;
  courtName?: string;
  courtNumber?: string;
  courtCode?: string;
  totalAmountPayable: Money;
  contemptOfCourtFee?: Money;
  locality?: string;
  snapshotCharges: (
    | SnapshotLoadCharge
    | SnapshotRtqsCharge
    | SnapshotSpeedCharge
  )[];
  type: string;
};
export type OverloadTransgressionDto = {
  type: "OverloadTransgressionDto";
} & TransgressionDto & {
    dialingCode?: string;
    contactNumber?: string;
    contactNumberType?: string;
    emailAddress?: string;
    officerId?: string;
    officerName?: string;
    officerSurname?: string;
    issuingAuthority?: string;
    paymentDueDate?: string;
    paymentReference?: string;
    policeStationName?: string;
    policeStationDistrict?: string;
    noOfPeaceOfficer?: string;
    privateBag?: string;
    town?: string;
    postalCode?: string;
    sequenceNumber: number;
    operator?: Operator;
    route?: Route;
    vehicleMassMeasurement?: VehicleMassMeasurement;
  };
export type RtqsTransgressionDto = {
  type: "RtqsTransgressionDto";
} & TransgressionDto & {
    dialingCode?: string;
    contactNumber?: string;
    contactNumberType?: string;
    emailAddress?: string;
    officerId?: string;
    officerName?: string;
    officerSurname?: string;
    issuingAuthority?: string;
    paymentDueDate?: string;
    paymentReference?: string;
    policeStationName?: string;
    policeStationDistrict?: string;
    noOfPeaceOfficer?: string;
    privateBag?: string;
    town?: string;
    postalCode?: string;
    operator?: Operator;
    route?: Route;
  };
export type ProvideWarrantListResponse = {
  transgressions?: (OverloadTransgressionDto | RtqsTransgressionDto)[];
};
export type ProvideWarrantListRequest = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
};
export type GenerateWarrantOfArrestResponse = {
  warrantNumbers: string[];
};
export type GenerateWarrantOfArrestRequest = {
  warrantNumber: string[];
};
export type GenerateWarrantOfArrestRegisterResponse = {
  encodedPdf?: string;
  noticeNumbers?: string[];
};
export type GenerateWarrantOfArrestRegisterRequest = {
  authorityCode: string;
  courtDate: string;
  courtName: string;
  courtRoom: string;
  noticeNumbers?: string[];
};
export type FinalisePrintWarrantOfArrestResponse = {
  warrantsPrinted: boolean;
};
export type FinalisePrintWarrantOfArrestRequest = {
  warrantOfArrestDocumentInformation: WarrantOfArrestDocumentInformation[];
};
export type DeleteSignedWarrantOfArrestResponse = {
  signedWarrantOfArrestDeleted: boolean;
};
export type DeleteSignedWarrantOfArrestRequest = {
  supervisorUsername: string;
  warrantNumber: string;
};
export type ValidateIdResponse = {
  valid?: boolean;
  elaboration?: string[];
};
export type ValidateIdRequest = {
  idType:
    | "NATIONAL_ID"
    | "PASSPORT"
    | "DRIVING_LICENCE"
    | "TRIPS_LEGAL_ENTITY_IDENTIFIER"
    | "TRN";
  idNumber: string;
  countryOfIssue: string;
};
export type UpdateTransgressionHistoryResponse = {
  transgressionHistoryUpdated: boolean;
};
export type UpdateTransgressionHistoryRequest = {
  documentType:
    | "COURT_REGISTER"
    | "REGISTER_OF_CONTROL_DOCUMENTS"
    | "WARRANT_OF_ARREST_REGISTER"
    | "WARRANT_OF_ARREST"
    | "OFFICER_CONTROL_REGISTER"
    | "COURT_SCHEDULE";
  noticeNumbers?: string[];
};
export type UpdateTransgressionStatusRequest = {
  noticeNumber: string;
  newStatus?:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  amountPaid?: Money;
  documentTypes?: (
    | "OFFENDER_COPY"
    | "OFFICE_COPY_RED"
    | "OFFICE_COPY_GREEN"
    | "CONTROL_COPY"
    | "CHARGE_SHEET"
    | "PAYMENT_RECEIPT"
    | "PAYMENT_DISCREPANCY_RECEIPT"
  )[];
};
export type UpdateRtqsTransgressionInformationResponse = {
  transgression: RtqsTransgression;
};
export type LegislationDto = {
  legislationId: string;
  legislationType: "CPA" | "TTTFP" | "AARTO";
  country: string;
  maximumAllowableCharges: number;
  active: boolean;
};
export type ChargebookDto = {
  chargebookId: string;
  authorityCodes?: string[];
  chargebookType: "OVERLOAD" | "SPEED" | "RTQS";
  startDate: string;
  expiryDate?: string;
  active: boolean;
  defaultChargebook: boolean;
  legislation: LegislationDto;
};
export type ChargeDto = {
  chargeId: string;
  chargeCode: string;
  chargeTitle?: string;
  chargeShortDescription: string;
  chargeLongDescription?: string;
  chargeRegulation?: string;
  specificRegulation?: string;
  severity?: string;
  demeritPoints?: number;
  fineAmount: Money;
  discountAmount?: Money;
  chargebook: ChargebookDto;
  type: string;
};
export type RtqsChargeDto = {
  type: "RtqsChargeDto";
} & ChargeDto & {
    chargeType?:
      | "LAMP"
      | "HEIGHT"
      | "ROAD"
      | "TYRE"
      | "LENGTH"
      | "PERSON"
      | "PANEL"
      | "ROAD_PANEL";
  };
export type RtqsChargeCompilationDto = {
  charge: RtqsChargeDto;
  plateNumber?: string;
  isAlternative?: boolean;
  linkedToChargeCode?: string;
  allowedHeight?: number;
  vehicleHeight?: number;
  numberOfLamps?: number;
  roadTravelledOn?: string;
  numberOfTyres?: number;
  lengthOfVehicle?: number;
  numberOfPersons?: number;
  numberOfPanels?: number;
};
export type UpdateRtqsTransgressionInformationRequest = {
  supervisorUsername?: string;
  operatorDetails: boolean;
  vehicleDetails: boolean;
  driverDetails: boolean;
  residentialAddressDetails: boolean;
  businessAddressDetails: boolean;
  chargeDetails: boolean;
  transgression: RtqsTransgression;
  rawCharges?: RtqsChargeCompilationDto[];
  allowArrestCase: boolean;
  arrestCaseFineAmount: Money;
};
export type UpdateOverloadTransgressionInformationResponse = {
  transgression: OverloadTransgression;
};
export type UpdateOverloadTransgressionInformationRequest = {
  transgression: OverloadTransgression;
  operatorDetails: boolean;
  vehicleDetails: boolean;
  driverDetails: boolean;
  residentialAddressDetails: boolean;
  businessAddressDetails: boolean;
  supervisorUsername?: string;
};
export type RetrieveTransgressionDetailsResponse = {
  transgression?: OverloadTransgressionDto | RtqsTransgressionDto;
};
export type RetrieveTransgressionDetailsRequest = {
  noticeNumber: string;
  transgressionVersion?: number;
};
export type Legislation = {
  legislationId: string;
  legislationType: "CPA" | "TTTFP" | "AARTO";
  country: string;
  maximumAllowableCharges: number;
  active: boolean;
};
export type Chargebook = {
  chargebookId: string;
  authorityCodes?: string[];
  chargebookType: "OVERLOAD" | "SPEED" | "RTQS";
  startDate: string;
  expiryDate?: string;
  active: boolean;
  defaultChargebook: boolean;
  legislation: Legislation;
};
export type Charge = {
  chargeId: string;
  chargeCode: string;
  chargeTitle?: string;
  chargeShortDescription: string;
  chargeLongDescription?: string;
  chargeRegulation?: string;
  specificRegulation?: string;
  severity?: string;
  demeritPoints?: number;
  fineAmount: Money;
  discountAmount?: Money;
  chargebook: Chargebook;
  type: string;
};
export type LoadCharge = {
  type: "LoadCharge";
} & Charge & {
    vehicleCategory?: string;
    vehicleType?: string;
    combinationVehicle?: boolean;
    vehicleUsage?: string;
    articulatedVehicle?: boolean;
    axleUnit?: boolean;
    numberOfAxles?: string;
    tyreType?: string;
    numberOfTyres?: string;
    permissible?: number;
    minValue: number;
    maxValue: number;
    chargeCategory:
      | "AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "AXLE_UNIT_STANDARD_TIRES_PERMISSIBLE_WEIGH_TEST"
      | "MANUFACTURER_PLATE_PERMISSIBLE_WEIGH_TEST"
      | "STEERING_AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "SUM_OF_PERMISSIBLES_WEIGH_TEST"
      | "MAXIMUM_MASS_WEIGH_TEST"
      | "STEERING_AXLE_UNDERLOAD_WEIGH_TEST"
      | "DRIVING_AXLE_WEIGH_TEST"
      | "ENGINE_POWER_WEIGH_TEST"
      | "GVM_WEIGH_TEST"
      | "GCM_WEIGH_TEST"
      | "BRIDGE_FORMULA_WEIGH_TEST";
  };
export type RtqsCharge = {
  type: "RtqsCharge";
} & Charge & {
    chargeType?:
      | "LAMP"
      | "HEIGHT"
      | "ROAD"
      | "TYRE"
      | "LENGTH"
      | "PERSON"
      | "PANEL"
      | "ROAD_PANEL";
  };
export type SpeedCharge = {
  type: "SpeedCharge";
} & Charge & {
    speedFrom: number;
    speedTo: number;
    speedLimit: number;
  };
export type TransgressionConfiguration = {
  legislationType: "CPA" | "TTTFP" | "AARTO";
  country: string;
  vehicleMake: boolean;
  vehicleModel: boolean;
  tripsDepotIdentifier: boolean;
  operatorName: boolean;
  operatorDiscNumber: boolean;
  emailAddress: boolean;
  contactNumber: boolean;
  contactNumberType: boolean;
  licenceCode: boolean;
  licenceNumber: boolean;
  prDPCode: boolean;
  prDPNumber: boolean;
  idCountryOfIssue: boolean;
  residentialAddressLine1: boolean;
  residentialAddressLine2: boolean;
  residentialCity: boolean;
  residentialCountry: boolean;
  residentialPostalCode: boolean;
  businessAddressLine1: boolean;
  businessAddressLine2: boolean;
  businessCity: boolean;
  businessCountry: boolean;
  businessPostalCode: boolean;
  occupation: boolean;
  depotName: boolean;
  colour: boolean;
  origin: boolean;
  destination: boolean;
  driverName: boolean;
  driverSurname: boolean;
  identificationType: boolean;
  identificationNumber: boolean;
  dateOfBirth: boolean;
  gender: boolean;
  trn: boolean;
  licenceCountryOfIssue: boolean;
  cargo: boolean;
  vehicleType: boolean;
  steeringAxleUnderloadRangeType: "PERCENTAGE" | "MASS";
  displayOptionalFields: boolean;
};
export type Authority = {
  authorityId: string;
  authorityCode: string;
  authorityName: string;
  physical?: Address;
  postal?: Address;
  locality?: string;
  region?: string;
};
export type UserRole = {
  role:
    | "ROLE_CORE_SUBSYSTEM"
    | "ROLE_WEIGH_SUBSYSTEM"
    | "ROLE_REPORTS_SUBSYSTEM"
    | "ROLE_TRANSGRESSIONS_SUBSYSTEM"
    | "ROLE_LOOKUP_PAGE"
    | "ROLE_PERSON_PAGE"
    | "ROLE_USERACCOUNT_PAGE"
    | "ROLE_OFFICER_PAGE"
    | "ROLE_SYSTEMPARAMETER_PAGE"
    | "ROLE_AUTHORITY_PAGE"
    | "ROLE_REPORT_PAGE"
    | "ROLE_PRESTART_PAGE"
    | "ROLE_WEIGH_PAGE"
    | "ROLE_AUTHORITY_MAINTAIN"
    | "ROLE_AUTHORITY_VIEW"
    | "ROLE_CHARGE_MAINTAIN"
    | "ROLE_CHARGE_VIEW"
    | "ROLE_LEGISLATION_MAINTAIN"
    | "ROLE_LEGISLATION_VIEW"
    | "ROLE_LOOKUP_MAINTAIN"
    | "ROLE_LOOKUP_VIEW"
    | "ROLE_OFFICER_MAINTAIN"
    | "ROLE_OFFICER_VIEW"
    | "ROLE_PERSON_MAINTAIN"
    | "ROLE_PERSON_VIEW"
    | "ROLE_SYSTEMPARAMETER_MAINTAIN"
    | "ROLE_SYSTEMPARAMETER_VIEW"
    | "ROLE_TRAFFICCONTROLCENTRE_MAINTAIN"
    | "ROLE_TRAFFICCONTROLCENTRE_VIEW"
    | "ROLE_USERACCOUNT_MAINTAIN"
    | "ROLE_USERACCOUNT_VIEW"
    | "ROLE_USERGROUP_MAINTAIN"
    | "ROLE_USERGROUP_VIEW"
    | "ROLE_WEIGHTESTSREQUIREDPARAMETER_MAINTAIN"
    | "ROLE_WEIGHTESTSREQUIREDPARAMETER_VIEW"
    | "ROLE_ADMITVEHICLE_MAINTAIN"
    | "ROLE_CONTROLCENTREVISITSTATUS_MAINTAIN"
    | "ROLE_AUTHORISEDSPECIALRELEASE_MAINTAIN"
    | "ROLE_CONTROLCENTREVISIT_VIEW"
    | "ROLE_DOCUMENTSGENERATION_MAINTAIN"
    | "ROLE_CANCELPRECAPTURE_MAINTAIN"
    | "ROLE_PRECAPTUREINFORMATION_MAINTAIN"
    | "ROLE_PRECAPTUREINFORMATION_VIEW"
    | "ROLE_RENDEREDWEIGHDOCUMENT_MAINTAIN"
    | "ROLE_VEHICLEWEIGH_MAINTAIN"
    | "ROLE_WEIGHRECORD_MAINTAIN"
    | "ROLE_WEIGHRECORD_VIEW"
    | "ROLE_PERFORMWEIGHTEST_MAINTAIN"
    | "ROLE_PERFORMWEIGHRETEST_MAINTAIN"
    | "ROLE_USERACCOUNTAUTHORISATION_MAINTAIN"
    | "ROLE_SPECIALRELEASE_MAINTAIN"
    | "ROLE_UPDATEVEHICLEWEIGH_MAINTAIN"
    | "ROLE_HOLDINGYARDWEIGHTESTSREQUIREDPARAMETER_VIEW"
    | "ROLE_HOLDINGYARDVEHICLEREQUIREDINFORMATION_VIEW"
    | "ROLE_CONTROLCENTREVISITSTATUS_VIEW"
    | "ROLE_WEIGHTESTPARAMETERS_VIEW"
    | "ROLE_WEIGHTESTREQUIREDPARAMETERCONFIG_VIEW"
    | "ROLE_PRECAPTURECONFIG_VIEW"
    | "ROLE_RELATIONSHIP_VIEW"
    | "ROLE_IDENTITYTYPE_VIEW"
    | "ROLE_AUTHORISEDSPECIALRELEASE_AUTHORISE"
    | "ROLE_STATICSCALE_MAINTAIN"
    | "ROLE_STATICSCALE_VIEW"
    | "ROLE_ABNORMALPERMIT_AUTHORISE"
    | "ROLE_ABNORMALPERMIT_MAINTAIN"
    | "ROLE_TRANSGRESSIONDETAILS_VIEW"
    | "ROLE_TRANSGRESSIONSTATUS_VIEW"
    | "ROLE_RELIEFVEHICLE_MAINTAIN"
    | "ROLE_RELIEFVEHICLE_WIEW"
    | "ROLE_HOLDINGYARDINFORMATION_AUTHORISE"
    | "ROLE_CONTROLCENTREVISITSTATUS_AUTHORISE"
    | "ROLE_PERFORMCORRECTIONS_MAINTAIN"
    | "ROLE_HOLDINGYARDINFORMATION_MAINTAIN"
    | "ROLE_UPDATE_VEHICLE_CONFIGURATION_MAINTAIN"
    | "ROLE_MANUALPAYMENT_MAINTAIN"
    | "ROLE_MANUALPAYMENT_VIEW"
    | "ROLE_TRANSGRESSIONCONFIGURATION_VIEW"
    | "ROLE_WEIGHBRIDGEPARAMETER_MAINTAIN"
    | "ROLE_WEIGHBRIDGEPARAMETER_VIEW"
    | "ROLE_CANCELTRANSGRESSION_OVERRIDE"
    | "ROLE_CORRECTARRESTCASE_OVERRIDE"
    | "ROLE_UPDATETRANSGRESSION_OVERRIDE"
    | "ROLE_CANCELCONTEMPTOFCOURT_OVERRIDE"
    | "ROLE_DELETESIGNEDWARRANTOFARREST_OVERRIDE"
    | "ROLE_CANCELRTQSTRANSGRESSION_OVERRIDE"
    | "ROLE_WIMRECORD_VIEW"
    | "ROLE_REPORT_VIEW"
    | "ROLE_REPORT_MAINTAIN"
    | "ROLE_COUNTRYREGION_VIEW"
    | "ROLE_AARTONOTICENUMBER_MAINTAIN"
    | "ROLE_NOTICEBOOK_VIEW"
    | "ROLE_NOTICEBOOK_MAINTAIN"
    | "ROLE_MANUALLINK_MAINTAIN"
    | "ROLE_UNLINK_MAINTAIN"
    | "ROLE_ADJUDICATION_MAINTAIN"
    | "ROLE_ADJUDICATIONALLOWANCE_MAINTAIN"
    | "ROLE_CANCELTRANSGRESSION_MAINTAIN"
    | "ROLE_COURT_VIEW"
    | "ROLE_REGISTERSUBMISSION_MAINTAIN"
    | "ROLE_REGISTERSUBMISSION_VIEW"
    | "ROLE_RENDEREDCHARGESHEETDOCUMENT_VIEW"
    | "ROLE_RENDEREDTRANSGRESSIONDOCUMENT_MAINTAIN"
    | "ROLE_RENDEREDTRANSGRESSIONDOCUMENT_VIEW"
    | "ROLE_UPDATESUBMISSIONSTATUS_MAINTAIN"
    | "ROLE_SUBMISSIONDETAILS_VIEW"
    | "ROLE_SUBMISSION_VIEW"
    | "ROLE_TRANSGRESSIONHISTORY_VIEW"
    | "ROLE_TRANSGRESSIONPRINTING_MAINTAIN"
    | "ROLE_TRANSGRESSION_MAINTAIN"
    | "ROLE_TRANSGRESSION_VIEW"
    | "ROLE_RTQSTRANSGRESSION_MAINTAIN"
    | "ROLE_RTQSTRANSGRESSION_VIEW"
    | "ROLE_UPDATEOVERLOADTRANSGRESSIONINFORMATION_MAINTAIN"
    | "ROLE_UPDATEVEHICLEWEIGHDETAILS_MAINTAIN"
    | "ROLE_VALIDATEID_MAINTAIN"
    | "ROLE_TRANSGRESSIONPARAMETER_VIEW"
    | "ROLE_COURTREGISTER_MAINTAIN"
    | "ROLE_TRANSGRESSIONSTATUS_MAINTAIN"
    | "ROLE_COURTRESULT_VIEW"
    | "ROLE_COURTRESULT_MAINTAIN"
    | "ROLE_CANCELCONTEMPTOFCOURT_MAINTAIN"
    | "ROLE_WARRANTOFARREST_MAINTAIN"
    | "ROLE_WARRANTOFARREST_VIEW"
    | "ROLE_WARRANTOFARRESTREGISTER_MAINTAIN"
    | "ROLE_WARRANTOFARRESTREGISTER_VIEW"
    | "ROLE_PRINTWARRANTOFARRESTDOCUMENTS_MAINTAIN"
    | "ROLE_UPDATESUBMISSION_MAINTAIN"
    | "ROLE_COURTREGISTERHISTORY_MAINTAIN"
    | "ROLE_REGISTEROFCONTROLDOCUMENTSHISTORY_MAINTAIN"
    | "ROLE_WARRANTREGISTERHISTORY_MAINTAIN"
    | "ROLE_REGISTEROFCONTROLDOCUMENTS_MAINTAIN"
    | "ROLE_UPDATERTQSTRANSGRESSIONINFORMATION_MAINTAIN"
    | "ROLE_CANCELRTQSTRANSGRESSION_MAINTAIN"
    | "ROLE_COURTSCHEDULE_MAINTAIN";
  enabled: boolean;
  description: string;
  activationDate?: string;
  expirationDate?: string;
};
export type UserGroup = {
  userGroupName: string;
  userGroupDescription: string;
  userRoles?: UserRole[];
  userGroupTypes?: ("CENTRAL" | "WEIGHSTATION" | "TCM")[];
};
export type UserAccountGroup = {
  authority?: Authority;
  userGroup?: UserGroup;
};
export type UserAccount = {
  userAccountId: string;
  username: string;
  isActive: boolean;
  firstName?: string;
  surname: string;
  userAccountGroups?: UserAccountGroup[];
};
export type RetrieveRtqsTransgressionInformationResponse = {
  transgressionDate: string;
  captureDate: string;
  allowArrestCase: boolean;
  arrestCaseFineAmount?: Money;
  charges: (LoadCharge | RtqsCharge | SpeedCharge)[];
  transgressionConfiguration: TransgressionConfiguration;
  userAccount: UserAccount;
};
export type RetrieveRtqsTransgressionInformationRequest = {
  authorityCode: string;
};
export type ControlCentreVisit = {
  id?: number;
  authorityId: string;
  sequenceNumber: number;
  vehicleStatus:
    | "PreCapture"
    | "HoldingYard"
    | "Released"
    | "CorrectionPending"
    | "Escaped"
    | "CancellationPending"
    | "WeighCancelled"
    | "AuthorisedSpecialRelease"
    | "SpecialRelease"
    | "Corrected"
    | "Cancelled";
  weighbridgeId: string;
  weighCategory?: "NormalWeigh" | "TareWeigh" | "Other";
  tripsCCVId?: string;
};
export type VehicleConfiguration = {
  articulatedVehicle?: boolean;
  combinationVehicle?: boolean;
  grossCombinationMass?: number;
  vehicleIdentificationNumber?: string;
  vehicles: Vehicle[];
  netPower?: number;
  axleConfiguration?: number;
};
export type ChargeIndexDescription = {
  chargeLongDescription: string;
};
export type VehicleChargeDto = {
  plateNumber: string;
  chargeCode: string;
  overloadMassPercentage?: number;
  overloadMassValue?: number;
  actualMass?: number;
  permissible?: number;
  chargeIndexDescription?: ChargeIndexDescription;
};
export type MassMeasurement = {
  mass: number;
  axleUnit?: AxleUnit;
};
export type RetrieveTransgressionInformationResponse = {
  transgressionDate: string;
  captureDate: string;
  arrestCase?: boolean;
  controlCentreVisit?: ControlCentreVisit;
  vehicleConfiguration?: VehicleConfiguration;
  route?: Route;
  driver?: Driver;
  operator?: Operator;
  charges: (LoadCharge | RtqsCharge | SpeedCharge)[];
  transgressionConfiguration: TransgressionConfiguration;
  userAccount: UserAccount;
  vehicleCharges: VehicleChargeDto[];
  massMeasurements?: MassMeasurement[];
};
export type RetrieveTransgressionInformationRequest = {
  sequenceNumber: number;
};
export type GenerateRtqsTransgressionResponse = {
  noticeNumber: string;
};
export type GenerateRtqsTransgressionRequest = {
  allowArrestCase: boolean;
  arrestCaseFineAmount: Money;
  authorityCode: string;
  weighbridgeId: string;
  charges: RtqsChargeCompilationDto[];
  driver?: Driver;
  route?: Route;
  operator?: Operator;
  vehicle: Vehicle;
};
export type GenerateOverloadTransgressionResponse = {
  noticeNumber: string;
};
export type GenerateOverloadTransgressionRequest = {
  vehicleModel?: string;
  tripsDepotIdentifier?: string;
  depotName?: string;
  operatorName?: string;
  operatorDiscNumber?: string;
  emailAddress?: string;
  contactNumber?: string;
  contactNumberType?: string;
  dialingCode?: string;
  licenceCode?: string;
  licenceNumber?: string;
  prDPCodes?: string[];
  prDPNumber?: string;
  countryOfIssue?: string;
  residentialAddressLine1?: string;
  businessAddressLine2?: string;
  businessCity?: string;
  businessCountry?: string;
  businessPostalCode?: string;
  occupation?: string;
  officerId?: string;
  officerName?: string;
  officerSurname?: string;
  sequenceNumber?: number;
  residentialAddressLine2?: string;
  residentialCity?: string;
  residentialCountry?: string;
  residentialPostalCode?: string;
  businessAddressLine1?: string;
  cargo?: string;
  identificationNumber?: string;
  identificationType?:
    | "NATIONAL_ID"
    | "PASSPORT"
    | "DRIVING_LICENCE"
    | "TRIPS_LEGAL_ENTITY_IDENTIFIER"
    | "TRN";
  idCountryOfIssue?: string;
  arrestCase: boolean;
  controlCentreVisit: ControlCentreVisit;
  vehicleConfiguration?: VehicleConfiguration;
  route?: Route;
  driver?: Driver;
  operator?: Operator;
  charges: LoadCharge[];
  vehicleCharges: VehicleChargeDto[];
  massMeasurements?: MassMeasurement[];
};
export type CancelTransgressionResponse = {
  cancelled?: boolean;
};
export type CancelTransgressionRequest = {
  supervisorUsername: string;
  supervisorPassword: string;
  noticeNumber: string;
  sequenceNumber: number;
  authorityCode: string;
  newPlateNumber?: string;
  reasons: string[];
};
export type CancelRtqsTransgressionResponse = {
  cancelled?: boolean;
};
export type CancelRtqsTransgressionRequest = {
  supervisorUsername: string;
  supervisorPassword: string;
  noticeNumber: string;
  reasons: string[];
};
export type UpdateSubmissionResponse = {
  submissionUpdated: boolean;
};
export type UpdateSubmissionRequest = {
  noticeNumber: string;
};
export type SubmissionOutcomeDto = {
  submissionResult:
    | "WITHDRAWN"
    | "DECLINED"
    | "ALTERNATIVE_CHARGE"
    | "DISCOUNTED";
  snapshotCharge?:
    | SnapshotLoadCharge
    | SnapshotRtqsCharge
    | SnapshotSpeedCharge;
  discountAmount?: Money;
};
export type SubmissionDto = {
  courtDate: string;
  noticeNumber: string;
  offenderName?: string;
  submissionDate: string;
  submissionDeadline: string;
  submissionRegistrationDate: string;
  transgressionDate: string;
  submissionStatus:
    | "PENDING_ADJUDICATION"
    | "ADJUDICATED"
    | "REGISTERED"
    | "CANCELLED";
  transgressionStatus:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  submissionReason?: string;
  submissionOutcomes?: SubmissionOutcomeDto[];
  courtName: string;
  adjudicationTime?: string;
  activeAdjudicator?: string;
  activeAdjudicationSessionId?: string;
};
export type RetrieveSubmissionResponse = {
  submissionDeadline?: string;
  transgressionStatusIsIssued?: boolean;
  submission?: SubmissionDto;
  transgression?: OverloadTransgressionDto | RtqsTransgressionDto;
  transgressionConfiguration?: TransgressionConfiguration;
};
export type RetrieveSubmissionRequest = {
  noticeNumber: string;
};
export type SubmissionOutcome = {
  submissionResult:
    | "WITHDRAWN"
    | "DECLINED"
    | "ALTERNATIVE_CHARGE"
    | "DISCOUNTED";
  snapshotCharge: SnapshotLoadCharge | SnapshotRtqsCharge | SnapshotSpeedCharge;
  discountAmount?: Money;
};
export type Submission = {
  courtDate: string;
  noticeNumber: string;
  offenderName?: string;
  submissionDate: string;
  submissionDeadline: string;
  submissionRegistrationDate: string;
  transgressionDate: string;
  submissionStatus:
    | "PENDING_ADJUDICATION"
    | "ADJUDICATED"
    | "REGISTERED"
    | "CANCELLED";
  transgressionStatus:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  submissionReason?: string;
  courtName: string;
  adjudicationTime?: string;
  activeAdjudicator?: string;
  activeAdjudicationSessionId?: string;
  submissionOutcomes?: SubmissionOutcome[];
};
export type RegisterSubmissionResponse = {
  submission: Submission;
};
export type RegisterSubmissionRequest = {
  submissionReason?: string;
  submissionDate: string;
  submissionDeadline: string;
  noticeNumber: string;
};
export type SubmissionSummaryDto = {
  courtDate: string;
  noticeNumber: string;
  offenderName?: string;
  submissionStatus:
    | "PENDING_ADJUDICATION"
    | "ADJUDICATED"
    | "REGISTERED"
    | "CANCELLED";
  courtName: string;
  courtResult: boolean;
};
export type ProvideSubmissionSummaryResponse = {
  submissionSummaries?: SubmissionSummaryDto[];
};
export type ProvideSubmissionSummaryRequest = {
  submissionStatuses: (
    | "PENDING_ADJUDICATION"
    | "ADJUDICATED"
    | "REGISTERED"
    | "CANCELLED"
  )[];
  courtNames?: string[];
  currentDate: string;
};
export type ProvideSubmissionResponse = {
  submissions?: SubmissionDto[];
};
export type ProvideSubmissionRequest = {
  noticeNumber: string;
};
export type ProvideRenderedTransgressionDocumentResponse = {
  encodedPdf?: string;
};
export type ProvideRenderedTransgressionDocumentRequest = {
  noticeNumber?: string;
  documentTypes?: (
    | "OFFENDER_COPY"
    | "OFFICE_COPY_RED"
    | "OFFICE_COPY_GREEN"
    | "CONTROL_COPY"
    | "CHARGE_SHEET"
    | "PAYMENT_RECEIPT"
    | "PAYMENT_DISCREPANCY_RECEIPT"
  )[];
};
export type ProvideRenderedChargeSheetResponse = {
  encodedPdf?: string;
};
export type ProvideRenderedChargeSheetRequest = {
  noticeNumber: string;
  documentType:
    | "OFFENDER_COPY"
    | "OFFICE_COPY_RED"
    | "OFFICE_COPY_GREEN"
    | "CONTROL_COPY"
    | "CHARGE_SHEET"
    | "PAYMENT_RECEIPT"
    | "PAYMENT_DISCREPANCY_RECEIPT";
};
export type ProsecuteTransgressionResponse = {
  success?: boolean;
};
export type ConfirmTransgressionPaymentResponse = {
  successful: boolean;
  elaboration?: string;
};
export type TransgressionPayment = {
  noticeNumber: string;
  paymentId: string;
  amount: Money;
  paymentDate: string;
  receiptNumber?: string;
  paymentStatus: "PAID" | "DISCREPANCY";
  userAccountId?: string;
};
export type ConfirmTransgressionPaymentRequest = {
  transgressionPayment: TransgressionPayment;
};
export type ProcessPaymentResponse = {
  payRequestId?: string;
  checkSum?: string;
  elaboration?: string[];
};
export type ProcessPaymentRequest = {
  noticeNumber: string;
  email: string;
  checksumAmount?: string;
};
export type Notice = {
  number: string;
  dateCreated?: string;
  authorityCode: string;
  noticeStatus: "CAPTURED" | "NOT_CAPTURED";
};
export type NoticeBook = {
  authorityCode?: string;
  noticeBookType?: "SECTION_54" | "SECTION_56" | "SECTION_341" | "NOTICE_460";
  numberOfPages?: number;
  firstNoticeNumber?: number;
  firstCheckNumber: string;
  lastNoticeNumber?: number;
  lastCheckNumber: string;
  officerId?: string;
  noticeBookStatus?:
    | "NEW_STOCK"
    | "ISSUED"
    | "HANDED_IN"
    | "AWAITING_HAND_IN_COMPLETED"
    | "COMPLETED"
    | "DELETED";
  numberOfPagesRemaining?: number;
  noticeBookNumber: string;
  notices?: Notice[];
};
export type AddNoticeBookResponse = {
  noticeBooks: NoticeBook[];
};
export type AddNoticeBookRequest = {
  noticeType: "SECTION_54" | "SECTION_56" | "SECTION_341" | "NOTICE_460";
  numberOfPages: number;
  firstNoticeNumber: number;
  lastNoticeNumber: number;
  authorityCode: string;
};
export type PaymentReceipt = {
  receiptNumber: string;
  dateCreated: string;
  amountPaid: Money;
};
export type ProcessManualPaymentResponse = {
  paymentSuccessful: boolean;
  paymentReceipt?: PaymentReceipt;
};
export type ProcessManualPaymentRequest = {
  noticeNumber: string;
  amount: Money;
  receiptRequired: boolean;
};
export type SaveFileResponse = {
  fileId: string;
};
export type SaveFileRequest = {
  file?: string;
  filename: string;
};
export type InitiateDpoPaymentResponse = {
  payGateId: string;
  payRequestId: string;
  reference: string;
  checksum: string;
};
export type InitiateDpoPaymentRequest = {
  paygateId: string;
  reference: string;
  amount: string;
  currency: string;
  returnUrl: string;
  locale: string;
  country: string;
  email: string;
  notifyUrl: string;
};
export type FindDpoPaymentResponse = {
  paygateId: string;
  payRequestId: string;
  reference: string;
  transactionStatus: string;
  resultCode?: string;
  authCode?: string;
  currency: string;
  amount: string;
  resultDesc?: string;
  transactionId: string;
  riskIndicator?: string;
  payMethod: string;
  payMethodDetail: string;
  checksum: string;
};
export type FindDpoPaymentRequest = {
  payGateId: string;
  payRequestId: string;
  reference: string;
  checksum: string;
};
export type GenerateCourtScheduleResponse = {
  encodedPdf?: string;
};
export type CourtRoomParameters = {
  dailyRoomCapacity: number;
  operatingHours: number;
  contemptOfCourtFee: Money;
  scheduleFrom: string;
  scheduleDateTo: string;
  schedulingCycle: "WEEKLY" | "FORTNIGHTLY" | "MONTHLY";
  recursOn?: "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST";
  operatingDays: (
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"
  )[];
  nonCourtDates?: string[];
};
export type CourtRoomBooking = {
  operatingDate: string;
  remainingCapacity: number;
};
export type CourtRoom = {
  room: string;
  defaultRoom: boolean;
  courtRoomParameters: CourtRoomParameters;
  courtRoomBookings: CourtRoomBooking[];
};
export type Court = {
  courtName: string;
  courtCode: string;
  districtCode: string;
  districtName: string;
  address: Address;
  authorityCodes: string[];
  courtRooms: CourtRoom[];
};
export type GenerateCourtScheduleRequest = {
  dateFrom: string;
  dateTo: string;
  scheduleDays: (
    | "ALL"
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
  )[];
  cycle: "WEEK" | "MONTH";
  occursOn?: "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST";
  repeatEvery: number;
  court: Court;
  courtRoom: CourtRoom;
  courtRoomBookings: CourtRoomBooking[];
};
export type CourtResult = {
  courtResultId: string;
  noticeNumber: string;
  courtOutcome:
    | "WARRANT_OF_ARREST"
    | "POSTPONED"
    | "WITHDRAWN"
    | "GUILTY"
    | "STRUCK_OFF_ROLL";
  caseNumber: string;
  plateNumber: string;
  offenderName?: string;
  newCourtDate?: string;
  courtDate: string;
  courtName: string;
  courtRoom: string;
  identificationNumber?: string;
  transgressionStatus:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  amountPaid?: Money;
  reason?: string;
  receiptNumber?: string;
  sentence?: string;
  sentenceType?: string;
  paymentMethod?: string;
  sentenceLength?: number;
  warrantNumber?: string;
  sentenceTimePeriod?: "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
  contemptOfCourtFee?: Money;
  snapshotCharges: (
    | SnapshotLoadCharge
    | SnapshotRtqsCharge
    | SnapshotSpeedCharge
  )[];
};
export type ProvideCourtResultsResponse = {
  courtResult?: CourtResult;
};
export type CourtResultsCriteria = {
  type: string;
};
export type CancelContemptOfCourtNoticeNumberCriteria = {
  type: "CancelContemptOfCourtNoticeNumberCriteria";
} & CourtResultsCriteria & {
    noticeNumber: string;
    transgressionStatuses: (
      | "CREATED"
      | "ISSUED"
      | "PAID"
      | "CANCELLED"
      | "ARREST_CASE_CREATED"
      | "CHARGE_SHEET_PRINTED"
      | "ARREST_CASE_CANCELLED"
      | "WITHDRAWN"
      | "PEND_WARRANT_OF_ARREST"
      | "WARRANT_OF_ARREST"
      | "ARRESTED"
      | "WARRANT_OF_ARREST_AUTHORISED"
      | "WARRANT_OF_ARREST_PRINTED"
    )[];
  };
export type CancelContemptOfCourtWarrantNumberCriteria = {
  type: "CancelContemptOfCourtWarrantNumberCriteria";
} & CourtResultsCriteria & {
    warrantNumber: string;
    transgressionStatuses: (
      | "CREATED"
      | "ISSUED"
      | "PAID"
      | "CANCELLED"
      | "ARREST_CASE_CREATED"
      | "CHARGE_SHEET_PRINTED"
      | "ARREST_CASE_CANCELLED"
      | "WITHDRAWN"
      | "PEND_WARRANT_OF_ARREST"
      | "WARRANT_OF_ARREST"
      | "ARRESTED"
      | "WARRANT_OF_ARREST_AUTHORISED"
      | "WARRANT_OF_ARREST_PRINTED"
    )[];
  };
export type CourtResultNoticeNumberCriteria = {
  type: "CourtResultNoticeNumberCriteria";
} & CourtResultsCriteria & {
    noticeNumber: string;
  };
export type ProvideCourtResultsRequest = {
  criteria:
    | CancelContemptOfCourtNoticeNumberCriteria
    | CancelContemptOfCourtWarrantNumberCriteria
    | CourtResultNoticeNumberCriteria;
};
export type CourtResultSummary = {
  noticeNumber: string;
  courtOutcome:
    | "WARRANT_OF_ARREST"
    | "POSTPONED"
    | "WITHDRAWN"
    | "GUILTY"
    | "STRUCK_OFF_ROLL";
  plateNumber: string;
  offenderName?: string;
  courtDate: string;
  courtName: string;
  transgressionStatus:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
};
export type ProvideCourtResultSummaryResponse = {
  courtResultSummaries?: CourtResultSummary[];
};
export type ProvideCourtResultSummaryRequest = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
};
export type CourtCaseEntry = {
  courtDate: string;
  courtName: string;
  plateNumber: string;
  offenderName?: string;
  transgressionStatus:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  noticeNumber: string;
};
export type ProvideCourtCaseListResponse = {
  courtCaseList?: CourtCaseEntry[];
  courtRegisterFound: boolean;
};
export type ProvideCourtCaseListRequest = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
};
export type FinaliseCourtResultResponse = {
  courtResultCaptured: boolean;
};
export type FinaliseCourtResultRequest = {
  noticeNumber: string;
  courtOutcome:
    | "WARRANT_OF_ARREST"
    | "POSTPONED"
    | "WITHDRAWN"
    | "GUILTY"
    | "STRUCK_OFF_ROLL";
  caseNumber: string;
  newCourtDate?: string;
  amountPaid?: Money;
  reason?: string;
  receiptNumber?: string;
  sentence?: string;
  sentenceType?: string;
  paymentMethod?: string;
  sentenceLength?: number;
  sentenceTimePeriod?: "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
  warrantNumber?: string;
  warrantNumberGeneration?: boolean;
  contemptOfCourtFee?: Money;
};
export type CancelContemptOfCourtResponse = {
  contemptOfCourtCancelled: boolean;
};
export type CancelContemptOfCourtRequest = {
  supervisorUsername: string;
  noticeNumber: string;
};
export type RetrieveTransgressionResponse = {
  errorMessage?: string;
  transgressions?: (OverloadTransgressionDto | RtqsTransgressionDto)[];
  submissions?: SubmissionDto[];
};
export type RetrieveTransgressionRequest = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
};
export type InitialiseCourtDocumentsResponse = {
  courts: Court[];
  adjudicationTimeFence: number;
};
export type CourtRegister = {
  versionNumber: number;
  courtDate: string;
  courtName: string;
  courtRoom: string;
  authority: string;
  presidingOfficer?: string;
  publicProsecutor?: string;
  clerkOfTheCourt?: string;
  interpreter?: string;
  result?: string;
  remark?: string;
  transgressions?: (
    | OverloadTransgression
    | RtqsTransgression
    | SpeedTransgression
  )[];
};
export type FindCourtRegisterResponse = {
  courtRegister?: CourtRegister;
};
export type FindCourtRegisterRequest = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
};
export type FinaliseCourtRegisterResponse = {
  encodedPdf?: string;
  noticeNumbers?: string[];
};
export type FinaliseCourtRegisterRequest = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
  presidingOfficer?: string;
  publicProsecutor?: string;
  clerkOfTheCourt?: string;
  interpreter?: string;
  allowAdjudicationAfterCourtDate?: boolean;
  authorityCode: string;
  supervisorUsername?: string;
  noticeNumbers?: string[];
};
export type ProvideCourtResponse = {
  courts?: Court[];
};
export type ProvideCourtRequest = {
  authorityCodes: string[];
};
export type FinaliseRegisterOfControlDocumentsResponse = {
  encodedPdf?: string;
  officerEncodedPdf?: string;
  noticeNumbers?: string[];
};
export type FinaliseRegisterOfControlDocumentsRequest = {
  courtDate: string;
  courtName: string;
  courtRoom: string;
  newPagePerOfficer: boolean;
  noticeNumbers?: string[];
  weighbridgeCode: string;
  noticeTypes?: ("OVERLOAD" | "RTQS" | "SPEED")[];
};
export type LoadChargeDto = {
  type: "LoadChargeDto";
} & ChargeDto & {
    vehicleCategory?: string;
    vehicleType?: string;
    combinationVehicle?: boolean;
    vehicleUsage?: string;
    articulatedVehicle?: boolean;
    axleUnit?: boolean;
    numberOfAxles?: string;
    tyreType?: string;
    numberOfTyres?: string;
    permissible?: number;
    minValue: number;
    maxValue: number;
    chargeCategory:
      | "AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "AXLE_UNIT_STANDARD_TIRES_PERMISSIBLE_WEIGH_TEST"
      | "MANUFACTURER_PLATE_PERMISSIBLE_WEIGH_TEST"
      | "STEERING_AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "SUM_OF_PERMISSIBLES_WEIGH_TEST"
      | "MAXIMUM_MASS_WEIGH_TEST"
      | "STEERING_AXLE_UNDERLOAD_WEIGH_TEST"
      | "DRIVING_AXLE_WEIGH_TEST"
      | "ENGINE_POWER_WEIGH_TEST"
      | "GVM_WEIGH_TEST"
      | "GCM_WEIGH_TEST"
      | "BRIDGE_FORMULA_WEIGH_TEST";
  };
export type ProvideChargeResponse = {
  charges?: (LoadChargeDto | RtqsChargeDto)[];
  vehicleCharges?: VehicleChargeDto[];
};
export type LoadChargeSpecification = {
  chargeCategory:
    | "AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
    | "AXLE_UNIT_STANDARD_TIRES_PERMISSIBLE_WEIGH_TEST"
    | "MANUFACTURER_PLATE_PERMISSIBLE_WEIGH_TEST"
    | "STEERING_AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
    | "SUM_OF_PERMISSIBLES_WEIGH_TEST"
    | "MAXIMUM_MASS_WEIGH_TEST"
    | "STEERING_AXLE_UNDERLOAD_WEIGH_TEST"
    | "DRIVING_AXLE_WEIGH_TEST"
    | "ENGINE_POWER_WEIGH_TEST"
    | "GVM_WEIGH_TEST"
    | "GCM_WEIGH_TEST"
    | "BRIDGE_FORMULA_WEIGH_TEST";
  vehicleType?: string;
  vehicleUsage?: string;
  vehicleCategory?: string;
  combinationVehicle?: boolean;
  articulatedVehicle?: boolean;
  axleUnit?: boolean;
  numberOfAxles?: string;
  numberOfTyres?: string;
  overloadMassPercentage?: number;
  overloadMassValue?: number;
  plateNumber?: string;
  calculatedPermissibleMassValue?: number;
  legislationType?: "CPA" | "TTTFP" | "AARTO";
  grossVehicleMass?: number;
  netPower?: number;
  grossMass?: number;
  mass?: number;
  chargebookId: string;
  axleId?: number;
};
export type ProvideChargeRequest = {
  loadChargeSpecifications: LoadChargeSpecification[];
  country: string;
  steeringAxleUnderloadRangeType: "PERCENTAGE" | "MASS";
  steeringVehiclePlateNumber?: string;
  plateNumbers?: string[];
};
export type SnapshotChargeDto = {
  chargeId: string;
  snapshotId: string;
  chargeCode: string;
  chargeTitle?: string;
  chargeShortDescription: string;
  chargeLongDescription?: string;
  chargeRegulation?: string;
  specificRegulation?: string;
  severity?: string;
  demeritPoints?: number;
  fineAmount: Money;
  discountAmount?: Money;
  plateNumber: string;
  type: string;
};
export type SnapshotLoadChargeDto = {
  type: "SnapshotLoadChargeDto";
} & SnapshotChargeDto & {
    vehicleCategory?: string;
    vehicleType?: string;
    combinationVehicle?: boolean;
    vehicleUsage?: string;
    articulatedVehicle?: boolean;
    axleUnit?: boolean;
    numberOfAxles?: string;
    tyreType?: string;
    numberOfTyres?: string;
    permissible?: number;
    minValue: number;
    maxValue: number;
    chargeCategory:
      | "AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "AXLE_UNIT_STANDARD_TIRES_PERMISSIBLE_WEIGH_TEST"
      | "MANUFACTURER_PLATE_PERMISSIBLE_WEIGH_TEST"
      | "STEERING_AXLE_UNIT_CARRYING_CAPACITY_WEIGH_TEST"
      | "SUM_OF_PERMISSIBLES_WEIGH_TEST"
      | "MAXIMUM_MASS_WEIGH_TEST"
      | "STEERING_AXLE_UNDERLOAD_WEIGH_TEST"
      | "DRIVING_AXLE_WEIGH_TEST"
      | "ENGINE_POWER_WEIGH_TEST"
      | "GVM_WEIGH_TEST"
      | "GCM_WEIGH_TEST"
      | "BRIDGE_FORMULA_WEIGH_TEST";
  };
export type SnapshotRtqsChargeDto = {
  type: "SnapshotRtqsChargeDto";
} & SnapshotChargeDto & {
    alternativeCharge: boolean;
    mainChargeCode?: string;
    allowedHeight?: number;
    vehicleHeight?: number;
    overHeight?: number;
    numberOfLamps?: number;
    roadTravelledOn?: string;
    numberOfTyres?: number;
    lengthOfVehicle?: number;
    numberOfPersons?: number;
    numberOfPanels?: number;
  };
export type SnapshotSpeedChargeDto = {
  type: "SnapshotSpeedChargeDto";
} & SnapshotChargeDto & {
    speedFrom: number;
    speedTo: number;
    speedLimit: number;
  };
export type ProvideSnapshotChargeResponse = {
  snapshotCharge:
    | SnapshotLoadChargeDto
    | SnapshotRtqsChargeDto
    | SnapshotSpeedChargeDto;
};
export type ProvideSnapshotChargeRequest = {
  arrestCaseFineAmount: Money;
  allowArrestCase: boolean;
  alternativeChargeSelected: boolean;
  plateNumber: string;
  steeringVehiclePlateNumber?: string;
  allowedHeight?: number;
  vehicleHeight?: number;
  numberOfLamps?: number;
  roadTravelledOn?: string;
  numberOfTyres?: number;
  lengthOfVehicle?: number;
  numberOfPersons?: number;
  numberOfPanels?: number;
  mainCharge: LoadChargeDto | RtqsChargeDto;
  alternativeCharge?: LoadChargeDto | RtqsChargeDto;
};
export type AuthoriseSupervisorOverrideResponse = {
  approved: boolean;
};
export type AuthoriseSupervisorOverrideRequest = {
  username: string;
  password: string;
  role:
    | "ROLE_CORE_SUBSYSTEM"
    | "ROLE_WEIGH_SUBSYSTEM"
    | "ROLE_REPORTS_SUBSYSTEM"
    | "ROLE_TRANSGRESSIONS_SUBSYSTEM"
    | "ROLE_LOOKUP_PAGE"
    | "ROLE_PERSON_PAGE"
    | "ROLE_USERACCOUNT_PAGE"
    | "ROLE_OFFICER_PAGE"
    | "ROLE_SYSTEMPARAMETER_PAGE"
    | "ROLE_AUTHORITY_PAGE"
    | "ROLE_REPORT_PAGE"
    | "ROLE_PRESTART_PAGE"
    | "ROLE_WEIGH_PAGE"
    | "ROLE_AUTHORITY_MAINTAIN"
    | "ROLE_AUTHORITY_VIEW"
    | "ROLE_CHARGE_MAINTAIN"
    | "ROLE_CHARGE_VIEW"
    | "ROLE_LEGISLATION_MAINTAIN"
    | "ROLE_LEGISLATION_VIEW"
    | "ROLE_LOOKUP_MAINTAIN"
    | "ROLE_LOOKUP_VIEW"
    | "ROLE_OFFICER_MAINTAIN"
    | "ROLE_OFFICER_VIEW"
    | "ROLE_PERSON_MAINTAIN"
    | "ROLE_PERSON_VIEW"
    | "ROLE_SYSTEMPARAMETER_MAINTAIN"
    | "ROLE_SYSTEMPARAMETER_VIEW"
    | "ROLE_TRAFFICCONTROLCENTRE_MAINTAIN"
    | "ROLE_TRAFFICCONTROLCENTRE_VIEW"
    | "ROLE_USERACCOUNT_MAINTAIN"
    | "ROLE_USERACCOUNT_VIEW"
    | "ROLE_USERGROUP_MAINTAIN"
    | "ROLE_USERGROUP_VIEW"
    | "ROLE_WEIGHTESTSREQUIREDPARAMETER_MAINTAIN"
    | "ROLE_WEIGHTESTSREQUIREDPARAMETER_VIEW"
    | "ROLE_ADMITVEHICLE_MAINTAIN"
    | "ROLE_CONTROLCENTREVISITSTATUS_MAINTAIN"
    | "ROLE_AUTHORISEDSPECIALRELEASE_MAINTAIN"
    | "ROLE_CONTROLCENTREVISIT_VIEW"
    | "ROLE_DOCUMENTSGENERATION_MAINTAIN"
    | "ROLE_CANCELPRECAPTURE_MAINTAIN"
    | "ROLE_PRECAPTUREINFORMATION_MAINTAIN"
    | "ROLE_PRECAPTUREINFORMATION_VIEW"
    | "ROLE_RENDEREDWEIGHDOCUMENT_MAINTAIN"
    | "ROLE_VEHICLEWEIGH_MAINTAIN"
    | "ROLE_WEIGHRECORD_MAINTAIN"
    | "ROLE_WEIGHRECORD_VIEW"
    | "ROLE_PERFORMWEIGHTEST_MAINTAIN"
    | "ROLE_PERFORMWEIGHRETEST_MAINTAIN"
    | "ROLE_USERACCOUNTAUTHORISATION_MAINTAIN"
    | "ROLE_SPECIALRELEASE_MAINTAIN"
    | "ROLE_UPDATEVEHICLEWEIGH_MAINTAIN"
    | "ROLE_HOLDINGYARDWEIGHTESTSREQUIREDPARAMETER_VIEW"
    | "ROLE_HOLDINGYARDVEHICLEREQUIREDINFORMATION_VIEW"
    | "ROLE_CONTROLCENTREVISITSTATUS_VIEW"
    | "ROLE_WEIGHTESTPARAMETERS_VIEW"
    | "ROLE_WEIGHTESTREQUIREDPARAMETERCONFIG_VIEW"
    | "ROLE_PRECAPTURECONFIG_VIEW"
    | "ROLE_RELATIONSHIP_VIEW"
    | "ROLE_IDENTITYTYPE_VIEW"
    | "ROLE_AUTHORISEDSPECIALRELEASE_AUTHORISE"
    | "ROLE_STATICSCALE_MAINTAIN"
    | "ROLE_STATICSCALE_VIEW"
    | "ROLE_ABNORMALPERMIT_AUTHORISE"
    | "ROLE_ABNORMALPERMIT_MAINTAIN"
    | "ROLE_TRANSGRESSIONDETAILS_VIEW"
    | "ROLE_TRANSGRESSIONSTATUS_VIEW"
    | "ROLE_RELIEFVEHICLE_MAINTAIN"
    | "ROLE_RELIEFVEHICLE_WIEW"
    | "ROLE_HOLDINGYARDINFORMATION_AUTHORISE"
    | "ROLE_CONTROLCENTREVISITSTATUS_AUTHORISE"
    | "ROLE_PERFORMCORRECTIONS_MAINTAIN"
    | "ROLE_HOLDINGYARDINFORMATION_MAINTAIN"
    | "ROLE_UPDATE_VEHICLE_CONFIGURATION_MAINTAIN"
    | "ROLE_MANUALPAYMENT_MAINTAIN"
    | "ROLE_MANUALPAYMENT_VIEW"
    | "ROLE_TRANSGRESSIONCONFIGURATION_VIEW"
    | "ROLE_WEIGHBRIDGEPARAMETER_MAINTAIN"
    | "ROLE_WEIGHBRIDGEPARAMETER_VIEW"
    | "ROLE_CANCELTRANSGRESSION_OVERRIDE"
    | "ROLE_CORRECTARRESTCASE_OVERRIDE"
    | "ROLE_UPDATETRANSGRESSION_OVERRIDE"
    | "ROLE_CANCELCONTEMPTOFCOURT_OVERRIDE"
    | "ROLE_DELETESIGNEDWARRANTOFARREST_OVERRIDE"
    | "ROLE_CANCELRTQSTRANSGRESSION_OVERRIDE"
    | "ROLE_WIMRECORD_VIEW"
    | "ROLE_REPORT_VIEW"
    | "ROLE_REPORT_MAINTAIN"
    | "ROLE_COUNTRYREGION_VIEW"
    | "ROLE_AARTONOTICENUMBER_MAINTAIN"
    | "ROLE_NOTICEBOOK_VIEW"
    | "ROLE_NOTICEBOOK_MAINTAIN"
    | "ROLE_MANUALLINK_MAINTAIN"
    | "ROLE_UNLINK_MAINTAIN"
    | "ROLE_ADJUDICATION_MAINTAIN"
    | "ROLE_ADJUDICATIONALLOWANCE_MAINTAIN"
    | "ROLE_CANCELTRANSGRESSION_MAINTAIN"
    | "ROLE_COURT_VIEW"
    | "ROLE_REGISTERSUBMISSION_MAINTAIN"
    | "ROLE_REGISTERSUBMISSION_VIEW"
    | "ROLE_RENDEREDCHARGESHEETDOCUMENT_VIEW"
    | "ROLE_RENDEREDTRANSGRESSIONDOCUMENT_MAINTAIN"
    | "ROLE_RENDEREDTRANSGRESSIONDOCUMENT_VIEW"
    | "ROLE_UPDATESUBMISSIONSTATUS_MAINTAIN"
    | "ROLE_SUBMISSIONDETAILS_VIEW"
    | "ROLE_SUBMISSION_VIEW"
    | "ROLE_TRANSGRESSIONHISTORY_VIEW"
    | "ROLE_TRANSGRESSIONPRINTING_MAINTAIN"
    | "ROLE_TRANSGRESSION_MAINTAIN"
    | "ROLE_TRANSGRESSION_VIEW"
    | "ROLE_RTQSTRANSGRESSION_MAINTAIN"
    | "ROLE_RTQSTRANSGRESSION_VIEW"
    | "ROLE_UPDATEOVERLOADTRANSGRESSIONINFORMATION_MAINTAIN"
    | "ROLE_UPDATEVEHICLEWEIGHDETAILS_MAINTAIN"
    | "ROLE_VALIDATEID_MAINTAIN"
    | "ROLE_TRANSGRESSIONPARAMETER_VIEW"
    | "ROLE_COURTREGISTER_MAINTAIN"
    | "ROLE_TRANSGRESSIONSTATUS_MAINTAIN"
    | "ROLE_COURTRESULT_VIEW"
    | "ROLE_COURTRESULT_MAINTAIN"
    | "ROLE_CANCELCONTEMPTOFCOURT_MAINTAIN"
    | "ROLE_WARRANTOFARREST_MAINTAIN"
    | "ROLE_WARRANTOFARREST_VIEW"
    | "ROLE_WARRANTOFARRESTREGISTER_MAINTAIN"
    | "ROLE_WARRANTOFARRESTREGISTER_VIEW"
    | "ROLE_PRINTWARRANTOFARRESTDOCUMENTS_MAINTAIN"
    | "ROLE_UPDATESUBMISSION_MAINTAIN"
    | "ROLE_COURTREGISTERHISTORY_MAINTAIN"
    | "ROLE_REGISTEROFCONTROLDOCUMENTSHISTORY_MAINTAIN"
    | "ROLE_WARRANTREGISTERHISTORY_MAINTAIN"
    | "ROLE_REGISTEROFCONTROLDOCUMENTS_MAINTAIN"
    | "ROLE_UPDATERTQSTRANSGRESSIONINFORMATION_MAINTAIN"
    | "ROLE_CANCELRTQSTRANSGRESSION_MAINTAIN"
    | "ROLE_COURTSCHEDULE_MAINTAIN";
  authorityCode: string;
  reason: string;
};
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  resetCredentials?: boolean;
  userAccountId?: string;
  tenantRoles: string[];
};
export type LoginRequest = {
  username: string;
  password: string;
  tenant: string;
};
export type InitialiseVirtualPaymentRequest = {
  flow?:
    | "CARD"
    | "CARD_VERIFICATION"
    | "EFT_ADUMO"
    | "EFT_OZOW"
    | "MOBICRED"
    | "MASTER_PASS"
    | "ZAPPER"
    | "CLICK_TO_PAY"
    | "OTT_VOUCHER";
  merchantId?: string;
  applicationId?: string;
  merchantReference?: string;
  amount?: number;
  txtCurrencyCode?: string;
  redirectSuccessfulUrl?: string;
  redirectFailedUrl?: string;
  notificationUrl?: string;
};
export type StartNextAdjudicationResponse = {
  submissionSummary: SubmissionSummaryDto;
  submission: SubmissionDto;
  transgression: OverloadTransgressionDto | RtqsTransgressionDto;
};
export type StartNextAdjudicationRequest = {
  sessionId: string;
  courtNames: string[];
};
export type AdjudicateSubmissionResponse = {
  adjudicated: boolean;
};
export type AdjudicateSubmissionRequest = {
  noticeNumber: string;
  submissionOutcomes: SubmissionOutcomeDto[];
  courtNames: string[];
};
export type AbortAdjudicationResponse = {
  adjudicationAborted?: boolean;
};
export type AbortAdjudicationRequest = {
  noticeNumber: string;
  sessionId: string;
  courtNames: string[];
};
export type RequestNoticeNumberResponse = {
  noticesRetrieved: boolean;
};
export type CountryRegionIndex = {
  region: string;
  code: string;
  country: string;
};
export type RequestNoticeNumberRequest = {
  numberOfNotices: number;
  aartoNoticeType: string;
  aartoNoticeTypeCode: string;
  countryRegionIndex: CountryRegionIndex;
};
export type AartoNoticeNumber = {
  dateCreated: string;
  noticeNumber: string;
  status: "AVAILABLE" | "USED";
  aartoNoticeType: string;
};
export type GenerateNoticeNumberResponse = {
  noticesGenerated: boolean;
  aartoNoticeNumbers: AartoNoticeNumber[];
};
export type GenerateNoticeNumberEntry = {
  aartoNoticeType: string;
  numberOfNotices: number;
  aartoNoticeTypeCode: string;
  region?: string;
  code?: string;
};
export type GenerateNoticeNumberRequest = {
  entries: GenerateNoticeNumberEntry[];
};
export type TransgressionEntry = {
  transgressionVersion: number;
  status:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
  comments?: string[];
  dateTime: string;
  doneBy: string;
  authorisedBy?: string;
};
export type TransgressionHistory = {
  noticeNumber: string;
  transgressionEntries: TransgressionEntry[];
};
export type TransgressionAuditDto = {
  id?: number;
  status?: string;
  transgressionDate?: string;
  transgressionLocation?: string;
  transgressionVersion?: number;
  authorityCode?: string;
  noticeNumber?: string;
  road?: string;
  courtAppearanceDate?: string;
  courtName?: string;
  courtNumber?: string;
  courtCode?: string;
  modifiedBy?: string;
  lastModifiedOn?: string;
};
export type TransgressionHistoryProviderResponse = {
  transgressions?: TransgressionAuditDto[];
};
export type SortObject = {
  sorted?: boolean;
  empty?: boolean;
  unsorted?: boolean;
};
export type PageableObject = {
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
  offset?: number;
  sort?: SortObject;
  unpaged?: boolean;
};
export type RtqsTransgressionSummaryDto = {
  transgressionDate: string;
  noticeNumber: string;
  plateNumber: string;
  offenderName?: string;
  status:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
};
export type PageRtqsTransgressionSummaryDto = {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: RtqsTransgressionSummaryDto[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  empty?: boolean;
};
export type OverloadTransgressionSummaryDto = {
  transgressionDate: string;
  sequenceNumber: number;
  noticeNumber: string;
  plateNumber: string;
  offenderName?: string;
  status:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
};
export type PageOverloadTransgressionSummaryDto = {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: OverloadTransgressionSummaryDto[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  empty?: boolean;
};
export type FindTransgressionStatusResponse = {
  transgressionStatus?:
    | "CREATED"
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
    | "ARREST_CASE_CREATED"
    | "CHARGE_SHEET_PRINTED"
    | "ARREST_CASE_CANCELLED"
    | "WITHDRAWN"
    | "PEND_WARRANT_OF_ARREST"
    | "WARRANT_OF_ARREST"
    | "ARRESTED"
    | "WARRANT_OF_ARREST_AUTHORISED"
    | "WARRANT_OF_ARREST_PRINTED";
};
export type TransgressionParameter = {
  dataType: "BOOLEAN" | "INTEGER" | "STRING" | "MONEY";
  defaultValue: string;
  description: string;
  modifiable: boolean;
  name: string;
  value: string;
  maximumValue?: number;
  minimumValue?: number;
};
export type ProvideTransgressionConfigurationResponse = {
  transgressionConfigurations?: TransgressionConfiguration[];
};
export type FinaliseSuccessfulPaymentResponse = {
  encodedPdf?: string;
  referenceNumber?: string;
  receiptPrinted?: boolean;
};
export type ReplicationInfo = {
  replicationMode?: string;
  lastChangelogChecksum?: string;
  applicationVersion?: string;
  publisherApplicationReady?: boolean;
  publisherCreated?: boolean;
  replicationEnabled?: boolean;
  subscriberEnabled?: boolean;
};
export type ProvidePaymentReceiptResponse = {
  encodedPdf?: string;
};
export type ValidateNoticeNumberResponse = {
  isValid: boolean;
  elaborations?: string[];
};
export type PageNoticeBook = {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: NoticeBook[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  empty?: boolean;
};
export type ProvideNoticeBookResponse = {
  page?: PageNoticeBook;
};
export type ValidateTransgressionStatusResponse = {
  isValid: boolean;
  elaborations?: string[];
};
export type PageLegislation = {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: Legislation[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  empty?: boolean;
};
export type Info = {
  applicationName?: string;
  applicationVersion?: string;
  gitBuildVersion?: string;
  gitBranch?: string;
  gitCommitId?: string;
  gitTimeStamp?: string;
};
export type ProvideFileResponse = {
  file?: string;
  filename?: string;
};
export type CurrencyProviderResponse = {
  currencyCode: string;
};
export type ProvideCountryRegionResponse = {
  countryRegionIndices?: CountryRegionIndex[];
};
export type InitialiseAdjudicationResponse = {
  courts?: Court[];
};
export type DeleteNoticeBookRequest = {
  noticeBookIds: number[];
};
export const {
  useUpdateSubmissionStatusMutation,
  useUploadSignedWarrantOfArrestMutation,
  useUpdateWarrantOfArrestMutation,
  useProvideWarrantOfArrestDocumentsMutation,
  useProvideWarrantOfArrestByWarrantNumberMutation,
  useProvideWarrantOfArrestByNoticeNumberMutation,
  useProvideWarrantOfArrestByCourtDetailsMutation,
  useProvideWarrantListMutation,
  useGenerateWarrantOfArrestMutation,
  useGenerateWarrantOfArrestRegisterMutation,
  useFinalisePrintWarrantOfArrestMutation,
  useDeleteSignedWarrantOfArrestMutation,
  useValidateIdMutation,
  useUpdateWarrantRegisterHistoryMutation,
  useUpdateRegisterOfControlDocumentsHistoryMutation,
  useUpdateCourtRegisterHistoryMutation,
  useUpdateTransgressionStatusMutation,
  useUpdateRtqsTransgressionInformationMutation,
  useUpdateOverloadTransgressionInformationMutation,
  useRetrieveTransgressionDetailsMutation,
  useRetrieveRtqsTransgressionInformationMutation,
  useRetrieveOverloadTransgressionInformationMutation,
  useGenerateRtqsTransgressionMutation,
  useGenerateOverloadTransgressionMutation,
  useCancelTransgressionMutation,
  useCancelRtqsTransgressionMutation,
  useRedirectToFrontendMutation,
  useUpdateSubmissionMutation,
  useRetrieveSubmissionByNoticeNumberMutation,
  useRegisterSubmissionMutation,
  useProvideSubmissionSummaryMutation,
  useProvideSubmissionDetailsMutation,
  useProvideRenderedTransgressionDocumentsMutation,
  useProvideRenderedChargeSheetMutation,
  useProsecuteTransgressionMutation,
  useConfirmTransgressionPaymentMutation,
  useInitiatePaymentMutation,
  useFinalisePaymentMutation,
  useAddNoticeBookMutation,
  useProcessManualPaymentMutation,
  useSaveFileMutation,
  useInitiateDpoPaymentMutation,
  useFindDpoPaymentMutation,
  useGenerateCourtScheduleMutation,
  useProvideCourtResultMutation,
  useProvideCourtResultSummaryMutation,
  useProvideCourtCaseListMutation,
  useFinaliseCourtResultMutation,
  useCancelContemptOfCourtMutation,
  useRetrieveTransgressionMutation,
  useInitialiseCourtDocumentsMutation,
  useFindCourtRegisterMutation,
  useFinaliseCourtRegisterMutation,
  useProvideCourtMutation,
  useFinaliseRegisterOfControlDocumentsMutation,
  useSearchChargeMutation,
  useProvideSnapshotChargeMutation,
  useAuthoriseSupervisorOverrideMutation,
  useLoginMutation,
  useInitialiseVirtualPaymentMutation,
  useStartNextAdjudicationMutation,
  useAllowAdjudicationMutation,
  useAdjudicateSubmissionMutation,
  useAbortAdjudicationMutation,
  useRequestNoticeNumberMutation,
  useProvideAartoNoticeNumberMutation,
  useGenerateNoticeNumbersMutation,
  useRetrieveTransgressionHistoryQuery,
  useFindAllTransgressionEventsBySequencedNumberQuery,
  useRetrieveRtqsTransgressionListQuery,
  useRetrieveOverloadTransgressionListQuery,
  useFindTransgressionStatusBySequenceNumberQuery,
  useFindTransgressionStatusByNoticeNumberQuery,
  useFindTransgressionParameterQuery,
  useFindTransgressionConfigurationQuery,
  useFindSuccessfulPaymentQuery,
  useGetStatusQuery,
  useGetAboutReplicationQuery,
  useIsTransgressionPendingQuery,
  useProvidePaymentRequestQuery,
  useFindPaymentByNoticeNumberQuery,
  useValidateNoticeNumberQuery,
  useProvideNoticeBookQuery,
  useValidateTransgressionQuery,
  useFindLegislationQuery,
  useSearchLegislationQuery,
  useGetAboutQuery,
  useProvideFileQuery,
  useDeleteFileMutation,
  useProvideCurrencyCodeQuery,
  useProvideCountryRegionQuery,
  useFindChargeQuery,
  useAllChargesQuery,
  useAllAuthorityByAuthorityIdQuery,
  useAllAuthorityByAuthorityCodeQuery,
  useAllAuthoritiesQuery,
  useInitialiseAdjudicationQuery,
  useRemovePendingProsecutionMutation,
  useDeleteNoticeBookMutation,
} = injectedRtkApi;
