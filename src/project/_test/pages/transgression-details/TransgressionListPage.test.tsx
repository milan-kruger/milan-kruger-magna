import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TransgressionListPage from '../../../pages/transgression-details/TransgressionListPage';
import TestingPageWrapper from '../../TestingPageWrapper';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Mocks
const mockHasRoles = vi.fn();
const mockIsFeatureEnabled = vi.fn();

const mockT = (str: string) => str;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT })
}));

vi.mock('../../../pages/transgression-details/OverloadTransgressionListPage', () => ({
    __esModule: true,
    default: () => <div data-testid="overload-list" />
}));
vi.mock('../../../pages/transgression-details/RTQSTransgressionListPage', () => ({
    __esModule: true,
    default: () => <div data-testid="rtqs-list" />
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('../../../components/tab/ResponsiveTabSelect', () => ({
    default: ({ items }: any) => (
        <div data-testid="tab-select">
            {items.map((item: any) => (
                <div key={item.id} data-testid={`tab-${item.id}`}>{item.label}</div>
            ))}
        </div>
    )
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

vi.mock('../../../../framework/auth/components/SecuredContent', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children, accessRoles }: any) => (
        <div data-testid="secured-content" data-access-roles={JSON.stringify(accessRoles)}>{children}</div>
    )
}));
vi.mock('../../../../framework/auth/authService', () => ({
    __esModule: true,
    default: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hasRoles: (...args: any[]) => mockHasRoles(...args),
        hasRole: vi.fn(() => false),
        isAuthenticated: vi.fn(() => true),
        getToken: vi.fn(() => 'mock-token'),
        getUser: vi.fn(() => ({ username: 'testuser' })),
        getUserName: vi.fn(() => 'testuser'),
        initializeAuthService: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isFeatureEnabled: (...args: any[]) => mockIsFeatureEnabled(...args),
    }
}));

// Create a test store with minimal configuration
const createTestStore = () => configureStore({
    reducer: combineReducers({
        // Add minimal reducers needed for the test
        ui: (state = { themeMode: 'light' }) => state,
        auth: (state = { isAuthenticated: true }) => state,
        error: (state = []) => state,
        conf: (state = { config: {} }) => state,
    }),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

const renderWithConfig = (featureFlags: { enableRtqsTransgressions?: boolean } = {}, roleSetup: { overload?: boolean, rtqs?: boolean } = {}) => {
    mockHasRoles.mockImplementation((roles: string[]) => !!roleSetup.overload && roles.includes('TRANSGRESSIONDETAILS_VIEW') || !!roleSetup.rtqs && roles.includes('RTQSTRANSGRESSION_VIEW'));

    // Mock isFeatureEnabled based on feature flags
    mockIsFeatureEnabled.mockImplementation((featureName: string) => {
        if (featureName === 'RTQS_TRANSGRESSIONS') {
            return featureFlags.enableRtqsTransgressions ?? false;
        }
        return false;
    });

    const testStore = createTestStore();
    return render(
        <TestingPageWrapper store={testStore}>
            <TransgressionListPage />
        </TestingPageWrapper>
    );
};

describe('TransgressionListPage', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test('renders only overload tab when only overload roles present', () => {
        renderWithConfig({}, { overload: true });
        expect(screen.getByTestId('tab-overloadListTab')).toBeInTheDocument();
        expect(screen.queryByTestId('tab-rtqsListTab')).not.toBeInTheDocument();
    });

    test('renders only RTQS tab when only RTQS roles present and feature enabled', () => {
        renderWithConfig({ enableRtqsTransgressions: true }, { rtqs: true });
        expect(screen.getByTestId('tab-rtqsListTab')).toBeInTheDocument();
        expect(screen.queryByTestId('tab-overloadListTab')).not.toBeInTheDocument();
    });

    test('renders both tabs when both roles present and feature enabled', () => {
        renderWithConfig({ enableRtqsTransgressions: true }, { overload: true, rtqs: true });
        expect(screen.getByTestId('tab-overloadListTab')).toBeInTheDocument();
        expect(screen.getByTestId('tab-rtqsListTab')).toBeInTheDocument();
    });

    test('renders no tabs when no roles present', () => {
        renderWithConfig();
        expect(screen.queryByTestId('tab-overloadListTab')).not.toBeInTheDocument();
        expect(screen.queryByTestId('tab-rtqsListTab')).not.toBeInTheDocument();
    });

    test('passes correct accessRoles to SecuredContent (feature off)', () => {
        renderWithConfig({}, { overload: true });
        const secured = screen.getByTestId('secured-content');
        const roles = JSON.parse(secured.getAttribute('data-access-roles')!);
        expect(roles).toEqual(['TRANSGRESSIONDETAILS_VIEW', 'TRANSGRESSION_MAINTAIN']);
    });

    test('passes correct accessRoles to SecuredContent (feature on)', () => {
        renderWithConfig({ enableRtqsTransgressions: true }, { overload: true, rtqs: true });
        const secured = screen.getByTestId('secured-content');
        const roles = JSON.parse(secured.getAttribute('data-access-roles')!);
        expect(roles).toEqual([
            'TRANSGRESSIONDETAILS_VIEW',
            'TRANSGRESSION_MAINTAIN',
            'RTQSTRANSGRESSION_MAINTAIN',
            'RTQSTRANSGRESSION_VIEW',
        ]);
    });

    test('does not render RTQS tab if feature is disabled even if roles present', () => {
        renderWithConfig({ enableRtqsTransgressions: false }, { rtqs: true });
        expect(screen.queryByTestId('tab-rtqsListTab')).not.toBeInTheDocument();
    });

    test('does not render overload tab if roles missing', () => {
        renderWithConfig({}, { rtqs: true });
        expect(screen.queryByTestId('tab-overloadListTab')).not.toBeInTheDocument();
    });

    test('does not render RTQS tab if roles missing even if feature enabled', () => {
        renderWithConfig({ enableRtqsTransgressions: true }, { overload: true });
        expect(screen.queryByTestId('tab-rtqsListTab')).not.toBeInTheDocument();
    });
});
