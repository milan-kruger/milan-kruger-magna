/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { MockData } from "../../mocks/MockData";
import ReturnDocumentsDialog from "../../../components/cancel-transgression/ReturnDocumentsDialog";
import { OverloadTransgression, OverloadTransgressionDto, RtqsTransgression, RtqsTransgressionDto } from "../../../redux/api/transgressionsApi";
import { JsonObjectType } from "../../../enum/JsonObjectType";
import { act } from "react";

// Mock translation
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock TmButton
vi.mock("../../../../framework/components/button/TmButton", () => ({
    __esModule: true,
    default: (props: any) => {
        return (
            <button data-testid={props.testid} onClick={props.onClick}>
                {props.children}
            </button>
        );
    },
}));

// Mock hook
const handleCancelOverloadTransgressionMock = vi.fn();
const handleCancelRtqsTransgressionMock = vi.fn();

vi.mock("../../../hooks/cancel-trangression/CancelTransgressionManager", () => ({
    __esModule: true,
    default: () => ({
        handleCancelOverloadTransgression: handleCancelOverloadTransgressionMock,
        handleCancelRtqsTransgression: handleCancelRtqsTransgressionMock,
    }),
}));

describe("ReturnDocumentsDialog", () => {
    const originalOverload = MockData.getTransgression as OverloadTransgression;
    const overloadTransgression: OverloadTransgressionDto = {
        ...originalOverload,
        type: JsonObjectType.OverloadTransgressionDto,
    };

    const commonProps = {
        onCancelComplete: vi.fn(),
        isOpen: true,
        transgression: overloadTransgression,
        supervisorUsername: "supervisor1",
        supervisorPassword: "password1",
        cancellationReason: "Incorrect Entry",
        plateNumber: "abc123",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders dialog when open", () => {
        render(<ReturnDocumentsDialog {...commonProps} />);
        expect(screen.getByTestId("returnDocumentsReturnDocumentsDialog")).toBeInTheDocument();
        expect(screen.getByTestId("returnDocumentsConfirmReturnDocumentsId")).toHaveTextContent("confirmReturnHeading");
        expect(screen.getByTestId("returnDocumentsCancelBtnConfirmReturnDocumentsCancelId")).toBeInTheDocument();
    });

    it("calls cancel overload handler when 'Yes' is clicked", async () => {
        handleCancelOverloadTransgressionMock.mockResolvedValueOnce(true);

        render(<ReturnDocumentsDialog {...commonProps} plateNumber="ABC123" />);

        const yesButton = screen.getByTestId("returnDocumentsConfirmBtnConfirmReturnDocumentsId");
        await act(async () => {
            fireEvent.click(yesButton);
        });

        expect(handleCancelOverloadTransgressionMock).toHaveBeenCalledWith(
            ["Incorrect Entry", "documentsReturned"],
            "supervisor1",
            "password1",
            "ABC123"
        );
        expect(commonProps.onCancelComplete).toHaveBeenCalledWith(true);
    });


    it("calls cancel overload handler with 'documentsNotReturned' when 'No' is clicked", async () => {
        handleCancelOverloadTransgressionMock.mockResolvedValueOnce(false);

        render(<ReturnDocumentsDialog {...commonProps} />);
        const noButton = screen.getByTestId("returnDocumentsCancelBtnConfirmReturnDocumentsCancelId");

        await act(async () => {
            fireEvent.click(noButton);
        });

        expect(handleCancelOverloadTransgressionMock).toHaveBeenCalledWith(
            ["Incorrect Entry", "documentsNotReturned"],
            "supervisor1",
            "password1",
            "ABC123"
        );
        expect(commonProps.onCancelComplete).toHaveBeenCalledWith(false);
    });

    it("uses RTQS handler if transgression type is RtqsTransgressionDto", async () => {
        const originalRtqs = MockData.getTransgression as RtqsTransgression;
        const rtqsTransgression: RtqsTransgressionDto = {
            ...originalRtqs,
            type: JsonObjectType.RtqsTransgressionDto,
        };
        handleCancelRtqsTransgressionMock.mockResolvedValueOnce(true);

        render(
            <ReturnDocumentsDialog
                {...commonProps}
                transgression={rtqsTransgression}
            />
        );

        const yesButton = screen.getByTestId("returnDocumentsConfirmBtnConfirmReturnDocumentsId");
        await act(async () => {
            fireEvent.click(yesButton);
        });

        expect(handleCancelRtqsTransgressionMock).toHaveBeenCalledWith(
            ["Incorrect Entry", "documentsReturned"],
            "supervisor1",
            "password1"
        );
        expect(commonProps.onCancelComplete).toHaveBeenCalledWith(true);
    });
});
