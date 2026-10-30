import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
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
    expect(query.get()).toEqual({ status: "ready", events: [{ id: "e1" }] });

    events = [{ id: "e1" }, { id: "e2" }];
    await query.load();
    expect(query.get()).toMatchObject({ events: [{ id: "e1" }, { id: "e2" }] });
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(500, "internal"));
    const query = createAdminEventsQuery({ api });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "internal" });
  });
});
