import { describe, expect, it } from "vitest";

import { fakeApi, problem } from "../commands/fake-api";
import { snapshot } from "../replica/snapshot-fixture";
import { createAdminEventsQuery } from "./admin-events";

describe("the admin events list", { tags: ["015-US2"] }, () => {
  it("holds every event once loaded, and again after a reload", async () => {
    let events = [{ id: "e1" }];
    const { api } = fakeApi(() =>
      Response.json({ events, now: "2030-01-01T00:00:00Z" })
    );
    const query = createAdminEventsQuery({ api });
    expect(query.get()).toEqual({ status: "loading" });

    await query.load();
    expect(query.get()).toEqual({
      status: "ready",
      events: [{ id: "e1" }],
      now: "2030-01-01T00:00:00Z",
    });

    events = [{ id: "e1" }, { id: "e2" }];
    await query.load();
    expect(query.get()).toMatchObject({ events: [{ id: "e1" }, { id: "e2" }] });
  });

  it("lists the events soonest first, undated last", async () => {
    const { api } = fakeApi(() =>
      Response.json({
        now: "2030-01-01T00:00:00Z",
        events: [
          {
            ...snapshot.event,
            slug: "late",
            firstDayStart: "2030-09-10T08:00:00Z",
          },
          { ...snapshot.event, slug: "undated", firstDayStart: null },
          {
            ...snapshot.event,
            slug: "early",
            firstDayStart: "2030-06-01T08:00:00Z",
          },
        ],
      })
    );
    const query = createAdminEventsQuery({ api });

    await query.load();

    const state = query.get();
    expect(state.status === "ready" && state.events.map((e) => e.slug)).toEqual(
      ["early", "late", "undated"]
    );
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(500, "internal"));
    const query = createAdminEventsQuery({ api });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "internal" });
  });
});
