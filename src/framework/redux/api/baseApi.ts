import { BaseQueryFn, FetchArgs, FetchBaseQueryError, createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import i18n from "i18next";
import { ConfigContextState, initialConfigContextState } from '../../config/ConfigContext';
import { selectConfigBaseUrl } from '../../config/configSlice';
import { RootState } from '../store';
import AuthService from '../../auth/authService';

const mutex = new Mutex();

const rawBaseQuery = (name: keyof ConfigContextState['apiBaseUrl']) => {
    return fetchBaseQuery({
        baseUrl: ' ', // Needs to be a single space (if empty then RTK Query sets it to the frontend's base URL)
        prepareHeaders: (headers, { getState }) => {
            // Add the JWT Token to the request header
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            // Add the Tenancy info to the request header
            const configTenancy = (getState() as RootState).conf.config.tenancy;
            const activeTenant = (getState() as RootState).conf.active.authorityCode;
            headers.set('X-Org', configTenancy.organisation);
            if (name === 'core') {
                headers.set('X-Tnt', configTenancy.coreTenant);
            }
            else {
                headers.set('X-Tnt', activeTenant);
            }
            // Set the language
            headers.set('Accept-Language', i18n.language);
            // Make sure we get JSON back from the server
            headers.set('Accept', 'application/json');
            return headers;
        }
    })
};

/**
 * @param name - The name of the API as defined in the Config and Store.
 * @param cacheDuration - The number of seconds a query cache is valid for.
 */
export const baseMultiSplitApi = (name: keyof ConfigContextState['apiBaseUrl'], cacheDuration: number) => {
    // Handle a dynamic base URL for the API calls
    const dynamicBaseQuery: BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError
    > = async (args, api, extraOptions) => {
        // Gracefully handle scenarios where data to generate the URL is missing
        const baseUrl = selectConfigBaseUrl(api.getState() as RootState);
        const apiBaseUrl = baseUrl[name];
        if (!apiBaseUrl || apiBaseUrl === initialConfigContextState.apiBaseUrl[name]) {
            return {
                error: {
                    status: 400,
                    statusText: 'Bad Request',
                    data: 'No baseUrl configured!'
                }
            };
        }
        const urlEnd = typeof args === 'string' ? args : args.url;
        // Construct a dynamically generated portion of the url
        const adjustedUrl = `${apiBaseUrl}${urlEnd}`;
        const adjustedArgs = typeof args === 'string' ? adjustedUrl : { ...args, url: adjustedUrl };
        // Provide the amended url and other params to the raw base query
        return rawBaseQuery(name)(adjustedArgs, api, extraOptions);
    }

    // Base query with reauthentication logic
    const baseQueryWithReauth: BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError
    > = async (args, api, extraOptions) => {
        let result = await dynamicBaseQuery(args, api, extraOptions);

        if (result.error && result.error.status === 403) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorResult = (result.error?.data as any)?.error;

            if (errorResult === 'TOKEN_EXPIRED') {
                const release = await mutex.acquire();

                try {
                    const currentToken = AuthService.getToken();
                    const sessionToken = sessionStorage.getItem('authToken');

                        if (currentToken === sessionToken) {
                            const refreshToken = sessionStorage.getItem('authRefreshToken');

                            if (!refreshToken) {
                                console.error('No refresh token available, logging out');
                                AuthService.doLogout();
                                return result;
                            }

                            const { coreApi } = await import('../../../project/redux/api/coreApi');

                            const refreshResult = await api.dispatch(
                                coreApi.endpoints.refreshAccessToken.initiate({ body: refreshToken })
                            );

                            if (refreshResult.data) {
                                const newAccessToken = refreshResult.data.accessToken;
                                sessionStorage.setItem('authToken', newAccessToken);

                                if (refreshResult.data.refreshToken) {
                                    sessionStorage.setItem('authRefreshToken', refreshResult.data.refreshToken);
                                }

                                AuthService.setAuthToken(newAccessToken);
                            } else {
                                console.error('Token refresh failed - no data or accessToken in response');
                                AuthService.doLogout();
                                return result;
                            }
                        } else {
                            console.log('Token already refreshed by another request');
                        }

                        // Retry the original request with the new token
                        result = await dynamicBaseQuery(args, api, extraOptions);

                } catch (error) {
                    console.error('Token refresh error:', error);
                    AuthService.doLogout();
                } finally {
                    release();
                }
            }
        }

        return result;
    }
    // Create an empty API service that will be used to inject the auto-generated endpoints into
    const baseSplitApi = createApi({
        reducerPath: `${name}Api`,
        baseQuery:
            retry(
                baseQueryWithReauth,
                {
                    retryCondition: (error, _args, options) => {
                        // Retry once
                        if (options.attempt <= 1) {
                            // Unless the server responded with a 403 (forbidden) in which case don't retry
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            if ((error as any)?.status === 403) {
                                console.log('403 responses won\'t be retried');
                                return false;
                            }
                            return true;
                        }
                        return false;
                    }
                }
            ),
        endpoints: () => ({}),
        keepUnusedDataFor: cacheDuration
    });
    // Return the adjusted createApi function
    return baseSplitApi;
}
