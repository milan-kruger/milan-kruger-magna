import { Box, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';

import { Suspense, lazy, useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, RouteObject, RouterProvider, RouterProviderProps, createBrowserRouter } from 'react-router-dom';
import useProjectRoutes from '../project/Routing';
import './App.css';
import { CopyrightPage } from './components/footer/CopyrightPage';
import TmFooter from './components/footer/TmFooter';
import TmLoadingSpinner from './components/progress/TmLoadingSpinner';
import { ConfigContext } from './config/ConfigContext';
import { setActiveAuthority, setConfig } from './config/configSlice';
import { BASE_URL } from './const';
import ProfilePage from './pages/profile-page/ProfilePage';
import { useAppDispatch } from './redux/hooks';
import { titleCaseWord } from './utils';
import ErrorPage from './error/ErrorPage';
import { useHotkeys } from 'react-hotkeys-hook';
import AuthService from './auth/authService';
import { SessionTimeoutDialog } from './utils/SessionTimeout';

// Code-Splitting based on routes
const ResponsiveAppBar = lazy(() => import('./components/app-bar/ResponsiveAppBar'));
const HomePage = lazy(() => import('../framework/pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

const ViewportBox = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
}));

function App() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    // Config
    const config = useContext(ConfigContext);
    useEffect(() => {
        dispatch(setConfig(config));
    }, [config, dispatch]);

    // Set the Authority
    useEffect(() => {
        dispatch(setActiveAuthority(config.tenancy.tenant));
    }, [config.tenancy.tenant, dispatch]);

    // Title
    useEffect(() => {
        document.title = t('appName', { tenant: titleCaseWord(config.tenancy.tenant), env: config.environment });
    }, [config.environment, t, config.tenancy.tenant]);

    // Routing
    const projectRoutes = useProjectRoutes();

    const loaderHome = useCallback(() => 'Home', []);
    const loaderProfile = useCallback(() => t('profile'), [t]);
    const loaderLogin = useCallback(() => t('login'), [t]);
    const loaderResetPassword = useCallback(() => t('resetPassword'), [t]);

    // Defined here because id and path needs to be the same
    const homeRoute = 'home';
    const profileRoute = 'profile';
    const copyrightRoute = 'copyright';
    const loginRoute = 'login';
    const resetPasswordRoute = 'resetPassword';

    const routes: RouteObject[] = [
        {
            id: 'root',
            element: (
                <>
                    <ResponsiveAppBar />
                    <Outlet />
                    <TmFooter />
                </>
            ),
            errorElement: <ErrorPage />,
            // loader: () => 'ROOT',
            children: [
                {
                    id: '',
                    path: '',
                    element: <HomePage />,
                    errorElement: <ErrorPage />,
                    loader: loaderHome
                },
                {
                    id: homeRoute,
                    path: homeRoute,
                    element: <HomePage />,
                    errorElement: <ErrorPage />,
                    loader: loaderHome
                },
                {
                    id: profileRoute,
                    path: profileRoute,
                    element: <ProfilePage />,
                    errorElement: <ErrorPage />,
                    loader: loaderProfile
                },
                {
                    id: copyrightRoute,
                    path: copyrightRoute,
                    element: <CopyrightPage />,
                    errorElement: <ErrorPage />,
                    loader: loaderProfile
                },
                // Add all the project specific routes
                ...projectRoutes
            ]
        },
        {
            id: loginRoute,
            path: loginRoute,
            element: <LoginPage />,
            errorElement: <ErrorPage />,
            loader: loaderLogin
        },
        {
            id: resetPasswordRoute,
            path: resetPasswordRoute,
            element: <ResetPasswordPage />,
            errorElement: <ErrorPage />,
            loader: loaderResetPassword
        }
    ];

    const router = createBrowserRouter(routes, {
        basename: BASE_URL,
        future: {
            v7_fetcherPersist: true,
            v7_normalizeFormMethod: true,
            v7_partialHydration: true,
            v7_relativeSplatPath: true,
            v7_skipActionErrorRevalidation: true
        }
    });

    useHotkeys('F2', () => {AuthService.doLogin()}, {
        preventDefault: true,
        enableOnFormTags: true,
        description: t('login'),
        enabled: !AuthService.isLoggedIn()
    });

    useHotkeys('ALT+F2', () => {AuthService.doLogout()}, {
        preventDefault: true,
        enableOnFormTags: true,
        description: t('logout'),
        enabled: AuthService.isLoggedIn()
    });

    return (
        <AppContent router={router} />
    );
}

function AppContent({ router }: Readonly<RouterProviderProps>) {
    // RENDER
    return (
        <ViewportBox>
            <SessionTimeoutDialog />
            <CssBaseline />
            <Suspense fallback={<TmLoadingSpinner testid='pageLoading' />}>
                <RouterProvider router={router} />
            </Suspense>
        </ViewportBox>
    );
}

export default App;
