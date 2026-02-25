import { SxProps, Theme, useMediaQuery } from '@mui/material';
import { ChangeEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../../framework/redux/hooks';
import TmTextField from '../../../framework/components/textfield/TmTextField';
import { containsSpecialCharacters, fieldsWidth } from '../../../framework/utils';
import { transgressionSlice } from '../../redux/transgression/transgressionSlice';
import Constants from '../../utils/Constants';

type Props = {
    testid: string;
    label: string;
    fieldKey: string;
    fieldValue: string | undefined;
    required: boolean | undefined;
    endAdornment?: React.JSX.Element;
    disabled: boolean;
    readonly: boolean;
    error: boolean | undefined;
    helperText?: string;
    fieldType: string;
    removeSpaces?: boolean;
    checkForSpecialCharacters?: boolean;
    errorKey?: string;
    maxLength?: number;
    isUpdateOnWeigh?: boolean;
    showTooltipPopup?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>, value: string | undefined) => void;
    sx?: SxProps<Theme>;
}

function SmartTextfield({ testid, label, fieldKey, fieldValue, required, endAdornment,
    disabled, readonly, error, helperText, fieldType, removeSpaces, checkForSpecialCharacters,
    errorKey, maxLength, isUpdateOnWeigh, showTooltipPopup = false, onChange, sx }: Readonly<Props>) {
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const [cursorPosition, setCursorPosition] = useState(0);
    const [localValue, setLocalValue] = useState(fieldValue ?? '');
    const inputRef = useRef<HTMLInputElement>(null);
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Sync local state with prop changes (when value changes from Redux)
    useEffect(() => {
        if (fieldValue !== localValue) {
            setLocalValue(fieldValue ?? '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldValue]);

    const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const eventValue = event.target.value;
        let upperCasedValue = eventValue.toUpperCase();
        const selectionStart = event.target.selectionStart ?? 0;

        const newCursorPosition = selectionStart + (upperCasedValue.length - eventValue.length);

        if (removeSpaces) {
            upperCasedValue = upperCasedValue.replace(/\s/g, '');
        }

        // Update local state immediately for responsive UI
        setLocalValue(upperCasedValue);
        setCursorPosition(newCursorPosition);

        // Debounce Redux dispatch to reduce re-renders
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
            dispatch(transgressionSlice.actions.setFormDataField({ key: fieldKey, value: upperCasedValue }));
        }, 150);

        onChange?.(event, upperCasedValue);
    }, [removeSpaces, dispatch, fieldKey, onChange]);

    const handleOnBlur = useCallback(() => {
        // Clear any pending sync and sync immediately
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }
        dispatch(transgressionSlice.actions.setFormDataField({ key: fieldKey, value: localValue }));

        // Validate
        if (checkForSpecialCharacters && localValue) {
            const isValid = containsSpecialCharacters(localValue);
            dispatch(transgressionSlice.actions.setFormFieldValidation({ key: errorKey ?? "", value: isValid }));
        }

        if (fieldKey === "operator.depots.0.emails.0.emailAddress" && localValue) {
            const isEmailValid = Constants.emailRegex.exec(localValue.toString());
            dispatch(transgressionSlice.actions.setFormFieldValidation({
                key: 'operatorEmailError',
                value: !isEmailValid
            }));
        }
    }, [checkForSpecialCharacters, localValue, fieldKey, errorKey, dispatch]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ' ' && removeSpaces) {
            event.preventDefault();
        }
        if (fieldType === 'number' && ['e', 'E', '+', '-', ',', '.'].includes(event.key)) {
            event.preventDefault();
        }
    };

    useEffect(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [cursorPosition]);

    return (
        <TmTextField
            inputRef={inputRef}
            testid={testid}
            label={label}
            required={required}
            value={localValue}
            disabled={disabled}
            readonly={readonly}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            endadornment={endAdornment}
            alternative={true}
            autoComplete='off'
            error={error}
            helperText={helperText}
            type={fieldType}
            maxLength={maxLength}
            isUpdateOnWeigh={isUpdateOnWeigh}
            showTooltipPopup={showTooltipPopup}
            onKeyDown={handleKeyDown}
            sx= {sx ?? {
                width: fieldsWidth(isMobile)
            }}
        />
    );
}

export default memo(SmartTextfield);
