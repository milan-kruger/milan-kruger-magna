import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { transgressionSlice } from "../redux/transgression/transgressionSlice";
import { TransgressionValidation } from "../redux/transgression/TransgressionValidation";

export const useTransgressionActions = () => {
    const dispatch = useDispatch();

    const setFormDataField = useCallback(
        (fieldKey: string, fieldValue: string | number | boolean | null | undefined) => {
            dispatch(
                transgressionSlice.actions.setFormDataField({
                    key: fieldKey,
                    value: fieldValue,
                })
            );
        },
        [dispatch]
    );

    const setFormFieldValidation = useCallback(
        (
            fieldKey: keyof TransgressionValidation,
            fieldValue: boolean | "" | undefined
        ) => {
            dispatch(
                transgressionSlice.actions.setFormFieldValidation({
                    key: fieldKey,
                    value: fieldValue,
                })
            );
        },
        [dispatch]
    );

    return {
        setFormDataField,
        setFormFieldValidation
    };
};
