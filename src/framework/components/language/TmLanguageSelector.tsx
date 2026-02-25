import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import { useCallback, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import { Tooltip } from '@mui/material';
import TmMenu from '../menu/TmMenu';
import TmMenuItem from '../menu/TmMenuItem';
import TmIconButton from '../button/TmIconButton';

type Props = {
    customIconColor?: string;
    customIconHoverColor?: string;
};

export function TmLanguageSelector({ customIconColor, customIconHoverColor }: Readonly<Props>) {
    const { t, i18n } = useTranslation();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleMenuItemClick = useCallback(
        (lang: string) => {
            i18n.changeLanguage(lang);
            handleClose();
        },
        [i18n, handleClose]
    );

    const baseTestId = 'languageSelector';

    // RENDER
    return (
        <>
            <Tooltip id={'LanguageChangeButtonTooltip'} title={t('languageChange')}>
                <span>
                    <TmIconButton
                        testid={`${baseTestId}Icon`}
                        onClick={handleOpen}
                        sx={{ 
                            color: customIconColor ?? 'default',
                            '&:hover': {
                                color: customIconHoverColor ?? 'default',
                            }
                        }}
                    >
                        <LanguageIcon />
                    </TmIconButton>
                </span>
            </Tooltip>
            <TmMenu testid={`${baseTestId}Menu`} anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                {Object.keys(i18n.options.resources ?? {}).map((lang) => (
                    <TmMenuItem key={lang} testid={`${baseTestId}${lang}MenuItem`} onClick={() => handleMenuItemClick(lang)} sx={{ gap: 20 }}>
                        {t(`${lang}`)}
                        {lang === i18n.language && <CheckIcon />}
                    </TmMenuItem>
                ))}
            </TmMenu>
        </>
    );
}
