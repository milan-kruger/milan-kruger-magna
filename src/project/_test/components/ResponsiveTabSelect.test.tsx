import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TmResponsiveTabSelect, { TmResponsiveTabSelectItem } from '../../components/tab/ResponsiveTabSelect';

import * as reactRouterDom from 'react-router-dom';
import * as muiMaterial from '@mui/material';

vi.mock('@mui/material', async () => {
    const actual = await vi.importActual<typeof muiMaterial>('@mui/material');
    return {
        ...actual,
        useMediaQuery: vi.fn(),
    };
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof reactRouterDom>('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
    };
});

// Mock components
vi.mock('../../../framework/components/tab/TmTab', () => ({
    __esModule: true,
    default: ({ label, onClick }: { label: string, onClick: () => void }) => (
        <button data-testid={`tm-tab-${label}`} onClick={onClick}>
            {label}
        </button>
    ),
}));

vi.mock('../../../framework/components/tab/TmTabPanel', () => ({
    __esModule: true,
    default: ({ value, index, children }: { value: number, index: number, children: React.ReactNode }) => {
        return value === index ? <div data-testid={`tab-panel-${index}`}>{children}</div> : null;
    },
}));

const mockedUseNavigate = vi.mocked(reactRouterDom.useNavigate);
const mockedUseLocation = vi.mocked(reactRouterDom.useLocation);
const mockedUseMediaQuery = vi.mocked(muiMaterial.useMediaQuery);

describe('TmResponsiveTabSelect', () => {
    const navigateMock = vi.fn();

    const items: TmResponsiveTabSelectItem[] = [
        { id: 'tab1', label: 'Tab 1', route: 'tab1', component: <div>Tab 1 content</div> },
        { id: 'tab2', label: 'Tab 2', route: 'tab2', component: <div>Tab 2 content</div> },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseNavigate.mockReturnValue(navigateMock);
    });

    afterEach(() => {
        vi.resetModules();
    });

    it('renders tabs on desktop and navigates on click', async () => {
        mockedUseMediaQuery.mockReturnValue(false);
        mockedUseLocation.mockReturnValue({
            pathname: '/tab2',
            state: undefined,
            key: '',
            search: '',
            hash: ''
        });

        render(<TmResponsiveTabSelect entryPath="entry" items={items} />);

        expect(screen.getByTestId('tm-tab-Tab 1')).toBeInTheDocument();
        expect(screen.getByTestId('tm-tab-Tab 2')).toBeInTheDocument();

        await userEvent.click(screen.getByTestId('tm-tab-Tab 1'));
        expect(navigateMock).toHaveBeenCalledWith('/tab1');
    });

    it('renders select dropdown on mobile', () => {
        mockedUseMediaQuery.mockReturnValue(true);
        mockedUseLocation.mockReturnValue({
            pathname: '/tab1',
            state: undefined,
            key: '',
            search: '',
            hash: ''
        });

        render(<TmResponsiveTabSelect entryPath="entry" items={items} />);

        expect(screen.getByText('Tab 1')).toBeInTheDocument();
    });

    it('displays the correct panel content for the selected tab', () => {
        mockedUseMediaQuery.mockReturnValue(false); // desktop
        mockedUseLocation.mockReturnValue({
            pathname: '/tab2',
            state: undefined,
            key: '',
            search: '',
            hash: ''
        });

        render(<TmResponsiveTabSelect entryPath="entry" items={items} />);

        expect(screen.queryByTestId('tab-panel-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('tab-panel-2')).toBeInTheDocument();
        expect(screen.getByText('Tab 2 content')).toBeInTheDocument();
    });

    it('navigates correctly when entryPath is active', () => {
        mockedUseMediaQuery.mockReturnValue(false); // desktop
        mockedUseLocation.mockReturnValue({
            pathname: '/entry',
            state: undefined,
            key: '',
            search: '',
            hash: ''
        });

        render(<TmResponsiveTabSelect entryPath="entry" items={items} />);

        // Should select second tab (value = 1)
        expect(screen.getByTestId('tab-panel-1')).toBeInTheDocument();
    });
});
