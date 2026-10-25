import { describe, expect, it, vi } from "vitest";
import { iso, snapshot } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { fakeApi, problem } from "./fake-api";
import { createCommandRunner } from "./runner";
import {
  createComment,
  deleteComment,
  editComment,
  likeComment,
  unlikeComment,
} from "./comment";

const created = {
  id: "c1",
  parentId: null,
  body: "Hello",
  deleted: false,
  createdTime: iso(10),
  editedTime: null,
  author: { id: "mia", name: "MIA" },
  likes: [],
};

function setup(handler: Parameters<typeof fakeApi>[0]) {
  const { api, calls } = fakeApi(handler);
  const store = createReplicaStore(snapshot);
  const runner = createCommandRunner({
    store,
    api,
    newKey: () => "key-1",
    retryDelays: [10],
  });
  return { runner, calls, store };
}

describe("creating a comment", () => {
  it(
    "posts it with the click's key and answers with the created comment",
    { tags: ["010-US2"] },
    async () => {
      const { runner, calls } = setup(() =>
        Response.json(created, { status: 201 })
      );

      const outcome = await runner.run(createComment, {
        subject: { kind: "session", id: "s" },
        body: "Hello",
      });

      expect(outcome).toEqual({ ok: true, data: created });
      expect(calls[0]).toMatchObject({
        method: "POST",
        path: "/api/v1/sessions/s/comments",
        key: "key-1",
        body: { body: "Hello" },
      });
      expect(runner.pending()).toEqual([]);
    }
  );

  it(
    "replies under a parent, on a proposal or a profile",
    { tags: ["010-US5"] },
    async () => {
      const { runner, calls } = setup(() =>
        Response.json(created, { status: 201 })
      );

      await runner.run(createComment, {
        subject: { kind: "proposal", id: "p" },
        parentId: "c0",
        body: "Hi",
      });
      await runner.run(createComment, {
        subject: { kind: "profile", id: "g" },
        body: "Hi",
      });

      expect(calls.map((c) => [c.path, c.body])).toEqual([
        ["/api/v1/proposals/p/comments", { parentId: "c0", body: "Hi" }],
        ["/api/v1/guests/g/comments", { body: "Hi" }],
      ]);
    }
  );

  it(
    "refuses an empty body before any call",
    { tags: ["010-US2"] },
    async () => {
      const { runner, calls } = setup(() => Response.json(created));

      const outcome = await runner.run(createComment, {
        subject: { kind: "session", id: "s" },
        body: "   ",
      });

      expect(outcome).toEqual({ ok: false, code: "comment.invalid" });
      expect(calls).toEqual([]);
    }
  );

  it(
    "retries a network error with the same key, so one comment is made",
    { tags: ["010-US2"] },
    async () => {
      vi.useFakeTimers();
      let attempts = 0;
      const { runner, calls } = setup(() => {
        if (++attempts === 1) throw new TypeError("Failed to fetch");
        return Response.json(created, { status: 201 });
      });

      const done = runner.run(createComment, {
        subject: { kind: "session", id: "s" },
        body: "Hello",
      });
      await vi.advanceTimersByTimeAsync(50);

      expect((await done).ok).toBe(true);
      expect(calls.map((c) => c.key)).toEqual(["key-1", "key-1"]);
      vi.useRealTimers();
    }
  );

  it("reports the problem code on a 4xx", { tags: ["010-US2"] }, async () => {
    const { runner } = setup(() => problem(403, "comment.forbidden"));

    const outcome = await runner.run(createComment, {
      subject: { kind: "session", id: "s" },
      body: "Hello",
    });

    expect(outcome).toEqual({ ok: false, code: "comment.forbidden" });
  });
});

describe("changing a comment", () => {
  it("edits the body with the click's key", { tags: ["010-US4"] }, async () => {
    const { runner, calls } = setup(() => Response.json(created));
    const outcome = await runner.run(editComment, {
      commentId: "c1",
      body: "Changed",
      subject: { kind: "session", id: "s" },
    });
    expect(outcome).toEqual({ ok: true, data: created });
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/comments/c1",
      key: "key-1",
      body: { body: "Changed" },
    });
  });

  it(
    "refuses an empty edit before any call",
    { tags: ["010-US4"] },
    async () => {
      const { runner, calls } = setup(() => Response.json(created));
      expect(
        await runner.run(editComment, {
          commentId: "c1",
          body: " ",
          subject: { kind: "session", id: "s" },
        })
      ).toEqual({ ok: false, code: "comment.invalid" });
      expect(calls).toEqual([]);
    }
  );

  it("deletes, likes and unlikes", { tags: ["010-US4"] }, async () => {
    const { runner, calls } = setup(() => new Response(null, { status: 204 }));
    await runner.run(deleteComment, {
      commentId: "c1",
      subject: { kind: "session", id: "s" },
    });
    await runner.run(likeComment, {
      commentId: "c1",
      subject: { kind: "session", id: "s" },
    });
    await runner.run(unlikeComment, {
      commentId: "c1",
      subject: { kind: "session", id: "s" },
    });
    expect(calls.map((c) => [c.method, c.path])).toEqual([
      ["DELETE", "/api/v1/comments/c1"],
      ["PUT", "/api/v1/comments/c1/like"],
      ["DELETE", "/api/v1/comments/c1/like"],
    ]);
  });

  it(
    "reports someone else's comment as the server's code",
    { tags: ["010-US4"] },
    async () => {
      const { runner } = setup(() => problem(403, "comment.notAuthor"));
      expect(
        await runner.run(deleteComment, {
          commentId: "c1",
          subject: { kind: "session", id: "s" },
        })
      ).toEqual({
        ok: false,
        code: "comment.notAuthor",
      });
    }
  );
});

describe("a failed comment command", () => {
  it("names the session the comment is on", { tags: ["010-US2"] }, async () => {
    const seen: string[] = [];
    const { api } = fakeApi(() => problem(403, "comment.notAuthor"));
    const runner = createCommandRunner({
      store: createReplicaStore(snapshot),
      api,
      newKey: () => "k",
      onFailure: ({ what }) => seen.push(what),
    });
    const subject = { kind: "session", id: "s" } as const;

    await runner.run(editComment, { commentId: "c", body: "x", subject });
    await runner.run(deleteComment, { commentId: "c", subject });
    await runner.run(likeComment, { commentId: "c", subject });
    await runner.run(unlikeComment, { commentId: "c", subject });

    expect(seen).toHaveLength(4);
    for (const what of seen) expect(what).toMatch(/ on “.+” \(/);
  });
});
