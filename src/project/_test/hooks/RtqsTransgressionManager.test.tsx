import { renderHook } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import useRtqsTransgressionManager from '../../hooks/prosecution/RtqsTransgressionManager';
import { RtqsTransgression, SnapshotRtqsCharge, Money, TransgressionConfiguration, Route } from '../../redux/api/transgressionsApi';
import { act } from 'react';

const mockHandleCancelNavigation = vi.fn();
const mockNavigate = vi.fn();

const mockMoney: Money = {
    currency: 'ZAR',
    amount: 500
};

const mockTransgressionConfiguration: TransgressionConfiguration = {
    legislationType: 'CPA',
    country: 'ZA',
    vehicleMake: false,
    vehicleModel: false,
    tripsDepotIdentifier: false,
    operatorName: false,
    operatorDiscNumber: false,
    emailAddress: false,
    contactNumber: false,
    contactNumberType: false,
    licenceCode: false,
    licenceNumber: false,
    prDPCode: false,
    prDPNumber: false,
    idCountryOfIssue: false,
    residentialAddressLine1: false,
    residentialAddressLine2: false,
    residentialCity: false,
    residentialCountry: false,
    residentialPostalCode: false,
    businessAddressLine1: false,
    businessAddressLine2: false,
    businessCity: false,
    businessCountry: false,
    businessPostalCode: false,
    occupation: false,
    depotName: false,
    colour: false,
    origin: false,
    destination: false,
    cargo: false,
    driverName: false,
    driverSurname: false,
    identificationType: false,
    identificationNumber: false,
    dateOfBirth: false,
    gender: false,
    trn: false,
    licenceCountryOfIssue: false,
    vehicleType: false,
    steeringAxleUnderloadRangeType: 'PERCENTAGE',
    displayOptionalFields: false
};

const mockSnapshotRtqsCharge: SnapshotRtqsCharge = {
    type: 'SnapshotRtqsCharge',
    chargeId: 'charge-123',
    snapshotId: 'snapshot-123',
    chargeCode: '12345',
    chargeTitle: 'Test RTQS Charge',
    chargeShortDescription: 'Test charge description',
    chargeLongDescription: 'Test long charge description',
    chargeRegulation: 'Reg 123',
    specificRegulation: 'Specific Reg 123',
    severity: 'Medium',
    demeritPoints: 3,
    fineAmount: mockMoney,
    plateNumber: 'T0001',
    alternativeCharge: false,
    mainChargeCode: '12345'
};

const mockRtqsTransgression: RtqsTransgression = {
    type: 'RtqsTransgression',
    status: 'CREATED',
    transgressionDate: '2025-03-07T10:00:00',
    transgressionLocation: 'Test Location',
    transgressionVersion: 1,
    authorityCode: 'W001',
    noticeNumber: {
        dateCreated: '2025-03-07',
        number: '1234567890',
        sequentialNumber: 1,
        authorityCode: 'W001',
        amount: mockMoney
    },
    vehicle: {
        plateNumber: 'T0001',
        vehicleType: 'Truck',
        vehicleMake: 'Test Make',
        vehicleModel: 'Test Model',
        vehicleCategory: 'Heavy',
        vehicleUsage: 'Goods'
    },
    snapshotCharges: [mockSnapshotRtqsCharge],
    totalAmountPayable: mockMoney,
    officerId: 'officer-123',
    officerName: 'Test',
    officerSurname: 'Officer'
};

const mockRoute = {
    cargo: 'Test cargo',
    destinationOfCargo: 'Test destination',
    originOfCargo: 'Test origin'
};

const mockTransgressionDetails = {
    ...mockRtqsTransgression,
    transgressionStatus: "CREATED",
    transgressionConfiguration: mockTransgressionConfiguration
};

const mockLocation = {
    state: {
        overloadTransgression: mockRtqsTransgression,
        transgressionDetails: mockTransgressionDetails,
        newTransgression: false
    },
    pathname: '/test-path'
};

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => ({ sequenceNumber: '1' })
}));

vi.mock('../../../framework/auth/authService.ts', () => ({
    default: { getUserName: vi.fn().mockReturnValue('Test User') }
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

const mockRetrieveRtqsInformation = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({
        transgressionConfiguration: mockTransgressionConfiguration,
        charges: [mockSnapshotRtqsCharge],
        allowArrestCase: true,
        arrestCaseFineAmount: mockMoney
    })
}));

