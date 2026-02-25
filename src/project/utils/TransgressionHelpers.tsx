/* eslint-disable @typescript-eslint/no-explicit-any */
import { Location, NavigateFunction } from "react-router-dom";
import ObjectUtil from "../../framework/utils/ObjectUtil";
import { Depot, Operator, OverloadTransgressionDto, RtqsChargeCompilationDto, RtqsTransgressionDto, TransgressionConfiguration, Vehicle } from "../redux/api/transgressionsApi";
import { TransgressionValidation } from "../redux/transgression/TransgressionValidation";
import { containsSpecialCharacters, titleCaseWord } from "../../framework/utils";
import { IdTypeResponse } from "../redux/api/coreApi";
import { ROUTE_NAMES } from "../Routing";
import { JsonObjectType } from "../enum/JsonObjectType";
import { TFunction } from "i18next";

type ChangeChecker = (formData: any, initialFormData: any) => boolean;

type BaseTransgressionData = {
    transgressionStatus: string;
    transgressionDate: string | Date;
    transgressionLocation: string;
    transgressionVersion: string;
    gpsYCoordinate: number;
    gpsXCoordinate: number;
    noticeNumber: string;
    route: string;
    authorityCode: string;
    operator: any;
    charges: any[];
    vehicleConfiguration?: { vehicles: any[] };
    totalAmountPayable: number;
    sequenceNumber?: number;
};

interface CancelNavigationParams {
    pathname: string;
    navigate: NavigateFunction;
    weighBaseURL?: string;
    sequenceNumber?: string;
    removePendingProsecution?: (payload: { sequenceNumber: number }) => void;
}

const buildOperator = (operator: any): Operator => ({
    businessAddressLine1: operator?.businessAddressLine1,
    businessAddressLine2: operator?.businessAddressLine2,
    businessCity: operator?.businessCity,
    businessCountry: operator?.businessCountry,
    businessPostalCode: operator?.businessPostalCode,
    name: operator?.name,
    operatorDiscNumber: operator?.operatorDiscNumber,
    depots: clearEmptyEmails(operator?.depots)
});

const buildVehicle = (vehicle: any, cargo: string): Vehicle => ({
    ...vehicle,
    cargo: cargo
})

const buildCommonTransgressionFields = (
    formData: any,
    transgressionDetails: any,
    type: 'RtqsTransgression' | 'OverloadTransgression'
) => {
    const result: Record<string, any> = {};

    const assignIfDefined = (key: string, value: any) => {
        if (value !== undefined && value !== null) {
            result[key] = value;
        }
    };

    // Required field
    result.type = type;

    // Conditionally assign all potentially undefined fields
    assignIfDefined('vehicle', buildVehicle(formData.vehicleConfiguration?.vehicles?.[0], formData.route.cargo));
    assignIfDefined('driver', formData.driver);
    assignIfDefined('operator', buildOperator(formData.operator));
    assignIfDefined('emailAddress', formData.operator?.depots?.[0]?.emails?.[0]?.emailAddress);

    // Use formatContactNumber helper to handle contact formatting consistently
    const formattedContact = formatContactNumber(formData.driver);
    if (formattedContact) {
        assignIfDefined('contactNumber', formattedContact);
    }

    // Handle contact metadata separately
    const contactNumber = formData.driver?.contactNumber;
    assignIfDefined('contactNumberType', contactNumber?.contactNumberType);
    assignIfDefined('dialingCode', contactNumber?.dialingCode);

    assignIfDefined('status', formData.transgressionStatus);
    assignIfDefined('transgressionDate', formData.transgressionDate);

    // Transgression details
    assignIfDefined('transgressionLocation', transgressionDetails.transgressionLocation);
    assignIfDefined('transgressionVersion', transgressionDetails.transgressionVersion);
    assignIfDefined('gpsXCoordinate', transgressionDetails.gpsXCoordinate);
    assignIfDefined('gpsYCoordinate', transgressionDetails.gpsYCoordinate);

    if (transgressionDetails.noticeNumber?.dateCreated) {
        result.noticeNumber = {
            ...transgressionDetails.noticeNumber,
            dateCreated: new Date(transgressionDetails.noticeNumber.dateCreated).toISOString()
        };
    }

    assignIfDefined('policeStationName', transgressionDetails.policeStationName);
    assignIfDefined('policeStationDistrict', transgressionDetails.policeStationDistrict);
    assignIfDefined('noOfPeaceOfficer', transgressionDetails.noOfPeaceOfficer);
    assignIfDefined('issuingAuthority', transgressionDetails.issuingAuthority);
    assignIfDefined('courtAppearanceDate', transgressionDetails.courtAppearanceDate);
    assignIfDefined('courtCode', transgressionDetails.courtCode);
    assignIfDefined('courtNumber', transgressionDetails.courtNumber);
    assignIfDefined('courtName', transgressionDetails.courtName);
    assignIfDefined('road', transgressionDetails.road);
    assignIfDefined('paymentDueDate', transgressionDetails.paymentDueDate);
    assignIfDefined('paymentReference', transgressionDetails.paymentReference);
    assignIfDefined('officerId', transgressionDetails.officerId);
    assignIfDefined('officerName', transgressionDetails.officerName);
    assignIfDefined('officerSurname', transgressionDetails.officerSurname);

    assignIfDefined('route', formData.route);

    assignIfDefined('authorityCode', transgressionDetails.authorityCode);
    assignIfDefined('town', transgressionDetails.town);
    assignIfDefined('postalCode', transgressionDetails.postalCode);
    assignIfDefined('privateBag', transgressionDetails.privateBag);
    assignIfDefined('totalAmountPayable', transgressionDetails.totalAmountPayable);

    return result;
};

