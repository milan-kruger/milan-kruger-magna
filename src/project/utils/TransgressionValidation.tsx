// useTransgressionValidation.ts
import { useEffect } from "react";
import { TransgressionValidation } from "../redux/transgression/TransgressionValidation";
import { useAppDispatch, useAppSelector } from "../../framework/redux/hooks";
import { transgressionSlice, selectForm } from "../redux/transgression/transgressionSlice";
import { getDefaultTransgressionValidation } from "./TransgressionHelpers";

export const useTransgressionValidation = () => {
    const dispatch = useAppDispatch();
    const form = useAppSelector(selectForm);
    const formValidation = useAppSelector(() => form.formValidation as TransgressionValidation);

    useEffect(() => {
        const defaultValidation = getDefaultTransgressionValidation();
        dispatch(transgressionSlice.actions.setFormValidations(defaultValidation));
    }, [dispatch]);

    useEffect(() => {
        const isFormInvalid = Object.values(formValidation).some((v) => v);
        dispatch(transgressionSlice.actions.setFormValidation(isFormInvalid));
    }, [dispatch, formValidation]);
};
