// @module-tag 007-US9
import { describe, expect, it } from "vitest";
import { snapshot as fixture } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { fakeApi } from "./fake-api";
import { createCommandRunner } from "./runner";
import {
  addBookmark,
  addHidden,
  removeBookmark,
  removeHidden,
} from "./session-mark";

function setup(
  marks: { sessionId: string; kind: "bookmark" | "hidden" }[] = []
) {
  const { api, calls } = fakeApi(() => new Response(null, { status: 204 }));
  const runner = createCommandRunner({
    store: createReplicaStore({ ...fixture, me: { ...fixture.me!, marks } }),
    api,
    newKey: () => "k",
  });
  return { runner, calls };
}

describe("bookmarking a session", () => {
  it("shows the bookmark at once and sends it", async () => {
    const { runner, calls } = setup();

    const pending = runner.run(addBookmark, { sessionId: "s" });

    expect(runner.view().me?.marks).toEqual([
      { sessionId: "s", kind: "bookmark" },
    ]);
    expect((await pending).ok).toBe(true);
    expect(calls).toMatchObject([
      {
        method: "PUT",
        path: "/api/v1/sessions/s/marks/mia",
        key: "k",
        body: { kind: "bookmark" },
      },
    ]);
  });

  it("removes the bookmark at once and sends it", async () => {
    const { runner, calls } = setup([{ sessionId: "s", kind: "bookmark" }]);

    const pending = runner.run(removeBookmark, { sessionId: "s" });

    expect(runner.view().me?.marks).toEqual([]);
    await pending;
    expect(calls).toMatchObject([
      { method: "DELETE", path: "/api/v1/sessions/s/marks/mia" },
    ]);
  });

  it("refuses an unknown session without sending", async () => {
    const { runner, calls } = setup();
    expect(await runner.run(addBookmark, { sessionId: "nope" })).toEqual({
      ok: false,
      code: "session.notFound",
    });
    expect(calls).toEqual([]);
  });
});

describe("hiding a session", () => {
  it("replaces a bookmark at once and sends it", async () => {
    const { runner, calls } = setup([{ sessionId: "s", kind: "bookmark" }]);

    const pending = runner.run(addHidden, { sessionId: "s" });

    expect(runner.view().me?.marks).toEqual([
      { sessionId: "s", kind: "hidden" },
    ]);
    await pending;
    expect(calls).toMatchObject([
      {
        method: "PUT",
        path: "/api/v1/sessions/s/marks/mia",
        body: { kind: "hidden" },
      },
    ]);
  });

  it("shows it again at once and sends it", async () => {
    const { runner, calls } = setup([{ sessionId: "s", kind: "hidden" }]);

    const pending = runner.run(removeHidden, { sessionId: "s" });

    expect(runner.view().me?.marks).toEqual([]);
    await pending;
    expect(calls).toMatchObject([
      { method: "DELETE", path: "/api/v1/sessions/s/marks/mia" },
    ]);
  });
});
