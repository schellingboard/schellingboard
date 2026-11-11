import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSearchParamText } from "./use-search-param-text";

describe("the search text kept in the q param", () => {
  it("takes up a q that changes from outside, and writes typed text to q", async () => {
    const onChange = vi.fn<(params: URLSearchParams) => void>();
    const { result, rerender } = renderHook(
      ({ query }) => useSearchParamText(new URLSearchParams(query), onChange),
      { initialProps: { query: "q=rust" } }
    );
    expect(result.current[0]).toBe("rust");

    rerender({ query: "" });
    expect(result.current[0]).toBe("");
    expect(onChange).not.toHaveBeenCalled();

    act(() => result.current[1]("go"));
    await vi.waitFor(() =>
      expect(onChange.mock.lastCall![0].get("q")).toBe("go")
    );
  });
});
