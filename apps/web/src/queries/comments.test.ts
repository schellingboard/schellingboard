// @module-tag 010-US2
import { describe, expect, it, vi } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createCommentsQuery } from "./comments";

const comment = (id: string, createdTime = "2026-06-02T10:00:00.000Z") => ({
  id,
  parentId: null,
  body: id,
  deleted: false,
  createdTime,
  editedTime: null,
  author: null,
  likes: [],
});

const pages: Record<string, unknown> = {
  "": {
    items: [
      comment("a", "2026-06-02T10:00:00Z"),
      comment("b", "2026-06-02T10:01:00Z"),
    ],
    nextCursor: "c1",
  },
  c1: { items: [comment("c", "2026-06-02T10:02:00Z")], nextCursor: null },
};

const serve = (call: { path: string }) =>
  Response.json(
    pages[new URL(call.path, "http://x").searchParams.get("cursor") ?? ""]
  );

const ids = (q: ReturnType<typeof createCommentsQuery>) =>
  q.get().items.map((c) => c.id);

describe("paged comments", () => {
  it("loads the first page, then the next from its cursor, until the last", async () => {
    const { api, calls } = fakeApi(serve);
    const query = createCommentsQuery({
      api,
      subject: { kind: "session", id: "s" },
      pageSize: 2,
    });

    await query.loadMore();
    expect(ids(query)).toEqual(["a", "b"]);
    expect(query.get()).toMatchObject({ status: "ready", hasMore: true });

    await query.loadMore();
    expect(ids(query)).toEqual(["a", "b", "c"]);
    expect(query.get().hasMore).toBe(false);

    await query.loadMore();
    expect(calls.map((c) => c.path)).toEqual([
      "/api/v1/sessions/s/comments?limit=2",
      "/api/v1/sessions/s/comments?limit=2&cursor=c1",
    ]);
  });

  it("asks for a page once while one is on its way", async () => {
    const { api, calls } = fakeApi(serve);
    const query = createCommentsQuery({
      api,
      subject: { kind: "proposal", id: "p" },
    });

    await Promise.all([query.loadMore(), query.loadMore()]);

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("/api/v1/proposals/p/comments?limit=50");
  });

  it("reads a profile's comments from the guest's endpoint", async () => {
    const { api, calls } = fakeApi(serve);
    await createCommentsQuery({
      api,
      subject: { kind: "profile", id: "g" },
    }).loadMore();
    expect(calls[0].path).toContain("/api/v1/guests/g/comments");
  });

  it("keeps what it has on a failure and tries the same page again", async () => {
    let fail = false;
    const { api } = fakeApi((call) =>
      fail && call.path.includes("cursor")
        ? problem(500, "server.error")
        : serve(call)
    );
    const query = createCommentsQuery({
      api,
      subject: { kind: "session", id: "s" },
    });
    await query.loadMore();

    fail = true;
    await query.loadMore();
    expect(query.get()).toMatchObject({ status: "error", hasMore: true });
    expect(ids(query)).toEqual(["a", "b"]);

    fail = false;
    await query.loadMore();
    expect(ids(query)).toEqual(["a", "b", "c"]);
  });

  it("adds a comment just created in time order, once, even if a later page holds it too", async () => {
    const { api } = fakeApi(serve);
    const query = createCommentsQuery({
      api,
      subject: { kind: "session", id: "s" },
    });
    await query.loadMore();

    query.add(comment("new", "2026-06-02T10:05:00Z"));
    query.add(comment("new", "2026-06-02T10:05:00Z"));
    expect(ids(query)).toEqual(["a", "b", "new"]);

    await query.loadMore();
    expect(ids(query)).toEqual(["a", "b", "c", "new"]);
  });

  it("keeps a comment added while a page failed to load", async () => {
    let release: ((r: Response) => void) | undefined;
    const { api } = fakeApi(
      () => new Promise<Response>((resolve) => (release = resolve))
    );
    const query = createCommentsQuery({
      api,
      subject: { kind: "session", id: "s" },
    });
    const loading = query.loadMore();
    await vi.waitFor(() => expect(release).not.toBe(undefined));

    query.add(comment("mine"));
    release!(problem(500, "server.error"));
    await loading;

    expect(ids(query)).toEqual(["mine"]);
  });

  it("ignores a page that arrives after it was destroyed", async () => {
    let release: ((r: Response) => void) | undefined;
    const { api } = fakeApi(
      () => new Promise<Response>((resolve) => (release = resolve))
    );
    const query = createCommentsQuery({
      api,
      subject: { kind: "session", id: "s" },
    });
    const loading = query.loadMore();
    await vi.waitFor(() => expect(release).not.toBe(undefined));

    query.destroy();
    release!(Response.json(pages[""]));
    await loading;

    expect(ids(query)).toEqual([]);
  });
});
