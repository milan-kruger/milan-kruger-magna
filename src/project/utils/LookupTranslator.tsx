import {useCallback, useMemo, useState} from "react";
import {
  coreApi,
  GetLookupsApiArg, LookupResponse,
} from "../redux/api/coreApi";
import { useAppDispatch } from "../../framework/redux/hooks";
import { RetrieveTransgressionInformationResponse } from "../redux/api/transgressionsApi";

export type TranslatedLookups = {
  [key: string]: string | string[] | undefined;
};

const useLookupTranslator = () => {
  const [translatedLookups, setTranslatedLookups] = useState<TranslatedLookups>(
    {}
  );
  const translatedLookupsRef: TranslatedLookups = {};
  const lookupsRef: { [key: string]: LookupResponse } = {};

  const dispatch = useAppDispatch();

  const lookUpRequest: GetLookupsApiArg = useMemo(() => {
    return {
        lookupType: "GENDER",
        page: 0,
        pageSize: 1,
        sortDirection: "ASC",
        sortFields: [],
        isExact: true,
    };
    }, []);


  const addUpdateTranslation = (key: string, value: string | string[] | undefined) => {
    translatedLookupsRef[key] = value;
  };

  // eslint disabled for this block to exclude translatedLookupsRef form the dependencies array
  // as that quickly causes an infinite loop
  /* eslint-disable react-hooks/exhaustive-deps*/
  const translateLookupValueToId = useCallback(
    (
      lookupValue: string | string[] | undefined,
      lookupType: GetLookupsApiArg["lookupType"],
      formField: string,
      useLookUpCode: boolean = false
    ) => {
      if (lookupValue && lookupType) {

        if (Array.isArray(lookupValue)) {
          const results: string[] = [];
          for (const value of lookupValue) {

            dispatch(
              coreApi.endpoints.getLookups.initiate({
                ...lookUpRequest,
                lookupType: lookupType,
                searchValue: value
              })
            ).then((data) => {
              const result = useLookUpCode
                ? data?.data?.content?.at(0)?.lookupCode
                : data?.data?.content?.at(0)?.lookupId;

              if (result) {
                results.push(result);
              }

              addUpdateTranslation(formField, results);
              setTranslatedLookups(translatedLookupsRef);
            });
          }
        }
        else {
          let parentId: number | undefined;

          if (
            lookupType === "DRIVING_LICENSE_CODE" &&
            lookupsRef["driver.countryOfIssue"]
          ) {
            parentId = lookupsRef["driver.countryOfIssue"].id;
          }

          dispatch(
            coreApi.endpoints.getLookups.initiate({
              ...lookUpRequest,
              lookupType: lookupType,
              searchValue: lookupValue as string,
              parentId,
            })
          ).then((data) => {
            const value = useLookUpCode
              ? data?.data?.content?.at(0)?.lookupCode
              : data?.data?.content?.at(0)?.lookupId;

            const lookup = data?.data?.content?.at(0);
            if (lookup) {
              lookupsRef[formField] = lookup as LookupResponse;
            }

            addUpdateTranslation(formField, value);
            setTranslatedLookups(translatedLookupsRef);
          });
        }
      }
    },
    [lookUpRequest, dispatch]
  );
  /* eslint-enable */

  const translateLookupIdToValue = useCallback(
    (lookupId: string | undefined): Promise<string | undefined> => {
      if (!lookupId) return Promise.resolve(undefined);
      return dispatch(
        coreApi.endpoints.getMultipleLookups.initiate({
          lookupIds: [lookupId],
        })
      ).then((data) => data?.data?.at(0)?.lookupValue);
    },
    [dispatch]
  );

  const lookupVehicleConfiguration = useCallback(
    (data: RetrieveTransgressionInformationResponse) => {
      translateLookupValueToId(
        data?.vehicleConfiguration?.vehicles[0].vehicleMake,
        "VEHICLE_MAKE",
        "vehicleConfiguration.vehicles[0].vehicleMake"
      );
      translateLookupValueToId(
        data?.vehicleConfiguration?.vehicles[0].colour,
        "VEHICLE_COLOUR",
        "vehicleConfiguration.vehicles[0].colour"
      );
      if (data.route) {
        translateLookupValueToId(
          data.route?.originOfCargo,
          "ORIGIN_DESTINATION",
          "route.originOfCargo"
        );
        translateLookupValueToId(
          data.route?.destinationOfCargo,
          "ORIGIN_DESTINATION",
          "route.destinationOfCargo"
        );
      }
      translateLookupValueToId(
        data.route?.cargo,
        "CARGO_TYPE",
        "route.cargo"
      );
    },
    [translateLookupValueToId]
  );

  const lookupDriverDetails = useCallback(
    (data: RetrieveTransgressionInformationResponse) => {
      translateLookupValueToId(
        data?.driver?.identification?.countryOfIssue,
        "COUNTRY",
        "driver.identification.countryOfIssue"
      );
      translateLookupValueToId(data?.driver?.gender, "GENDER", "driver.gender");
      translateLookupValueToId(
        data?.driver?.contactNumber?.dialingCode,
        "DIALING_CODE",
        "driver.contactNumber.dialingCode"
      );
      translateLookupValueToId(
        data?.driver?.countryOfIssue,
        "COUNTRY",
        "driver.countryOfIssue"
      );
      translateLookupValueToId(
        data?.driver?.residentialCountry,
        "COUNTRY",
        "driver.residentialCountry"
      );
      translateLookupValueToId(
        data?.driver?.prDPCodes,
        "PRDP_CODE",
        "driver.prDPCodes",
      );
      translateLookupValueToId(
        data?.driver?.contactNumber?.contactNumberType,
        "CONTACT_NUMBER_TYPE",
        "driver.contactNumber.contactNumberType"
      );
    },
    [translateLookupValueToId]
  );

  const lookupOperatorDetails = useCallback(
    (data: RetrieveTransgressionInformationResponse) => {
      if (data.operator) {
        translateLookupValueToId(
          data.operator?.businessCountry,
          "COUNTRY",
          "operator.businessCountry"
        );
      }
    },
    [translateLookupValueToId]
  );

  const translateOverloadTransgressionInformation = useCallback(
    (data: RetrieveTransgressionInformationResponse) => {
      lookupVehicleConfiguration(data);
      lookupDriverDetails(data);
      lookupOperatorDetails(data);
    },
    [lookupVehicleConfiguration, lookupDriverDetails, lookupOperatorDetails]
  );

  return [
    translateOverloadTransgressionInformation,
    translatedLookups,
    lookupVehicleConfiguration,
    lookupDriverDetails,
    lookupOperatorDetails,
    addUpdateTranslation,
    translateLookupIdToValue,
  ] as const;
};

export default useLookupTranslator;
