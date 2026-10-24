import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { SEARCH_DEBOUNCE_MS, useDebouncedSearch } from "./use-debounced";

describe("useDebouncedSearch", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("trails the keystrokes", () => {
    const { result, rerender } = renderHook(({ q }) => useDebouncedSearch(q), {
      initialProps: { q: "" },
    });
    rerender({ q: "ta" });
    expect(result.current).toBe("");
    act(() => void vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(result.current).toBe("ta");
  });

  it("applies a cleared search at once", () => {
    const { result, rerender } = renderHook(({ q }) => useDebouncedSearch(q), {
      initialProps: { q: "ta" },
    });
    rerender({ q: "" });
    expect(result.current).toBe("");
  });
});
