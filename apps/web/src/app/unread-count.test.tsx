import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi } from "../commands/fake-api";
import { HeaderLinks, UNREAD_POLL_MS } from "./header-links";
import {
  UnreadProvider,
  useNotificationRevision,
  useUnread,
} from "./unread-count";

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

  describe("when the server pushes changes", () => {
    class Source {
      readyState = 1;
      closed = false;
      private listeners = new Map<string, (e: { data: string }) => void>();
      constructor(readonly url: string) {}
      addEventListener(type: string, l: (e: { data: string }) => void) {
        this.listeners.set(type, l);
      }
      close() {
        this.closed = true;
      }
      emit(type: string, data: unknown = {}) {
        this.listeners.get(type)?.({ data: JSON.stringify(data) });
      }
    }

    it("shows a new count at once, without asking again", async () => {
      const { api, calls } = fakeApi(() =>
        Response.json({ items: [], unreadCount: 0 })
      );
      const sources: Source[] = [];
      render(
        <UnreadProvider>
          <HeaderLinks
            api={api}
            signedIn
            createSource={(url) => {
              const source = new Source(url);
              sources.push(source);
              return source as unknown as EventSource;
            }}
          />
        </UnreadProvider>
      );
      await screen.findByRole("link", { name: "Notifications" });
      const asked = calls.length;

      act(() => sources[0].emit("unread", { unreadCount: 3 }));

      expect(
        screen.getByRole("link", { name: "Notifications (3 unread)" })
      ).toBeTruthy();
      expect(calls.length).toBe(asked);
    });

    it("tells an open notification list to load again", async () => {
      const { api } = fakeApi(() =>
        Response.json({ items: [], unreadCount: 0 })
      );
      const sources: Source[] = [];
      const seen: number[] = [];
      function List() {
        seen.push(useNotificationRevision()[0]);
        return null;
      }
      render(
        <UnreadProvider>
          <HeaderLinks
            api={api}
            signedIn
            createSource={(url) => {
              const source = new Source(url);
              sources.push(source);
              return source as unknown as EventSource;
            }}
          />
          <List />
        </UnreadProvider>
      );
      await screen.findByRole("link", { name: "Notifications" });

      act(() => sources[0].emit("unread", { unreadCount: 1 }));
      const afterOpening = seen.at(-1)!;
      act(() => sources[0].emit("unread", { unreadCount: 2 }));

      expect(seen.at(-1)).toBe(afterOpening + 1);
    });

    it("falls back to asking now and then when the stream is refused", async () => {
      vi.useFakeTimers({
        shouldAdvanceTime: true,
        toFake: ["setTimeout", "setInterval", "clearInterval", "clearTimeout"],
      });
      try {
        let unreadCount = 0;
        const { api } = fakeApi(() =>
          Response.json({ items: [], unreadCount })
        );
        const sources: Source[] = [];
        render(
          <UnreadProvider>
            <HeaderLinks
              api={api}
              signedIn
              createSource={(url) => {
                const source = new Source(url);
                sources.push(source);
                return source as unknown as EventSource;
              }}
            />
          </UnreadProvider>
        );
        await screen.findByRole("link", { name: "Notifications" });
        sources[0].readyState = 2;
        act(() => sources[0].emit("error"));

        unreadCount = 4;
        await act(() => vi.advanceTimersByTimeAsync(UNREAD_POLL_MS));

        await screen.findByRole("link", { name: "Notifications (4 unread)" });
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
