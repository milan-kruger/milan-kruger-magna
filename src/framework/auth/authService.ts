import { Role } from '../../project/auth/roles';
import { login, logout, setToken } from './authSlice';
import { LoginResponse } from '../../project/redux/api/coreApi';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { Store } from '@reduxjs/toolkit';
import { BASE_URL } from '../const';
import { UserRoleInfo, FEATURE_ROLE_MAPPING, FeatureName } from '../../project/auth/userRole.types';

type BaseAppDispatch = ThunkDispatch<unknown, undefined, UnknownAction>;
type AppStore = Store<unknown>;

let token: string | null = null;
let dispatch: BaseAppDispatch | null = null;
let storeRef: AppStore | null = null;

const initializeAuthService = (storeDispatch: BaseAppDispatch) => {
    dispatch = storeDispatch;
};

const setStore = (store: AppStore) => {
    storeRef = store;
};

const getStore = (): AppStore | null => {
    return storeRef;
};

const getState = () => {
    return storeRef ? storeRef.getState() : null;
};

const setupAuth = (onAuthSetupCallback: (authenticated: boolean) => void) => {
    const storedToken = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('authUser');

    if (storedToken && storedUser) {
        token = storedToken;

        // Update Redux store with stored auth data
        getStore()?.dispatch(login({
            user: storedUser,
            token: storedToken,
            isAuthenticated: true
        }));

        onAuthSetupCallback(true);
    } else {
        // Make sure Redux store is cleared if no valid session
        getStore()?.dispatch(logout());
        onAuthSetupCallback(false);
    }
};

const doLogin = () => {
let currentPath = window.location.pathname;
    if (currentPath.startsWith(BASE_URL)) {
        currentPath = currentPath.substring(BASE_URL.length);
    }
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    window.location.href = `${window.location.origin}${BASE_URL}${'/login'}`;
};

const doLogout = (navigateToHome  = false) => {
    // Only navigate to home if navigateToHome is true
    if (navigateToHome) {
        window.location.href = `${window.location.origin}${BASE_URL}`;
    }
    sessionStorage.removeItem('redirectAfterLogin');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authRefreshToken');
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authRoles');
    sessionStorage.removeItem('authRolesInfo');
    token = null;
    getStore()?.dispatch(logout());
};

const isLoggedIn = () => {
    if (token) return true;

    const storedToken = sessionStorage.getItem('authToken');
    if (storedToken) {
        token = storedToken;
    }

    return false;
};

const getUserName = () => {
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) return storedUser;
    return 'unknown';
};

const hasRole = (role: Role): boolean => {
    const storedRoles = sessionStorage.getItem('authRoles');

    if (!storedRoles) {
        return false;
    }

    try {
        const roles: string[] = JSON.parse(storedRoles);
        const roleWithPrefix = `ROLE_${role}`;
        return roles.includes(roleWithPrefix);
    } catch (error) {
        console.error('Error parsing authRoles from sessionStorage:', error);
        return false;
    }
};

const hasRoles = (roles: Role[]) => roles.some(role => hasRole(role));

const hasAllRoles = (roles: Role[]) => roles.every(role => hasRole(role));

const isRoleEnabled = (role: Role): boolean => {
    const storedRoleInfo = sessionStorage.getItem('authRolesInfo');

    if (!storedRoleInfo) {
        return false;
    }

    try {
        const rolesInfo: UserRoleInfo[] = JSON.parse(storedRoleInfo);
        const roleWithPrefix = `ROLE_${role}`;
        const roleInfo = rolesInfo.find(r => r.role === roleWithPrefix);
        return roleInfo?.enabled ?? false;
    } catch (error) {
        console.error('Error parsing authRolesInfo from sessionStorage:', error);
        return false;
    }
};

const areAnyRolesEnabled = (roles: Role[]): boolean => {
    return roles.some(role => isRoleEnabled(role));
};

const isFeatureEnabled = (featureName: FeatureName): boolean => {
    const featureRoles = FEATURE_ROLE_MAPPING[featureName];
    return areAnyRolesEnabled(featureRoles);
};

const getToken = () => {
    if (token) return token;

    const storedToken = sessionStorage.getItem('authToken');
    if (storedToken) {
        token = storedToken;
    }

    return null;
};

const setAuthToken = (newToken: string) => {
    token = newToken;
    sessionStorage.setItem('authToken', newToken);
    if (dispatch) {
        dispatch(setToken(newToken));
    }
};

const handleLoginResponse = (loginData: LoginResponse, username: string) => {
    if (loginData.accessToken) {
        sessionStorage.setItem('authToken', loginData.accessToken);
        sessionStorage.setItem('authRefreshToken', loginData.refreshToken);
        sessionStorage.setItem('authUser', username);
        sessionStorage.setItem('authRoles', JSON.stringify(loginData.tenantRoles || []));

        token = loginData.accessToken;

        if (dispatch) {
            dispatch(login({
                user: username,
                token: loginData.accessToken,
                isAuthenticated: true
            }));
        }

        return loginData;
    }
    return null;
};

const setUserRolesInfo = (rolesInfo: UserRoleInfo[]) => {
    sessionStorage.setItem('authRolesInfo', JSON.stringify(rolesInfo));
};

const AuthService = {
    initializeAuthService,
    setStore,
    setupAuth,
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    getUserName,
    hasRole,
    hasRoles,
    hasAllRoles,
    isRoleEnabled,
    areAnyRolesEnabled,
    isFeatureEnabled,
    setAuthToken,
    handleLoginResponse,
    setUserRolesInfo,
    getStore,
    getState
};

export default AuthService;
