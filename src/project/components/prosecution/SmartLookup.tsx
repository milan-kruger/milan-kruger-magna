import { useAppDispatch, useAppSelector } from "../../../framework/redux/hooks";
import { LookupResponse } from "../../redux/api/coreApi";
import { Dispatch, ReactNode, SetStateAction, SyntheticEvent, memo, useCallback, useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import { SxProps, Theme, useMediaQuery } from "@mui/material";
import { fieldsWidth } from "../../../framework/utils";
import useSmartLookupProvider from "../../utils/SmartLookupProvider";
import { selectDriverPrDPCodes, transgressionSlice } from "../../redux/transgression/transgressionSlice";

type Props = {
    testid: string;
    label: string;
    required: boolean | undefined;
    lookupType:
    |'VEHICLE_USAGE'
    | 'VEHICLE_TYPE'
    | 'VEHICLE_MAKE'
    | 'VEHICLE_MODEL'
    | 'VEHICLE_COLOUR'
    | 'ORIGIN_DESTINATION'
    | 'COUNTRY'
    | 'VEHICLE_CATEGORY'
    | 'GENDER'
    | 'OCCUPATION'
    | 'DRIVING_LICENSE_CODE'
    | 'PRDP_CODE'
    | 'DIALING_CODE'
    | 'CONTACT_NUMBER_TYPE'
    | 'CARGO_TYPE'
    | 'TRANSGRESSION_CANCEL_REASON'
    | 'PAYMENT_METHOD'
    | 'SENTENCE'
    | 'SENTENCE_TYPE';
    disabled: boolean;
    readonly: boolean;
    fieldKey: string;
    fieldValue: string | string[] | undefined;
    error: boolean | undefined;
    helperText: string;
    isUpdateOnWeigh?: boolean;
    showTooltipPopup?: boolean;
    customWidth?: string | number;
    sx?: SxProps<Theme>;
    setLookupValue?: Dispatch<SetStateAction<LookupResponse | LookupResponse[] | null>>;
}

function SmartLookup({ testid, label, required, lookupType,
    disabled, readonly, fieldKey, fieldValue,
    error, helperText, isUpdateOnWeigh, showTooltipPopup = false, sx, customWidth, setLookupValue, ...props }: Readonly<Props>) {

    const isMultiple = lookupType === 'PRDP_CODE';
    const dispatch = useAppDispatch();

    const multiLookupId = useAppSelector(isMultiple ? selectDriverPrDPCodes : () => undefined);
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const [listPageFilter,
        setListPageFilter,
        setLookups,
        lookups,
        lookupsResponse,
        getNextLookupsPage,
        isFetchingLookups,
        getOptionLabel,
        isOptionEqualToValue,
        getLookupValue
    ] = useSmartLookupProvider(lookupType, fieldValue ?? "");

    const handleOnInputChange = useDebouncedCallback((_event: React.SyntheticEvent<Element, Event>, value: string) => {
        let searchValue = "";
        if (value.includes(" - ")) {
            searchValue = value.split("-", 2)[0].replace(" ", "");
        }
        else {
            searchValue = value.trim();
        }
        if (listPageFilter.searchValue !== searchValue) {
            setListPageFilter({
                ...listPageFilter,
                page: 0,
                searchValue: searchValue
            });
            setLookups([]);
        }
    }, 500);

    const handleOnChange = useCallback((_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
        if (lookupType === 'DRIVING_LICENSE_CODE') {
            dispatch(transgressionSlice.actions.setFormDataField({ key: fieldKey, value: value ? value.lookupCode : null }));
        }else if(lookupType === 'PRDP_CODE') {
            const selectedValues = Array.isArray(value)
                ? value.map(item => item.lookupValue)
                : [value?.lookupValue];

            dispatch(transgressionSlice.actions.setFormDataField({key: fieldKey, value: selectedValues}));
        }
        else {
            dispatch(transgressionSlice.actions.setFormDataField({ key: fieldKey, value: value?.lookupValue }));
        }
    }, [dispatch, fieldKey, lookupType]);

    const currentLookupValue = useMemo((): LookupResponse | LookupResponse[] | null => {
        return getLookupValue(fieldValue, isMultiple);
    }, [getLookupValue, fieldValue, isMultiple]);

    useEffect(() => {
        setLookupValue?.(currentLookupValue);
    }, [currentLookupValue, setLookupValue]);

    const isDisabled = disabled;

    const maxWidth = useCallback(() => {
        if (multiLookupId && multiLookupId.length > 1) {
            return isDisabled ? '80%' : '75%'
        } else {
            return isDisabled ? '100%' : '85%';
        }
    }, [isDisabled, multiLookupId]);

    const prValue = useCallback(() => {
        if (isDisabled) {
            return '0 !important';
        } else {
            return 15;
        }
    }, [isDisabled])

    return (
        <TmAutocomplete
            {...props}
            testid={testid}
            label={label}
            required={required}
            renderInput={(): ReactNode => { return; }}
            options={lookups}
            alternative={true}
            value={currentLookupValue}
            onChange={handleOnChange}
            multiple={lookupType === 'PRDP_CODE'}
            limitTags={1}
            onInputChange={handleOnInputChange}
            paginated={true}
            hasNextPage={!lookupsResponse?.last}
            getNextPage={getNextLookupsPage}
            isNextPageLoading={isFetchingLookups}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            isCountry={lookupType === 'COUNTRY'}
            error={error}
            helperText={helperText}
            disabled={disabled}
            renderPaginatedOptionItem={getOptionLabel}
            isUpdateOnWeigh={isUpdateOnWeigh}
            showtooltippopup={showTooltipPopup}
            readonly={readonly}
            sx={sx ?? {
                width: customWidth ?? fieldsWidth(isMobile),
                ...(isMultiple && {
                    '& .MuiAutocomplete-tag': {
                        height: '18px',
                        maxWidth: maxWidth(),
                        fontSize: '0.9em',
                        lineHeight: 'normal',
                        opacity: isDisabled ? undefined : '1 !important'
                    },
                    '& .MuiChip-deleteIcon': {
                        fontSize: '18px !important',
                        display: isDisabled ? 'none' : 'inherit'
                    },
                    ...(multiLookupId && multiLookupId.length > 0 && {
                        '&:not(.Mui-focused) .MuiAutocomplete-input': {
                            height: '0px'
                        }
                    }),
                    '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiAutocomplete-inputRoot': {
                        pr: 15
                    },
                    '&.MuiAutocomplete-hasPopupIcon .MuiAutocomplete-inputRoot': {
                        pr: prValue()
                    }
                }),
                '& .MuiFormHelperText-root': {
                    marginTop: 0,
                    lineHeight: 1.1,
                },
                '& .MuiInputBase-input.MuiInput-input': {
                    fontSize: 'medium'
                }
            }}
        />
    );
}

export default memo(SmartLookup);
