import { weighBaseSplitApi as api } from "./weighBaseApi";
export const addTagTypes = [
  "UpdateVehicleWeigh",
  "ControlCentreVisitStatus",
  "Info",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      updateVehicleWeighDetails: build.mutation<
        UpdateVehicleWeighDetailsApiResponse,
        UpdateVehicleWeighDetailsApiArg
      >({
        query: (queryArg) => ({
          url: `/preCapture/updateVehicleWeighDetails`,
          method: "PUT",
          body: queryArg.updateVehicleWeighDetailsRequest,
        }),
        invalidatesTags: ["UpdateVehicleWeigh"],
      }),
      updateControlCentreVisitStatus: build.mutation<
        UpdateControlCentreVisitStatusApiResponse,
        UpdateControlCentreVisitStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/controlCentreVisitStatus/updateControlCentreVisitStatus`,
          method: "PUT",
          body: queryArg.updateControlCentreVisitStatusRequest,
        }),
        invalidatesTags: ["ControlCentreVisitStatus"],
      }),
      getAbout: build.query<GetAboutApiResponse, GetAboutApiArg>({
        query: () => ({ url: `/info/about` }),
        providesTags: ["Info"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as weighApi };
export type UpdateVehicleWeighDetailsApiResponse =
  /** status 200 OK */ UpdateVehicleWeighDetailsResponse;
export type UpdateVehicleWeighDetailsApiArg = {
  updateVehicleWeighDetailsRequest: UpdateVehicleWeighDetailsRequest;
};
export type UpdateControlCentreVisitStatusApiResponse =
  /** status 200 OK */ UpdateControlCentreVisitStatusResponse;
export type UpdateControlCentreVisitStatusApiArg = {
  updateControlCentreVisitStatusRequest: UpdateControlCentreVisitStatusRequest;
};
export type GetAboutApiResponse = /** status 200 OK */ Info;
export type GetAboutApiArg = void;
export type UpdateVehicleWeighDetailsResponse = {
  noticeNumber: string;
  officerId?: string;
};
export type UpdateVehicleWeighDetailsRequest = {
  sequenceNumber: number;
  vehicleMake?: string;
  colour?: string;
  origin?: string;
  destination?: string;
  depotName?: string;
  operatorName?: string;
  emailAddress?: string;
  driverName?: string;
  driverSurname?: string;
  identificationType?: string;
  idCountryOfIssue?: string;
  identificationNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  contactNumber?: string;
  contactNumberType?: string;
  dialingCode?: string;
  licenceCode?: string;
  licenceNumber?: string;
  prDPCodes?: string[];
  prDPNumber?: string;
  trn?: string;
  licenceCountryOfIssue?: string;
  residentialAddressLine1?: string;
  residentialAddressLine2?: string;
  residentialCity?: string;
  residentialCountry?: string;
  residentialPostalCode?: string;
  businessAddressLine1?: string;
  businessAddressLine2?: string;
  businessCity?: string;
  businessCountry?: string;
  businessPostalCode?: string;
  cargo?: string;
  newPlateNumber?: string;
  noticeNumber: string;
  officerId?: string;
};
export type ControlCentreVisitDto = {
  arrivalDate: string;
  authorityId?: string;
  exitDate?: string;
  firstWeigh?: boolean;
  id: number;
  numberOfWeighs?: number;
  weighbridgeId?: string;
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
  weighCategory?: "NormalWeigh" | "TareWeigh" | "Other";
  sequenceNumber?: number;
  prevSequenceNumber?: number;
  nextSequenceNumber?: number;
  specialReleaseActivation?: boolean;
  controlCentreVisitId?: string;
  parentControlCentreVisitId?: string;
  firstWeighReTested?: boolean;
  holdingYardAdditionalInformationCaptured?: boolean;
};
export type UpdateControlCentreVisitStatusResponse = {
  controlCentreVisit: ControlCentreVisitDto;
};
export type UpdateControlCentreVisitStatusRequest = {
  controlCentreVisitId: number;
  newStatus:
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
  documentId?: string;
  username?: string;
  password?: string;
  authorityCode?: string;
};
export type Info = {
  applicationName?: string;
  applicationVersion?: string;
  gitBuildVersion?: string;
  gitBranch?: string;
  gitCommitId?: string;
  gitTimeStamp?: string;
};
export const {
  useUpdateVehicleWeighDetailsMutation,
  useUpdateControlCentreVisitStatusMutation,
  useGetAboutQuery,
} = injectedRtkApi;
