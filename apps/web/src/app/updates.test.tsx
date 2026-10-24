import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { fakeApi } from "../commands/fake-api";
import { useUpdateStatus } from "./updates";

const status = {
  current: { version: "v4.0.0", date: "2026-10-04" },
  latest: { version: "v4.1.0", date: "2026-10-12" },
  updateAvailable: true,
};

describe("useUpdateStatus", () => {
  it("reads the status once", async () => {
    const { api, calls } = fakeApi(() => Response.json(status));

    const { result } = renderHook(() => useUpdateStatus(api));

    await waitFor(() => expect(result.current).toEqual(status));
    expect(calls.map((c) => c.path)).toEqual(["/api/v1/updates"]);
  });

  it("stays unknown for anyone the server tells nothing, and offline", async () => {
    const { api, calls } = fakeApi(() => Response.json(null));
    const quiet = renderHook(() => useUpdateStatus(api));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(quiet.result.current).toBeNull();

    const offline = fakeApi(() => {
      throw new TypeError("offline");
    });
    const down = renderHook(() => useUpdateStatus(offline.api));
    await waitFor(() => expect(offline.calls).toHaveLength(1));
    expect(down.result.current).toBeNull();
  });
});
