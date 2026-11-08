import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "./use-scroll-lock";

const overflow = () => document.documentElement.style.overflow;

describe("useScrollLock", () => {
  afterEach(() => {
    document.documentElement.style.overflow = "";
  });

  it("stops the page scrolling while locked and restores it after", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(overflow()).toBe("hidden");

    unmount();
    expect(overflow()).toBe("");
  });

  it("does nothing while not locked", () => {
    renderHook(() => useScrollLock(false));
    expect(overflow()).toBe("");
  });

  it("stays locked until the last of several locks is released", () => {
    const outer = renderHook(() => useScrollLock(true));
    const inner = renderHook(() => useScrollLock(true));

    inner.unmount();
    expect(overflow()).toBe("hidden");
    outer.unmount();
    expect(overflow()).toBe("");
  });

  it("also releases when the outer lock goes first", () => {
    const outer = renderHook(() => useScrollLock(true));
    const inner = renderHook(() => useScrollLock(true));

    outer.unmount();
    expect(overflow()).toBe("hidden");
    inner.unmount();
    expect(overflow()).toBe("");
  });

  it("puts back the overflow the page had before", () => {
    document.documentElement.style.overflow = "scroll";
    const { rerender } = renderHook(({ on }) => useScrollLock(on), {
      initialProps: { on: true },
    });

    rerender({ on: false });
    expect(overflow()).toBe("scroll");
  });
});
