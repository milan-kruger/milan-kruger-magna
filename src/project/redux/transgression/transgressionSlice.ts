/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../framework/redux/store";
import { LookupResponse } from "../api/coreApi";
import { RetrieveTransgressionInformationResponse } from "../api/transgressionsApi";
import { TransgressionValidation } from "./TransgressionValidation";

export type TransgressionState = {
    vehicleDetails: {
        vehicleMake?: LookupResponse;
    },
    driverDetails: {
        driverLicenceCountryOfIssue?: LookupResponse;
    }
    newBusinessAddressCountry?: string;
    disableBusinessAddress?: boolean;
    newTransgression?: boolean;
    form: FormState;
}

export const initialState: TransgressionState = {
    vehicleDetails: {
        vehicleMake: undefined
    },
    driverDetails: {
        driverLicenceCountryOfIssue: undefined
    },
    newBusinessAddressCountry: '',
    disableBusinessAddress: false,
    newTransgression: false,
    form: {
        initialFormData: {},
        formData: {},
        formValidation: {},
        validationErrors: false,
        isDirty: false
    },
}

export type FormFieldState = {
    key: string;
    value?: any;
}

export type FormState = {
    initialFormData: unknown;
    formData: unknown;
    formValidation: unknown;
    validationErrors: boolean;
    isDirty: boolean;
}

export type FormFieldValidationState = {
    key: string;
    value?: any;
}

export const transgressionSlice = createSlice({
    name: 'transgression',
    initialState,
    reducers: {
        setVehicleMake: (state, action: PayloadAction<any>) => {
            state.vehicleDetails.vehicleMake = action.payload;
        },
        setNewBusinessAddressCountry: (state, action: PayloadAction<any>) => {
            state.newBusinessAddressCountry = action.payload;
        },
        setDisableBusinessAddress: (state, action: PayloadAction<any>) => {
            state.disableBusinessAddress = action.payload;
        },
        setNewTransgression: (state, action: PayloadAction<any>) => {
            state.newTransgression = action.payload;
        },
        setDriverLicenseCountryOfIssue: (state, action: PayloadAction<any>) => {
            state.driverDetails.driverLicenceCountryOfIssue = action.payload;
        },
        setFormDataField: (state, action: PayloadAction<FormFieldState>) => {
            if (action.payload.key.includes('.')) {
                const keys = action.payload.key.split('.');
                let formData = state.form.formData as Record<string, any>;
                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    if (!formData[key]) {
                        const nextKey = keys[i + 1];
                        if (/^\d+$/.test(nextKey)) {
                            formData[key] = [];
                        } else {
                            formData[key] = {};
                        }
                    }
                    formData = formData[key];
                }
                const lastKey = keys[keys.length - 1];
                formData[lastKey] = action.payload.value;
            }
            else {
                (state.form.formData as any)[action.payload.key] = action.payload.value;
            }
        },
        setFormFieldValidation: (state, action: PayloadAction<FormFieldValidationState>) => {
            (state.form.formValidation as any)[action.payload.key] = action.payload.value;
        },
        setInitialFormData: (state, action: PayloadAction<FormState['initialFormData']>) => {
            state.form.initialFormData = action.payload;
        },
        setFormData: (state, action: PayloadAction<FormState['formData']>) => {
            state.form.formData = action.payload;
        },
        setFormDataDirty: (state, action: PayloadAction<FormState['isDirty']>) => {
            state.form.isDirty = action.payload;
        },
        setFormValidations: (state, action: PayloadAction<FormState['formValidation']>) => {
            state.form.formValidation= action.payload;
        },
        setFormValidation: (state, action: PayloadAction<FormState['validationErrors']>) => {
            state.form.validationErrors = action.payload;
        },
        resetFormData: (state) => {
            state.form.formData = {};
        },
    }
})