const buildUpdateRequest = (transgression: any) => {
    const clone = JSON.parse(JSON.stringify(transgression));
    const depot = transgression.operator?.depots?.at(0);
    if (clone.driver?.depot && depot) {
        clone.driver.depot = depot;
    }
    return clone;
};

const extractChangeDetails = (formData: any, compareFormData: any) => ({
    vehicleDetails: vehicleDetailsChanged(formData, compareFormData),
    operatorDetails: operatorDetailsChanged(formData, compareFormData),
    driverDetails: driverDetailsChanged(formData, compareFormData),
    residentialAddressDetails: residentialAddressDetailsChanged(formData, compareFormData),
    businessAddressDetails: businessAddressDetailsChanged(formData, compareFormData),
    chargeDetails: chargeDetailsChanged?.(formData, compareFormData) // Safe in case Overload doesn't use it
});

const hasValidData = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) return Object.keys(value).length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    return value != null; // `!=` checks for both `null` and `undefined`
};

/**
 * Generic function to check if specific fields have changed
 * @param sourceData First object to compare
 * @param compareData Second object to compare
 * @param detailsExtractor Function that extracts relevant fields for comparison
 * @returns boolean indicating whether any fields have changed
 */
export function haveDetailsChanged<T, U>(
    sourceData: T | undefined | null,
    compareData: U | undefined | null,
    detailsExtractor: (data: T | U) => Record<string, any>
): boolean {
    if (!sourceData && !compareData) {
        return false; // both are null/undefined → no change
    }

    if (!sourceData || !compareData) {
        return true; // one is null/undefined → change occurred
    }

    const details = detailsExtractor(sourceData);
    const compareDetails = detailsExtractor(compareData);

    return ObjectUtil.hasChanged(details, compareDetails);
}

export function vehicleDetailsChanged(formData: any, compareFormData: any): boolean {
    const extractVehicleDetails = (data: any) => ({
        vehicle: data.vehicleConfiguration?.vehicles[0],
        route: data.route
    });

    const vehicleData = formData ?? {};
    const compareVehicleData = compareFormData ?? {};

    return ObjectUtil.hasChanged(
        extractVehicleDetails(vehicleData),
        extractVehicleDetails(compareVehicleData)
    );
}

