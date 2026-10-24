// @module-tag 007-US4
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createReplicaStore } from "../replica/store";
import { snapshot } from "../replica/snapshot-fixture";
import { useServerNow } from "./use-server-now";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useServerNow", () => {
  it("reads the server's clock, kept by the replica, and moves on every minute", () => {
    // This device is 20 s ahead of the server (snapshot.now is 10:00:00Z).
    vi.setSystemTime(new Date("2026-06-02T10:00:20.000Z"));
    const store = createReplicaStore(snapshot);
    const { result } = renderHook(() => useServerNow(store));
    expect(result.current.toISOString()).toBe("2026-06-02T10:00:00.000Z");

    act(() => void vi.advanceTimersByTime(60_000));
    expect(result.current.toISOString()).toBe("2026-06-02T10:01:00.000Z");
  });
});
