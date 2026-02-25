import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RouteGuardWrapper from "../../components/RouteGuard";

interface CircularState {
  name: string;
  self?: CircularState;
}

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const TestComponent = ({ onClick }: { onClick?: () => void }) => (
  <div>
    <h1>Test Content</h1>
    <button onClick={onClick}>Click me</button>
    <input data-testid="test-input" />
  </div>
);

describe("RouteGuard", () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let addEventListenerSpy: Mock;
  let removeEventListenerSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();

    window.addEventListener = addEventListenerSpy;
    window.removeEventListener = removeEventListenerSpy;
  });

  afterEach(() => {
    cleanup();
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  describe("RouteGuardWrapper - Basic Functionality", () => {
    it("renders children correctly", () => {
      const testContent = "Test Content";
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <div>{testContent}</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    it("renders multiple children correctly", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <div>First Child</div>
            <span>Second Child</span>
            <p>Third Child</p>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(screen.getByText("First Child")).toBeInTheDocument();
      expect(screen.getByText("Second Child")).toBeInTheDocument();
      expect(screen.getByText("Third Child")).toBeInTheDocument();
    });

    it("renders React components as children", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <TestComponent />
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Click me" })
      ).toBeInTheDocument();
      expect(screen.getByTestId("test-input")).toBeInTheDocument();
    });

    it("preserves children functionality and event handlers", () => {
      const clickHandler = vi.fn();
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <TestComponent onClick={clickHandler} />
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const button = screen.getByRole("button", { name: "Click me" });
      button.click();

      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it("handles null/undefined children gracefully", () => {
      expect(() => {
        render(
          <MemoryRouter>
            <RouteGuardWrapper defaultUrl="/default">
              {null}
              {undefined}
            </RouteGuardWrapper>
          </MemoryRouter>
        );
      }).not.toThrow();
    });

    it("handles React fragments as children", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <>
              <div>Fragment Child 1</div>
              <div>Fragment Child 2</div>
            </>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(screen.getByText("Fragment Child 1")).toBeInTheDocument();
      expect(screen.getByText("Fragment Child 2")).toBeInTheDocument();
    });
  });

  describe("Props Validation and Handling", () => {
    it("passes all props correctly to RouteGuard", () => {
      const testState = { user: "test", id: 123 };
      const defaultUrl = "/dashboard";

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl={defaultUrl} state={testState}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });

    it("handles empty string as defaultUrl", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
        expect(mockNavigate).toHaveBeenCalledWith("", { state: {} });
      }
    });

    it("handles root path as defaultUrl", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockNavigate).toHaveBeenCalledWith("/", { state: {} });
    });

    it("handles complex nested state objects", () => {
      const complexState = {
        user: {
          id: 1,
          name: "John",
          preferences: { theme: "dark", language: "en" },
        },
        permissions: ["read", "write", "admin"],
        metadata: {
          timestamp: Date.now(),
          version: "1.2.3",
          nested: {
            deep: {
              value: "test",
              array: [1, 2, { inner: "value" }],
            },
          },
        },
      };

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/complex" state={complexState}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }
      expect(mockNavigate).toHaveBeenCalledWith("/complex", {
        state: complexState,
      });
    });

    it("handles state with functions (should be preserved as-is)", () => {
      const stateWithFunction = {
        data: "test",
        callback: vi.fn(),
        handler: () => "test",
      };

      render(
        <MemoryRouter>
          <RouteGuardWrapper
            defaultUrl="/function-state"
            state={stateWithFunction}
          >
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockNavigate).toHaveBeenCalledWith("/function-state", {
        state: stateWithFunction,
      });
    });

    it("handles null state", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/null-state" state={null}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockNavigate).toHaveBeenCalledWith("/null-state", { state: {} });
    });

    it("handles undefined state (defaults to empty object)", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/undefined-state">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockNavigate).toHaveBeenCalledWith("/undefined-state", {
        state: {},
      });
    });
  });

  describe("Component Lifecycle Management", () => {
    it("adds popstate event listener on mount", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });

    it("removes popstate event listener on unmount", () => {
      const { unmount } = render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });

    it("uses the same function reference for add and remove event listener", () => {
      const { unmount } = render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/default">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const addedFunction = addEventListenerSpy.mock.calls[0][1];

      unmount();

      const removedFunction = removeEventListenerSpy.mock.calls[0][1];
      expect(addedFunction).toBe(removedFunction);
    });

    it("handles multiple mount/unmount cycles correctly", () => {
      const { unmount } = render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/test1">
            <div>Content 1</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/test2">
            <div>Content 2</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Popstate Event Handling - Comprehensive", () => {
    it("calls navigate with correct parameters when popstate event occurs", () => {
      const defaultUrl = "/dashboard";
      const testState = { userId: 123, role: "admin" };

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl={defaultUrl} state={testState}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      expect(popstateListener).toBeDefined();

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        type: "popstate",
        bubbles: true,
        cancelable: true,
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(defaultUrl, {
        state: testState,
      });
    });

    it("handles popstate event with empty state object when no state provided", () => {
      const defaultUrl = "/home";

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl={defaultUrl}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockNavigate).toHaveBeenCalledWith(defaultUrl, { state: {} });
    });

    it("handles rapid successive popstate events", async () => {
      const defaultUrl = "/rapid-test";
      const testState = { counter: 0 };

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl={defaultUrl} state={testState}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      for (let i = 0; i < 5; i++) {
        if (popstateListener) {
          popstateListener(mockEvent);
        }
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(5);
      });

      for (let i = 0; i < 5; i++) {
        expect(mockNavigate).toHaveBeenNthCalledWith(i + 1, defaultUrl, {
          state: testState,
        });
      }
    });

    it("event handler maintains correct context and state", () => {
      const state1 = { page: "page1" };
      const state2 = { page: "page2" };

      const { rerender } = render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/context-test" state={state1}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const firstListener = addEventListenerSpy.mock.calls[0][1];

      rerender(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/context-test" state={state2}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      firstListener(mockEvent);
      expect(mockNavigate).toHaveBeenCalledWith("/context-test", {
        state: state1,
      });
    });

    it("handles popstate events with malformed/missing event methods gracefully", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/malformed-event">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const malformedEvent = {} as unknown as PopStateEvent;

      if (popstateListener) {
        expect(() => {
          popstateListener(malformedEvent);
        }).toThrow();
      }

      const partialEvent = {
        stopImmediatePropagation: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        expect(() => {
          popstateListener(partialEvent);
        }).toThrow();
      }
    });
  });

  describe("URL and Path Handling", () => {
    const urlTestCases = [
      { url: "/simple", description: "simple path" },
      {
        url: "/path/with/multiple/segments",
        description: "multiple path segments",
      },
      { url: "/path-with-dashes", description: "dashes in path" },
      { url: "/path_with_underscores", description: "underscores in path" },
      {
        url: "/path/with?query=value&other=test",
        description: "query parameters",
      },
      { url: "/path/with#hash", description: "hash fragment" },
      { url: "/path/with?query=value#hash", description: "query and hash" },
      {
        url: "/path/with spaces",
        description: "spaces in path (though not recommended)",
      },
      { url: "/path/with/unicode/测试", description: "unicode characters" },
      {
        url: "/path/with/números/123",
        description: "numbers and accented characters",
      },
      { url: "https://external.com/path", description: "full URL" },
      {
        url: "//protocol-relative.com/path",
        description: "protocol-relative URL",
      },
    ];

    urlTestCases.forEach(({ url, description }) => {
      it(`handles ${description} correctly`, () => {
        render(
          <MemoryRouter>
            <RouteGuardWrapper defaultUrl={url}>
              <div>Content</div>
            </RouteGuardWrapper>
          </MemoryRouter>
        );

        const popstateListener = (
          addEventListenerSpy.mock.calls as [string, EventListener][]
        ).find((call) => call[0] === "popstate")?.[1];

        const mockEvent = {
          stopImmediatePropagation: vi.fn(),
          stopPropagation: vi.fn(),
          preventDefault: vi.fn(),
        } as unknown as PopStateEvent;

        if (popstateListener) {
          popstateListener(mockEvent);
        }

        expect(mockNavigate).toHaveBeenCalledWith(url, { state: {} });
      });
    });
  });

  describe("Router Integration and Context", () => {
    it("works with different initial routes in MemoryRouter", () => {
      const initialEntries = ["/initial", "/secondary", "/tertiary"];

      render(
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
          <RouteGuardWrapper defaultUrl="/fallback">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });

    it("maintains functionality when router context changes", () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={["/first"]}>
          <RouteGuardWrapper defaultUrl="/first-fallback">
            <div>First Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(screen.getByText("First Content")).toBeInTheDocument();

      rerender(
        <MemoryRouter initialEntries={["/second"]}>
          <RouteGuardWrapper defaultUrl="/second-fallback">
            <div>Second Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      expect(screen.getByText("Second Content")).toBeInTheDocument();
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Performance and Memory Management", () => {
    it("does not create memory leaks with event listeners", () => {
      const components = [];

      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <MemoryRouter>
            <RouteGuardWrapper defaultUrl={`/test-${i}`}>
              <div>Content {i}</div>
            </RouteGuardWrapper>
          </MemoryRouter>
        );
        components.push(unmount);
      }

      expect(addEventListenerSpy).toHaveBeenCalledTimes(10);

      components.forEach((unmount) => unmount());

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(10);
    });

    it("event listener functions are properly bound", () => {
      render(
        <MemoryRouter>
          <RouteGuardWrapper
            defaultUrl="/binding-test"
            state={{ test: "value" }}
          >
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = addEventListenerSpy.mock.calls[0][1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      expect(() => {
        popstateListener.call(null, mockEvent);
      }).not.toThrow();

      expect(mockNavigate).toHaveBeenCalledWith("/binding-test", {
        state: { test: "value" },
      });
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("works correctly when navigate function throws an error", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockNavigate.mockImplementationOnce(() => {
        throw new Error("Navigation failed");
      });

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/error-test">
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        expect(() => {
          popstateListener(mockEvent);
        }).toThrow("Navigation failed");
      }

      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("handles extremely large state objects", () => {
      const largeState = {
        data: new Array(1000).fill(0).map((_, i) => ({
          id: i,
          name: `Item ${i}`,
          details: {
            description: `This is item number ${i}`,
            tags: [`tag${i}`, `category${i % 10}`, `type${i % 5}`],
            metadata: {
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              version: Math.floor(Math.random() * 100),
            },
          },
        })),
      };

      render(
        <MemoryRouter>
          <RouteGuardWrapper defaultUrl="/large-state" state={largeState}>
            <div>Content</div>
          </RouteGuardWrapper>
        </MemoryRouter>
      );

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockNavigate).toHaveBeenCalledWith("/large-state", {
        state: largeState,
      });
    });

    it("handles circular references in state (should not crash)", () => {
      const circularState: CircularState = { name: "test" };
      circularState.self = circularState;

      expect(() => {
        render(
          <MemoryRouter>
            <RouteGuardWrapper
              defaultUrl="/circular-state"
              state={circularState}
            >
              <div>Content</div>
            </RouteGuardWrapper>
          </MemoryRouter>
        );
      }).not.toThrow();

      const popstateListener = (
        addEventListenerSpy.mock.calls as [string, EventListener][]
      ).find((call) => call[0] === "popstate")?.[1];

      const mockEvent = {
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as PopStateEvent;

      if (popstateListener) {
        popstateListener(mockEvent);
      }

      expect(mockNavigate).toHaveBeenCalledWith("/circular-state", {
        state: circularState,
      });
    });
  });
});