export function operatorDetailsChanged(formData: any, compareFormData: any): boolean {
    const extractOperatorDetails = (operator: any) => ({
        depotName: operator.depots?.[0]?.name,
        name: operator.name,
        operatorDiscNumber: operator.operatorDiscNumber,
        operatorDepotEmail: operator.depots?.[0]?.emails?.[0]?.emailAddress,
        tripsDepotIdentifier: operator.depots?.[0]?.tripsDepotIdentifier
    });

    const operatorData = formData?.operator ?? {};
    const compareOperatorData = compareFormData?.operator ?? {};

    return ObjectUtil.hasChanged(
        extractOperatorDetails(operatorData),
        extractOperatorDetails(compareOperatorData)
    );
}

export function driverDetailsChanged(formData: any, compareFormData: any): boolean {
    const extractDriverDetails = (driver: any) => ({
        firstNames: driver.firstNames,
        surname: driver.surname,
        identification: driver.identification,
        dateOfBirth: driver.dateOfBirth,
        gender: driver.gender,
        occupation: driver.occupation,
        contactNumber: driver.contactNumber,
        countryOfIssue: driver.countryOfIssue,
        licenceCode: driver.licenceCode,
        licenceNumber: driver.licenceNumber,
        prDPCodes: driver.prDPCodes,
        prDPNumber: driver.prDPNumber,
        trn: driver.trn
    });

    const driverData = formData?.driver ?? {};
    const compareDriverData = compareFormData?.driver ?? {};

    return ObjectUtil.hasChanged(
        extractDriverDetails(driverData),
        extractDriverDetails(compareDriverData)
    );
}

export function residentialAddressDetailsChanged(formData: any, compareFormData: any): boolean {
    const extractResidentialDetails = (driver: any) => ({
        residentialAddressLine1: driver?.residentialAddressLine1,
        residentialAddressLine2: driver?.residentialAddressLine2,
        residentialCity: driver?.residentialCity,
        residentialCountry: driver?.residentialCountry,
        residentialPostalCode: driver?.residentialPostalCode
    });

    const driverData = formData?.driver ?? {};
    const compareDriverData = compareFormData?.driver ?? {};

    return ObjectUtil.hasChanged(
        extractResidentialDetails(driverData),
        extractResidentialDetails(compareDriverData)
    );
}


export function businessAddressDetailsChanged(formData: any, compareFormData: any): boolean {
    const extractBusinessDetails = (operator: any) => ({
        businessAddressLine1: operator.businessAddressLine1,
        businessAddressLine2: operator.businessAddressLine2,
        businessCity: operator.businessCity,
        businessCountry: operator.businessCountry,
        businessPostalCode: operator.businessPostalCode
    });

    const operatorData = formData?.operator ?? {};
    const compareOperatorData = compareFormData?.operator ?? {};

    return ObjectUtil.hasChanged(
        extractBusinessDetails(operatorData),
        extractBusinessDetails(compareOperatorData)
    );
}

export function chargeDetailsChanged(formData: any, compareFormData: any): boolean {
    const chargesData = formData?.charges ?? [];
    const compareChargesData = compareFormData?.charges ?? [];

    return ObjectUtil.hasChanged(chargesData, compareChargesData);
}

export function clearEmptyEmails(depots: Depot[] | null | undefined): Depot[] {
    if (!depots) return [];

    return depots
        .map(depot => ({
            ...depot,
            emails: depot.emails?.filter(email => email.emailAddress?.trim()) || [],
        }))
        .filter(depot => Object.values(depot).some(hasValidData));
}

export function buildTransgressionDto<T extends BaseTransgressionData>(
    data: T,
    type: 'RtqsTransgressionDto' | 'OverloadTransgressionDto'
) {
    const base = {
        type,
        status: data.transgressionStatus,
        transgressionDate: new Date(data.transgressionDate).toISOString(),
        transgressionLocation: data.transgressionLocation,
        transgressionVersion: data.transgressionVersion,
        gpsYCoordinate: data.gpsYCoordinate,
        gpsXCoordinate: data.gpsXCoordinate,
        noticeNumber: data.noticeNumber,
        route: data.route,
        authorityCode: data.authorityCode,
        operator: data.operator,
        snapshotCharges: data.charges,
        vehicle: data.vehicleConfiguration?.vehicles[0],
        totalAmountPayable: data.totalAmountPayable,
    };

    // Conditionally add `sequenceNumber` for Overload DTOs
    if (type === 'OverloadTransgressionDto' && 'sequenceNumber' in data) {
        return JSON.parse(JSON.stringify({
            ...base,
            sequenceNumber: data.sequenceNumber,
        }));
    }

    return JSON.parse(JSON.stringify(base));
}

