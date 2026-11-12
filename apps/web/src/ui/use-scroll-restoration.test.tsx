// @module-tag 007-US1
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useScrollRestoration } from "./use-scroll-restoration";

function Scroller({
  storageKey,
  fallbackKey,
}: {
  storageKey: string;
  fallbackKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollRestoration(ref, storageKey, true, fallbackKey);
  return <div ref={ref} data-testid="scroller" />;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("useScrollRestoration", () => {
  it("brings a remounted schedule back to where it was left", () => {
    const first = render(<Scroller storageKey="conf:grid" />);
    const scroller = screen.getByTestId("scroller");
    scroller.scrollLeft = 120;
    scroller.scrollTop = 800;
    fireEvent.scroll(scroller);
    first.unmount();

    render(<Scroller storageKey="conf:grid" />);
    const again = screen.getByTestId("scroller");
    expect(again.scrollLeft).toBe(120);
    expect(again.scrollTop).toBe(800);
  });

  it("falls back to where the page was last left in a new entry", () => {
    const first = render(<Scroller storageKey="1:grid" fallbackKey="conf" />);
    const scroller = screen.getByTestId("scroller");
    scroller.scrollTop = 800;
    fireEvent.scroll(scroller);
    first.unmount();

    render(<Scroller storageKey="3:grid" fallbackKey="conf" />);
    expect(screen.getByTestId("scroller").scrollTop).toBe(800);
  });

  it("fixes an entry's place at its first visit, so a later fallback does not reach it", () => {
    sessionStorage.setItem("scroll:conf", '{"left":0,"top":800}');
    const first = render(<Scroller storageKey="1:grid" fallbackKey="conf" />);
    first.unmount();
    sessionStorage.setItem("scroll:conf", '{"left":0,"top":500}');

    render(<Scroller storageKey="1:grid" fallbackKey="conf" />);
    expect(screen.getByTestId("scroller").scrollTop).toBe(800);
  });

  it("keeps a position per key", () => {
    const first = render(<Scroller storageKey="conf:grid" />);
    const scroller = screen.getByTestId("scroller");
    scroller.scrollTop = 800;
    fireEvent.scroll(scroller);
    first.unmount();

    render(<Scroller storageKey="conf:agenda" />);
    expect(screen.getByTestId("scroller").scrollTop).toBe(0);
  });

  it("restores the window a frame later, and only once the content is there", () => {
    function Page({ ready }: { ready: boolean }) {
      useScrollRestoration(null, "page", ready);
      return null;
    }
    sessionStorage.setItem("scroll:page", '{"left":0,"top":640}');
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const view = render(<Page ready={false} />);
    vi.advanceTimersByTime(100);
    expect(scrollTo).not.toHaveBeenCalled();

    view.rerender(<Page ready />);
    expect(scrollTo).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 640);
  });

  it("does not record the window's reset as the page is left", () => {
    function Page() {
      useScrollRestoration(null, "page");
      return null;
    }
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const first = render(<Page />);
    vi.advanceTimersByTime(100);
    const at = (y: number) => {
      Object.defineProperty(window, "scrollY", {
        value: y,
        configurable: true,
      });
      fireEvent.scroll(window);
    };
    at(800);
    vi.advanceTimersByTime(150);
    at(0);
    first.unmount();

    expect(sessionStorage.getItem("scroll:page")).toBe('{"left":0,"top":800}');
  });

  it("ignores a stored value that is not a position", () => {
    sessionStorage.setItem("scroll:k", '{"left":"x"}');
    render(<Scroller storageKey="k" />);
    expect(screen.getByTestId("scroller").scrollTop).toBe(0);
  });

  it("survives storage that refuses to work", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    render(<Scroller storageKey="k" />);
    const scroller = screen.getByTestId("scroller");
    expect(() => fireEvent.scroll(scroller)).not.toThrow();
  });
});
