// @module-tag 011-US3
import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createDirectoryQuery } from "./directory";

const item = (id: string, profileUpdatedAt: string | null = null) => ({
  id,
  name: `Name ${id}`,
  aboutMe: null,
  avatarUrl: null,
  pronouns: null,
  basedIn: null,
  prompts: null,
  languages: null,
  contacts: null,
  profileUpdatedAt,
  version: 1,
  isHost: false,
  openToMeetings: false,
});

describe("the people directory query", () => {
  it("reads every page and turns update times into dates", async () => {
    const { api, calls } = fakeApi(({ path }) =>
      Response.json(
        path.includes("cursor=c1")
          ? { items: [item("b")], nextCursor: null }
          : { items: [item("a", "2026-05-01T10:00:00Z")], nextCursor: "c1" }
      )
    );
    const query = createDirectoryQuery({ api });

    await query.refresh();

    expect(calls.map((c) => c.path)).toEqual([
      "/api/v1/attendees?limit=1000",
      "/api/v1/attendees?limit=1000&cursor=c1",
    ]);
    const { status, entries } = query.get();
    expect(status).toBe("ready");
    expect(entries.map((e) => e.id)).toEqual(["a", "b"]);
    expect(entries[0].profileUpdatedAt).toEqual(
      new Date("2026-05-01T10:00:00Z")
    );
    expect(entries[1].profileUpdatedAt).toBeNull();
  });

  it("keeps the earlier entries and reports a failure", async () => {
    let fail = false;
    const { api } = fakeApi(() =>
      fail
        ? problem(500, "server.error")
        : Response.json({ items: [item("a")], nextCursor: null })
    );
    const query = createDirectoryQuery({ api });
    await query.refresh();

    fail = true;
    await query.refresh();

    expect(query.get()).toMatchObject({
      status: "error",
      code: "server.error",
    });
    expect(query.get().entries).toHaveLength(1);
  });
});
