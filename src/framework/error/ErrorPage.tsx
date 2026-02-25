/* eslint-disable @typescript-eslint/no-explicit-any */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
import { Box, Container, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useRouteError, useNavigate} from 'react-router-dom';
import TmButton from '../components/button/TmButton';
import TmTypography from '../components/typography/TmTypography';
import { useAppSelector } from '../redux/hooks';
import { selectConfigDevMode } from '../config/configSlice';

function ErrorPage() {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const devMode = useAppSelector(selectConfigDevMode);

    const error = useRouteError() as any;
    console.warn(error);

    // Construct the error messages and details
    let errorMessage: string;
    let errorDetails = '*** DEVELOPMENT DETAILS ***';
    if (isRouteErrorResponse(error) as any) {
        errorMessage = error?.error?.message || error?.statusText;
        errorDetails += `
            ${error?.status}: ${error?.statusText}
            ${error?.data}
            ${error?.error ? error?.error.message + '\n' + error?.error.stack : ''}
            `;
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails += `
            ${error.name}
            ${error.stack}
            ${(error as any).cause}
            `;
    } else if (typeof error === 'string') {
        errorMessage = error;
        errorDetails += 'N/A';
    } else {
        errorMessage = 'Unknown Error';
        errorDetails += JSON.stringify(error, undefined, 2);
    }

    // Copy to clipboard
    const [errorCopied, setErrorCopied] = useState(false);
    const copyToClipboard = useCallback(() => {
        const textToCopy = `${errorMessage}\n\n${errorDetails}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setErrorCopied(true);
        });
    }, [errorMessage, errorDetails]);

    // RENDER
    return (
        <Container>
            <Box marginTop={10} textAlign='center'>
                <ErrorTwoToneIcon color='error' fontSize='large'/>
                <TmTypography testid={'errorPageTitle'} variant='h4' color='error' textAlign='center' marginBottom={5}>
                    {t('error')}
                </TmTypography>
                <TmTypography testid={'errorPageMessage'} variant='body1' color='error' textAlign='center'>
                    {errorMessage}
                </TmTypography>
                <TmButton
                    testid='ErrorHandlingBackToHomePage'
                    size='large'
                    variant='outlined'
                    onClick={() => navigate('/')}
                    sx={{marginTop: 10}}
                >
                    {t('backToHomePage')}
                </TmButton>
                {devMode &&
                    <>
                        <TmTypography testid='errorPageDetails' textAlign='left'>
                            <pre>
                                {errorDetails}
                            </pre>
                        </TmTypography>
                        <Box display='flex' marginTop='15px' alignItems='center'>
                            <TmButton
                                testid={'errorPageCopyButton'}
                                type='submit'
                                variant='outlined'
                                color={errorCopied ? 'warning' : 'info'}
                                size='large'
                                startIcon={<ContentCopyIcon/>}
                                onClick={copyToClipboard}
                            >
                                Copy error to clipboard
                            </TmButton>
                            {errorCopied &&
                                <TmTypography
                                    testid={'errorPageErrorCopied'}
                                    color={theme.palette.info.main}
                                    ml='10px'
                                >
                                    Copied!
                                </TmTypography>
                            }
                        </Box>
                    </>
                }
            </Box>
        </Container>
    );
}

export default ErrorPage;
