/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Checkbox, TextField, useTheme } from "@mui/material";
import { memo } from "react";
import toCamelCase from '../../utils/index';
import tinycolor from "tinycolor2";
import StyledAutocomplete, { CustomProps } from "./StyledAutomplete.ts";

type Props = {
    label: string;
    testid: string;
    selectDefault?: boolean;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    checkedState?: [];
    limitTags?: number;
    getLimitTagsText?: (more: number) => string;
} & CustomProps;

const TmCheckboxAutocomplete = ({ label, testid, required, error, helperText, selectDefault, limitTags = -1, getLimitTagsText, ...props }: Props) => {
    const theme = useTheme();

    return (
        <StyledAutocomplete
            {...props as any}
            multiple // Enable multiple selections
            autoHighlight
            limitTags={limitTags}
            getLimitTagsText={getLimitTagsText ?? (() => `..`)}
            defaultValue={selectDefault ? props.options : []}
            slotProps={{
                chip: { size: 'small' }
            }}
            sx={{
                '& .MuiAutocomplete-inputRoot': {
                    flexWrap: 'nowrap',
                },
                '& .MuiAutocomplete-tag': {
                    maxWidth: 'calc(100% - 60px)',
                },
            }}
            renderInput={(params: any) => (
                <TextField
                    sx={{
                        '& .MuiInputBase-input': {
                            background: error ? tinycolor(theme.palette.error.light).darken(10).setAlpha(0.20).toRgbString() : 'inherit'
                        }
                    }}
                    {...params}
                    required={required}
                    label={label}
                    variant='standard'
                    error={error}
                    helperText={helperText !== ' ' ? <span id={testid + 'ErrorMessage'}>{helperText}</span> : ' '}
                    inputProps={{
                        ...params.inputProps,
                        id: testid,
                    }}
                />
            )}
            renderOption={(props, option, { selected }, ownerState) => (

                <li
                    {...props}
                    id={toCamelCase(testid + ownerState.getOptionLabel(option))}
                    key={props.id}
                >
                    <Checkbox
                        icon={<CheckBoxOutlineBlank fontSize='medium' />}
                        checkedIcon={<CheckBox fontSize='medium' />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                        key={props.id}
                    />
                    {ownerState.getOptionLabel(option)}
                </li>
            )}
        />
    );
};

export default memo(TmCheckboxAutocomplete);
