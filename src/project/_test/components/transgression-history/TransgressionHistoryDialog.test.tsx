import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRetrieveTransgressionHistoryQuery } from '../../../redux/api/transgressionsApi';
import TestingPageWrapper from '../../TestingPageWrapper';
import TransgressionHistoryDialog from '../../../components/transgression-history/TransgressionHistoryDialog';
import { initialConfigState } from '../../mocks/config.mock';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../../../framework/redux/store';

vi.mock('../../../../project/components/transgression-history/TransgressionHistoryTable', () => ({
    default: vi.fn(({ rows }) => (
        <div data-testid="transgression-history-table">{rows?.length} rows</div>
    )),
}));

vi.mock('../../../../framework/components/button/TmButton', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children, ...props }: any) => (
        <button data-testid={props.testid} {...props}>
            {children}
        </button>
    ),
}));

vi.mock('../../../../framework/components/progress/TmLoadingSpinner', () => ({
    __esModule: true,
    default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-hotkeys-hook', () => ({
    useHotkeys: vi.fn(),
}));

vi.mock('../../../redux/api/transgressionsApi', async () => {
    const actual = await vi.importActual('../../../redux/api/transgressionsApi');
    return {
        ...actual,
        useRetrieveTransgressionHistoryQuery: vi.fn(() => ({
            data: undefined,
            isFetching: false,
        })),
    };
});

const mockTransgressionData = {
    noticeNumber: 'ABC123',
    transgressionEntries: [
        {
            dateTime: '2025-08-05T10:00:00Z',
            doneBy: 'John Doe',
            authorisedBy: 'Jane Smith',
            transgressionVersion: 2,
            status: 'Open',
            comments: ['Comment 1', 'Comment 2'],
        },
    ],
};

const initializeStore = () =>
    configureStore({
        reducer: rootReducer,
    });

const renderWithWrapper = (
    ui: React.ReactElement,
    store: EnhancedStore = initializeStore()
) =>
    rtlRender(<TestingPageWrapper store={store} initialConfigState={initialConfigState}>{ui}</TestingPageWrapper>);

describe('TransgressionHistoryDialog', () => {
    let store: EnhancedStore;
    const defaultProps = {
        testid: 'transgressionHistory',
        isOpen: true,
        noticeNo: 'ABC123',
        onCancel: vi.fn(),
    };

    beforeEach(() => {
        store = initializeStore();
        vi.clearAllMocks();
    });

    it('should render loading spinner when data is loading', () => {
        vi.mocked(useRetrieveTransgressionHistoryQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            refetch: vi.fn(),
        });

        renderWithWrapper(<TransgressionHistoryDialog {...defaultProps} />, store);
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render table when data is loaded', async () => {
        vi.mocked(useRetrieveTransgressionHistoryQuery).mockReturnValue({
            data: mockTransgressionData,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        renderWithWrapper(<TransgressionHistoryDialog {...defaultProps} />, store);
        expect(await screen.findByTestId('transgression-history-table')).toBeInTheDocument();
        expect(screen.getByText('1 rows')).toBeInTheDocument();
    });

    it('should call onCancel when close button is clicked', () => {
        vi.mocked(useRetrieveTransgressionHistoryQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        renderWithWrapper(<TransgressionHistoryDialog {...defaultProps} />, store);
        fireEvent.click(screen.getByTestId('transgressionHistoryDialogCloseButton'));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should skip API query when dialog is closed', () => {
        renderWithWrapper(<TransgressionHistoryDialog {...defaultProps} isOpen={false} />, store);

        expect(useRetrieveTransgressionHistoryQuery).toHaveBeenCalledWith(
            { noticeNumber: '' },
            expect.objectContaining({ skip: true })
        );
    });

    it('should trigger request when dialog opens and noticeNo is set', async () => {
        vi.mocked(useRetrieveTransgressionHistoryQuery).mockReturnValue({
            data: mockTransgressionData,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        const { rerender } = renderWithWrapper(
            <TransgressionHistoryDialog {...defaultProps} isOpen={false} />,
            store
        );

        rerender(
            <TestingPageWrapper store={store} initialConfigState={initialConfigState}>
                <TransgressionHistoryDialog {...defaultProps} isOpen={true} />
            </TestingPageWrapper>
        );

        await waitFor(() => {
            expect(useRetrieveTransgressionHistoryQuery).toHaveBeenCalledWith(
                { noticeNumber: 'ABC123' },
                expect.anything()
            );
        });
    });
});