/**
 * Detects if charge codes have changed between form charges and original snapshot charges.
 * This determines whether backend needs to recompile charges (code change)
 * vs just merge attribute updates (no code change).
 *
 * @param formCharges - TmRtqsCharge[] from the form
 * @param snapshotCharges - Original SnapshotRtqsCharge[] from backend
 * @returns true if any charge code has changed
 */
const haveChargeCodesChanged = (formCharges: any[], snapshotCharges: any[]): boolean => {
    const actualFormCharges = formCharges.filter((charge: any) => !charge.isNew);

    // If counts differ, charges have definitely changed
    if (actualFormCharges.length !== snapshotCharges.length) {
        return true;
    }

    // Check if any charge code has changed
    for (let i = 0; i < actualFormCharges.length; i++) {
        const formCharge = actualFormCharges[i];
        const snapshot = snapshotCharges[i];

        // Compare charge codes - if different, charges have changed
        if (formCharge.chargeCode !== snapshot.chargeCode) {
            return true;
        }
    }

    return false;
};

/**
 * Converts form charges (TmRtqsCharge[]) to raw charge compilation DTOs
 * for backend recompilation when charge codes have changed.
 *
 * @param formCharges - TmRtqsCharge[] from the form
 * @returns RtqsChargeCompilationDto[] for backend compilation
 */
const buildRawChargesFromForm = (formCharges: any[]): RtqsChargeCompilationDto[] => {
    const actualFormCharges = formCharges.filter((charge: any) => !charge.isNew);

    return actualFormCharges.map((formCharge: any): RtqsChargeCompilationDto => {
        // Convert actualCharge (RtqsCharge entity) to RtqsChargeDto format
        // The key difference is the 'type' field: entity uses 'RtqsCharge', DTO uses 'RtqsChargeDto'
        const chargeDto = formCharge.actualCharge ? {
            ...formCharge.actualCharge,
            type: 'RtqsChargeDto' // Change type from entity to DTO for backend deserialization
        } : undefined;

        // Build the raw charge compilation DTO
        const rawCharge: RtqsChargeCompilationDto = {
            charge: chargeDto as any, // Raw charge from chargebook (now as DTO)
            plateNumber: formCharge.plateNumber,
            isAlternative: formCharge.isAlternative,
            linkedToChargeCode: formCharge.linkedTo, // Charge code this alternative is linked to

            // Vehicle-specific attributes (sparse - only populated when needed)
            allowedHeight: formCharge.allowedHeight,
            vehicleHeight: formCharge.vehicleHeight,
            numberOfLamps: formCharge.numberOfLamps,
            roadTravelledOn: formCharge.roadTravelledOn,
            numberOfTyres: formCharge.numberOfTyres,
            lengthOfVehicle: formCharge.vehicleLength,
            numberOfPersons: formCharge.numberOfPersons,
            numberOfPanels: formCharge.numberOfPanels,
        };

        return rawCharge;
    });
};

/**
 * Merges form charge modifications back into original snapshot charges
 * for RTQS transgressions during updates.
 *
 * @param formCharges - TmRtqsCharge[] from the form (may include modifications)
 * @param snapshotCharges - Original SnapshotRtqsCharge[] from backend
 * @returns Updated SnapshotRtqsCharge[] with modifications applied
 */
