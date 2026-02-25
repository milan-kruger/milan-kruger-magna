/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../framework/redux/store";

export type CaptureCourtResultState = {
    form: FormState;
}

export const initialState: CaptureCourtResultState = {
    form: {
        initialFormData: {},
        formData: {},
        formValidation: {},
        validationErrors: false,
        isDirty: false
    }
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

export const captureCourtResultSlice = createSlice({
    name: 'captureCourtResults',
    initialState,
    reducers: {
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
        clearForm: (state) => {
            state.form.formData = {};
        }
    }
})

export const {
    setFormDataField,
    setFormFieldValidation,
    setInitialFormData,
    setFormData,
    setFormDataDirty
} = captureCourtResultSlice.actions;

export const selectForm = (state: RootState) => state.captureCourtResults.form;

export default captureCourtResultSlice.reducer;
