import AdjudicationOutcome from "../../components/adjudication/AdjudicationOutcome";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TSubmissionOutcomeDto } from "../../pages/adjudication/AdjudicateSubmissionContextProvider";
import { ThemeProvider, createTheme } from "@mui/material";
import { vi } from 'vitest';
import { SnapshotRtqsCharge } from "../../redux/api/transgressionsApi";


vi.mock("i18next", () => ({
    t: (key: string) => key.replace(/_/g, " "),
}));


vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

const theme = createTheme();

const altCharge: SnapshotRtqsCharge = {
    type: "SnapshotRtqsCharge",
    chargeId: "CHARGE2",
    snapshotId: "SNAPSHOT2",
    chargeCode: "CODE2",
    chargeShortDescription: "Alternative Charge Description",
    plateNumber: "CA654321",
    fineAmount: { amount: 200, currency: "ZAR" },
    discountAmount: { amount: 20, currency: "ZAR" },
    alternativeCharge: true,
    mainChargeCode: "CODE1",

}

const outcome: TSubmissionOutcomeDto = {
    submissionResult: "DISCOUNTED",
    snapshotCharge: {
        type: "SnapshotLoadCharge",
        chargeId: "CHARGE1",
        snapshotId: "SNAPSHOT1",
        chargeCode: "CODE1",
        chargeShortDescription: "Driving Axle Weigh Test",
        plateNumber: "CA123456",
        fineAmount: { amount: 100, currency: "ZAR" },
        discountAmount: { amount: 10, currency: "ZAR" }
    }
};
const mockOutcome = vi.fn().mockReturnValue(outcome);
const mockAlternativeCharge = vi.fn().mockReturnValue(altCharge);

const renderComponent = (props = {}) => {
    return render(
        <ThemeProvider theme={theme}>
            <AdjudicationOutcome
                index={0}
                outcome={mockOutcome()}
                readonly={false}
                alternativeCharge={mockAlternativeCharge()}
                {...props}
            />
        </ThemeProvider>
    );
};

describe("AdjudicationOutcome", () => {

    test('should render the component', () => {
        renderComponent();
        expect(screen.getByTestId('chargeNumber')).toBeInTheDocument();
        expect(screen.getByTestId('chargeDescription')).toBeInTheDocument();
        expect(screen.getByTestId('fineAmount')).toBeInTheDocument();
    });

    test("should render discount amount when captureResult is DISCOUNTED", async () => {
        const discountedOutcome: TSubmissionOutcomeDto = outcome;
        discountedOutcome.submissionResult = "DISCOUNTED";
        vi.mocked(mockOutcome).mockReturnValue(discountedOutcome);

        renderComponent();

        // Retrieve the captureResult select
        const captureResultSelect = screen.getByRole("combobox");

        // Open the dropdown
        await fireEvent.mouseDown(captureResultSelect);

        // Wait for options to appear
        await waitFor(() => screen.getByRole("option", { name: /DISCOUNTED/i }));

        // Click the desired option
        const discountedOption = screen.getByRole("option", { name: /DISCOUNTED/i });
        fireEvent.click(discountedOption); // Selects the option

        // Wait for discountAmount field to appear
        const discountInput = await screen.findByTestId("discount");
        expect(discountInput).toBeInTheDocument();
    });

    test("should render discount alternative charge when captureResult is ALTERNATIVE_CHARGE", async () => {
        const alternativeChargeOutcome: TSubmissionOutcomeDto = outcome;
        alternativeChargeOutcome.submissionResult = "ALTERNATIVE_CHARGE";
        alternativeChargeOutcome.snapshotCharge = {type: "SnapshotRtqsCharge", ...outcome.snapshotCharge} as SnapshotRtqsCharge;
        vi.mocked(mockOutcome).mockReturnValue(alternativeChargeOutcome);

        renderComponent();

        // Retrieve the captureResult select
        const captureResultSelect = screen.getByRole("combobox");

        // Open the dropdown
        await fireEvent.mouseDown(captureResultSelect);

        // Wait for options to appear
        await waitFor(() => screen.getByRole("option", { name: /ALTERNATIVE CHARGE/i }));

        // Click the desired option
        const discountedOption = screen.getByRole("option", { name: /ALTERNATIVE CHARGE/i });
        fireEvent.click(discountedOption); // Selects the option

        // Wait for discountAmount field to appear
        const discountInput = await screen.findByTestId("altCharge");
        expect(discountInput).toBeInTheDocument();
    });
});
