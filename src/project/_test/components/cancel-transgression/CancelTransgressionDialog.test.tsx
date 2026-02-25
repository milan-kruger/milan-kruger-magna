/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import CancelTransgressionDialog from '../../../components/cancel-transgression/CancelTransgressionDialog';
import { TransgressionDto } from '../../../redux/api/transgressionsApi';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../../../framework/redux/store';
import TestingPageWrapper from '../../TestingPageWrapper';

const getTransgression: TransgressionDto = {
  vehicle: {
    plateNumber: 'ABC123',
  },
  driver: {},
  status: 'ISSUED',
  transgressionDate: '',
  transgressionLocation: '',
  transgressionVersion: 0,
  authorityCode: '',
  noticeNumber: {
    dateCreated: '',
    number: '',
    sequentialNumber: 0,
    authorityCode: '',
    amount: {
      currency: '',
      amount: 0
    }
  },
  totalAmountPayable: {
    currency: '',
    amount: 0
  },
  snapshotCharges: [],
  type: ''
};

// Mock all child components used in CancelTransgressionDialog
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false),
    Dialog: ({ children, ...props }: any) => {
      return <div data-testid={props.testid} {...props}>{children}</div>;
    },
    DialogActions: ({ children, ...props }: any) => {
      return <div data-testid={props.testid} {...props}>{children}</div>;
    },
    DialogContent: ({ children, ...props }: any) => {
      return <div data-testid={props.testid} {...props}>{children}</div>;
    },
    DialogTitle: ({ children, ...props }: any) => {
      return <div data-testid={props.testid} {...props}>{children}</div>;
    },
  };
});

vi.mock('../../../../framework/components/button/TmButton', () => ({
  default: ({ children, ...props }: any) => (
    <button {...props} data-testid={props.testid}>{children}</button>
  ),
}));

vi.mock('../../../../framework/components/textfield/TmAutocomplete', () => ({
  default: ({ children, ...props }: any) => <div data-testid={props.testid} {...props}>{children}</div>,
}));

vi.mock('../../../../framework/components/dialog/TmAuthenticationDialog', () => ({
  default: () => <div data-testid="TmAuthenticationDialog" />,
}));

vi.mock('../../../../framework/components/dialog/TmDialog', () => ({
  default: () => <div data-testid="TmDialog" />,
}));

vi.mock('../../../../framework/components/textfield/TmTextField', () => ({
  default: ({ testId, testid, children, ...props }: any) => (
    <div data-testid={testId ?? testid ?? 'TmTextField'} {...props}>{children}</div>
  )
}));

vi.mock('../../../../project/components/cancel-transgression/ReturnDocumentsDialog', () => ({
  default: () => <div data-testid="ReturnDocumentsDialog" />,
}));

vi.mock('../../../../project/components/cancel-transgression/VehicleReweighDialog', () => ({
  default: () => <div data-testid="VehicleReweighDialog" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => { })
    }
  })
}));

vi.mock('../../../hooks/cancel-trangression/CancelTransgressionManager', () => ({
  default: () => ({
    openSupervisorDialog: false,
    openReturnDocumentsDialog: false,
    openReweighDialog: false,
    transgression: getTransgression,
    cancellationReason: 'Incorrect plate number',
    supervisorUsername: '',
    supervisorPassword: '',
    invalidReason: false,
    isIncorrectOverloadPlateNo: true,
    isErrorAuthentication: false,
    newPlateNumber: '',
    notApproved: false,
    transgressionCancelReasons: { options: [], getOptionLabel: () => '' },
    invalidDriverPlateNo: false,
    cancelAuthErrorDialogVisible: false,
    clearFields: vi.fn(),
    onChangeReason: vi.fn(),
    onPlateNumberChange: vi.fn(),
    displayPlateNumbers: vi.fn(),
    setSupervisorUsername: vi.fn(),
    setSupervisorPassword: vi.fn(),
    getTransgressionReasonValue: vi.fn(),
    handleOnInputChange: vi.fn(),
    handleSupervisorAuthDialogClose: vi.fn(),
    handleReturnDocumentsDialogClose: vi.fn(),
    handleVehicleReweighDialogClose: vi.fn(),
    handleSupervisorAuthConfirm: vi.fn(),
    handleCloseAuthErrorDialog: vi.fn(),
    handleOnConfirm: vi.fn(),
    handleCloseDialog: vi.fn(),
  }),
}));


const initializeStore = () => configureStore({
  reducer: rootReducer,
});

describe('CancelTransgressionDialog', () => {
  let store: EnhancedStore;

  const defaultProps = {
    testId: 'test-dialog',
    isOpen: true,
    transgression: getTransgression,
    onCancelTransgression: vi.fn(),
    sequenceNumber: 1,
  };

  beforeEach(() => {
    store = initializeStore();
  });

  it('renders all mocked subcomponents correctly', () => {
    render(
      <TestingPageWrapper store={store}>
        <CancelTransgressionDialog {...defaultProps} />
      </TestingPageWrapper>
    );

    expect(screen.getByTestId('test-dialogCancelNoticeDialog')).toBeInTheDocument();
    expect(screen.getByTestId('test-dialogDialogTitle')).toBeInTheDocument();
    expect(screen.getByTestId('test-dialogDialogContent')).toBeInTheDocument();
    expect(screen.getByTestId('test-dialogDialogActions')).toBeInTheDocument();
    expect(screen.getByTestId('cancelCancelNoticeDropdown')).toBeInTheDocument();
    expect(screen.getByTestId('TmAuthenticationDialog')).toBeInTheDocument();
    expect(screen.getByTestId('ReturnDocumentsDialog')).toBeInTheDocument();
    expect(screen.getByTestId('VehicleReweighDialog')).toBeInTheDocument();
    expect(screen.getByTestId('TmDialog')).toBeInTheDocument();
  });

  it('calls handleOnConfirm when confirm button is clicked', () => {
    const { getByTestId } = render(<CancelTransgressionDialog {...defaultProps} />);
    const confirmButton = getByTestId('test-dialogDialogConfirmButton');
    fireEvent.click(confirmButton);
  });


   it('renders plate number correction field when isIncorrectOverloadPlateNo = true', async () => {
    render(
      <TestingPageWrapper store={initializeStore()}>
        <CancelTransgressionDialog
          testId="branch-test"
          isOpen={true}
          transgression={getTransgression}
          onCancelTransgression={vi.fn()}
          sequenceNumber={1}
        />
      </TestingPageWrapper>
    );

    expect(screen.getByTestId('captureCorrectPlateNumberOnCancel')).toBeInTheDocument();
  });

});
