import { render, screen } from "@testing-library/react";
import TmFullscreenInputFrame from "../../../components/fullscreen-input-frame/TmFullscreenInputFrame";

const title = "TestTitle";
const backgroundImage = "test-bg.png";
const childText = "Child Content";
const windowHeight = 800;

vi.mock("@mui/material", async () => {
    const actual = await vi.importActual("@mui/material");
    return {
        ...actual,
        useMediaQuery: vi.fn(() => false),
    };
});

vi.mock("react", async () => ({
    ...await vi.importActual("react"),
    useContext: vi.fn(() => ({
        windowHeight: windowHeight,
    })),
}));

const renderComponent = (props = {}) => {
    return render(
        <TmFullscreenInputFrame
            title={title}
            backgroundImage={backgroundImage}
            {...props}
        >
            <div>{childText}</div>
        </TmFullscreenInputFrame>
    );
};

describe("TmFullscreenInputFrame", () => {

    it("renders the title and children", () => {
        renderComponent();

        expect(screen.getByTestId(title + "FullscreenInputTitle")).toHaveTextContent(title);
        expect(screen.getByText(childText)).toBeInTheDocument();
    });

    it("applies the correct background image and height", () => {
        renderComponent();

        const outerBox = screen.getByTestId(title + "FullscreenInputTitle").closest(".MuiBox-root");

        expect(outerBox?.attributes.getNamedItem("style")?.value).toContain(`background-image: url("${backgroundImage}")`);
        expect(outerBox).toHaveStyle(`height: ${windowHeight - 99}px`);
    });
});
