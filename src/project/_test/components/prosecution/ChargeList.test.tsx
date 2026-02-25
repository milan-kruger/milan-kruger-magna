import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import TmChargeList from "../../../components/prosecution/ChargeList";
import { SnapshotCharge, SnapshotRtqsCharge, VehicleChargeDto } from "../../../redux/api/transgressionsApi";
import { JsonObjectType } from "../../../enum/JsonObjectType";

vi.mock("i18next", () => ({
    t: (key: string) => {
        const translations: Record<string, string> = {
            'charge': 'Charge',
            'altCharge': 'Alternative Charge',
            'amountPayable': 'Amount Payable'
        };
        return translations[key] || key;
    }
}));

vi.mock("@mui/material", async () => {
    const original = await vi.importActual("@mui/material");
    return {
        ...original,
        useMediaQuery: vi.fn(() => false)
    };
});

vi.mock("react-number-format", () => ({
    NumericFormat: ({ value }: { value?: number }) => (
        <span>{value?.toString() || ''}</span>
    )
}));

describe("TmChargeList", () => {
    const mockCharge: SnapshotCharge = {
        chargeId: "charge-1",
        chargeCode: "CHG001",
        chargeTitle: "Speeding Violation",
        plateNumber: "ABC 123",
        fineAmount: {
            amount: 1500,
            currency: "ZAR"
        },
        snapshotId: "",
        chargeShortDescription: "",
        type: ""
    };

    const mockRtqsCharge: SnapshotRtqsCharge = {
        chargeId: "charge-2",
        chargeCode: "RTQS001",
        chargeTitle: "RTQS Violation",
        plateNumber: "XYZ 456",
        fineAmount: {
            amount: 2500,
            currency: "ZAR"
        },
        type: JsonObjectType.SnapshotRtqsCharge,
        alternativeCharge: true,
        snapshotId: "",
        chargeShortDescription: ""
    };

    const mockVehicleCharges: VehicleChargeDto[] = [
        {
            plateNumber: "VEH 111",
            chargeCode: "CHG001"
        },
        {
            plateNumber: "VEH 222",
            chargeCode: "RTQS001"
        }
    ];

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the component", () => {
        render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge]}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByTestId("transgressionsChargeName0")).toBeInTheDocument();
    });

    it("should render multiple charges", () => {
        const charges = [mockCharge, { ...mockCharge, chargeId: "charge-2" }];
        render(
            <TmChargeList
                testid="chargeList"
                charges={charges}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByTestId("transgressionsChargeName0")).toBeInTheDocument();
        expect(screen.getByTestId("transgressionsChargeName1")).toBeInTheDocument();
        expect(screen.getByText("Charge 1:")).toBeInTheDocument();
        expect(screen.getByText("Charge 2:")).toBeInTheDocument();
    });

    it("should render charge details correctly", () => {
        render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge]}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByTestId("transgressionsChargeDescription0")).toHaveTextContent("CHG001 Speeding Violation");
        expect(screen.getByTestId("transgressionsChargeCurrency0")).toHaveTextContent("Amount Payable 1:");
        expect(screen.getByTestId("transgressionsChargeAmount0")).toHaveTextContent("ZAR");
    });

    it("should render alternative charge label for RTQS charges", () => {
        render(
            <TmChargeList
                testid="chargeList"
                charges={[mockRtqsCharge]}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByText("Alternative Charge:")).toBeInTheDocument();
    });

    it("should use plate number from charge when vehicleCharges is empty", () => {
        render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge]}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByTestId("transgressionsPlateNumber0")).toHaveTextContent("ABC 123");
    });

    it("should use plate number from vehicleCharges when provided", () => {
        render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge, mockRtqsCharge]}
                vehicleCharges={mockVehicleCharges}
            />
        );

        expect(screen.getByTestId("transgressionsPlateNumber0")).toHaveTextContent("VEH 111");
        expect(screen.getByTestId("transgressionsPlateNumber1")).toHaveTextContent("VEH 222");
    });

    it("should handle missing vehicleCharge data gracefully", () => {
        render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge, mockRtqsCharge]}
                vehicleCharges={[mockVehicleCharges[0]]}
            />
        );

        expect(screen.getByTestId("transgressionsPlateNumber0")).toHaveTextContent("VEH 111");
        expect(screen.getByTestId("transgressionsPlateNumber1")).toHaveTextContent("");
    });

    it("should handle charges with zero fineAmount", () => {
        const chargeWithZeroFine: SnapshotCharge = {
            chargeId: "charge-no-fine",
            chargeCode: "CHG001",
            chargeTitle: "Speeding Violation",
            plateNumber: "ABC 123",
            snapshotId: "",
            chargeShortDescription: "",
            type: "",
            fineAmount: {
                amount: 0,
                currency: "ZAR"
            }
        };
        render(
            <TmChargeList
                testid="chargeList"
                charges={[chargeWithZeroFine]}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByTestId("transgressionsChargeAmount0")).toBeInTheDocument();
        expect(screen.getByTestId("transgressionsChargeAmount0")).toHaveTextContent("ZAR");
    });

    it("should apply custom sx styles", () => {
        const customSx = { margin: 2, padding: 3 };
        const { container } = render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge]}
                vehicleCharges={[]}
                sx={customSx}
            />
        );

        const stackElement = container.querySelector('#chargeList');
        expect(stackElement).toBeInTheDocument();
    });

    it("should render charges in correct order with indices", () => {
        const charges = [
            { ...mockCharge, chargeCode: "CHG001" },
            { ...mockCharge, chargeId: "charge-2", chargeCode: "CHG002" },
            { ...mockCharge, chargeId: "charge-3", chargeCode: "CHG003" }
        ];

        render(
            <TmChargeList
                testid="chargeList"
                charges={charges}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByTestId("transgressionsChargeDescription0")).toHaveTextContent("CHG001");
        expect(screen.getByTestId("transgressionsChargeDescription1")).toHaveTextContent("CHG002");
        expect(screen.getByTestId("transgressionsChargeDescription2")).toHaveTextContent("CHG003");
    });

    it("should handle empty charges array", () => {
        const { container } = render(
            <TmChargeList
                testid="chargeList"
                charges={[]}
                vehicleCharges={[]}
            />
        );

        const stackElement = container.querySelector('#chargeList');
        expect(stackElement).toBeInTheDocument();
        expect(stackElement?.children.length).toBe(0);
    });

    it("should render fine amount with currency", () => {
        render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge]}
                vehicleCharges={[]}
            />
        );

        const amountElement = screen.getByTestId("transgressionsChargeAmount0");
        expect(amountElement).toHaveTextContent("ZAR");
        expect(amountElement.parentElement).toHaveTextContent("1500");
    });

    it("should handle different currency types", () => {
        const chargeWithUSD = {
            ...mockCharge,
            fineAmount: {
                amount: 100,
                currency: "USD"
            }
        };

        render(
            <TmChargeList
                testid="chargeList"
                charges={[chargeWithUSD]}
                vehicleCharges={[]}
            />
        );

        expect(screen.getByTestId("transgressionsChargeAmount0")).toHaveTextContent("USD");
    });

    it("should render responsive layout based on media query", () => {
        const { container } = render(
            <TmChargeList
                testid="chargeList"
                charges={[mockCharge]}
                vehicleCharges={[]}
            />
        );

        const gridContainers = container.querySelectorAll('[class*="MuiGrid"]');
        expect(gridContainers.length).toBeGreaterThan(0);
    });
});
