// @module-tag 007-US1
import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useScrollRestoration } from "./use-scroll-restoration";

function Scroller({ storageKey }: { storageKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollRestoration(ref, storageKey);
  return <div ref={ref} data-testid="scroller" />;
}

afterEach(() => {
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

  it("keeps a position per key", () => {
    const first = render(<Scroller storageKey="conf:grid" />);
    const scroller = screen.getByTestId("scroller");
    scroller.scrollTop = 800;
    fireEvent.scroll(scroller);
    first.unmount();

    render(<Scroller storageKey="conf:agenda" />);
    expect(screen.getByTestId("scroller").scrollTop).toBe(0);
  });

  it("ignores a stored value that is not a position", () => {
    sessionStorage.setItem("schedule-scroll:k", '{"left":"x"}');
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
