import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi } from "../commands/fake-api";
import { HeaderLinks, UNREAD_POLL_MS } from "./header-links";
import { UnreadProvider, useUnread } from "./unread-count";

afterEach(cleanup);

describe("the bell's count", { tags: ["013-US2"] }, () => {
  it("follows what the notification list reports", async () => {
    const { api } = fakeApi(() => Response.json({ items: [], unreadCount: 3 }));
    let report: (count: number) => void = () => {};
    function List() {
      report = useUnread()[1];
      return null;
    }
    render(
      <UnreadProvider>
        <HeaderLinks api={api} signedIn />
        <List />
      </UnreadProvider>
    );
    await screen.findByRole("link", { name: "Notifications (3 unread)" });

    act(() => report(0));

    expect(screen.getByRole("link", { name: "Notifications" })).toBeTruthy();
  });

  it("picks up new notifications without a reload", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      let unreadCount = 0;
      const { api } = fakeApi(() => Response.json({ items: [], unreadCount }));
      render(
        <UnreadProvider>
          <HeaderLinks api={api} signedIn />
        </UnreadProvider>
      );
      await screen.findByRole("link", { name: "Notifications" });

      unreadCount = 2;
      await act(() => vi.advanceTimersByTimeAsync(UNREAD_POLL_MS));
      await screen.findByRole("link", { name: "Notifications (2 unread)" });

      unreadCount = 5;
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await screen.findByRole("link", { name: "Notifications (5 unread)" });
    } finally {
      vi.useRealTimers();
    }
  });
});