const mergeRtqsChargeModifications = (formCharges: any[], snapshotCharges: any[]): any[] => {
    // Filter out placeholder charges (isNew: true)
    const actualFormCharges = formCharges.filter((charge: any) => !charge.isNew);

    // Start with original snapshot charges
    const updatedSnapshots = [...snapshotCharges];

    // Update snapshot charges with any modifications from form
    actualFormCharges.forEach((formCharge: any, index: number) => {
        if (index < updatedSnapshots.length) {
            const snapshot = updatedSnapshots[index];

            // Merge form modifications into snapshot
            // Preserve all snapshot charge fields, only update what user can modify
            // Use fallback to snapshot value when form field is undefined (not present on form object)
            updatedSnapshots[index] = {
                ...snapshot,
                // User-modifiable fields
                plateNumber: formCharge.plateNumber ?? snapshot.plateNumber,
                alternativeCharge: formCharge.isAlternative ?? snapshot.alternativeCharge,
                mainChargeCode: formCharge.isAlternative === false ? null :
                    (formCharge.linkedTo !== undefined ? formCharge.linkedTo : snapshot.mainChargeCode),
                // Vehicle-specific attributes
                allowedHeight: formCharge.allowedHeight !== undefined ? formCharge.allowedHeight : snapshot.allowedHeight,
                vehicleHeight: formCharge.vehicleHeight !== undefined ? formCharge.vehicleHeight : snapshot.vehicleHeight,
                numberOfLamps: formCharge.numberOfLamps !== undefined ? formCharge.numberOfLamps : snapshot.numberOfLamps,
                roadTravelledOn: formCharge.roadTravelledOn !== undefined ? formCharge.roadTravelledOn : snapshot.roadTravelledOn,
                numberOfTyres: formCharge.numberOfTyres !== undefined ? formCharge.numberOfTyres : snapshot.numberOfTyres,
                lengthOfVehicle: formCharge.vehicleLength !== undefined ? formCharge.vehicleLength : snapshot.lengthOfVehicle,
                numberOfPersons: formCharge.numberOfPersons !== undefined ? formCharge.numberOfPersons : snapshot.numberOfPersons,
                numberOfPanels: formCharge.numberOfPanels !== undefined ? formCharge.numberOfPanels : snapshot.numberOfPanels,
            };
        }
    });

    return updatedSnapshots;
};

export const updateTransgression = <T,>(
    type: 'RtqsTransgression' | 'OverloadTransgression',
    extraData: {
        form: any,
        location: Location,
        supervisor: string | undefined,
    },
    transgressionDetails: any,
    setSupervisor: (supervisor: string | undefined) => void,
    updateFn: (payload: any) => any,
    extraFields: Record<string, unknown> = {}
): Promise<T> => {
    const formData = extraData.form.formData;
    const compareFormData = extraData.location.state.transgressionDetails;

    // For RTQS transgressions, check if charge codes have changed
    const chargeCodesChanged = type === 'RtqsTransgression'
        ? haveChargeCodesChanged(formData.charges, transgressionDetails.snapshotCharges)
        : false;

    // Build transgression object
    const transgression: any = {
        ...buildCommonTransgressionFields(formData, transgressionDetails, type),
        ...(type === 'RtqsTransgression' && !chargeCodesChanged ? {
            // Charge codes unchanged - merge attribute modifications into existing snapshots
            snapshotCharges: mergeRtqsChargeModifications(formData.charges, transgressionDetails.snapshotCharges)
        } : type === 'RtqsTransgression' && chargeCodesChanged ? {
            // Charge codes changed - keep original snapshots, backend will replace them
            snapshotCharges: transgressionDetails.snapshotCharges
        } : {
            // Overload transgression - keep original snapshots
            snapshotCharges: transgressionDetails.snapshotCharges
        }),
        ...(type === 'OverloadTransgression' ? { sequenceNumber: transgressionDetails.sequenceNumber } : {})
    };

    const updateRequest = buildUpdateRequest(transgression);
    const changeDetails = extractChangeDetails(formData, compareFormData);

    // Build rawCharges if charge codes changed (RTQS only)
    const rawCharges = type === 'RtqsTransgression' && chargeCodesChanged
        ? buildRawChargesFromForm(formData.charges)
        : undefined;

    return new Promise((resolve, reject) => {
        updateFn({
            [`update${type}InformationRequest`]: {
                transgression: updateRequest,
                supervisorUsername: extraData.supervisor,
                ...changeDetails,
                ...(rawCharges ? { rawCharges } : {}), // Include rawCharges only if present
                ...extraFields
            }
        }).unwrap().then((response: any) => {
            setSupervisor(undefined);
            resolve(response.transgression);
        }).catch(reject);
    });
};

