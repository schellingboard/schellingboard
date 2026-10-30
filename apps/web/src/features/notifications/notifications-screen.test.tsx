import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { notificationCalls } from "../../commands/notifications";
import { createNotificationsQuery } from "../../queries/notifications";
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

async function show(
  items: ReturnType<typeof item>[],
  handler: FakeHandler = () => new Response(null, { status: 204 })
) {
  const { api, calls } = fakeApi((call) =>
    call.method === "GET"
      ? Response.json({
          items,
          nextCursor: null,
          unreadCount: items.filter((i) => i.readAt === null).length,
        })
      : handler(call)
  );
  const query = createNotificationsQuery({ calls: notificationCalls(api) });
  await query.load();
  const onOpen = vi.fn();
  const onUnreadChange = vi.fn();
  render(
    <NotificationsScreen
      query={query}
      now={NOW}
      onOpen={onOpen}
      onUnreadChange={onUnreadChange}
    />
  );
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
      within(actions()).getByRole("checkbox", { name: "Select all" })
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
      path: "/api/v1/me/notifications/delete",
      body: { ids: ["Anna", "Bo"] },
    });
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
