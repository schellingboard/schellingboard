import { describe, expect, it } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../commands/fake-api";
import { notificationCalls } from "../commands/notifications";
import { createNotificationsQuery } from "./notifications";

const item = (id: string, read: boolean) => ({
  id,
  type: "profileComment",
  text: `Note ${id}`,
  url: `/guests/${id}`,
  createdAt: "2030-01-01T10:00:00.000Z",
  readAt: read ? "2030-01-01T11:00:00.000Z" : null,
});

function make(handler: FakeHandler) {
  const { api, calls } = fakeApi(handler);
  const query = createNotificationsQuery({ calls: notificationCalls(api) });
  return { query, calls };
}

const firstPage = () =>
  Response.json({
    items: [item("a", false), item("b", false), item("c", true)],
    nextCursor: "next",
    unreadCount: 5,
  });

describe("my notifications", { tags: ["013-US2"] }, () => {
  it("loads a page, then appends the older one", async () => {
    const { query, calls } = make((call) =>
      call.path.includes("cursor=next")
        ? Response.json({
            items: [item("d", false)],
            nextCursor: null,
            unreadCount: 5,
          })
        : firstPage()
    );

    await query.load();
    expect(query.get()).toMatchObject({ status: "ready", hasMore: true });

    await query.loadMore();

    const state = query.get();
    expect(state.status === "ready" && state.items.map((i) => i.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(calls[1].path).toContain("cursor=next");
    expect(state).toMatchObject({ hasMore: false, unreadCount: 5 });
  });

  it("keeps the loaded rows when an older page cannot be fetched", async () => {
    const { query } = make((call) =>
      call.path.includes("cursor=next")
        ? problem(500, "server.error")
        : firstPage()
    );
    await query.load();

    const result = await query.loadMore();

    expect(result.ok).toBe(false);
    expect(query.get()).toMatchObject({ status: "ready", hasMore: true });
  });

  it("marks rows read and counts only the ones that were unread", async () => {
    const { query, calls } = make((call) =>
      call.path.endsWith("/read")
        ? new Response(null, { status: 204 })
        : firstPage()
    );
    await query.load();

    const result = await query.markRead(["a", "c"]);

    expect(result.ok).toBe(true);
    expect(calls[1]).toMatchObject({
      method: "POST",
      path: "/api/v1/me/notifications/read",
      body: { ids: ["a", "c"] },
    });
    const state = query.get();
    expect(
      state.status === "ready" && state.items.map((i) => i.readAt !== null)
    ).toEqual([true, false, true]);
    expect(state).toMatchObject({ unreadCount: 4 });
  });

  it("deletes rows and drops their unread share of the count", async () => {
    const { query } = make((call) =>
      call.path.endsWith("/delete")
        ? new Response(null, { status: 204 })
        : firstPage()
    );
    await query.load();

    await query.remove(["a", "c"]);

    const state = query.get();
    expect(state.status === "ready" && state.items.map((i) => i.id)).toEqual([
      "b",
    ]);
    expect(state).toMatchObject({ unreadCount: 4 });
  });

  it("opens one: marks it read and hands back where it goes", async () => {
    const { query } = make((call) =>
      call.path.endsWith("/a/read")
        ? Response.json({ ...item("a", true), url: "/camp?viewSession=s1" })
        : firstPage()
    );
    await query.load();

    const result = await query.open("a");

    expect(result).toEqual({ ok: true, url: "/camp?viewSession=s1" });
    expect(query.get()).toMatchObject({ unreadCount: 4 });
  });

  it("keeps the list and says why when the server refuses", async () => {
    const { query } = make((call) =>
      call.method === "POST" ? problem(403, "guest.unselected") : firstPage()
    );
    await query.load();

    const result = await query.markRead(["a"]);

    expect(result.ok).toBe(false);
    expect(query.get()).toMatchObject({ unreadCount: 5 });
  });

  it("reports why the list could not be loaded", async () => {
    const { query } = make(() => problem(403, "guest.protected"));

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "guest.protected" });
  });
});
