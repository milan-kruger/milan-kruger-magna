/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RTQSTransgressionList from '../../pages/transgression-details/RTQSTransgressionListPage';
import { ROUTE_NAMES } from '../../Routing';
import useRtqsTransgressionDetailsManager from '../../hooks/transgression-details/RtqsTransgressionDetailsManger';

const mockNavigate = vi.fn();
const mockHasRole = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => { }),
    },
  })
}));

vi.mock('@mui/material', async () => {
  const original = await vi.importActual('@mui/material');
  return {
    ...original,
    useMediaQuery: vi.fn(() => {
      return false;
    }),
  };
});

vi.mock('../../../framework/auth/authService', () => ({
  __esModule: true,
  default: {
    hasRole: (role: string) => mockHasRole(role)
  }
}));

vi.mock('../../components/transgression-details/transgression-list/TransgressionListSearch', () => ({
  default: () => (
    <div data-testid="TransgressionListSearch" />
  ),
}));

vi.mock('../../components/transgression-details/transgression-list/TransgressionsListTable', () => ({
  default: () => <div data-testid="TransgressionsListTable" />,
}));

vi.mock('../../../framework/components/progress/TmLoadingSpinner', () => ({
  default: () => <div data-testid="DialogListLoadSpinner" />,
}));

vi.mock('../../../framework/components/typography/TmTypography', () => ({
  default: ({ children }: any) => <h5 data-testid="rtqsTransgressionList">{children}</h5>,
}));

vi.mock('../../../framework/components/button/TmButton', () => ({
  default: ({ children, ...props }: any) => (
    <button data-testid="createRtqsTransgressionBtn" {...props}>{children}</button>
  ),
}));

const baseMock = {
  rows: [],
  handleFindTransgressions: vi.fn(),
  handleSearchTransgressions: vi.fn(),
  handleTransgressionClick: vi.fn(),
  isLoading: false,
  onRetrieveTransgressionDetails: vi.fn()
}

vi.mock("../../hooks/transgression-details/RtqsTransgressionDetailsManger", () => ({
  __esModule: true,
  default: vi.fn(() => ({ ...baseMock })),
}));

const mockedUseRtqsTransgressionDetailsManager = vi.mocked(useRtqsTransgressionDetailsManager);

afterEach(() => {
  cleanup();
});

describe('RTQSTransgressionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading and button', () => {
    mockHasRole.mockImplementation((role: string) => role === 'RTQSTRANSGRESSION_MAINTAIN');

    render(<RTQSTransgressionList />);

    expect(screen.getByTestId('rtqsTransgressionList')).toHaveTextContent('rtqsTransgressionList');
    expect(screen.getByTestId('createRtqsTransgressionBtn')).toHaveTextContent('createRtqs');
  });

  it('renders loading spinner when isLoading is true', () => {
    mockedUseRtqsTransgressionDetailsManager.mockReturnValueOnce({
      ...baseMock,
      isLoading: true
    })

    render(<RTQSTransgressionList />);
    expect(screen.getByTestId('DialogListLoadSpinner')).toBeInTheDocument();
  });

  it('navigates on button click', () => {
    render(<RTQSTransgressionList />);
    fireEvent.click(screen.getByTestId('createRtqsTransgressionBtn'));
    expect(mockNavigate).toHaveBeenCalledWith(
      `/${ROUTE_NAMES.rtqsTransgressionCreate}`,
      expect.anything()
    );
  });

  it('renders TransgressionsListTable when not loading', () => {
    mockedUseRtqsTransgressionDetailsManager.mockReturnValueOnce({
      ...baseMock,
      isLoading: false
    })
    render(<RTQSTransgressionList />);
    expect(screen.getByTestId('TransgressionsListTable')).toBeInTheDocument();
  });

  it('navigates when ALT+C hotkey is pressed', () => {
    render(<RTQSTransgressionList />);

    fireEvent.keyDown(document, {
      key: 'c',
      code: 'KeyC',
      altKey: true,
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${ROUTE_NAMES.rtqsTransgressionCreate}`,
      expect.anything()
    );
  });
});
