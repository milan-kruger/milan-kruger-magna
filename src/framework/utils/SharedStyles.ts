/* eslint-disable @typescript-eslint/no-explicit-any */
import tinycolor from 'tinycolor2';
import { Theme } from '@mui/material/styles';

const errorBackgroundColorCache = new Map<string, string>();

const getErrorBackgroundColor = (theme: Theme): string => {
  const cacheKey = theme.palette.error.light;

  if (!errorBackgroundColorCache.has(cacheKey)) {
    const color = tinycolor(theme.palette.error.light).darken(10).setAlpha(0.2).toRgbString();
    errorBackgroundColorCache.set(cacheKey, color);
  }

  return errorBackgroundColorCache.get(cacheKey)!;
};

export const getSharedSxStyles = ({
  alternative,
  readonly,
  dateValue,
  error,
  theme,
  props = {},
}: {
  alternative?: boolean;
  readonly?: boolean;
  dateValue?: any;
  error?: boolean;
  theme: Theme;
  props?: any;
}) => {
  const errorBg = error ? getErrorBackgroundColor(theme) : 'inherit';

  return {
    ...props.sx,
    '& .MuiInputBase-root': {
      fontSize: alternative ? '1rem' : undefined,
    },
    '& .MuiInputBase-input': {
      WebkitTextFillColor: readonly ? `${theme.palette.text.primary} !important` : undefined,
      padding: alternative ? '0px !important' : 'inherit',
      textOverflow: alternative ? 'ellipsis' : 'inherit',
      background: errorBg,
    },
    '& .MuiFormLabel-root': {
      fontSize: alternative ? '1em' : undefined,
      marginTop: alternative ? '-4px' : undefined,
    },
    '& .MuiInputLabel-shrink': {
      marginTop: alternative ? 0 : undefined,
    },
    '& .MuiInput-root, & .MuiInputBase-root.MuiInput-root': {
      paddingBottom: alternative ? 0 : undefined,
      minHeight: '1.4375em',
    },
    '& .MuiFormHelperText-root': {
      marginTop: alternative ? 0 : undefined,
      lineHeight: alternative ? 1.1 : undefined,
    },
    '& .MuiInputBase-root.MuiInput-root.Mui-disabled::before': {
      borderBottom: readonly ? 'none' : undefined,
    },
    '& .MuiButtonBase-root': {
      display: readonly ? 'none' : 'inherit',
    },
    '& .MuiInputLabel-root': {
      color: readonly && dateValue !== null ? `${theme.palette.text.primary} !important` : undefined,
    },
    '& #editFieldDateOfBirthOpenPicker': {
      padding: '0 8px 0',
    },
    '& .MuiPickersSectionList-root': {
      padding: alternative ? '0px !important' : undefined,
      backgroundColor: errorBg,
    },
    '& .MuiPickersInputBase-root': {
      backgroundColor: errorBg,
    },
  };
};
