import { FormControl, FormControlLabel, FormLabel, Grid, RadioGroup } from '@mui/material';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmRadio from '../../../components/selection/TmRadio';
import TmTypography from '../../../components/typography/TmTypography';
import { toCamelCaseWords } from '../../../utils';

const LanguageTab = () => {

    const { t, i18n } = useTranslation();
    const [languageValue, setLanguageValue] = useState(i18n.resolvedLanguage);

    const handleChangeLanguage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLanguageValue((event.target as HTMLInputElement).value);
        i18n.changeLanguage((event.target as HTMLInputElement).value);
    };

    return (
        <Grid container spacing={10} size={{ md: 12 }}>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <TmTypography testid={'languagePageTitle'} variant='h5'>
                    {t('language')}
                </TmTypography>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                    <FormControl>
                        <FormLabel>
                            {t('selectALanguage')}
                        </FormLabel>
                        <RadioGroup
                            name='controlled-radio-buttons-group'
                            value={languageValue}
                            onChange={handleChangeLanguage}
                        >
                            {Object.keys(i18n.options.resources ?? {}).map(lang =>
                                <FormControlLabel
                                    key={lang}
                                    value={lang}
                                    control={<TmRadio testid={toCamelCaseWords('languagePage', lang)} />}
                                    label={t(lang)}
                                />
                            )}
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default memo(LanguageTab);