// validationUtils
export const getDefaultTransgressionValidation = (): TransgressionValidation => ({
    plateNumberError: true,
    vehicleTypeError: true,
    vehicleMakeError: true,
    vehicleModelError: true,
    vehicleColorError: true,
    originOfCargoError: true,
    destinationOfCargoError: true,
    cargoError: true,

    depotNumberError: true,
    depotNameError: true,
    operatorNameError: true,
    operatorDiscNumberError: true,
    operatorEmailError: true,

    firstNamesError: true,
    surnameError: true,
    dateOfBirthError: true,
    genderLookupError: true,
    occupationError: true,
    identificationCountryOfIssueError: true,
    identificationTypeLookupError: true,
    identificationNumberError: true,
    contactNumberError: true,
    contactNumberTypeError: true,
    contactDialingCodeError: true,
    licenceCodeError: true,
    licenceNoError: true,
    driverCountryOfIssueError: true,
    driverPrdpNoError: true,
    driverPrdpCodeError: true,

    physicalAddressCountryError: true,
    physicalAddressCityError: true,
    physicalAddressLine1Error: true,
    physicalAddressLine2Error: true,
    physicalAddressCodeError: true,

    businessAddressCountryError: true,
    businessAddressCityError: true,
    businessAddressLine1Error: true,
    businessAddressLine2Error: true,
    businessAddressCodeError: true,
});

export function isFormDataDirty(
    formData: any,
    initialFormData: any,
    checkers: ChangeChecker[]
): boolean {
    // Return false if formData is empty
    if (!formData || JSON.stringify(formData) === "{}") return false;

    // Compare using deepEqual function after normalization
    return checkers.some((checker) => checker(formData, initialFormData));
}

export const getFormattedOfficerName = (
    details?: { officerName?: string; officerSurname?: string },
    fallbackUser?: { firstName?: string; surname?: string }
): string => {
    if (details) {
        return `${titleCaseWord(details.officerName ?? "")} ${titleCaseWord(details.officerSurname ?? "")}`;
    }

    return `${titleCaseWord(fallbackUser?.firstName ?? "")} ${titleCaseWord(fallbackUser?.surname ?? "")}`;
};

export function getPlateNumber(formData: any): () => string {
    return () => formData?.vehicleConfiguration?.vehicles?.[0]?.plateNumber;
}

export function getIdTypeValue(
    idTypeName: string | undefined | null,
    idTypes: IdTypeResponse[] | undefined
): IdTypeResponse | null {
    if (idTypeName === "DRIVING_LICENCE") {
        return null;
    }

    if (idTypeName) {
        return (
            idTypes?.find((idType) => idType.name === idTypeName) || null
        );
    }

    return null;
}

export function handleCancelNavigation({
    pathname,
    navigate,
    weighBaseURL,
    sequenceNumber,
    removePendingProsecution = () => { }
}: CancelNavigationParams) {
    if (pathname.includes(ROUTE_NAMES.captureTransgressionsRoute) && weighBaseURL && sequenceNumber) {
        removePendingProsecution({ sequenceNumber: parseInt(sequenceNumber) });
        window.location.href = `${weighBaseURL}/weigh/ccv/${sequenceNumber}`;
    } else if (pathname.includes(ROUTE_NAMES.transgressionDetailsRoute)) {
        navigate(`/${ROUTE_NAMES.overloadTransgression}`, { replace: true });
    } else if (
        pathname.includes(ROUTE_NAMES.rtqsTransgressionCreate) ||
        pathname.includes(ROUTE_NAMES.rtqsTransgressionDetails)
    ) {
        navigate(`/${ROUTE_NAMES.rtqsTransgression}`, { replace: true });
    } else {
        navigate(-1);
    }
}