export const {
    setVehicleMake,
    setNewBusinessAddressCountry,
    setDisableBusinessAddress,
    setNewTransgression,
    setDriverLicenseCountryOfIssue,
    setFormDataField,
    setFormFieldValidation,
    setInitialFormData,
    setFormData,
    setFormDataDirty
} = transgressionSlice.actions;

export const selectVehicleMake = (state: RootState) => state.transgression.vehicleDetails.vehicleMake;
export const selectNewBusinessCountry = (state: RootState) => state.transgression.newBusinessAddressCountry;
export const selectDisabledBusinessAddress = (state: RootState) => state.transgression.disableBusinessAddress;
export const selectNewTransgression = (state: RootState) => state.transgression.newTransgression;
export const selectDriverLicenseCountryOfIssue = (state: RootState) => state.transgression.driverDetails.driverLicenceCountryOfIssue;
export const selectForm = (state: RootState) => state.transgression.form;
export const selectDriverPrDPCodes = (state: RootState) => {
    const formData = state.transgression.form.formData as RetrieveTransgressionInformationResponse;
    return formData.driver?.prDPCodes;
};

/**
 * Consolidated selector for VehicleDetails component
 */
export const selectVehicleDetailsData = createSelector(
    [selectForm, selectVehicleMake],
    (form, vehicleMake) => {
        const formData = form.formData as RetrieveTransgressionInformationResponse;
        const validation = form.formValidation as TransgressionValidation;
        const vehicle = formData.vehicleConfiguration?.vehicles?.[0];
        const route = formData.route;

        return {
            // Form Data
            plateNumber: vehicle?.plateNumber,
            vehicleMake: vehicle?.vehicleMake,
            vehicleModel: vehicle?.vehicleModel,
            vehicleType: vehicle?.vehicleType,
            colour: vehicle?.colour,
            originOfCargo: route?.originOfCargo,
            destinationOfCargo: route?.destinationOfCargo,
            cargo: route?.cargo,

            // Validation Errors
            plateNumberError: validation.plateNumberError,
            vehicleMakeError: validation.vehicleMakeError,
            vehicleModelError: validation.vehicleModelError,
            vehicleTypeError: validation.vehicleTypeError,
            vehicleColorError: validation.vehicleColorError,
            originOfCargoError: validation.originOfCargoError,
            destinationOfCargoError: validation.destinationOfCargoError,
            cargoError: validation.cargoError,

            // Additional Data
            vehicleMakeValue: vehicleMake
        };
    }
);

/**
 * Consolidated selector for DriverDetails component
 */
export const selectDriverDetailsData = createSelector(
    [selectForm, selectDriverLicenseCountryOfIssue],
    (form, licenceCountryOfIssue) => {
        const formData = form.formData as RetrieveTransgressionInformationResponse;
        const validation = form.formValidation as TransgressionValidation;
        const driver = formData.driver;

        return {
            // Form Data - Personal Info
            firstNames: driver?.firstNames,
            surname: driver?.surname,
            dateOfBirth: driver?.dateOfBirth,
            gender: driver?.gender,
            occupation: driver?.occupation,

            // Form Data - Identification
            idType: driver?.identification?.idType,
            idNumber: driver?.identification?.number,
            idCountryOfIssue: driver?.identification?.countryOfIssue,

            // Form Data - Contact
            contactNumberType: driver?.contactNumber?.contactNumberType,
            contactNumber: driver?.contactNumber?.number,
            dialingCode: driver?.contactNumber?.dialingCode,

            // Form Data - License
            licenceCode: driver?.licenceCode,
            licenceNumber: driver?.licenceNumber,
            countryOfIssue: driver?.countryOfIssue,
            prDPCodes: driver?.prDPCodes,
            prDPNumber: driver?.prDPNumber,

            // Validation Errors - Personal
            firstNamesError: validation.firstNamesError,
            surnameError: validation.surnameError,
            dateOfBirthError: validation.dateOfBirthError,
            genderLookupError: validation.genderLookupError,
            occupationError: validation.occupationError,

            // Validation Errors - Identification
            identificationTypeLookupError: validation.identificationTypeLookupError,
            identificationNumberError: validation.identificationNumberError,
            identificationCountryOfIssueError: validation.identificationCountryOfIssueError,

            // Validation Errors - Contact
            contactNumberTypeError: validation.contactNumberTypeError,
            contactNumberError: validation.contactNumberError,
            contactDialingCodeError: validation.contactDialingCodeError,

            // Validation Errors - License
            licenceCodeError: validation.licenceCodeError,
            licenceNoError: validation.licenceNoError,
            driverCountryOfIssueError: validation.driverCountryOfIssueError,
            driverPrdpCodeError: validation.driverPrdpCodeError,
            driverPrdpNoError: validation.driverPrdpNoError,

            // Additional Data
            licenceCountryOfIssue
        };
    }
);

