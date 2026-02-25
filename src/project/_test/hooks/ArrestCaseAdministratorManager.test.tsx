import { renderHook } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import useArrestCaseAdministratorManager from '../../hooks/prosecution/ArrestCaseAdministratorManager';
import { ROUTE_NAMES } from '../../Routing';
import { RetrieveTransgressionInformationResponse } from '../../redux/api/transgressionsApi';
import { act } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../framework/redux/store';
import { ArrestCaseAdministratorContext } from '../../pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorContext';
import { UpdateControlCentreVisitStatusResponse } from '../../redux/api/weighApi';

const mockUpdateControlCentreVisitStatusResponse: UpdateControlCentreVisitStatusResponse = {
  controlCentreVisit: {
    id: 1,
    sequenceNumber: 12345,
    weighbridgeId: 'WB001',
    arrivalDate: '2025-03-07T10:00:00',
    vehicleStatus: 'PreCapture'
  }
};

const mockRetrieveTransgressionInfo: RetrieveTransgressionInformationResponse = {
  transgressionDate: '2025-03-07T10:00:00',
  captureDate: '2025-03-07T10:00:00',
  arrestCase: false,
  charges: [],
  transgressionConfiguration: {
    legislationType: 'CPA',
    country: '',
    vehicleMake: true,
    vehicleModel: true,
    tripsDepotIdentifier: true,
    operatorName: true,
    operatorDiscNumber: true,
    emailAddress: true,
    contactNumber: true,
    contactNumberType: true,
    licenceCode: true,
    licenceNumber: true,
    prDPCode: true,
    prDPNumber: true,
    idCountryOfIssue: true,
    residentialAddressLine1: true,
    residentialAddressLine2: true,
    residentialCity: true,
    residentialCountry: true,
    residentialPostalCode: true,
    businessAddressLine1: true,
    businessAddressLine2: true,
    businessCity: true,
    businessCountry: true,
    businessPostalCode: true,
    occupation: true,
    depotName: true,
    colour: true,
    origin: true,
    destination: true,
    driverName: true,
    driverSurname: true,
    identificationType: true,
    identificationNumber: true,
    dateOfBirth: true,
    gender: true,
    trn: true,
    licenceCountryOfIssue: true,
    cargo: true,
    vehicleType: true,
    steeringAxleUnderloadRangeType: 'PERCENTAGE',
    displayOptionalFields: true
  },
  userAccount: {
    username: 'testuser',
    firstName: 'Test',
    userAccountId: 'user-123',
    isActive: false,
    surname: 'User'
  },
  vehicleCharges: []
};

const mockNavigate = vi.fn();
const mockUpdateCCVStatus = vi.fn().mockResolvedValue({
  data: mockUpdateControlCentreVisitStatusResponse,
  error: undefined
});
const mockOnSupervisorAuthorization = vi.fn();
const mockConfig = {
  tenancy: { tenant: 'TENANT' },
  subsystem: { apps: { weigh: 'http://weigh-url' } }
};

const mockData = mockRetrieveTransgressionInfo;

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  isRouteErrorResponse: () => false,
  useRouteError: () => ({ message: 'Error' }),
  useParams: () => ({ sequenceNumber: '42' }),
  Form: () => <form></form>,
  useLocation: vi.fn(),
  useNavigationType: vi.fn()
}));

vi.mock("sockjs-client", () => ({ default: vi.fn() }));
vi.mock("@stomp/stompjs", () => ({ Client: vi.fn() }));
vi.mock("../../pages/aarto/notice-management/NoticeManagementPage", () => ({ default: () => null }));

vi.mock('../../hooks/SupervisorAuthorizationManager', () => ({
  default: () => ({
    onSupervisorAuthorization: mockOnSupervisorAuthorization,
    isError: false
  })
}));

vi.mock('../../../framework/config/ConfigContext', () => ({
  ConfigContext: {
    _currentValue: {
      tenancy: { tenant: 'TENANT' },
      weighbridge: { id: 'WEIGHBRIDGE' }
    }
  },
  initialConfigContextState: {
    tenancy: { tenant: 'loading' },
    weighbridge: { id: 'loading' }
  }
}));

vi.mock('../../../framework/redux/hooks', () => ({
  useAppSelector: () => ({ config: mockConfig }),
  useAppDispatch: () => vi.fn(),
  useAppSelectorShallow: vi.fn(),
  useConfig: () => vi.fn()
}));

vi.mock('../../redux/api/weighApi', () => {
  const originalModule = vi.importActual('../../redux/api/weighApi');

  return {
    ...originalModule,
    weighApi: {
      reducerPath: 'weighApi',
      reducer: vi.fn().mockReturnValue({}),
      middleware: vi.fn()
    },
    useUpdateVehicleWeighDetailsMutation: vi.fn(),
    useUpdateControlCentreVisitStatusMutation: vi.fn(() => ([
      mockUpdateCCVStatus,
      {
        isLoading: false,
        isError: false,
        isSuccess: true
      }
    ]))
  }
});

vi.mock('../../../framework/redux/store', () => ({
  store: {
    getState: vi.fn(),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
    replaceReducer: vi.fn(),
  }
}));

