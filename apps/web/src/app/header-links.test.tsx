import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { fakeSources } from "../commands/fake-source";
import { HeaderLinks } from "./header-links";
import { UnreadProvider } from "./unread-count";

function show(signedIn: boolean) {
  const { notifications, createSource } = fakeSources();
  render(
    <UnreadProvider
      guestId={signedIn ? "g1" : null}
      createSource={createSource}
    >
      <HeaderLinks signedIn={signedIn} />
    </UnreadProvider>
  );
  return {
    pushUnread: (unreadCount: number) =>
      act(() => notifications[0].emit("unread", { unreadCount })),
  };
}

describe("HeaderLinks", () => {
  it("links the attendees, and the notifications with how many are unread", () => {
    show(true).pushUnread(3);
    expect(
      screen.getByRole("link", { name: "Attendees" }).getAttribute("href")
    ).toBe("/guests");
    const bell = screen.getByRole("link", {
      name: "Notifications (3 unread)",
    });
    expect(bell.getAttribute("href")).toBe("/notifications");
    expect(bell.textContent).toBe("3");
  });

  it("names the notifications plainly when all are read", () => {
    show(true).pushUnread(0);
    expect(screen.getByRole("link", { name: "Notifications" })).toBeTruthy();
  });

  it("shows the bell before the count is in, so nothing moves when it lands", () => {
    const { pushUnread } = show(true);
    expect(screen.getByRole("link", { name: "Notifications" })).toBeTruthy();
    pushUnread(3);
    expect(
      screen.getByRole("link", { name: "Notifications (3 unread)" })
    ).toBeTruthy();
  });

  it("has no notifications for nobody", () => {
    show(false);
    expect(screen.getByRole("link", { name: "Attendees" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Notifications/ })).toBeNull();
  });
});
