import { Box, Container, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import packageJson from '../../../../package.json';
import { useGetAboutQuery as useGetAboutQueryCore } from '../../../project/redux/api/coreApi';
import { useGetAboutQuery as useGetAboutQueryTrans } from '../../../project/redux/api/transgressionsApi';
import { useGetAboutQuery as useGetAboutQueryWeigh } from '../../../project/redux/api/weighApi';
import { ConfigContext } from '../../config/ConfigContext';
import { titleCaseWord } from '../../utils';
import { useGetCopyrightOwnership } from '../../utils/useGetCopyrightOwnership';
import TmTypography from '../typography/TmTypography';
import { DevModeFooter } from './DevModeFooter';
import dayjs from "dayjs";
import { useGetAboutQuery as useGetAboutQueryContentStore } from '../../../project/redux/api/contentStoreApi';

const Copyright = memo(function Copyright() {
    const { t } = useTranslation();
    const { ownershipFullName } = useGetCopyrightOwnership();
    return (
        <NavLink to='copyright' color='inherit'>
            <TmTypography
                testid={'footerCopyright'}
                variant='body2'
                fontSize='0.77rem'
                color='primary'
                sx={{textDecoration: 'underline'}}
            >
                {t('copyright', { date: new Date().getFullYear() })}
                {' '}
                {ownershipFullName}
            </TmTypography>
        </NavLink>
    );
});

const Version = memo(function Version() {

    function consistentDate(date: string | undefined): string {
        return date
            ? dayjs(date).format() //Use ISO 8601 format
            : 'Sometime';
    }

    const feDate = consistentDate(import.meta.env.VITE_COMMIT_DATE);

    const { data: weighAbout, error: weighError, isLoading: weighIsLoading } = useGetAboutQueryWeigh();
    const weighBeDate = consistentDate(weighAbout?.gitTimeStamp);

    const { data: coreAbout, error: coreError, isLoading: coreIsLoading } = useGetAboutQueryCore();
    const coreBeDate = consistentDate(coreAbout?.gitTimeStamp);

    const { data: transAbout, error: transError, isLoading: transIsLoading } = useGetAboutQueryTrans();
    const transBeDate = consistentDate(transAbout?.gitTimeStamp);

    const { data: contentStoreAbout, error: contentStoreError, isLoading: contentStoreIsLoading  } = useGetAboutQueryContentStore()
    const contentStoreBeDate = consistentDate(contentStoreAbout?.gitTimeStamp);

    return (
        <TmTypography
            testid={'footerVersion'}
            variant='body2'
            fontSize='0.7rem'
            lineHeight='0.7rem'
            color='text.secondary'
        >
            FE {`${packageJson.version} - ${feDate} (${import.meta.env.VITE_BRANCH_NAME} ${import.meta.env.VITE_COMMIT_HASH})`}
            ,
            BE:W {weighIsLoading ? 'loading' : (weighError ? 'error' : `${weighAbout?.applicationVersion} - ${weighBeDate} (${weighAbout?.gitBranch} ${weighAbout?.gitCommitId})`)}
            ,
            BE:C {coreIsLoading ? 'loading' : (coreError ? 'error' : `${coreAbout?.applicationVersion} - ${coreBeDate} (${coreAbout?.gitBranch} ${coreAbout?.gitCommitId})`)}
            ,
            BE:T {transIsLoading ? 'loading' : (transError ? 'error' : `${transAbout?.applicationVersion} - ${transBeDate} (${transAbout?.gitBranch} ${transAbout?.gitCommitId})`)}
            ,
            BE:CS {contentStoreIsLoading  ? 'loading' : (contentStoreError ? 'error' : `${contentStoreAbout?.applicationVersion} - ${contentStoreBeDate} (${contentStoreAbout?.gitBranch} ${contentStoreAbout?.gitCommitId})`)}
        </TmTypography>
    );
});

const FooterBox = styled(Box)(({ theme }) => ({
    padding: 2,
    marginTop: 'auto',
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800]
}));

export default memo(function TmFooter() {
    const { t } = useTranslation();
    const config = useContext(ConfigContext);
    return (
        <FooterBox>
            <Container style={{ maxWidth: 'none' }}>
                <Stack direction='row' gap={10}>
                    <TmTypography testid={'footerProject'} variant='caption'>
                        {t('appName', { tenant: titleCaseWord(config.tenancy.tenant), env: config.environment })}
                    </TmTypography>
                    <Copyright />
                    {config.devMode && <DevModeFooter />}
                </Stack>
                <Version />
            </Container>
        </FooterBox>
    );
});
