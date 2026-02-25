import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import { FormControlLabel, SxProps, useTheme } from '@mui/material';
import { memo, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { selectThemeMode, setActiveTheme, setThemeMode } from '../../../../ui/uiSlice';
import TmSwitch from '../../../switch/TmSwitch';
import { selectConfig } from '../../../../config/configSlice';
import { useTranslation } from 'react-i18next';

type Props = {
    hideLabel?: boolean;
    sx?: SxProps;
}

function ThemeToggle({ hideLabel, sx }: Readonly<Props>) {
    const theme = useTheme();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector(selectThemeMode);
    const { config: { theme: configTheme } } = useAppSelector(selectConfig);
    const themeLabel = useMemo(() => theme.palette.mode === 'dark' ? t('darkMode') : t('lightMode'), [t, theme.palette.mode]);
    useEffect(() => {
        if (theme.palette.mode !== themeMode) {
            dispatch(setActiveTheme(configTheme));
        }
    }, [dispatch, themeMode, configTheme, theme.palette.mode]);
    return (
        <FormControlLabel
            sx={{...sx}}
            label={hideLabel ? undefined : themeLabel}
            control={
                <TmSwitch
                    testid={'themeToggle'}
                    disableRipple
                    style={{
                        width: 30,
                        height: 30,
                        top: '4px',
                        left: '3px',
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.contrastText : theme.palette.primary.main
                    }}
                    sx={{
                        '& .MuiSwitch-track': {
                            height: 16,
                            borderRadius: 22 / 2,
                            backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF !important' : '#000000 !important',
                        }
                    }}
                    checkedIcon={<DarkMode id='themeDarkIcon' />}
                    icon={<LightMode
                        id='themeLightIcon'
                        sx={(theme) => ({ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.contrastText })}
                    />}
                    checked={theme.palette.mode === 'dark'}
                    onChange={(_event, checked) => dispatch(setThemeMode(checked ? 'dark' : 'light'))}
                />
            }
        />
    );
}

export default memo(ThemeToggle);
