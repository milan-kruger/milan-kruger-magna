import { render } from "vitest-browser-react";
import TmAdjudicationOutcomes from "../../components/adjudication/AdjudicationOutcomes";
import { OverloadTransgressionDto, SubmissionDto } from "../../redux/api/transgressionsApi";
import { TSubmissionOutcomeDto } from "../../pages/adjudication/AdjudicateSubmissionContextProvider";
import { screen } from "@testing-library/react";

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
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

vi.mock('./../../components/adjudication/AdjudicationOutcome', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockSubmission: SubmissionDto = {
    noticeNumber: "notice1",
    courtDate: "2025-03-01",
    offenderName: "John Doe",
    submissionStatus: "PENDING_ADJUDICATION",
    courtName: "Cape Town Court",
    submissionDate: "2025-02-15",
    submissionDeadline: "2025-02-28",
    submissionRegistrationDate: "2025-02-15",
    transgressionDate: "2025-02-01",
    transgressionStatus: "CREATED"
};

const mockOutcomes: TSubmissionOutcomeDto[] = [
    {
        submissionResult: "DISCOUNTED",
        snapshotCharge: {
            type: "SnapshotLoadCharge",
            chargeId: "CHARGE1",
            snapshotId: "SNAPSHOT1",
            chargeCode: "CODE1",
            chargeShortDescription: "Driving Axle Weigh Test",
            plateNumber: "CA123456",
            fineAmount: {
                amount: 100,
                currency: "ZAR"
            },
            discountAmount: {
                amount: 10,
                currency: "ZAR"
            }
        }
    }
];

const mockOverloadTransgression: OverloadTransgressionDto = {
    type: "OverloadTransgressionDto",
    transgressionDate: "2025-02-01",
    transgressionLocation: "Gobabis",
    transgressionVersion: 4,
    sequenceNumber: 0,
    status: "ISSUED",
    authorityCode: "AUTH1",
    noticeNumber: {
        dateCreated: "2025-02-01",
        number: "NOTICE1",
        sequentialNumber: 0,
        authorityCode: "AUTH1",
        amount: {
            currency: "ZAR",
            amount: 100
        }
    },
    vehicle: {
        position: 1,
        vehicleType: "Box Body",
        colour: "White",
        grossVehicleMass: 1000,
        vehicleMake: "MAN",
        vehicleModel: "TGS",
        vehicleUsage: "Goods For Reward",
        vehicleCategory: "Heavy Goods Vehicle",
        plateNumber: "PLATE1",
        vehicleIdentificationNumber: "VIN1",
        cargo: "Heavy Armoured Vehicles",
        axleUnits: [],
    },
    snapshotCharges: [
        {
            type: "SnapshotLoadCharge",
            chargeId: "CHARGE1",
            snapshotId: "SNAPSHOT1",
            chargeCode: "CODE1",
            chargeCategory: "DRIVING_AXLE_WEIGH_TEST",
            chargeShortDescription: "Driving Axle Weigh Test",
            plateNumber: "CA123456",
            fineAmount: {
                amount: 100,
                currency: "ZAR"
            },
            discountAmount: {
                amount: 10,
                currency: "ZAR"
            },
            maxValue: 4000,
            minValue: 100
        }
    ],
    totalAmountPayable: {
        currency: "ZAR",
        amount: 90
    }
};


const renderComponent = (props = {}) => {
    return render(
        <TmAdjudicationOutcomes
            submission={mockSubmission}
            outcomes={mockOutcomes}
            transgression={mockOverloadTransgression}
            readonly={false}
            {...props}
        />
    );
};

describe("AdjudicationOutcomes", () => {

    test("should render the component", async () => {
        renderComponent({ readonly: false });

        const courtDate = await screen.findByTestId('courtDate');
        const captureSubmissionResults = await screen.findByTestId('captureSubmissionResults');
        const submitAdjudicationBtn = await screen.findByTestId('submitAdjudication');
        const cancelAdjudicationBtn = await screen.findByTestId('cancelAdjudication');

        expect(courtDate).toBeInTheDocument();
        expect(captureSubmissionResults).toBeInTheDocument();
        expect(submitAdjudicationBtn).toBeInTheDocument();
        expect(cancelAdjudicationBtn).toBeInTheDocument();
    });

    test("should not render the submit and cancel buttons when readonly", async () => {
        renderComponent({ readonly: true });

        const submitAdjudicationBtn = await screen.queryByTestId('submitAdjudication');
        const cancelAdjudicationBtn = await screen.queryByTestId('cancelAdjudication');

        expect(submitAdjudicationBtn).not.toBeInTheDocument();
        expect(cancelAdjudicationBtn).not.toBeInTheDocument();
    });
});
