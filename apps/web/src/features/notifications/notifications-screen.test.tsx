import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { notificationCalls } from "../../commands/notifications";
import { createNotificationsQuery } from "../../queries/notifications";
import { paramsUpdater } from "../../ui/list-paging";
import { NotificationsScreen } from "./notifications-screen";

afterEach(cleanup);

const NOW = new Date("2030-01-01T12:00:00.000Z");
const item = (id: string, read: boolean) => ({
  id,
  type: "profileComment",
  text: `${id} commented on your profile`,
  url: `/guests/${id}`,
  createdAt: "2030-01-01T10:00:00.000Z",
  readAt: read ? "2030-01-01T11:00:00.000Z" : null,
});

const serve = (path: string, items: ReturnType<typeof item>[]) => {
  const cursor = new URL(path, "http://x").searchParams.get("cursor");
  const from = Number(cursor ?? 0);
  return Response.json({
    items: items.slice(from, from + 50),
    nextCursor: from + 50 < items.length ? String(from + 50) : null,
    unreadCount: items.filter((i) => i.readAt === null).length,
  });
};

async function show(
  items: ReturnType<typeof item>[],
  handler: FakeHandler = () => new Response(null, { status: 204 }),
  startAt = ""
) {
  const { api, calls } = fakeApi((call) =>
    call.method === "GET" ? serve(call.path, items) : handler(call)
  );
  const query = createNotificationsQuery({ calls: notificationCalls(api) });
  await query.load();
  const onOpen = vi.fn();
  const onUnreadChange = vi.fn();
  function Page() {
    const [params, setParams] = useState(new URLSearchParams(startAt));
    return (
      <>
        <div data-testid="url">{params.toString()}</div>
        <NotificationsScreen
          query={query}
          now={NOW}
          params={params}
          onParams={paramsUpdater(params, setParams)}
          onOpen={onOpen}
          onUnreadChange={onUnreadChange}
        />
      </>
    );
  }
  render(<Page />);
  return { calls, onOpen, onUnreadChange };
}

const actions = () =>
  screen.getByRole("group", { name: "Notification actions" });

describe("the notification list", { tags: ["013-US2"] }, () => {
  it("says nothing is there yet", async () => {
    await show([]);

    expect(screen.getByText(/Nothing yet/)).toBeTruthy();
  });

  it("acts only on the ticked rows, and does nothing with none ticked", async () => {
    const { calls, onUnreadChange } = await show([
      item("Anna", false),
      item("Bo", false),
    ]);
    const markRead = within(actions()).getByRole("button", {
      name: "Mark as read",
    });
    expect((markRead as HTMLButtonElement).disabled).toBe(true);

    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "Select Anna commented on your profile",
      })
    );
    await userEvent.click(markRead);

    expect(calls[1]).toMatchObject({
      path: "/api/v1/me/notifications/read",
      body: { ids: ["Anna"] },
    });
    expect(onUnreadChange).toHaveBeenLastCalledWith(1);
    expect(
      screen.getAllByRole("button", { name: "Mark as read" })
    ).toHaveLength(2);
  });

  it("marks one read from its own button", async () => {
    const { calls } = await show([item("Anna", false)]);

    const row = screen.getByRole("listitem");
    await userEvent.click(
      within(row).getByRole("button", { name: "Mark as read" })
    );

    expect(calls[1].body).toEqual({ ids: ["Anna"] });
    expect(
      within(row).queryByRole("button", { name: "Mark as read" })
    ).toBeNull();
  });

  it("says why when the server refuses an action, and keeps the rows", async () => {
    await show([item("Anna", false)], () => problem(403, "guest.unselected"));

    await userEvent.click(
      within(screen.getByRole("listitem")).getByRole("button", {
        name: "Mark as read",
      })
    );

    expect((await screen.findByRole("alert")).textContent).toBeTruthy();
    expect(screen.getByRole("listitem")).toBeTruthy();
  });

  it("deletes the selection after asking", async () => {
    const { calls } = await show([item("Anna", false), item("Bo", true)]);

    await userEvent.click(
      within(actions()).getByRole("checkbox", { name: "Select page" })
    );
    await userEvent.click(
      within(actions()).getByRole("button", { name: "Delete" })
    );
    expect(screen.getByText(/Delete these 2 notifications/)).toBeTruthy();
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" })
    );

    expect(await screen.findByText(/Nothing yet/)).toBeTruthy();
    expect(calls[1]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/me/notifications?ids=Anna%2CBo",
    });
  });

  it("deletes a long selection in batches the URL can hold", async () => {
    const { api, calls } = fakeApi(() => new Response(null, { status: 204 }));
    const ids = Array.from({ length: 230 }, (_, i) => `n${i}`);

    await notificationCalls(api).remove(ids, "k");

    expect(calls.map((c) => c.path.split("=")[1].split("%2C").length)).toEqual([
      100, 100, 30,
    ]);
  });

  it("opens a notification: marks it read, then follows where it leads", async () => {
    const { onOpen, calls } = await show([item("Anna", false)], () =>
      Response.json({ ...item("Anna", true), url: "/guests/Anna" })
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Anna commented on your profile/ })
    );

    expect(calls[1].path).toBe("/api/v1/me/notifications/Anna/read");
    expect(onOpen).toHaveBeenCalledWith("/guests/Anna");
  });
});