export const getTransgressionType = (transgression?: OverloadTransgressionDto | RtqsTransgressionDto) => {
    if (!transgression) return undefined;
    if (transgression.type === JsonObjectType.OverloadTransgressionDto) {
        return JsonObjectType.OverloadTransgressionDto;
    } else if (transgression.type === JsonObjectType.RtqsTransgressionDto) {
        return JsonObjectType.RtqsTransgressionDto;
    }
};

/**
 * Recursively (depth-first) clean up any half-baked data using a simple heuristic (and a little co-operation from
 * the X-gressions BE API).
 *
 * We go through the object, and then apply the following rules:
 *  * Remove any properties whose value is null;
 *  * Remove any empty strings;
 *  * If, after cleaning up all the properties of an object we find that they have all been eliminated, remove
 *  the actual object itself.
 *
 *
 *  If we follow some basic principles in defining our DTOs/entities on our BE, such as the principle that a missing
 *  Container (List, &c) should be defaulted to an empty container, then we reduce the incidence of incomplete data
 *  confusing the validation checks (especially for mandatory fields).
 *
 *  For example, something like this:
 *  ```JSON
 *      {
 *          driver: {
 *              driverName: ""
 *          }
 *          //... some other stuff
 *      }
 *  ```
 *  should actually be sent to the BE without the content-less `driver` property. The BE will then accept the `null`
 *  driver, rather than trying to validate a `driver` property with no actual content (and then failing).
 */
/**
 * Recursively removes empty/null values from objects and arrays.
 * - Empty strings become null and are removed
 * - Empty arrays become null and are removed
 * - Null/undefined fields are removed
 * - Objects with no remaining fields become null
 */
export function cleanObject<T>(obj: T): T | null {
    if (obj == null) {
        return null;
    }

    // Check for empty string first
    if (typeof obj === 'string' && obj === '') {
        return null;
    }

    if (Array.isArray(obj)) {
        const cleaned: any[] = obj.map(item => cleanObject(item)).filter(item => item !== null);
        return cleaned.length > 0 ? (cleaned as T) : null;
    }

    if (typeof obj === 'object') {
        const result = {} as Record<string, any>;

        for (const [key, value] of Object.entries(obj)) {
            const cleanedValue: any = cleanObject(value);
            if (cleanedValue !== null) {
                result[key] = cleanedValue;
            }
        }

        return Object.keys(result).length > 0 ? (result as T) : null;
    }

    return obj;
}

export const displayField = (displayOptionalFields: boolean, fieldRequired: boolean | undefined): boolean => {
    return fieldRequired || (displayOptionalFields && !fieldRequired);
};

export const anyFieldVisible = (displayOptionalFields: boolean, fields: (boolean | undefined)[]): boolean => {
    return fields.some((flag) => displayField(displayOptionalFields, flag ?? false));
};

export const helperTextMessage = (error: boolean | undefined, field: string | string[] | undefined, fieldLabel: string, disableEdit: boolean, t: TFunction<"translation", undefined>) => {
    let message = "";
    if (error && field && field !== "" && !disableEdit) {
        if (Array.isArray(field)) {
            for (const element of field) {
                const item = element;
                if (item && containsSpecialCharacters(item)) {
                    message = t(fieldLabel) + " " + t("specialCharacterError");
                    break;
                } else if (error && item) {
                    message = t(fieldLabel) + " " + t("isInvalid");
                    break;
                }
            }
        } else {
            if (containsSpecialCharacters(field) && (fieldLabel !== "operatorEmail")) {
                message = t(fieldLabel) + " " + t("specialCharacterError");
            } else if (error && field) {
                message = t(fieldLabel) + " " + t("isInvalid");
            }
        }
    }
    return message;
}

export const displayVehicleSection = (transgressionConfig: TransgressionConfiguration | undefined): boolean => {
    return anyFieldVisible(transgressionConfig?.displayOptionalFields ?? false, [
        transgressionConfig?.vehicleType,
        transgressionConfig?.vehicleMake,
        transgressionConfig?.vehicleModel,
        transgressionConfig?.colour,
        transgressionConfig?.origin,
        transgressionConfig?.destination,
        transgressionConfig?.cargo,
    ]);
};

