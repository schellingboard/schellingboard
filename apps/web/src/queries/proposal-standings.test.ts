// @module-tag 004-US5
import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createStandingsQuery } from "./proposal-standings";

const item = (id: string) => ({
  id,
  tally: { interested: 2, maybe: 1 },
  votesCount: 4,
});

describe("the proposal standings", () => {
  it("reads every page and keys tally and standing by proposal", async () => {
    const { api, calls } = fakeApi(({ path }) =>
      Response.json(
        path.includes("cursor=c1")
          ? { items: [item("b")], nextCursor: null }
          : { items: [item("a")], nextCursor: "c1" }
      )
    );
    const query = createStandingsQuery({ api, eventId: "e" });

    await query.refresh();

    expect(calls.map((c) => c.path)).toEqual([
      "/api/v1/proposals?eventId=e&limit=1000",
      "/api/v1/proposals?eventId=e&limit=1000&cursor=c1",
    ]);
    expect(query.get()).toEqual({
      status: "ready",
      standings: new Map([
        ["a", { tally: { interested: 2, maybe: 1 }, total: 4 }],
        ["b", { tally: { interested: 2, maybe: 1 }, total: 4 }],
      ]),
    });
  });

  it("keeps the earlier standings and reports a failure", async () => {
    let fail = false;
    const { api } = fakeApi(() =>
      fail
        ? problem(500, "server.error")
        : Response.json({ items: [item("a")], nextCursor: null })
    );
    const query = createStandingsQuery({ api, eventId: "e" });
    await query.refresh();

    fail = true;
    await query.refresh();

    expect(query.get()).toMatchObject({
      status: "error",
      code: "server.error",
    });
    expect(query.get().standings.has("a")).toBe(true);
  });
});
