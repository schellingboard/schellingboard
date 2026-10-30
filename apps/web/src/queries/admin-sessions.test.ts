import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import {
  createAdminSessionsQuery,
  loadSessionRsvpGuests,
  scheduledOf,
} from "./admin-sessions";

const session = (id: string) => ({
  id,
  eventId: "e1",
  title: `S ${id}`,
  description: "",
  startTime: null,
  endTime: null,
  capacity: 5,
  adminManaged: true,
  blocker: false,
  closed: false,
  proposalId: null,
  hosts: [{ id: "g1", name: "Alice" }],
  locations: [{ id: "l1", name: "Hall", color: "blue" }],
  numRsvps: 2,
  version: 3,
});

describe("the admin sessions query", { tags: ["018-US2"] }, () => {
  it("reads every page, scheduled or not", async () => {
    const { api, calls } = fakeApi((call) =>
      call.path.includes("cursor=c1")
        ? Response.json({ items: [session("s2")], nextCursor: null })
        : Response.json({ items: [session("s1")], nextCursor: "c1" })
    );
    const query = createAdminSessionsQuery({ api, eventId: "e1" });

    await query.load();

    expect(calls).toHaveLength(2);
    const state = query.get();
    expect(state.status === "ready" && state.sessions.map((s) => s.id)).toEqual(
      ["s1", "s2"]
    );
    expect(state.status === "ready" && state.sessions[0].locations).toEqual([
      { id: "l1", name: "Hall" },
    ]);
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(404, "event.notFound"));
    const query = createAdminSessionsQuery({ api, eventId: "e1" });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "event.notFound" });
  });

  it("lists who RSVPed, or null when it cannot", async () => {
    const ok = fakeApi(() =>
      Response.json({
        rsvps: [{ id: "r1", sessionId: "s1", guestId: "g1" }],
      })
    );
    expect(await loadSessionRsvpGuests(ok.api, "s1")).toEqual(["g1"]);

    const bad = fakeApi(() => problem(404, "session.notFound"));
    expect(await loadSessionRsvpGuests(bad.api, "s1")).toBeNull();
  });
});

describe("the scheduled sessions", { tags: ["015-US4"] }, () => {
  it("keeps only those with a time", () => {
    const base = {
      id: "s",
      description: "",
      capacity: 1,
      adminManaged: false,
      blocker: false,
      closed: false,
      hosts: [],
      locations: [],
      numRsvps: 0,
      version: 1,
    };

    expect(
      scheduledOf([
        { ...base, title: "Early", startTime: "a", endTime: "b" },
        { ...base, title: "Later", startTime: null, endTime: null },
      ])
    ).toEqual([{ title: "Early", startTime: "a", endTime: "b" }]);
  });
});
