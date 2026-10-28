import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { fakeApi } from "../commands/fake-api";
import { HeaderLinks } from "./header-links";

function show(signedIn: boolean, unreadCount = 3) {
  const { api } = fakeApi(() =>
    Response.json({ notifications: [], unreadCount })
  );
  render(<HeaderLinks api={api} signedIn={signedIn} />);
}

describe("HeaderLinks", () => {
  it("links the attendees, and the notifications with how many are unread", async () => {
    show(true);
    expect(
      screen.getByRole("link", { name: "Attendees" }).getAttribute("href")
    ).toBe("/guests");
    const bell = await screen.findByRole("link", {
      name: "Notifications (3 unread)",
    });
    expect(bell.getAttribute("href")).toBe("/legacy/notifications");
    expect(bell.textContent).toBe("3");
  });

  it("names the notifications plainly when all are read", async () => {
    show(true, 0);
    expect(
      await screen.findByRole("link", { name: "Notifications" })
    ).toBeTruthy();
  });

  it("shows the bell before the count is in, so nothing moves when it lands", async () => {
    show(true);
    expect(screen.getByRole("link", { name: "Notifications" })).toBeTruthy();
    await screen.findByRole("link", { name: "Notifications (3 unread)" });
  });

  it("has no notifications for nobody", () => {
    show(false);
    expect(screen.getByRole("link", { name: "Attendees" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Notifications/ })).toBeNull();
  });
});