vi.mock('../../redux/api/transgressionsApi', () => {
    const originalModule = vi.importActual('../../redux/api/transgressionsApi');
    return {
        ...originalModule,
        useRetrieveRtqsTransgressionInformationMutation: vi.fn(() => [
            mockRetrieveRtqsInformation,
            { isLoading: false }
        ]),
        useGenerateRtqsTransgressionMutation: vi.fn(() => [vi.fn(() => (
            { unwrap: vi.fn().mockResolvedValue({ noticeNumber: '123' }) }
        )), { isLoading: false }]),
        useUpdateRtqsTransgressionInformationMutation: vi.fn(() => [vi.fn().mockResolvedValue(mockRtqsTransgression), { isLoading: false }])
    };
});

interface TestRoute extends Route {
    cargo: string;
    destinationOfCargo: string;
    originOfCargo: string;
}
interface TestRtqsTransgression extends RtqsTransgression { route: TestRoute }

const rtqsTransgression: TestRtqsTransgression = { ...mockRtqsTransgression, route: mockRoute };
vi.mock('../../../framework/redux/hooks', () => ({
    useAppDispatch: () => vi.fn(),
    useAppSelector: vi.fn(() => ({ formData: { ...rtqsTransgression, charges: rtqsTransgression.snapshotCharges, vehicleConfiguration: { vehicles: rtqsTransgression.vehicle } }, validationErrors: false }))
}));

vi.mock('../../redux/api/coreApi', () => ({
    useGetLoggedInUserQuery: vi.fn(() => ({ data: { username: 'Test User' } })),
    useFindAllIdentityTypesQuery: vi.fn(() => ({ data: [{ description: 'ID Type' }] }))
}));

vi.mock('../../utils/LookupTranslator', () => {
    return {
        default: vi.fn(() => [vi.fn(), {}, {}, {}, {}])
    }
});

vi.mock('../../utils/TransgressionHelpers', () => ({
    getFormattedOfficerName: vi.fn(() => 'Officer Name'),
    getPlateNumber: vi.fn(() => 'ABC123'),
    getIdTypeValue: vi.fn(() => 'ID123'),
    buildTransgressionDto: vi.fn(() => ({})),
    updateTransgression: vi.fn(() => Promise.resolve(mockRtqsTransgression)),
    handleCancelNavigation: vi.fn(() => {
        mockHandleCancelNavigation();
    }),
    vehicleDetailsChanged: vi.fn(),
    operatorDetailsChanged: vi.fn(),
    driverDetailsChanged: vi.fn(),
    residentialAddressDetailsChanged: vi.fn(),
    businessAddressDetailsChanged: vi.fn(),
    chargeDetailsChanged: vi.fn(),
    cleanObject: vi.fn(),
}));

describe('useRtqsTransgressionManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('initializes with default values', () => {
        const { result } = renderHook(() => useRtqsTransgressionManager());
        expect(result.current).toBeDefined();
        expect(result.current.isEditable).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.transgressionStatus).toBe('Unknown');
    });

    test('onEdit sets isEditable to true', () => {
        const { result } = renderHook(() => useRtqsTransgressionManager());
        act(() => {
            result.current.onEdit();
        });
        expect(result.current.isEditable).toBe(true);
    });

    test('onDisableEdit sets isEditable to false', () => {
        const { result } = renderHook(() => useRtqsTransgressionManager());
        act(() => {
            result.current.setIsEditable(true);
        })
        act(() => {
            result.current.onDisableEdit();
        });
        expect(result.current.isOnEditable()).toBe(false);
    });

    test('onUpdateRtqsTransgression updates details and disables edit', async () => {
        const { result } = renderHook(() => useRtqsTransgressionManager());
        await act(async () => {
            await result.current.onUpdateRtqsTransgression();
        });
        expect(result.current.isEditable).toBe(false);
    });

    test('onGenerateRtqsTransgression calls generate and navigates', async () => {
        const { result } = renderHook(() => useRtqsTransgressionManager());
        await act(async () => {
            await result.current.onGenerateRtqsTransgression();
        });
        expect(mockNavigate).toHaveBeenCalled();
    });

    test('onCancel calls handleCancelNavigation', () => {
        const { result } = renderHook(() => useRtqsTransgressionManager());
        act(() => {
            result.current.onCancel();
        });

        expect(mockHandleCancelNavigation).toHaveBeenCalled();
    });
});
