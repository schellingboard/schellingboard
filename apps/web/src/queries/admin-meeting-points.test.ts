import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAdminMeetingPointsQuery } from "./admin-meeting-points";

describe("the admin meeting points", { tags: ["012-US1"] }, () => {
  it("holds the event's points once loaded", async () => {
    const { api, calls } = fakeApi(() =>
      Response.json({ meetingPoints: [{ id: "p1", name: "Lobby" }] })
    );
    const query = createAdminMeetingPointsQuery({ api, id: "e1" });
    expect(query.get()).toEqual({ status: "loading" });

    await query.load();

    expect(calls[0].path).toBe("/api/v1/admin/events/e1/meeting-points");
    expect(query.get()).toEqual({
      status: "ready",
      points: [{ id: "p1", name: "Lobby" }],
    });
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(403, "admin.required"));
    const query = createAdminMeetingPointsQuery({ api, id: "e1" });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "admin.required" });
  });
});
