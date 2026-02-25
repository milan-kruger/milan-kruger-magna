import { useCallback, useEffect, useMemo, useState } from "react";
import {
    GetLookupsApiArg,
    LookupResponse,
    useGetLookupsQuery,
} from "../redux/api/coreApi";
import { t } from "i18next";

const PAGE_LIMIT = 50;

const useSmartLookupProvider = (
  lookupType:
    | "VEHICLE_USAGE"
    | "VEHICLE_TYPE"
    | "VEHICLE_MAKE"
    | "VEHICLE_MODEL"
    | "VEHICLE_COLOUR"
    | "ORIGIN_DESTINATION"
    | "COUNTRY"
    | "VEHICLE_CATEGORY"
    | "GENDER"
    | "OCCUPATION"
    | "DRIVING_LICENSE_CODE"
    | "PRDP_CODE"
    | "DIALING_CODE"
    | "CONTACT_NUMBER_TYPE"
    | "CARGO_TYPE"
    | "TRANSGRESSION_CANCEL_REASON"
    | "PAYMENT_METHOD"
    | "SENTENCE"
    | "SENTENCE_TYPE",
  initialValue: string | string[]
) => {

  const normalizedInitialValue = Array.isArray(initialValue)
    ? undefined
    : initialValue;

  const [listPageFilter, setListPageFilter] = useState<GetLookupsApiArg>({
    lookupType,
    searchValue: normalizedInitialValue,
    page: 0,
    pageSize: PAGE_LIMIT,
    sortDirection: "ASC",
    sortFields: ["lookupType", "lookupValue"],
    isValid: true
  });

  const { data: lookupsResponse, isFetching: isFetchingLookups } =
    useGetLookupsQuery(listPageFilter);
  const [lookups, setLookups] = useState<LookupResponse[]>([]);

  const getNextLookupsPage = useCallback(() => {
    if (!lookupsResponse?.last) {
      setListPageFilter({
        ...listPageFilter,
        page: listPageFilter.page + 1,
      });
    }
  }, [lookupsResponse, listPageFilter]);

  const { data: findLookupResponse } = useGetLookupsQuery(listPageFilter);

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (lookupsResponse) {
      setIsUpdating(false);
      setLookups((prevOptions: LookupResponse[]) => {
        const existingLookupIds = new Set(
          prevOptions.map((option) => option.id)
        );
        const newLookups = (lookupsResponse?.content ?? []).filter(
          (lookup) => !existingLookupIds.has(lookup.id)
        );
        return [...prevOptions, ...newLookups];
      });
    }
  }, [lookupsResponse]);

  const lookupResponseData = useMemo(() => {
    return {
      options: findLookupResponse?.content ? findLookupResponse.content : [],
    };
  }, [findLookupResponse]);

  useEffect(() => {
    const updateLookups = (options: LookupResponse[]) => {
      for (const value of options) {
        if (listPageFilter.searchValue === value.lookupId) {
          setLookups((prevLookups) => {
            const updatedLookups = new Set(
              prevLookups.map((lookup) => lookup.lookupId)
            );
            if (!updatedLookups.has(value.lookupId)) {
              return [...prevLookups, value];
            }
            return prevLookups;
          });
        }
      }
    };

    if (lookupResponseData) {
      updateLookups(lookupResponseData.options);
    }
  }, [lookupResponseData, listPageFilter.searchValue, lookups, listPageFilter]);

  const updateLookups = useCallback((lookupValue: string | string[] | null | undefined) => {
    let searchValue: string | undefined;
    if (Array.isArray(lookupValue)) {
      searchValue = undefined;
    } else {
      searchValue = lookupValue ?? undefined;
    }

    if (searchValue && !isUpdating) {
      setIsUpdating(true);
      setListPageFilter({
        ...listPageFilter,
        searchValue,
        page: 0,
      });
    }
  }, [listPageFilter, isUpdating])

  const getLookupValue = useCallback(
    (lookupValue: string | string[] | null | undefined, multiple: boolean = false): LookupResponse | LookupResponse[] | null => {
      if (Array.isArray(lookupValue)) {
        if (!lookupValue || lookupValue.length === 0) {
          return multiple ? [] : null;
        }

        if (lookupResponseData) {
          const found = lookupValue.map(val => {
            return lookupResponseData.options.find(value =>
              value.lookupValue.toLocaleLowerCase() === val?.toLocaleLowerCase() ||
              value.lookupCode.toLocaleLowerCase() === val?.toLocaleLowerCase()
            ) ?? null;
          }).filter(Boolean) as LookupResponse[];

          if (found.length) return found;

          updateLookups(lookupValue);
        }
        return multiple ? [] : null;
      }

      if (lookupValue && lookupResponseData) {
        const found = lookupResponseData.options.find(value =>
          value.lookupValue.toLocaleLowerCase() === lookupValue?.toLocaleLowerCase() ||
          value.lookupCode.toLocaleLowerCase() === lookupValue?.toLocaleLowerCase()
        );

        if (found) return found;
        updateLookups(lookupValue);
      }

      return multiple ? [] : null;
    },
    [lookupResponseData, updateLookups]
  );

  const getOptionLabel = useCallback(
    (option: LookupResponse | LookupResponse[]) => {
        if (Array.isArray(option)) {
            return option.map(item => `${item.lookupCode} - ${t(item.lookupValue)}`).join(', ');
        }else {
            return (t(option.lookupCode) ?? option.lookupCode) + " - " + (t(option.lookupValue) ?? option.lookupValue);
        }
    }, []);

  const isOptionEqualToValue = useCallback(
    (option: unknown, value: unknown) =>
      (option as LookupResponse).lookupId ===
      (value as LookupResponse).lookupId || value === null,
    []
  );

  return [
    listPageFilter,
    setListPageFilter,
    setLookups,
    lookups,
    lookupsResponse,
    getNextLookupsPage,
    isFetchingLookups,
    getOptionLabel,
    isOptionEqualToValue,
    getLookupValue,
  ] as const;
};

export default useSmartLookupProvider;
