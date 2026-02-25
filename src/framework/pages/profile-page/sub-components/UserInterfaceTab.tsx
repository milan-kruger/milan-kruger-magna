import { Grid, Stack } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../components/app-bar/sub-components/menus/ThemeToggle';
import TmTypography from '../../../components/typography/TmTypography';

const UserInterfaceTab = () => {
    const { t } = useTranslation();
    return (
        <Grid container spacing={10} size={{ md: 12 }}>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <TmTypography testid={'userInterfacePageTitle'} variant='h5'>
                    {t('userInterface')}
                </TmTypography>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <Stack gap={5}>
                    <TmTypography
                        testid={'userInterfaceThemeText'}
                        variant='body1'
                    >
                        {t('changeTheme')}
                    </TmTypography>
                    <ThemeToggle />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default memo(UserInterfaceTab);
