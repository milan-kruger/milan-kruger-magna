import SettingsSuggestTwoToneIcon from '@mui/icons-material/SettingsSuggestTwoTone';
import { Box, Container } from '@mui/material';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmLoadingSpinner from '../components/progress/TmLoadingSpinner';
import TmTypography from '../components/typography/TmTypography';
import { BASE_URL } from '../const';

export type ConfigContextState = {
    devMode: boolean;
    warningTime: number;
    environment: string;
    clientName: {
        en: string;
        af: string;
    };
    apiBaseUrl: {
        core: string;
        transgressions: string;
        weigh: string;
        contentStore: string;
    };
    jasperUrl: string;
    subsystem: {
        currentApp: string;
        apps: {
            portal: string;
            core: string;
            reports: string;
            weigh: string;
            transgressions: string;
        };
    };
    tenancy: {
        organisation: string;
        tenant: string;
        coreTenant: string;
        tenants: {
            [name: string]: string;
        };
        hideTenancySelector: boolean;
    };
    theme: {
        fischerTheme: {
            primary: string,
            secondary: string
        };
        magnaTheme: {
            primary: string,
            secondary: string
        };
        primary: string;
        secondary: string;
        success: string;
        error: string;
        warning: string;
        info: string;
        scrollbar: string;
    };
    dateTime: {
        ampmClock: boolean;
        dateFormat: string;
        timeFormat: string;
        dateTimeSecondsFormat: string;
        dateTimeFormat: string;
    };
    weighbridgeId: string;
    trafficControlCentreId: string;
    weighbridge: {
        id: string;
    }
}

export const initialConfigContextState: ConfigContextState = {
    devMode: true,
    warningTime: 60000,
    environment: 'loading',
    clientName: {
        en: 'loading',
        af: 'loading'
    },
    apiBaseUrl: {
        core: 'loading',
        transgressions: 'loading',
        weigh: 'loading',
        contentStore: 'loading'
    },
    jasperUrl: 'loading',
    subsystem: {
        currentApp: 'loading',
        apps: {
            portal: 'loading',
            core: 'loading',
            reports: 'loading',
            weigh: 'loading',
            transgressions: 'loading'
        },
    },
    tenancy: {
        organisation: 'loading',
        tenant: 'loading',
        coreTenant: 'loading',
        tenants: {},
        hideTenancySelector: true
    },
    theme: {
        fischerTheme: {
            primary: 'loading',
            secondary: 'loading'
        },
        magnaTheme: {
            primary: 'loading',
            secondary: 'loading'
        },
        primary: 'loading',
        secondary: 'loading',
        success: 'loading',
        error: 'loading',
        warning: 'loading',
        info: 'loading',
        scrollbar: 'loading'
    },
    dateTime: {
        ampmClock: false,
        dateFormat: 'loading',
        timeFormat: 'loading',
        dateTimeSecondsFormat: 'loading',
        dateTimeFormat: 'loading'
    },
    weighbridgeId: 'loading',
    trafficControlCentreId: 'loading',
    weighbridge: {
        id: 'loading'
    }
};

export const ConfigContext = createContext<ConfigContextState>(initialConfigContextState);

type Props = {
    children?: ReactNode;
}

export default function ConfigContextProvider({ children }: Readonly<Props>) {
    const { t } = useTranslation();
    // Load Config
    const [fetchedConfig, setFetchedConfig] = useState<ConfigContextState | null>(null);
    useEffect(() => {
        fetch(`${BASE_URL}/config.json`)
            .then(response => response.json())
            .then(fetchedConfig => {
                return setFetchedConfig({
                    devMode: fetchedConfig.devMode,
                    environment: fetchedConfig.environment,
                    clientName: { ...fetchedConfig.clientName },
                    apiBaseUrl: fetchedConfig.apiBaseUrl,
                    jasperUrl: fetchedConfig.jasperUrl,
                    warningTime: fetchedConfig.warningTime,
                    subsystem: {
                        currentApp: fetchedConfig.subsystem.currentApp,
                        apps: { ...fetchedConfig.subsystem.apps },
                    },
                    tenancy: { ...fetchedConfig.tenancy },
                    theme: { ...fetchedConfig.theme },
                    dateTime: { ...fetchedConfig.dateTime },
                    weighbridgeId: fetchedConfig.weighbridgeId,
                    trafficControlCentreId: fetchedConfig.trafficControlCentreId,
                    weighbridge: { ...fetchedConfig.weighbridge }
                });
            });
    }, []);

    if (!fetchedConfig) {
        return (
            <Container>
                <Box marginTop={10} textAlign='center'>
                    <SettingsSuggestTwoToneIcon color='info' fontSize='large' />
                    <TmTypography testid={'configLoadDescription'} variant='h4' color='info' textAlign='center' marginBottom={5}>
                        {t('configLoading')}
                    </TmTypography>
                    <TmLoadingSpinner testid={'configLoadSpinner'} size={40} />
                </Box>
            </Container>
        );
    }

    // Config is loaded, we can continue to render the children
    return (
        <ConfigContext.Provider value={fetchedConfig}>
            {children}
        </ConfigContext.Provider>
    );
}