describe("paging the notifications", { tags: ["013-US2"] }, () => {
  const many = Array.from({ length: 120 }, (_, i) =>
    item(`N${String(i).padStart(3, "0")}`, true)
  );
  const rows = () => screen.getAllByRole("checkbox", { name: /^Select N/ });
  const loadedGets = (calls: { method: string }[]) =>
    calls.filter((c) => c.method === "GET").length;

  it("shows 50 a page, with the page in the address and the list scrolled up", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    await show(many);

    await waitFor(() => expect(rows()).toHaveLength(50));

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Page 3" })
    );

    expect(screen.getByTestId("url").textContent).toBe("page=3");
    await waitFor(() => expect(rows()).toHaveLength(20));
    expect(scroll).toHaveBeenCalledWith({ block: "start" });
  });

  it("shows the last page for a page past the end", async () => {
    await show(many, undefined, "page=99");

    await waitFor(() => expect(rows()).toHaveLength(20));
  });

  it("loads on until a bookmarked page is there", async () => {
    const { calls } = await show(many, undefined, "page=3");

    await waitFor(() => expect(rows()).toHaveLength(20));
    expect(rows()[0].getAttribute("aria-label")).toBe(
      "Select N100 commented on your profile"
    );
    expect(loadedGets(calls)).toBe(3);
  });

  it("fetches the next chunk when Next passes the loaded rows, and says more exist", async () => {
    const { calls } = await show(many);
    await waitFor(() => expect(rows()).toHaveLength(50));
    expect(screen.getByText("50+ results")).toBeTruthy();
    expect(loadedGets(calls)).toBe(1);

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => expect(rows()).toHaveLength(50));
    expect(screen.getByText("100+ results")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => expect(rows()).toHaveLength(20));
    expect(screen.getByText("120 results")).toBeTruthy();
    expect(loadedGets(calls)).toBe(3);
  });

  it("keeps the heading and pager while the next chunk loads", async () => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const { api } = fakeApi(async (call) => {
      if (call.method !== "GET") return new Response(null, { status: 204 });
      if (call.path.includes("cursor")) await gate;
      return serve(call.path, many);
    });
    const query = createNotificationsQuery({ calls: notificationCalls(api) });
    await query.load();
    function Page() {
      const [params, setParams] = useState(new URLSearchParams());
      return (
        <NotificationsScreen
          query={query}
          now={NOW}
          params={params}
          onParams={paramsUpdater(params, setParams)}
          onOpen={vi.fn()}
          onUnreadChange={vi.fn()}
        />
      );
    }
    render(<Page />);
    await waitFor(() => expect(rows()).toHaveLength(50));

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByRole("heading", { name: "Notifications" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Loading…");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveProperty(
      "disabled",
      true
    );
    release();
    await waitFor(() => expect(rows()).toHaveLength(50));
  });

  it("offers a retry after a chunk fails to load", async () => {
    let fail = true;
    const { api } = fakeApi((call) => {
      if (call.method !== "GET") return new Response(null, { status: 204 });
      if (call.path.includes("cursor") && fail)
        return new Response(null, { status: 500 });
      return serve(call.path, many);
    });
    const query = createNotificationsQuery({ calls: notificationCalls(api) });
    await query.load();
    function Page() {
      const [params, setParams] = useState(new URLSearchParams("page=2"));
      return (
        <NotificationsScreen
          query={query}
          now={NOW}
          params={params}
          onParams={paramsUpdater(params, setParams)}
          onOpen={vi.fn()}
          onUnreadChange={vi.fn()}
        />
      );
    }
    render(<Page />);
    await screen.findByRole("button", { name: "Try again" });

    fail = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(rows()).toHaveLength(50));
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("ignores ticks on rows the address no longer shows", async () => {
    const { api, calls } = fakeApi((call) =>
      call.method === "GET"
        ? serve(call.path, many)
        : new Response(null, { status: 204 })
    );
    const query = createNotificationsQuery({ calls: notificationCalls(api) });
    await query.load();
    await query.loadMore();
    const screenAt = (search: string) => (
      <NotificationsScreen
        query={query}
        now={NOW}
        params={new URLSearchParams(search)}
        onParams={vi.fn()}
        onOpen={vi.fn()}
        onUnreadChange={vi.fn()}
      />
    );
    const { rerender } = render(screenAt(""));
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select page" })
    );

    rerender(screenAt("page=2"));

    expect(
      within(actions()).getByRole("button", { name: "Mark as read" })
    ).toHaveProperty("disabled", true);
    expect(calls.filter((c) => c.method !== "GET")).toHaveLength(0);
  });

  it("selects and acts on the rows of the page only", async () => {
    const { calls } = await show(many);
    await waitFor(() => expect(rows()).toHaveLength(50));

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select page" })
    );
    await userEvent.click(
      within(actions()).getByRole("button", { name: "Mark as read" })
    );

    const [call] = calls.filter((c) => c.method !== "GET");
    expect((call.body as { ids: string[] }).ids).toHaveLength(50);
  });

  it("drops the ticks when the page changes", async () => {
    await show(many);
    await waitFor(() => expect(rows()).toHaveLength(50));
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select page" })
    );

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() =>
      expect(
        within(actions()).getByRole("button", { name: "Mark as read" })
      ).toHaveProperty("disabled", true)
    );
  });

  it("has no pager for a short list", async () => {
    await show([item("Anna", true)]);

    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
  });
});
