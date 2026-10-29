import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAdminProposalsQuery } from "./admin-proposals";

const proposal = (id: string) => ({
  id,
  eventId: "e1",
  title: `Talk ${id}`,
  description: null,
  durationMinutes: null,
  hosts: [{ id: "g1", name: "Alice", extra: 1 }],
  sessionIds: ["s1"],
  tally: null,
  votesCount: 3,
  version: 2,
});

describe("the admin proposals query", { tags: ["018-US1"] }, () => {
  it("reads every page of the event's proposals", async () => {
    const { api, calls } = fakeApi((call) =>
      call.path.includes("cursor=c1")
        ? Response.json({ items: [proposal("p2")], nextCursor: null })
        : Response.json({ items: [proposal("p1")], nextCursor: "c1" })
    );
    const query = createAdminProposalsQuery({ api, eventId: "e1" });

    await query.load();

    expect(calls).toHaveLength(2);
    expect(query.get()).toEqual({
      status: "ready",
      proposals: ["p1", "p2"].map((id) => ({
        id,
        title: `Talk ${id}`,
        description: "",
        durationMinutes: null,
        hosts: [{ id: "g1", name: "Alice" }],
        votesCount: 3,
        sessionCount: 1,
        version: 2,
      })),
    });
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(404, "event.notFound"));
    const query = createAdminProposalsQuery({ api, eventId: "e1" });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "event.notFound" });
  });
});
