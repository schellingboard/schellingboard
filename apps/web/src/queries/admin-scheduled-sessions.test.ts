import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAdminScheduledSessionsQuery } from "./admin-scheduled-sessions";

const session = (title: string, startTime: string | null) => ({
  title,
  startTime,
  endTime: startTime && startTime.replace("T08", "T09"),
});

describe("the admin scheduled sessions", { tags: ["015-US4"] }, () => {
  it("reads every page and keeps only sessions with a time", async () => {
    const { api, calls } = fakeApi((call) =>
      call.path.includes("cursor=c2")
        ? Response.json({
            items: [session("Late", "2030-05-02T08:00:00Z")],
            nextCursor: null,
          })
        : Response.json({
            items: [
              session("Early", "2030-05-01T08:00:00Z"),
              session("Unscheduled", null),
            ],
            nextCursor: "c2",
          })
    );
    const query = createAdminScheduledSessionsQuery({ api, eventId: "e1" });

    await query.load();

    expect(calls).toHaveLength(2);
    expect(query.get()).toEqual({
      status: "ready",
      sessions: [
        {
          title: "Early",
          startTime: "2030-05-01T08:00:00Z",
          endTime: "2030-05-01T09:00:00Z",
        },
        {
          title: "Late",
          startTime: "2030-05-02T08:00:00Z",
          endTime: "2030-05-02T09:00:00Z",
        },
      ],
    });
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(500, "internal"));
    const query = createAdminScheduledSessionsQuery({ api, eventId: "e1" });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "internal" });
  });
});