vi.mock('../../pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorContext', () => ({
  ArrestCaseAdministratorContext: {
    _currentValue: {
      incorrectVehicleConfig: false
    }
  }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);


describe('useArrestCaseAdministratorManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockUpdateCCVStatus.mockReset();
    mockOnSupervisorAuthorization.mockReset();
    mockNavigate.mockReset();
  });

  test('initializes with default values', () => {
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    expect(result.current.showAuthorizationDialog).toBe(false);
    expect(result.current.supervisorUsername).toBe('');
    expect(result.current.supervisorPassword).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.showReweighDialog).toBe(false);
    expect(result.current.showAuthErrorDialog).toBe(false);
    expect(result.current.notApproved).toBe(false);
  });

  test('submitCorrectionReason navigates to capture transgression if not incorrectVehicleConfig', () => {
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.submitCorrectionReason();
    });
    expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTE_NAMES.captureTransgressionsRoute}/42`, expect.objectContaining({ state: expect.any(Object) }));
  });

  test('submitCorrectionReason shows authorization dialog if incorrectVehicleConfig', () => {
    // eslint-disable-next-line
    vi.mocked(ArrestCaseAdministratorContext as any)._currentValue = {
      incorrectVehicleConfig: true
    };

    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.submitCorrectionReason();
    });
    expect(result.current.showAuthorizationDialog).toBe(true);
  });

  test('closeDialogs resets dialog and supervisor state', () => {
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.setSupervisorUsername('user');
      result.current.setSupervisorPassword('pass');
      result.current.closeDialogs();
    });
    expect(result.current.showAuthorizationDialog).toBe(false);
    expect(result.current.showReweighDialog).toBe(false);
    expect(result.current.showAuthErrorDialog).toBe(false);
    expect(result.current.supervisorUsername).toBe('');
    expect(result.current.supervisorPassword).toBe('');
  });

  test('handleCorrectionPending triggers supervisor authorization passes and shows reweigh dialog', async () => {
    mockUpdateCCVStatus.mockResolvedValue({
      data: mockUpdateControlCentreVisitStatusResponse,
      error: undefined
    });
    mockOnSupervisorAuthorization.mockResolvedValue(true);
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.setSupervisorUsername('user');
      result.current.setSupervisorPassword('pass');
    });
    await act(async () => {
      result.current.handleCorrectionPending();
    });
    expect(mockOnSupervisorAuthorization).toHaveBeenCalledWith('user', 'pass', expect.any(String), expect.any(String));
    expect(mockUpdateCCVStatus).toHaveBeenCalled();
    expect(result.current.showReweighDialog).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  test('handleCorrectionPending triggers supervisor authorization fails and closes all dialogs', async () => {
    mockUpdateCCVStatus.mockResolvedValue({
      data: {},
      error: true
    });
    mockOnSupervisorAuthorization.mockResolvedValue(true);
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.setSupervisorUsername('user');
      result.current.setSupervisorPassword('pass');
    });
    await act(async () => {
      result.current.handleCorrectionPending();
    });
    expect(mockOnSupervisorAuthorization).toHaveBeenCalledWith('user', 'pass', expect.any(String), expect.any(String));
    expect(mockUpdateCCVStatus).toHaveBeenCalled();
    expect(result.current.showAuthErrorDialog).toBe(false);
    expect(result.current.showReweighDialog).toBe(false);
    expect(result.current.showAuthErrorDialog).toBe(false);
    expect(result.current.supervisorUsername).toBe('');
    expect(result.current.supervisorPassword).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  test('handleSupervisorAuthorization sets notApproved if authorization fails', async () => {
    mockOnSupervisorAuthorization.mockResolvedValue(false);
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.setSupervisorUsername('user');
      result.current.setSupervisorPassword('pass');
    });
    await act(async () => {
      await result.current.handleCorrectionPending();
    });
    expect(result.current.notApproved).toBe(true);
  });

  test('updateControlCentreVisitStatus sets showReweighDialog on success', async () => {
    mockOnSupervisorAuthorization.mockResolvedValue(true);
    mockUpdateCCVStatus.mockResolvedValue({ error: undefined });
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.setSupervisorUsername('user');
      result.current.setSupervisorPassword('pass');
    });
    await act(async () => {
      await result.current.handleCorrectionPending();
    });

    expect(result.current.showReweighDialog).toBe(true);
  });

  test('updateControlCentreVisitStatus closes dialogs on error', async () => {
    mockOnSupervisorAuthorization.mockResolvedValue(false);
    mockUpdateCCVStatus.mockResolvedValue({ error: { message: 'fail' } });
    const { result } = renderHook(() => useArrestCaseAdministratorManager(mockData, '42'), { wrapper });
    act(() => {
      result.current.setSupervisorUsername('user');
      result.current.setSupervisorPassword('pass');
    });
    await act(async () => {
      await result.current.handleCorrectionPending();
    });
    expect(result.current.showAuthorizationDialog).toBe(false);
    expect(result.current.showReweighDialog).toBe(false);
    expect(result.current.showAuthErrorDialog).toBe(false);
  });
});
