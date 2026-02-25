import { ConfigContextState } from "../../../framework/config/ConfigContext";

export const initialConfigState: Partial<ConfigContextState> = {
    devMode: true,
    warningTime: 90000,
    environment: 'testing',
    clientName: {
        en: 'loading',
        af: 'loading'
    },
    apiBaseUrl: {
        core: 'loading',
        transgressions: 'loading',
        weigh: 'loading',
        contentStore: 'loading',
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
    trafficControlCentreId: 'loading'
};
