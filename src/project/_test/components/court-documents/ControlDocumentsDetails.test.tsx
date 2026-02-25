import { render, screen, fireEvent } from "@testing-library/react";
import ControlDocumentDetails from "../../../components/court-documents/ControlDocumentDetails";

vi.mock("i18next", () => ({
    t: (key: string) => key,
}));

vi.mock("../../../../framework/components/textfield/TmAutocomplete", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => (
        <div
            data-testid={props.testid}
            data-error={String(props.error)} // 👈 ensure this is a string
        >
            MockAutocomplete - Value: {props.value}
            <button onClick={() => props.onChange({}, "MockSelected")}>Change</button>
        </div>
    ),
}));


vi.mock("../../../../framework/components/selection/TmCheckbox", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => (
        <input
            type="checkbox"
            data-testid={props.testid}
            checked={props.value}
            onChange={(e) => props.onChange(e, !props.value)}
        />
    ),
}));

describe("ControlDocumentDetails", () => {
    const noticeTypeList = ["TypeA", "TypeB"];
    const noticeType = "TypeA";
    const handleNoticeTypeChange = vi.fn();
    const handlePagePerOfficerChange = vi.fn();
    const noticeTypeError = vi.fn(() => false);

    const baseProps = {
        noticeTypeList: ["TypeA", "TypeB"],
        noticeType: "TypeA",
        handleNoticeTypeChange: vi.fn(),
        handlePagePerOfficerChange: vi.fn(),
    };

    it("renders the autocomplete and checkbox", () => {
        render(
            <ControlDocumentDetails
                noticeTypeList={noticeTypeList}
                noticeType={noticeType}
                handleNoticeTypeChange={handleNoticeTypeChange}
                noticeTypeError={noticeTypeError}
                pagePerOfficer={true}
                handlePagePerOfficerChange={handlePagePerOfficerChange}
            />
        );

        // Check that autocomplete and checkbox are in the document
        expect(screen.getByTestId("noticeType")).toBeInTheDocument();
        expect(screen.getByTestId("officerPerPage")).toBeInTheDocument();

        // Ensure error function is called
        expect(noticeTypeError).toHaveBeenCalled();
    });

    it("calls handleNoticeTypeChange when autocomplete changes", () => {
        render(
            <ControlDocumentDetails
                noticeTypeList={noticeTypeList}
                noticeType={noticeType}
                handleNoticeTypeChange={handleNoticeTypeChange}
                noticeTypeError={noticeTypeError}
                pagePerOfficer={false}
                handlePagePerOfficerChange={handlePagePerOfficerChange}
            />
        );

        const changeBtn = screen.getByRole("button", { name: /change/i }); // robust and case-insensitive
        fireEvent.click(changeBtn);

        expect(handleNoticeTypeChange).toHaveBeenCalledWith({}, "MockSelected");
    });

    it("calls handlePagePerOfficerChange when checkbox is toggled", () => {
        render(
            <ControlDocumentDetails
                noticeTypeList={noticeTypeList}
                noticeType={noticeType}
                handleNoticeTypeChange={handleNoticeTypeChange}
                noticeTypeError={noticeTypeError}
                pagePerOfficer={false}
                handlePagePerOfficerChange={handlePagePerOfficerChange}
            />
        );

        const checkbox = screen.getByTestId("officerPerPage");
        fireEvent.click(checkbox);
        expect(handlePagePerOfficerChange).toHaveBeenCalledWith(expect.anything(), true);
    });

    it("passes error=false when noticeTypeError returns false", () => {
        const noticeTypeError = vi.fn(() => false);

        render(
            <ControlDocumentDetails
                {...baseProps}
                noticeTypeError={noticeTypeError}
                pagePerOfficer={false}
            />
        );

        const autocomplete = screen.getByTestId("noticeType");
        expect(autocomplete.getAttribute("data-error")).toBe("false");
        expect(noticeTypeError).toHaveBeenCalled();
    });

    it("passes error=true when noticeTypeError returns true", () => {
        const noticeTypeError = vi.fn(() => true);

        render(
            <ControlDocumentDetails
                {...baseProps}
                noticeTypeError={noticeTypeError}
                pagePerOfficer={false}
            />
        );

        const autocomplete = screen.getByTestId("noticeType");
        expect(autocomplete.getAttribute("data-error")).toBe("true");
        expect(noticeTypeError).toHaveBeenCalled();
    });
});
