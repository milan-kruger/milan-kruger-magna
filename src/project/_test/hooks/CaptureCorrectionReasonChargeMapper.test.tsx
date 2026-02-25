import { Charge } from '../../redux/api/transgressionsApi';
import useCaptureCorrectionReasonChargeMapper from '../../hooks/prosecution/arrest-case-administrator/CaptureCorrectionReasonChargeMapper';
import { renderHook } from '@testing-library/react';

vi.mock('i18next', () => ({ t: vi.fn((key) => key) }));

const charges: Charge[] = [
    {
        chargeId: '1',
        chargeCode: 'A1',
        chargeTitle: 'Overload1',
        chargeShortDescription: '',
        fineAmount: { currency: 'ZAR', amount: 100 },
        chargebook: {
            chargebookId: 'cb1',
            chargebookType: "OVERLOAD",
            startDate: '',
            active: true,
            defaultChargebook: true,
            legislation: {
                legislationId: 'leg1',
                legislationType: "CPA",
                country: 'ZA',
                maximumAllowableCharges: 1,
                active: true,
            },
        },
        type: 'OverloadCharge',
    },
    {
        chargeId: '2',
        chargeCode: 'B2',
        chargeTitle: 'Overload2',
        chargeShortDescription: '',
        fineAmount: { currency: 'ZAR', amount: 0 },
        chargebook: {
            chargebookId: 'cb1',
            chargebookType: "OVERLOAD",
            startDate: '',
            active: true,
            defaultChargebook: true,
            legislation: {
                legislationId: 'leg1',
                legislationType: "CPA",
                country: 'ZA',
                maximumAllowableCharges: 1,
                active: true,
            },
        },
        type: 'OverloadCharge',
    },
];

const vehicleCharges = [
    {
        overloadMassPercentage: 10,
        actualMass: 2000,
        permissible: 1800,
        plateNumber: 'P1',
        chargeCode: 'C1',
    },
    {
        overloadMassPercentage: 0,
        actualMass: 1800,
        permissible: 1800,
        plateNumber: 'P2',
        chargeCode: 'C2',
    },
];

describe('useCaptureCorrectionReasonChargeMapper', () => {

    it('maps charges and vehicleCharges correctly', () => {
        const { result } = renderHook(() => useCaptureCorrectionReasonChargeMapper(charges, vehicleCharges));

        const [mapped] = result.current;

        expect(mapped).toHaveLength(2);
        expect(mapped[0]).toMatchObject({
            chargeId: '1',
            chargeCode: 'A1',
            fineAmount: 'ZAR 100',
            chargeDescription: 'Overload1',
            percentage: 10,
            actualMass: 2000,
            permissibleMass: 1800,
        });
        expect(mapped[1]).toMatchObject({
            chargeId: '2',
            chargeCode: 'B2',
            fineAmount: 'arrest',
            chargeDescription: 'Overload2',
            percentage: 0,
            actualMass: 1800,
            permissibleMass: 1800,
        });
    });

    it('returns empty array if no vehicleCharges', () => {
        const { result } = renderHook(() => useCaptureCorrectionReasonChargeMapper(charges, []));

        const [mapped] = result.current;

        expect(mapped).toHaveLength(0);
    });
});
