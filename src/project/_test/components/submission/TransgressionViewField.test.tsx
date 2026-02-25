import { render, screen } from "@testing-library/react";
import TransgressionViewField from "../../../components/submission/TransgressionViewField";
import userEvent from "@testing-library/user-event";

// Mock the custom TmTextField
vi.mock("../../../../framework/components/textfield/TmTextField", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ testid, label, value, readonly, disabled }: any) => (
        <div data-testid={testid}>
            <span>{label}</span>
            <span>{value}</span>
            <span>{readonly ? "readonly" : "editable"}</span>
            <span>{disabled ? "disabled" : "enabled"}</span>
        </div>
    ),
}));

describe("TransgressionViewField", () => {
    it("renders with required props and defaults", () => {
        render(
            <TransgressionViewField
                testId="test-field"
                label="Offense"
                value="Speeding"
            />
        );

        const field = screen.getByTestId("test-field");
        expect(field).toBeInTheDocument();
        expect(field).toHaveTextContent("Offense");
        expect(field).toHaveTextContent("Speeding");
        expect(field).toHaveTextContent("readonly");
        expect(field).toHaveTextContent("disabled");
    });

    it("respects provided optional props", () => {
        render(
            <TransgressionViewField
                testId="test-field"
                label="Fine"
                value={500}
                readonly={false}
                disabled={false}
            />
        );

        const field = screen.getByTestId("test-field");
        expect(field).toBeInTheDocument();
        expect(field).toHaveTextContent("editable");
        expect(field).toHaveTextContent("enabled");
    });

    it("shows tooltip on hover with correct value", async () => {
        const value = "Parked in a no-parking zone";
        render(
            <TransgressionViewField
                testId="tooltip-test"
                label="Violation"
                value={value}
            />
        );

        const wrapper = screen.getByTestId("tooltip-test");
        await userEvent.hover(wrapper);

        const tooltip = await screen.findByText(value);
        expect(tooltip).toBeInTheDocument();
    });
});
