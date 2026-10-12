// @module-tag 007-US8
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { createReplicaStore } from "../replica/store";
import { RECONNECT_GRACE_MS, STALE_AFTER_MS } from "../replica/sync-state";
import { snapshot } from "../replica/snapshot-fixture";
import { SyncIndicator } from "./sync-indicator";

let t = 0;
const clock = () => t;
const advance = (ms: number) =>
  act(() => {
    t += ms;
    vi.advanceTimersByTime(ms);
  });

function show() {
  const store = createReplicaStore(snapshot, clock);
  render(<SyncIndicator store={store} now={clock} />);
  return store;
}

describe("SyncIndicator", () => {
  beforeEach(() => {
    t = 1000;
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("says live while the feed is connected", () => {
    show();
    expect(screen.getByText("Live")).toBeTruthy();
  });

  it("does not flash reconnecting for a short drop", () => {
    const store = show();
    act(() => store.linkDown());
    advance(RECONNECT_GRACE_MS - 1);
    expect(screen.getByText("Live")).toBeTruthy();
  });

  it("says reconnecting, then that the screen may be out of date", () => {
    const store = show();
    act(() => store.linkDown());

    advance(RECONNECT_GRACE_MS);
    expect(screen.getByText("Reconnecting…")).toBeTruthy();

    advance(STALE_AFTER_MS);
    expect(screen.getByText("Not updating: may be out of date")).toBeTruthy();
  });

  it("recovers when the feed comes back", () => {
    const store = show();
    act(() => store.linkDown());
    advance(STALE_AFTER_MS);

    act(() => store.linkUp());

    expect(screen.getByText("Live")).toBeTruthy();
  });

  it("starts out of date for a replica opened from the device's copy", () => {
    const store = createReplicaStore(snapshot, clock, undefined, {
      persisted: true,
    });
    render(<SyncIndicator store={store} now={clock} />);
    expect(screen.getByText("Not updating: may be out of date")).toBeTruthy();
  });

  it("announces changes politely", () => {
    show();
    expect(
      screen.getByText("Live").closest("[aria-live]")?.getAttribute("aria-live")
    ).toBe("polite");
  });
});
