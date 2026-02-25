import { Autocomplete, AutocompleteProps, styled } from "@mui/material";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type CustomProps = {
    readonly?: boolean;
} & AutocompleteProps<any, boolean, boolean, boolean>

 const StyledAutocomplete = styled(Autocomplete, {
    shouldForwardProp: (prop) => prop !== 'readonly',
})<CustomProps>(({ theme, readonly, value }) => ({
    '& .MuiInputLabel-root': {
        color: readonly && value !== null ? `${theme.palette.text.primary} !important` : undefined
    },
    '& .MuiInputBase-input': {
        WebkitTextFillColor: readonly ? `${theme.palette.text.primary} !important` : undefined
    },
    '& .MuiInputBase-root.MuiInput-root.Mui-disabled::before': {
        borderBottom: readonly ? 'none' : undefined
    },
    '& .MuiAutocomplete-endAdornment': {
        display: readonly ? 'none' : 'inherit'
    }
}));

export default StyledAutocomplete;
