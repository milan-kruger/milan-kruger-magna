/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import WeighbridgeMenu from '../../components/app-bar/sub-components/menus/WeighbridgeMenu';

vi.mock('@mui/material', async () => {
    const actual = await vi.importActual('@mui/material');
    return {
        ...actual,
        useTheme: () => ({
            palette: { primary: { contrastText: 'white' } },
        }),
        Tooltip: ({ children }: any) => <div>{children}</div>,
        Stack: ({ children }: any) => <div>{children}</div>,
        Grid2: ({ children }: any) => <div>{children}</div>,
    };
});

vi.mock('../../../framework/auth/authService', () => ({
    default: {
        isLoggedIn: () => true,
    },
}));

vi.mock('../../../framework/components/app-bar/styles/TmAppMenuButton', () => ({
    default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('../../../framework/components/app-bar/sub-components/menus/MobileMenuButtons', () => ({
    MobileMenuButtons: ({ icon, label, onClick }: any) => (
        <button onClick={onClick}>
            {icon}
            {label}
        </button>
    ),
}));

vi.mock('../../../framework/components/button/TmIconButton', () => ({
    default: ({ children, onClick, testid }: any) => (
        <button data-testid={testid} onClick={onClick}>{children}</button>
    ),
}));

vi.mock('../../../framework/components/menu/TmMenu', () => ({
    default: React.forwardRef(({ children }: any, ref: any) => <div ref={ref}>{children}</div>),
}));

vi.mock('../../../framework/components/typography/TmTypography', () => ({
    default: ({ children, testid }: any) => <span data-testid={testid}>{children}</span>,
}));

vi.mock('../../../framework/redux/hooks', () => ({
    useAppDispatch: () => vi.fn(),
    useAppSelector: vi.fn().mockImplementation((selector) => {
        if (selector.name === 'selectActiveAuthority') return 'AUTH_001';
        if (selector.name === 'selectActiveWeighbridge') return 'WB_001';
        return '';
    }),
}));

vi.mock('../../../framework/config/configSlice', () => ({
    selectActiveAuthority: () => '',
    selectActiveWeighbridge: () => '',
    setActiveWeighbridge: vi.fn(),
}));

vi.mock('../../../framework/utils', () => ({
    default: (val: string) => val,
    toCamelCase: (val: string) => val,
    toCamelCaseWords: (prefix: string, value: string) => `${prefix}-${value}`,
}));

vi.mock('../../../project/redux/api/coreApi', () => ({
    useFindTrafficControlCentresByAuthorityQuery: () => ({
        data: [{
            weighbridges: [
                { weighbridgeCode: 'WB_001' },
                { weighbridgeCode: 'WB_002' },
            ],
        }],
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// --- Tests ---
describe('WeighbridgeMenu Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing in desktop mode', () => {
        render(<WeighbridgeMenu />);
        expect(screen.getByTestId('weighbridgeMenuIcon')).toBeInTheDocument();
        expect(screen.getByTestId('weighbridgeActive')).toBeInTheDocument();
    });

    it('renders without crashing in mobile mode', () => {
        render(<WeighbridgeMenu isMobile />);

        const allWB001s = screen.getAllByText('WB_001');
        expect(allWB001s.length).toBeGreaterThan(0);

        // Example: test the first one
        expect(allWB001s[0]).toBeInTheDocument();
    });


    it('renders weighbridge menu items if user is logged in', () => {
        render(<WeighbridgeMenu />);
        expect(screen.getByTestId('weighbridgeMenuIcon')).toBeInTheDocument();
        expect(screen.getByTestId('weighbridgeActive')).toHaveTextContent('WB_001');
    });

    it('opens menu on icon button click', () => {
        render(<WeighbridgeMenu />);

        const iconButton = screen.getByTestId('weighbridgeMenuIcon');
        fireEvent.click(iconButton);

        // Expect at least one LocalShippingIcon after the click
        const icons = screen.getAllByTestId('LocalShippingIcon');
        expect(icons.length).toBeGreaterThan(0);
    });

});
