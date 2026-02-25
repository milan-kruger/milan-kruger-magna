import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import OverloadTransgressionList from '../../../pages/transgression-details/OverloadTransgressionListPage';
import TestingPageWrapper from '../../TestingPageWrapper';
import { store } from '../../../../framework/redux/store';
import { TransgressionType } from '../../../enum/TransgressionType';

// Mocks
const mockT = (s: string) => s;
const mockHandleFindTransgressions = vi.fn();
const mockHandleSearchTransgressions = vi.fn();
const mockHandleTransgressionClick = vi.fn();
let mockIsFetchingTransgressionList = false;

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));

vi.mock('../../../components/transgression-details/transgression-list/TransgressionsListTable', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ rows, searchValue, onTransgressionClick, transgressionType }: any) => (
    <div data-testid="transgressions-list-table" data-rows={JSON.stringify(rows)} data-search-value={searchValue} data-type={transgressionType} onClick={() => onTransgressionClick && onTransgressionClick('row1')} />
  )
}));

vi.mock('../../../components/transgression-details/transgression-list/TransgressionListSearch', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ onFindTransgressions, onSearchTransgression }: any) => {
    return (
      <div>
        <button data-testid="find-btn" onClick={() => onFindTransgressions && onFindTransgressions('find')}>Find</button>
        <button data-testid="search-btn" onClick={() => onSearchTransgression && onSearchTransgression('search')}>Search</button>
      </div>
    )
  }
}));

vi.mock('../../../framework/components/progress/TmLoadingSpinner', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ testid }: any) => <div data-testid={testid || 'loading-spinner'} />
}));

vi.mock('../../../hooks/transgression-details/OverloadTransgressionListManager', () => ({
  __esModule: true,
  default: () => ({
    rows: [{ id: 'row1', noticeNo: '123' }],
    handleFindTransgressions: mockHandleFindTransgressions,
    handleSearchTransgressions: mockHandleSearchTransgressions,
    handleTransgressionClick: mockHandleTransgressionClick,
    isFetchingTransgressionList: mockIsFetchingTransgressionList,
  })
}));

const renderWithOverride = (isFetchingTransgressionList?: boolean) => {
  const config = {};
  mockIsFetchingTransgressionList = isFetchingTransgressionList ?? false;
  return render(
    <TestingPageWrapper store={store} initialConfigState={config}>
      <OverloadTransgressionList />
    </TestingPageWrapper>
  );
};

describe('OverloadTransgressionList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders the title and table', () => {
    renderWithOverride();
    expect(screen.getByTestId('overloadTransgressionList')).toBeInTheDocument();
  });

  test('renders the search component and triggers handlers', () => {
    renderWithOverride();
    fireEvent.click(screen.getByTestId('find-btn'));
    expect(mockHandleFindTransgressions).toHaveBeenCalledWith('find');
    fireEvent.click(screen.getByTestId('search-btn'));
    expect(mockHandleSearchTransgressions).toHaveBeenCalledWith('search');
  });

  test('shows loading spinner when fetching', () => {
    renderWithOverride(true);
    expect(screen.getByTestId('DialogListLoadSpinner')).toBeInTheDocument();
    expect(screen.queryByTestId('transgressions-list-table')).not.toBeInTheDocument();
  });

  test('calls onTransgressionClick when a row is clicked', () => {
    renderWithOverride();
    fireEvent.click(screen.getByTestId('transgressions-list-table'));
    expect(mockHandleTransgressionClick).toHaveBeenCalledWith('row1');
  });

  test('passes correct props to TransgressionsListTable', () => {
    renderWithOverride();
    const table = screen.getByTestId('transgressions-list-table');
    expect(table.getAttribute('data-rows')).toContain('123');
    expect(table.getAttribute('data-type')).toBe(TransgressionType.OVERLOAD);
  });

  test('renders translated title', () => {
    renderWithOverride();
    expect(screen.getByText('overloadTransgressionList')).toBeInTheDocument();
  });
});
