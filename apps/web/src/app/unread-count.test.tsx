import { act, cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { fakeSources } from "../commands/fake-source";
import { HeaderLinks } from "./header-links";
import {
  UnreadProvider,
  useNotificationRevision,
  useUnread,
} from "./unread-count";

afterEach(cleanup);

function renderBell(guestId = "g1", extra: ReactNode = null) {
  const sources = fakeSources();
  const view = (id: string) => (
    <UnreadProvider guestId={id} createSource={sources.createSource}>
      <HeaderLinks signedIn />
      {extra}
    </UnreadProvider>
  );
  const { rerender } = render(view(guestId));
  return {
    streams: sources.notifications,
    switchTo: (id: string) => rerender(view(id)),
  };
}

describe("the bell's count", { tags: ["013-US2"] }, () => {
  it("follows what the notification list reports", () => {
    let report: (count: number) => void = () => {};
    function List() {
      report = useUnread()[1];
      return null;
    }
    const { streams } = renderBell("g1", <List />);
    act(() => streams[0].emit("unread", { unreadCount: 3 }));

    act(() => report(0));

    expect(screen.getByRole("link", { name: "Notifications" })).toBeTruthy();
  });

  it("shows each count the server pushes", () => {
    const { streams } = renderBell();

    act(() => streams[0].emit("unread", { unreadCount: 3 }));

    expect(
      screen.getByRole("link", { name: "Notifications (3 unread)" })
    ).toBeTruthy();
  });

  it("tells an open notification list to load again", () => {
    const seen: number[] = [];
    function List() {
      seen.push(useNotificationRevision());
      return null;
    }
    const { streams } = renderBell("g1", <List />);

    act(() => streams[0].emit("unread", { unreadCount: 1 }));
    const afterOpening = seen.at(-1)!;
    act(() => streams[0].emit("unread", { unreadCount: 2 }));

    expect(seen.at(-1)).toBe(afterOpening + 1);
  });

  it("follows the viewer to the name they switch to", () => {
    const { streams, switchTo } = renderBell("g1");
    act(() => streams[0].emit("unread", { unreadCount: 3 }));

    switchTo("g2");

    expect(streams[0].closed).toBe(true);
    expect(streams).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Notifications" })).toBeTruthy();
  });
});
