import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useGetCopyrightOwnership } from '../../utils/useGetCopyrightOwnership';

export function CopyrightPage() {
    const { t } = useTranslation();
    const theme = useTheme();

    const linkColor = theme.palette.primary.main;
    
    const { ownership, ownershipFullName } = useGetCopyrightOwnership();

    const website = useMemo(() => {
        return (
            <Typography>
                {t('website') + ':'}
                {' '}
                <a 
                    href={ownership === 'FCA' ? 'https://www.fischercons.co.za/' : 'https://www.magnabc.co.za/'}
                    style={{ color: linkColor, textDecoration: 'underline' }}
                    target='_blank' 
                    rel='noopener noreferrer'
                >
                    {ownership === 'FCA' ? 'https://www.fischercons.co.za' : 'https://www.magnabc.co.za'}
                </a>
            </Typography>
            )
    }, [linkColor, ownership, t]);

    const address = useMemo(() => {
        return (
            <Stack>
                <Typography>Delta Building</Typography>
                <Typography>471 Monica Road</Typography>
                <Typography>LYNNWOOD</Typography>
                <Typography>0102</Typography>
            </Stack>
        )
    }, []);

    const poBox = useMemo(() => {
        return (
            <Stack>
                <Typography>P.O. Box 35423</Typography>
                <Typography>MENLO PARK</Typography>
                <Typography>0102 South Africa</Typography>
            </Stack>
        )
    }, []);

    const fcaContact = useMemo(() => {
        return (
            <Stack>
                <Typography>
                {t('tel') + ':'}
                {' '}
                <a href='tel:+23059334256' style={{ color: linkColor, textDecoration: 'underline' }}>
                    (+2305) 933 4256
                </a>
                </Typography>
                <Typography>
                    {t('email') + ':'}
                    {' '}
                    <a
                        href='info@fcaint.mu'
                        style={{ color: linkColor, textDecoration: 'underline' }}
                    >
                        info@fcaint.mu
                    </a>
                </Typography>
            </Stack>
        )
    }, [linkColor, t]);

    const magnaContact = useMemo(() => {
        return (
            <Stack>
                <Typography>
                    {t('tel') + ':'}
                    {' '}
                    <a href='tel:+27123483488' style={{ color: linkColor, textDecoration: 'underline' }}>
                        (+2712) 348 3488
                    </a>
                </Typography>
                <Typography>{t('fax') + ':  '} (+2712) 348 4506</Typography>
                <Typography>
                    {t('email') + ':'}
                    {' '}
                    <a
                        href='mailto:info@magnabc.co.za'
                        style={{ color: linkColor, textDecoration: 'underline' }}
                    >
                        info@magnabc.co.za
                    </a>
                </Typography>
            </Stack>
        )
    }, [linkColor, t]);
 
    return (
        <Box p={20}>
            <Stack gap={10}>
                <Typography variant='h5' fontWeight='500'>
                    {t('copyright', { date: new Date().getFullYear() })}
                    {' '}
                    {ownershipFullName}
                </Typography>
                <Typography>{ownership}:</Typography>
                <Typography>{t('copyrightWarning')}</Typography>
                <Typography>
                    <Trans i18nKey='copyrightAuthorisation' components={{ strong: <strong /> }} values={{ ownershipFullName }}>
                        <strong>{ownershipFullName}</strong>
                    </Trans>
                </Typography>
                <Typography>{t('copyrightBody')}</Typography>
                <Typography>
                    <Trans i18nKey='copyrightJurisdiction' components={{ strong: <strong /> }} values={{ ownershipFullName }}>
                        <strong>{ownershipFullName}</strong>
                    </Trans>
                </Typography>
                <Typography fontWeight='bold'>{ownershipFullName}</Typography>
                {address}
                {poBox}
                {ownership === 'FCA' ? fcaContact : magnaContact}
                {website}
            </Stack>
        </Box>
    )
}