export const displayOperatorSection = (transgressionConfig: TransgressionConfiguration | undefined) => {
    return anyFieldVisible(transgressionConfig?.displayOptionalFields ?? false, [
        transgressionConfig?.tripsDepotIdentifier,
        transgressionConfig?.depotName,
        transgressionConfig?.operatorName,
        transgressionConfig?.operatorDiscNumber,
        transgressionConfig?.emailAddress,
    ]);
};

export const displayDriverSection = (transgressionConfig: TransgressionConfiguration | undefined) => {
    return anyFieldVisible(transgressionConfig?.displayOptionalFields ?? false, [
        transgressionConfig?.driverName,
        transgressionConfig?.driverSurname,
        transgressionConfig?.identificationType,
        transgressionConfig?.identificationNumber,
        transgressionConfig?.idCountryOfIssue,
        transgressionConfig?.dateOfBirth,
        transgressionConfig?.gender,
        transgressionConfig?.occupation,
        transgressionConfig?.contactNumberType,
        transgressionConfig?.contactNumber,
        transgressionConfig?.licenceCountryOfIssue,
        transgressionConfig?.licenceCode,
        transgressionConfig?.licenceNumber,
        transgressionConfig?.prDPCode,
        transgressionConfig?.prDPNumber,
        transgressionConfig?.trn,
    ]);
};

export const displayResidentialSection = (transgressionConfig: TransgressionConfiguration | undefined) => {
    return anyFieldVisible(transgressionConfig?.displayOptionalFields ?? false, [
        transgressionConfig?.residentialAddressLine1,
        transgressionConfig?.residentialAddressLine2,
        transgressionConfig?.residentialCity,
        transgressionConfig?.residentialPostalCode,
        transgressionConfig?.residentialCountry,
    ]);
};

export const displayBusinessSection = (transgressionConfig: TransgressionConfiguration | undefined) => {
    return anyFieldVisible(transgressionConfig?.displayOptionalFields ?? false, [
        transgressionConfig?.businessAddressLine1,
        transgressionConfig?.businessAddressLine2,
        transgressionConfig?.businessCity,
        transgressionConfig?.businessPostalCode,
        transgressionConfig?.businessCountry,
    ]);
};

export const formatContactNumber = (driver: any): string => {
    // Handle nested contactNumber object with dialingCode and number
    if (driver?.contactNumber?.dialingCode && driver?.contactNumber?.number) {
        const number = driver.contactNumber.number;
        const newDialingCode = driver.contactNumber.dialingCode;

        // If the number already contains a dialing code, remove it first
        if (typeof number === 'string') {
            // Remove any existing dialing code pattern at the start (with or without +)
            const cleanedNumber = number.replace(/^(\+)?\d+\s+/, '');
            // Ensure dialingCode starts with +
            const formattedDialingCode = newDialingCode.startsWith('+') ? newDialingCode : `+${newDialingCode}`;
            return `${formattedDialingCode} ${cleanedNumber}`;
        }

        // Ensure dialingCode starts with +
        const formattedDialingCode = newDialingCode.startsWith('+') ? newDialingCode : `+${newDialingCode}`;
        return `${formattedDialingCode} ${number}`;
    }

    // If contactNumber is a plain string (legacy format or already formatted)
    if (typeof driver?.contactNumber === 'string') {
        // If we have a new dialingCode to use, replace any existing one
        if (driver?.dialingCode) {
            // Remove any existing dialing code pattern and add the new one
            const cleanedNumber = driver.contactNumber.replace(/^(\+)?\d+\s+/, '');
            const formattedDialingCode = driver.dialingCode.startsWith('+') ? driver.dialingCode : `+${driver.dialingCode}`;
            return `${formattedDialingCode} ${cleanedNumber}`;
        }
        // Otherwise return as is
        return driver.contactNumber;
    }

    // Fallback to just the number if available
    if (driver?.contactNumber?.number) {
        return driver.contactNumber.number;
    }

    // Return empty string if no contact information
    return '';
};
