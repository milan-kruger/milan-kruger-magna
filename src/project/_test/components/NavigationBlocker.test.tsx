import { render } from "vitest-browser-react";
import { vi } from "vitest";
import NavigationBlocker from "../../components/NavigationBlocker";

const mockNavigate = vi.fn();
const mockLocation = vi.fn(() => ({state: { from: "/allowed" }}));
const mockAllowedFromPaths = vi.fn(() => ["/allowed"]);
const mockFallbackPath = vi.fn((): string | undefined => "/fallback");

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation(),
    useParams: () => ({ sequenceNumber: '1' })
}));

const renderComponent = async (props = {}) => {
    return render(
        <NavigationBlocker
            allowedFromPaths={mockAllowedFromPaths()}
            fallbackPath={mockFallbackPath()}
            {...props}
        >
            <div>Test Content</div>
        </NavigationBlocker>
    );
};

describe("NavigationBlocker", () => {

    afterEach(() => {
        vi.clearAllMocks();
        mockLocation.mockClear();
        mockNavigate.mockClear();
        mockAllowedFromPaths.mockClear();
    });

    it("should render component", async () => {
        const component = await renderComponent();
        expect(component).toBeDefined();
    });

    it("should render children if from path is allowed", async () => {
        const { container } = await renderComponent();
        expect(container.textContent).toContain("Test Content");
    });

    it("should navigate to fallbackPath if from path is not allowed", async () => {
        mockLocation.mockReturnValue({ state: { from: "/not-allowed" } });

        await renderComponent();
        expect(mockNavigate).toHaveBeenCalledWith("/fallback", { replace: true });
    });

    it("should navigate back if no fallbackPath is provided", async () => {
        mockLocation.mockReturnValue({ state: { from: "/not-allowed" } });
        mockAllowedFromPaths.mockReturnValue(["/another-Path"]);
        mockFallbackPath.mockReturnValue(undefined);

        await renderComponent();

        expect(mockNavigate).toHaveBeenCalledWith(-1);
   });

});
