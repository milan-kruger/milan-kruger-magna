import TranslateIcon from '@mui/icons-material/Translate';
import { Box, Container } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import TmLoadingSpinner from '../components/progress/TmLoadingSpinner';
import TmTypography from '../components/typography/TmTypography';
import packageJson from '../../../package.json';
import i18n from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { BASE_URL } from '../const';

export type I18nWrapperState = {
    framework: Record<string, object>;
    project: Record<string, object>;

    filesLoaded: boolean;
    i18nInitialized: boolean;
    i18n: string[];
};

const initialI18nWrapperState: I18nWrapperState = {
    framework: {},
    project: {},
    filesLoaded: false,
    i18nInitialized: false,
    i18n: []
}

type Props = {
    children?: ReactNode;
}

export function I18nWrapper({ children }: Readonly<Props>) {
    const [fetchedI18n, setFetchedI18n] = useState<I18nWrapperState>({ ...initialI18nWrapperState });

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const i18n = await fetch(`${BASE_URL}/i18n/i18n.json?v${packageJson.version}`).then(res => res.json());
                const fetches = [];
                for (const lang of (i18n.languages as string[])) {
                    fetches.push(
                        fetch(`${BASE_URL}/i18n/framework/${lang}.json?v${packageJson.version}`)
                            .then(res => res.json())
                            .catch(() => ({ "translation": {} }))
                    );
                    fetches.push(
                        fetch(`${BASE_URL}/i18n/project/${lang}.json?v${packageJson.version}`)
                            .then(res => res.json())
                            .catch(() => ({ "translation": {} }))
                    );
                }
                const fetchedTranslations = await Promise.all(fetches);
                setFetchedI18n({
                    framework: (i18n.languages as string[]).reduce((obj, lang, index) => {
                        obj[lang] = fetchedTranslations[index * 2].translation;
                        return obj;
                    }, {} as Record<string, object>),
                    project: (i18n.languages as string[]).reduce((obj, lang, index) => {
                        obj[lang] = fetchedTranslations[index * 2 + 1].translation;
                        return obj;
                    }, {} as Record<string, object>),
                    filesLoaded: true,
                    i18nInitialized: false,
                    i18n: i18n.languages
                });
            }
            catch (error) {
                console.error('Error fetching i18n:', error);
            }
        };
        fetchTranslations();
    }, []);

    // All files have been loaded
    useEffect(() => {
        if (fetchedI18n.filesLoaded && !fetchedI18n.i18nInitialized) {
            i18n
                .use(I18nextBrowserLanguageDetector)
                .use(initReactI18next)
                .init({
                    resources: fetchedI18n.i18n.reduce((obj, lang) => {
                        obj[lang] = {
                            translation: {
                                ...(fetchedI18n.framework[lang]),
                                ...(fetchedI18n.project[lang])
                            }
                        };
                        return obj;
                    }, {} as Record<string, { translation: object }>),
                    fallbackLng: fetchedI18n.i18n[0],
                    interpolation: {
                        escapeValue: false
                    }
                })
                .then(() => {
                    setFetchedI18n({
                        ...fetchedI18n,
                        i18nInitialized: true
                    });
                });
        }
    }, [fetchedI18n]);

    if (!fetchedI18n.i18nInitialized) {
        return (
            <Container>
                <Box marginTop={10} textAlign='center'>
                    <TranslateIcon color='info' fontSize='large' />
                    {/* Can't translate the text yet because we are in the process of loading the translations files */}
                    <TmTypography testid={'configLoadDescription'} variant='h4' color='info' textAlign='center' marginBottom={5}>
                        Loading text...
                    </TmTypography>
                    <TmLoadingSpinner testid={'configLoadSpinner'} size={40} />
                </Box>
            </Container>
        );
    }

    // I18n is loaded, we can continue to render the children
    return (
        <>
            {children}
        </>
    );
}
