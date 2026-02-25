import { renderHook } from '@testing-library/react';
import useChargeProvider from '../../hooks/chargebook/ChargeProvider';
import { LoadCharge, RtqsCharge } from '../../redux/api/transgressionsApi';

// Mock the useProvideSnapshotChargeMutation hook
const mockProvideSnapshotChargeMutation = vi.fn();
const mockUnwrap = vi.fn();

vi.mock('../../redux/api/transgressionsApi', async () => {
    const actual = await vi.importActual("../../redux/api/transgressionsApi");

    return {
        ...actual,
        useProvideSnapshotChargeMutation: () => [
            mockProvideSnapshotChargeMutation,
            { isLoading: false }
        ],
        JsonObjectType: {
            LoadCharge: 'LoadCharge',
            LoadChargeDto: 'LoadChargeDto',
            RtqsCharge: 'RtqsCharge',
            RtqsChargeDto: 'RtqsChargeDto'
        }
    };
});

describe('useChargeProvider', () => {
    beforeEach(() => {
        mockProvideSnapshotChargeMutation.mockReset();
        mockUnwrap.mockReset();
    });

    test('should return provideSnapshotCharge and isLoading', () => {
        const { result } = renderHook(() => useChargeProvider());
        expect(typeof result.current.provideSnapshotCharge).toBe('function');
        expect(result.current.isLoading).toBe(false);
    });

    test('should call provideSnapshotChargeMutation with correct params and resolve', async () => {
        const fakeResponse = {
            snapshotCharge: {
                mainCharge: { type: 'LoadChargeDto' },
                alternativeCharge: null
            }
        };
        mockProvideSnapshotChargeMutation.mockReturnValue({
            unwrap: () => Promise.resolve(fakeResponse)
        });

        const { result } = renderHook(() => useChargeProvider());

        const mainCharge = { type: 'LoadCharge', chargeId: '1' } as LoadCharge;
        const arrestCaseFineAmount = { amount: 100, currency: 'ZAR' };
        await expect(
            result.current.provideSnapshotCharge(
                arrestCaseFineAmount,
                true,
                false,
                'ABC123',
                mainCharge
            )
        ).resolves.toEqual({
            mainCharge: { type: 'LoadChargeDto' },
            alternativeCharge: false
        });

        expect(mockProvideSnapshotChargeMutation).toHaveBeenCalledWith({
            provideSnapshotChargeRequest: expect.objectContaining({
                allowArrestCase: true,
                alternativeChargeSelected: false,
                arrestCaseFineAmount,
                plateNumber: 'ABC123',
                mainCharge: expect.objectContaining({ type: 'LoadChargeDto' }),
                alternativeCharge: undefined
            })
        });
    });

    test('should handle alternativeCharge and mainCharge of type RtqsCharge', async () => {
        const fakeResponse = {
            snapshotCharge: {
                mainCharge: { type: 'RtqsChargeDto' },
                alternativeCharge: { type: 'RtqsChargeDto' }
            }
        };
        mockProvideSnapshotChargeMutation.mockReturnValue({
            unwrap: () => Promise.resolve(fakeResponse)
        });

        const { result } = renderHook(() => useChargeProvider());

        const mainCharge = { type: 'RtqsCharge', chargeId: '2' } as RtqsCharge;
        const alternativeCharge = { type: 'RtqsCharge', chargeId: '3' } as RtqsCharge;
        const arrestCaseFineAmount = { amount: 200, currency: 'ZAR' };

        await expect(
            result.current.provideSnapshotCharge(
                arrestCaseFineAmount,
                false,
                true,
                'XYZ789',
                mainCharge,
                0,
                0,
                0,
                alternativeCharge
            )
        ).resolves.toEqual({
            mainCharge: { type: 'RtqsChargeDto' },
            alternativeCharge: { type: 'RtqsChargeDto' }
        });
    });

    test('should reject if provideSnapshotChargeMutation fails', async () => {
        mockProvideSnapshotChargeMutation.mockReturnValue({
            unwrap: () => Promise.reject(new Error('Failed'))
        });

        const { result } = renderHook(() => useChargeProvider());

        await expect(
            result.current.provideSnapshotCharge(
                { amount: 0, currency: 'ZAR' },
                false,
                false,
                '',
                undefined
            )
        ).rejects.toThrow('Failed');
    });
});
