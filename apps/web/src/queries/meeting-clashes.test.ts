import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi } from "../commands/fake-api";
import { createMeetingClashesQuery } from "./meeting-clashes";

afterEach(() => vi.useRealTimers());

const clash = {
  guestName: "Mia",
  kind: "hosting",
  title: "Rust",
  isViewer: true,
};
const reply = () =>
  Response.json({
    meetings: [
      { id: "m1", clashes: [clash] },
      { id: "m2", clashes: [] },
    ],
    availability: [],
  });

describe("clashes of my 1-on-1s", { tags: ["012-US4"] }, () => {
  it("asks the meetings query and keeps the clashes by meeting id", async () => {
    const { api, calls } = fakeApi(reply);
    const query = createMeetingClashesQuery({ api, eventId: "e 1" });

    await query.load();

    expect(calls[0].path).toBe("/api/v1/meetings?eventId=e%201");
    expect(query.get().get("m1")).toEqual([clash]);
    expect(query.get().get("m2")).toEqual([]);
  });

  it("keeps the last answer when a refetch fails", async () => {
    let fail = false;
    const { api } = fakeApi(() =>
      fail ? new Response(null, { status: 500 }) : reply()
    );
    const query = createMeetingClashesQuery({ api, eventId: "e" });
    await query.load();
    fail = true;
    await query.load();
    expect(query.get().get("m1")).toEqual([clash]);
  });

  it("fetches once after a burst of changes, once they stop", async () => {
    vi.useFakeTimers();
    const { api, calls } = fakeApi(reply);
    const query = createMeetingClashesQuery({
      api,
      eventId: "e",
      debounceMs: 300,
    });

    query.schedule();
    await vi.advanceTimersByTimeAsync(200);
    query.schedule();
    await vi.advanceTimersByTimeAsync(299);
    expect(calls).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);

    expect(calls).toHaveLength(1);
  });
});