/**
 * Consolidated selector for OperatorDetails component
 */
export const selectOperatorDetailsData = createSelector(
    [selectForm],
    (form) => {
        const formData = form.formData as RetrieveTransgressionInformationResponse;
        const validation = form.formValidation as TransgressionValidation;
        const depot = formData.operator?.depots?.[0];

        return {
            // Form Data
            depotNumber: depot?.tripsDepotIdentifier,
            depotName: depot?.name,
            operatorName: formData.operator?.name,
            operatorDiscNumber: formData.operator?.operatorDiscNumber,
            operatorEmail: depot?.emails?.[0]?.emailAddress,

            // Validation Errors
            depotNumberError: validation.depotNumberError,
            depotNameError: validation.depotNameError,
            operatorNameError: validation.operatorNameError,
            operatorDiscNumberError: validation.operatorDiscNumberError,
            operatorEmailError: validation.operatorEmailError
        };
    }
);

/**
 * Consolidated selector for PhysicalAddress component
 */
export const selectPhysicalAddressData = createSelector(
    [selectForm],
    (form) => {
        const formData = form.formData as RetrieveTransgressionInformationResponse;
        const validation = form.formValidation as TransgressionValidation;

        return {
            // Form Data
            addressLine1: formData.driver?.residentialAddressLine1,
            addressLine2: formData.driver?.residentialAddressLine2,
            city: formData.driver?.residentialCity,
            code: formData.driver?.residentialPostalCode,
            country: formData.driver?.residentialCountry,

            // Validation Errors
            physicalAddressLine1Error: validation.physicalAddressLine1Error,
            physicalAddressLine2Error: validation.physicalAddressLine2Error,
            physicalAddressCityError: validation.physicalAddressCityError,
            physicalAddressCodeError: validation.physicalAddressCodeError,
            physicalAddressCountryError: validation.physicalAddressCountryError
        };
    }
);

/**
 * Consolidated selector for BusinessAddressDetails component
 */
export const selectBusinessAddressData = createSelector(
    [selectForm, selectNewBusinessCountry, selectDisabledBusinessAddress],
    (form, newBusinessCountry, disableBusinessAddress) => {
        const formData = form.formData as RetrieveTransgressionInformationResponse;
        const validation = form.formValidation as TransgressionValidation;

        return {
            // Form Data
            addressLine1: formData.operator?.businessAddressLine1,
            addressLine2: formData.operator?.businessAddressLine2,
            city: formData.operator?.businessCity,
            code: formData.operator?.businessPostalCode,
            country: formData.operator?.businessCountry,

            // Validation Errors
            businessAddressLine1Error: validation.businessAddressLine1Error,
            businessAddressLine2Error: validation.businessAddressLine2Error,
            businessAddressCityError: validation.businessAddressCityError,
            businessAddressCodeError: validation.businessAddressCodeError,
            businessAddressCountryError: validation.businessAddressCountryError,

            // Additional State
            newBusinessCountry,
            disableBusinessAddress
        };
    }
);

export default transgressionSlice.reducer;
