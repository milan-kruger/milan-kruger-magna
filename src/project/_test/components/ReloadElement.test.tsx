import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TmReloadElement from "../../components/ReloadElement";
import { act } from "react";

// Mock child component
const MockChild = () => <div data-testid="child">Child Content</div>;

describe("TmReloadElement", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers(); // clean up all pending timers
        vi.useRealTimers();
    });

    it("should show the child immediately if showImmediately is true", () => {
        render(
            <TmReloadElement showImidiately>
                <MockChild />
            </TmReloadElement>
        );
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should hide and then show the child after delay if enableReload is true", async () => {
        render(
            <TmReloadElement delay={1000} enableReload>
                <MockChild />
            </TmReloadElement>
        );

        // Initially hidden (child not in DOM)
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();

        // Fast-forward full delay
        await act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Now the child should be visible
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });


    it("should show the child and not reload if enableReload is false", async () => {
        render(
            <TmReloadElement enableReload={false}>
                <MockChild />
            </TmReloadElement>
        );

        // Should be shown immediately
        expect(screen.getByTestId("child")).toBeInTheDocument();

        // Advance time — nothing should change
        await act(() => {
            vi.advanceTimersByTime(5000);
        });

        // Still present
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });


    it("should use the default delay of 500ms if none is provided", async () => {
        render(
            <TmReloadElement>
                <MockChild />
            </TmReloadElement>
        );

        // Initially hidden
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();

        // Before 500ms: still hidden
        await act(() => {
            vi.advanceTimersByTime(400);
        });
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();

        // After 500ms: now shown
        await act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("clears the timeout on unmount", () => {
        const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

        const { unmount } = render(
            <TmReloadElement delay={1000}>
                <MockChild />
            </TmReloadElement>
        );

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });

});
