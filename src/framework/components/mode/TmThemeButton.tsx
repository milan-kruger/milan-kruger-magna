import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme, IconButtonProps, Tooltip } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../redux/hooks';
import { setThemeMode } from '../../ui/uiSlice';
import TmIconButton from '../button/TmIconButton';

type Props = {
    customIconColor?: string;
    customIconHoverColor?: string;
} & IconButtonProps;

export function TmThemeButton({ customIconColor, customIconHoverColor, ...props }: Readonly<Props>) {
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const handleModeToggle = useCallback(() => {
        dispatch(setThemeMode(theme.palette.mode === 'light' ? 'dark' : 'light'));
    }, [dispatch, theme.palette.mode]);

    const baseTestId = 'darkLightMode';

    // RENDER
    return (
        <Tooltip id={'ThemeButtonTooltip'} title={t('toggleTheme')}>
            <span>
                <TmIconButton
                    testid={`${baseTestId}Icon`}
                    onClick={handleModeToggle}
                    sx={{ 
                        ...props.sx,
                        color: customIconColor ?? 'default',
                        '&:hover': {
                            color: customIconHoverColor ?? 'default',
                        }
                    }}
                >
                    {theme.palette.mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </TmIconButton>
            </span>
        </Tooltip>
    );
}
