import { coreBaseSplitApi as api } from "./coreBaseApi";
export const addTagTypes = [
  "UserAccounts",
  "Lookups",
  "Authentication",
  "TrafficControlCentre",
  "Info",
  "Identity Types",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      changeAccountPassword: build.mutation<
        ChangeAccountPasswordApiResponse,
        ChangeAccountPasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/userAccounts/credentials/changepassword`,
          method: "POST",
          body: queryArg.userAccountPasswordChangeRequest,
        }),
        invalidatesTags: ["UserAccounts"],
      }),
      getLookups: build.query<GetLookupsApiResponse, GetLookupsApiArg>({
        query: (queryArg) => ({
          url: `/lookups`,
          params: {
            parentId: queryArg.parentId,
            lookupType: queryArg.lookupType,
            searchValue: queryArg.searchValue,
            isValid: queryArg.isValid,
            isExact: queryArg.isExact,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sortDirection: queryArg.sortDirection,
            sortFields: queryArg.sortFields,
          },
        }),
        providesTags: ["Lookups"],
      }),
      refreshAccessToken: build.mutation<
        RefreshAccessTokenApiResponse,
        RefreshAccessTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/auth/refresh`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Authentication"],
      }),
      login: build.mutation<LoginApiResponse, LoginApiArg>({
        query: (queryArg) => ({
          url: `/auth/login`,
          method: "POST",
          body: queryArg.loginRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      findTrafficControlCentresByAuthority: build.query<
        FindTrafficControlCentresByAuthorityApiResponse,
        FindTrafficControlCentresByAuthorityApiArg
      >({
        query: (queryArg) => ({
          url: `/trafficControlCentre/authority`,
          params: {
            authorityCode: queryArg.authorityCode,
          },
        }),
        providesTags: ["TrafficControlCentre"],
      }),
      getMultipleLookups: build.query<
        GetMultipleLookupsApiResponse,
        GetMultipleLookupsApiArg
      >({
        query: (queryArg) => ({
          url: `/lookups/multiple`,
          params: {
            lookupIds: queryArg.lookupIds,
          },
        }),
        providesTags: ["Lookups"],
      }),
      getAbout: build.query<GetAboutApiResponse, GetAboutApiArg>({
        query: () => ({ url: `/info/about` }),
        providesTags: ["Info"],
      }),
      findAllIdentityTypes: build.query<
        FindAllIdentityTypesApiResponse,
        FindAllIdentityTypesApiArg
      >({
        query: (queryArg) => ({
          url: `/identityTypes/`,
          params: {
            sortDirection: queryArg.sortDirection,
          },
        }),
        providesTags: ["Identity Types"],
      }),
      getLoggedInUser: build.query<
        GetLoggedInUserApiResponse,
        GetLoggedInUserApiArg
      >({
        query: (queryArg) => ({
          url: `/auth/loggedInUser/${queryArg.username}`,
        }),
        providesTags: ["Authentication"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as coreApi };
export type ChangeAccountPasswordApiResponse = unknown;
export type ChangeAccountPasswordApiArg = {
  userAccountPasswordChangeRequest: UserAccountPasswordChangeRequest;
};
export type GetLookupsApiResponse = /** status 200 OK */ PageLookupResponse;
export type GetLookupsApiArg = {
  parentId?: number;
  lookupType?:
    | "GENDER"
    | "COUNTRY"
    | "ADDRESS_TYPE"
    | "CURRENCY"
    | "DIALING_CODE"
    | "CONTACT_NUMBER_TYPE"
    | "COUNTRY_CODE"
    | "COUNTRY_DISTINGUISHING_SIGN"
    | "ORGANISATION_TYPE"
    | "REGION"
    | "VEHICLE_USAGE"
    | "CANCEL_REASON"
    | "VEHICLE_TYPE"
    | "VEHICLE_COLOUR"
    | "VEHICLE_CATEGORY"
    | "VEHICLE_MAKE"
    | "VEHICLE_MODEL"
    | "INVALID_PLATE_NUMBER"
    | "DECK_DEACTIVATION_REASON"
    | "ADMIT_REASON"
    | "CORRIDOR"
    | "ORIGIN_DESTINATION"
    | "AUTHORISED_SPECIAL_RELEASE_REASON"
    | "SPECIAL_RELEASE_REASON"
    | "CARGO_TYPE"
    | "SKIP_LINK_REASON"
    | "OFFICER_TYPE"
    | "OFFICER_RANK"
    | "CHARGE_CATEGORY"
    | "OCCUPATION"
    | "DRIVING_LICENSE_CODE"
    | "PRDP_CODE"
    | "TRANSGRESSION_CANCEL_REASON"
    | "RTQS_TRANSGRESSION_CANCEL_REASON"
    | "SENTENCE_TYPE"
    | "SENTENCE"
    | "PAYMENT_METHOD"
    | "AARTO_NOTICE_TYPE";
  searchValue?: string;
  isValid?: boolean;
  isExact?: boolean;
  page: number;
  pageSize: number;
  sortDirection: "ASC" | "DESC";
  sortFields: string[];
};
export type RefreshAccessTokenApiResponse =
  /** status 200 OK */ RefreshTokensResponse;
export type RefreshAccessTokenApiArg = {
  body: string;
};
export type LoginApiResponse = /** status 200 OK */ LoginResponse;
export type LoginApiArg = {
  loginRequest: LoginRequest;
};
export type FindTrafficControlCentresByAuthorityApiResponse =
  /** status 200 OK */ TrafficControlCentreResponse[];
export type FindTrafficControlCentresByAuthorityApiArg = {
  authorityCode?: string;
};
export type GetMultipleLookupsApiResponse =
  /** status 200 OK */ LookupResponse[];
export type GetMultipleLookupsApiArg = {
  lookupIds: string[];
};
export type GetAboutApiResponse = /** status 200 OK */ Info;
export type GetAboutApiArg = void;
export type FindAllIdentityTypesApiResponse =
  /** status 200 OK */ IdTypeResponse[];
export type FindAllIdentityTypesApiArg = {
  sortDirection: "ASC" | "DESC";
};
export type GetLoggedInUserApiResponse =
  /** status 200 OK */ LoggedInUserAccountResponse;
export type GetLoggedInUserApiArg = {
  username: string;
};
export type UserAccountPasswordChangeRequest = {
  userAccountId: string;
  oldPassword: string;
  newPassword: string;
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
export type LookupResponse = {
  lookupValue: string;
  lookupType:
    | "GENDER"
    | "COUNTRY"
    | "ADDRESS_TYPE"
    | "CURRENCY"
    | "DIALING_CODE"
    | "CONTACT_NUMBER_TYPE"
    | "COUNTRY_CODE"
    | "COUNTRY_DISTINGUISHING_SIGN"
    | "ORGANISATION_TYPE"
    | "REGION"
    | "VEHICLE_USAGE"
    | "CANCEL_REASON"
    | "VEHICLE_TYPE"
    | "VEHICLE_COLOUR"
    | "VEHICLE_CATEGORY"
    | "VEHICLE_MAKE"
    | "VEHICLE_MODEL"
    | "INVALID_PLATE_NUMBER"
    | "DECK_DEACTIVATION_REASON"
    | "ADMIT_REASON"
    | "CORRIDOR"
    | "ORIGIN_DESTINATION"
    | "AUTHORISED_SPECIAL_RELEASE_REASON"
    | "SPECIAL_RELEASE_REASON"
    | "CARGO_TYPE"
    | "SKIP_LINK_REASON"
    | "OFFICER_TYPE"
    | "OFFICER_RANK"
    | "CHARGE_CATEGORY"
    | "OCCUPATION"
    | "DRIVING_LICENSE_CODE"
    | "PRDP_CODE"
    | "TRANSGRESSION_CANCEL_REASON"
    | "RTQS_TRANSGRESSION_CANCEL_REASON"
    | "SENTENCE_TYPE"
    | "SENTENCE"
    | "PAYMENT_METHOD"
    | "AARTO_NOTICE_TYPE";
  parentId?: number;
  startDate: string;
  endDate?: string;
  lookupCode: string;
  id: number;
  parentLookupValue?: string;
  parentLookupType?:
    | "GENDER"
    | "COUNTRY"
    | "ADDRESS_TYPE"
    | "CURRENCY"
    | "DIALING_CODE"
    | "CONTACT_NUMBER_TYPE"
    | "COUNTRY_CODE"
    | "COUNTRY_DISTINGUISHING_SIGN"
    | "ORGANISATION_TYPE"
    | "REGION"
    | "VEHICLE_USAGE"
    | "CANCEL_REASON"
    | "VEHICLE_TYPE"
    | "VEHICLE_COLOUR"
    | "VEHICLE_CATEGORY"
    | "VEHICLE_MAKE"
    | "VEHICLE_MODEL"
    | "INVALID_PLATE_NUMBER"
    | "DECK_DEACTIVATION_REASON"
    | "ADMIT_REASON"
    | "CORRIDOR"
    | "ORIGIN_DESTINATION"
    | "AUTHORISED_SPECIAL_RELEASE_REASON"
    | "SPECIAL_RELEASE_REASON"
    | "CARGO_TYPE"
    | "SKIP_LINK_REASON"
    | "OFFICER_TYPE"
    | "OFFICER_RANK"
    | "CHARGE_CATEGORY"
    | "OCCUPATION"
    | "DRIVING_LICENSE_CODE"
    | "PRDP_CODE"
    | "TRANSGRESSION_CANCEL_REASON"
    | "RTQS_TRANSGRESSION_CANCEL_REASON"
    | "SENTENCE_TYPE"
    | "SENTENCE"
    | "PAYMENT_METHOD"
    | "AARTO_NOTICE_TYPE";
  childCount?: number;
  lookupId?: string;
  enabled?: boolean;
  visible?: boolean;
};
export type PageLookupResponse = {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: LookupResponse[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  empty?: boolean;
};
export type RefreshTokensResponse = {
  accessToken: string;
  refreshToken: string;
};
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  resetCredentials: boolean;
  userAccountId: string;
  tenantRoles: string[];
};
export type LoginRequest = {
  username: string;
  password: string;
  tenant: string;
};
export type AddressDto = {
  id?: number;
  addressTypeLookup?: string;
  countryLookup?: string;
  lineOne?: string;
  lineTwo?: string;
  lineThree?: string;
  code?: string;
  city?: string;
};
export type IdentificationDto = {
  id?: number;
  primaryId?: boolean;
  number?: string;
  identificationType?: "NATIONAL_ID" | "PASSPORT" | "TRN";
  countryOfIssueLookup?: string;
};
export type ContactNumberDto = {
  id?: number;
  number?: string;
  dialingCodeLookup?: string;
  contactNumberTypeLookup?: string;
};
export type EmailDto = {
  id?: number;
  emailAddress?: string;
  preferredEmail?: boolean;
  verified?: boolean;
};
export type PersonDto = {
  id?: number;
  firstName?: string;
  surname?: string;
  dateOfBirth?: string;
  physical?: AddressDto;
  postal?: AddressDto;
  genderLookup?: string;
  identifications?: IdentificationDto[];
  contactNumbers?: ContactNumberDto[];
  emails?: EmailDto[];
};
export type AuthorityPersonResponse = {
  id: number;
  firstName: string;
  surname: string;
  primaryContactType?: string;
  primaryContactCode?: string;
  primaryContactNumber?: string;
};
export type AuthorityResponse = {
  id: number;
  authorityId: string;
  authorityCode: string;
  authorityName: string;
  locality?: string;
  organisationTypeLookup: string;
  regionLookup?: string;
  contactPersonId?: number;
  contactPerson: AuthorityPersonResponse;
  physical: AddressDto;
  postal?: AddressDto;
  parentAuthorityId?: number;
  userGroupTypes?: ("CENTRAL" | "WEIGHSTATION" | "TCM")[];
};
export type WeighbridgeDto = {
  id?: number;
  weighbridgeId?: string;
  weighbridgeCode?: string;
  weighbridgeDescription?: string;
  weighbridgeType?: "LCC" | "LAYBY";
  longitude?: string;
  latitude?: string;
  tripsWeighStationCode?: string;
  parentWeighbridge?: WeighbridgeDto;
  road?: string;
};
export type TrafficControlCentreResponse = {
  id?: number;
  trafficControlCentreId?: string;
  trafficControlCentreName?: string;
  countryRegionLookup?: string;
  corridorLookup?: string;
  longitude?: string;
  latitude?: string;
  contactPerson?: PersonDto;
  authority?: AuthorityResponse;
  weighbridges?: WeighbridgeDto[];
  privateBag?: string;
  town?: string;
  postalCode?: string;
};
export type Info = {
  applicationName?: string;
  applicationVersion?: string;
  gitBuildVersion?: string;
  gitBranch?: string;
  gitCommitId?: string;
  gitTimeStamp?: string;
  replicated?: boolean;
  replicationEnabled?: boolean;
  replicationMode?: string;
};
export type IdTypeResponse = {
  name?: string;
  description?: string;
};
export type AuthorityUserGroupResponse = {
  id: number;
  authorityId: string;
  authorityCode: string;
  authorityName: string;
};
export type UserRoleDto = {
  id: number;
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
    | "ROLE_CANCELRTQSTRANSGRESSION_MAINTAIN";
  enabled: boolean;
  description: string;
  activationDate?: string;
  expirationDate?: string;
  subsystem?:
    | "Trafman-Weigh-FE"
    | "Trafman-Transgressions-FE"
    | "Trafman-Weigh-BE"
    | "Trafman-Portal"
    | "Trafman-Core-BE"
    | "Trafman-Core-FE"
    | "Trafman-Data-Warehouse-BE";
};
export type UserGroupDto = {
  id?: number;
  userGroupName?: string;
  userGroupDescription?: string;
  userRoles?: UserRoleDto[];
  userGroupTypes?: ("CENTRAL" | "WEIGHSTATION" | "TCM")[];
};
export type UserAccountGroupResponseDto = {
  id?: number;
  authority?: AuthorityUserGroupResponse;
  userGroup?: UserGroupDto;
};
export type LoggedInUserAccountResponse = {
  id?: number;
  username?: string;
  userAccountId?: string;
  isActive?: boolean;
  firstName?: string;
  surname?: string;
  userAccountGroups?: UserAccountGroupResponseDto[];
};
export const {
  useChangeAccountPasswordMutation,
  useGetLookupsQuery,
  useRefreshAccessTokenMutation,
  useLoginMutation,
  useFindTrafficControlCentresByAuthorityQuery,
  useGetMultipleLookupsQuery,
  useGetAboutQuery,
  useFindAllIdentityTypesQuery,
  useGetLoggedInUserQuery,
} = injectedRtkApi;
