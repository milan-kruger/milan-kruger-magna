import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment, TextField, TextFieldProps, useTheme } from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import TmIconButton from '../../button/TmIconButton';
import toCamelCase, { toCamelCaseWords } from '../../../utils';
import tinycolor from 'tinycolor2';

type Props = {
    testid: string;
    label: string,
    password?: string,
    setPasswordValue: (value: string) => void,
    setPasswordError: (error: boolean) => void,
    passwordError: boolean,
    helperText: string,
    validations?: boolean[],
    alternative?: boolean;
} & TextFieldProps

function TmPasswordTextfield({ testid, label, password, setPasswordValue, setPasswordError, passwordError, helperText, validations,
    alternative, ...textFieldProps }: Props) {

    const theme = useTheme();
    const [isDirty, setIsDirty] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => setShowPassword(true);
    const handleHidePassword = () => setShowPassword(false);

    const handlePasswordChange = (value: string) => {
        setPasswordValue(value);
        setIsDirty(true);
    };

    useEffect(() => {
        if (validations && isDirty) {
            if (validations.every((validation) => validation)) {
                setPasswordError(false);
            }
            else {
                setPasswordError(true);
            }
        }
    }, [validations, isDirty, setPasswordError]);

    return (
        <TextField
            {...textFieldProps}
            required
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label={label}
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange(event.target.value)}
            error={passwordError}
            helperText={helperText !== ' ' ? <span id={testid+'ErrorMessage'}>{helperText}</span> : ' '}
            autoComplete='off'
            variant='standard'
            sx={{
                ...textFieldProps.sx,
                '& .MuiInputBase-root': {
                    fontSize: alternative ? '1.1rem' : 'inherit',
                },
                '& .MuiInputBase-input': {
                    padding: alternative ? 0 : 'inherit',
                    textOverflow: alternative ? 'ellipsis' : 'inherit',
                    backgroundColor: passwordError ? tinycolor(theme.palette.error.light).setAlpha(0.20).toRgbString() : 'inherit'
                },
                '& .MuiFormLabel-root': {
                    fontSize: alternative ? '1.1em' : undefined,
                },
            }}
            InputProps={{
                inputProps: {
                    id: testid
                },
                endAdornment: (
                    <InputAdornment position='end'>
                        <TmIconButton
                            testid={toCamelCaseWords(testid, toCamelCase(label), 'ShowPassword')}
                            tabIndex={-1}
                            aria-label='toggle password visibility'
                            onMouseDown={handleShowPassword}
                            onMouseUp={handleHidePassword}
                            onMouseLeave={handleHidePassword}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </TmIconButton>
                    </InputAdornment>
                )
            }}
        />
    );
}

export default memo(TmPasswordTextfield);
