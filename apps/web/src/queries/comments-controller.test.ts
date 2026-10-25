import { describe, expect, it } from "vitest";
import { snapshot } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { createCommandRunner } from "../commands/runner";
import { fakeApi, problem, type FakeHandler } from "../commands/fake-api";
import { createCommentsQuery } from "./comments";
import { createCommentsController } from "./comments-controller";

const comment = (id: string, over = {}) => ({
  id,
  parentId: null as string | null,
  body: id,
  deleted: false,
  createdTime: `2026-06-02T10:0${id.length}:00.000Z`,
  editedTime: null,
  author: { id: "mia", name: "MIA" },
  likes: [] as { id: string; name: string; avatarUrl: string | null }[],
  ...over,
});

async function setup(
  handler: FakeHandler,
  items = [comment("a")],
  nextCursor: string | null = null
) {
  const { api, calls } = fakeApi((call) =>
    call.method === "GET" ? Response.json({ items, nextCursor }) : handler(call)
  );
  const runner = createCommandRunner({
    store: createReplicaStore(snapshot),
    api,
    newKey: () => "k",
    retryDelays: [],
  });
  const query = createCommentsQuery({
    api,
    subject: { kind: "session", id: "s" },
  });
  await query.loadMore();
  const controller = createCommentsController({
    runner,
    query,
    subject: { kind: "session", id: "s" },
    me: () => ({ id: "mia", name: "MIA", avatarUrl: null }),
  });
  return { controller, query, calls };
}

describe("the comments of a subject", () => {
  it(
    "adds a created comment to the thread",
    { tags: ["010-US2"] },
    async () => {
      const { controller, query } = await setup(() =>
        Response.json(comment("bb", { body: "new" }), { status: 201 })
      );
      expect(await controller.create("new")).toEqual({ ok: true });
      expect(query.get().items.map((c) => c.body)).toEqual(["a", "new"]);
    }
  );

  it("replaces an edited comment", { tags: ["010-US4"] }, async () => {
    const { controller, query } = await setup(() =>
      Response.json(
        comment("a", { body: "edited", editedTime: "2026-06-02T11:00:00.000Z" })
      )
    );
    await controller.edit("a", "edited");
    expect(query.get().items[0].body).toBe("edited");
  });

  it(
    "removes a deleted comment, but keeps one with replies as a placeholder",
    { tags: ["010-US4"] },
    async () => {
      const { controller, query } = await setup(
        () => new Response(null, { status: 204 }),
        [comment("a"), comment("bb", { parentId: "a" }), comment("ccc")]
      );
      await controller.remove("ccc");
      await controller.remove("a");
      const [a, reply] = query.get().items;
      expect(query.get().items.map((c) => c.id)).toEqual(["a", "bb"]);
      expect(a).toMatchObject({
        deleted: true,
        body: "",
        author: null,
        likes: [],
      });
      expect(reply.deleted).toBe(false);
    }
  );

  it(
    "keeps a deleted comment as a placeholder while a later page may hold its replies",
    { tags: ["010-US4"] },
    async () => {
      const { controller, query } = await setup(
        () => new Response(null, { status: 204 }),
        [comment("a")],
        "more"
      );
      await controller.remove("a");
      expect(query.get().items[0]).toMatchObject({ id: "a", deleted: true });
    }
  );

  it(
    "likes as the reader and takes the like back",
    { tags: ["010-US6"] },
    async () => {
      const { controller, query, calls } = await setup(
        () => new Response(null, { status: 204 })
      );
      await controller.setLiked("a", true);
      expect(query.get().items[0].likes).toEqual([
        { id: "mia", name: "MIA", avatarUrl: null },
      ]);
      await controller.setLiked("a", false);
      expect(query.get().items[0].likes).toEqual([]);
      expect(calls.slice(-2).map((c) => c.method)).toEqual(["PUT", "DELETE"]);
    }
  );

  it(
    "reports a refusal and leaves the thread alone",
    { tags: ["010-US2"] },
    async () => {
      const { controller, query } = await setup(() =>
        problem(403, "comment.notAuthor")
      );
      expect(await controller.remove("a")).toEqual({ ok: false });
      expect(await controller.create("  ")).toEqual({ ok: false });
      expect(query.get().items).toHaveLength(1);
    }
  );
});
