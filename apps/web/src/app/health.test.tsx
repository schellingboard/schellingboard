import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { fakeApi } from "../commands/fake-api";
import { useHealth } from "./health";

describe("useHealth", () => {
  it("reads the version, build and dev-tools flag once", async () => {
    const { api, calls } = fakeApi(() =>
      Response.json({
        status: "ok",
        version: "4.0.0",
        buildId: "b1",
        devTools: true,
      })
    );

    const { result } = renderHook(() => useHealth(api));

    expect(result.current).toBeUndefined();
    await waitFor(() =>
      expect(result.current).toEqual({
        version: "4.0.0",
        buildId: "b1",
        devTools: true,
      })
    );
    expect(calls.map((c) => c.path)).toEqual(["/api/v1/health"]);
  });

  it("stays unknown when the server cannot be reached", async () => {
    const { api, calls } = fakeApi(() => {
      throw new TypeError("offline");
    });

    const { result } = renderHook(() => useHealth(api));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(result.current).toBeUndefined();
  });
});
