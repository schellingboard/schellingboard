import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FakeCall } from "../commands/fake-api";
import { problem } from "../commands/fake-api";
import { open } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});

const emailSettings = {
  rsvpChange: true,
  hostChange: true,
  cohostAdd: true,
  proposalJoin: true,
  proposalComment: true,
  sessionComment: true,
  profileComment: true,
  commentThread: false,
  meetingRequest: true,
  meetingResponse: true,
  sessionHeadsUp: true,
  attendeeCountReminder: true,
};

const notification = (id: string, url: string) => ({
  id,
  type: "profileComment",
  text: `${id} commented on your profile`,
  url,
  createdAt: "2030-01-01T10:00:00.000Z",
  readAt: null,
});

const answers = (call: FakeCall): Response | undefined => {
  if (call.path.startsWith("/api/v1/attendees"))
    return Response.json({ items: [], nextCursor: null });
  if (call.path === "/api/v1/me/email-settings")
    return Response.json(emailSettings);
  if (call.path === "/api/v1/meeting-availability")
    return Response.json({ forms: [] });
  if (call.path === "/api/v1/push/key")
    return Response.json({ publicKey: "AQAB" });
  if (
    call.method === "GET" &&
    call.path.startsWith("/api/v1/me/notifications?")
  )
    return Response.json({
      items: [notification("Anna", "/conf?viewSession=s1")],
      nextCursor: null,
      unreadCount: 1,
    });
  if (call.path === "/api/v1/me/notifications/Anna/read")
    return Response.json({ url: "/conf?viewSession=s1" });
  return undefined;
};

describe("the settings page", { tags: ["013-US5"] }, () => {
  it("shows the signed-in guest's settings", async () => {
    await open({ handler: answers, path: "/settings", identity: "al" });

    expect(
      await screen.findByRole("heading", { name: "Settings" })
    ).toBeTruthy();
    expect(screen.getByText(/Email me when/)).toBeTruthy();
  });

  it("asks to select a name first, but keeps the device's appearance", async () => {
    await open({
      handler: (call) =>
        call.path === "/api/v1/me/email-settings"
          ? problem(403, "guest.unselected")
          : answers(call),
      path: "/settings",
      identity: null,
    });

    expect(await screen.findByText(/select who you are/)).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Appearance (this device)" })
    ).toBeTruthy();
  });
});

describe("the notifications page", { tags: ["013-US2"] }, () => {
  it("lists the notifications and follows one to what happened", async () => {
    const { router } = await open({
      handler: answers,
      path: "/notifications",
      identity: "al",
    });

    await userEvent.click(
      await screen.findByRole("button", { name: /Anna commented/ })
    );

    await waitFor(() => expect(router.history.location.pathname).toBe("/conf"));
    expect(router.history.location.search).toBe("?viewSession=s1");
  });

  it("asks to select a name first", async () => {
    await open({
      handler: (call) =>
        call.method === "GET" &&
        call.path.startsWith("/api/v1/me/notifications?")
          ? problem(403, "guest.unselected")
          : answers(call),
      path: "/notifications",
      identity: null,
    });

    expect(await screen.findByText(/select who you are/)).toBeTruthy();
  });
});
