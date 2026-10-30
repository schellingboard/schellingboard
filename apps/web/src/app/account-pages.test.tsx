import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FakeCall } from "../commands/fake-api";
import { problem } from "../commands/fake-api";
import { hardNavigate } from "./hard-navigate";
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

const bo = {
  id: "bo",
  name: "Bo",
  aboutMe: null,
  avatarUrl: null,
  pronouns: null,
  basedIn: null,
  prompts: null,
  languages: null,
  contacts: null,
  profileUpdatedAt: null,
  version: 1,
  isHost: false,
  openToMeetings: false,
  authProtected: true,
};

const withBo = (call: FakeCall): Response | undefined =>
  call.path.startsWith("/api/v1/attendees")
    ? Response.json({ items: [bo], nextCursor: null })
    : answers(call);

describe("the site password page", { tags: ["002-US1"] }, () => {
  it("is the screen at /login, not an event of that name", async () => {
    await open({ path: "/login", identity: null });

    expect(
      await screen.findByRole("heading", { name: "Access Required" })
    ).toBeTruthy();
  });

  it("goes on to the page the visitor came for", async () => {
    await open({
      handler: (call) =>
        call.path === "/api/v1/auth/site"
          ? new Response(null, { status: 204 })
          : undefined,
      path: "/login?redirect=%2Fconf%3Fx%3D1",
      identity: null,
    });

    await userEvent.type(await screen.findByLabelText("Password"), "pw");
    await userEvent.click(screen.getByRole("button", { name: "Access Site" }));

    await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith("/conf?x=1"));
  });

  it.each([
    ["a backslash", "%2F%5Cevil.example"],
    ["a tab", "%2F%09%2Fevil.example"],
    ["a newline", "%2F%0A%2Fevil.example"],
    ["a protocol-relative address", "%2F%2Fevil.example"],
    ["an absolute address", "https%3A%2F%2Fevil.example"],
  ])(
    "does not follow a redirect to another site written with %s",
    async (_, redirect) => {
      await open({
        handler: (call) =>
          call.path === "/api/v1/auth/site"
            ? new Response(null, { status: 204 })
            : undefined,
        path: `/login?redirect=${redirect}`,
        identity: null,
      });

      await userEvent.type(await screen.findByLabelText("Password"), "pw");
      await userEvent.click(
        screen.getByRole("button", { name: "Access Site" })
      );

      await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith("/"));
    }
  );
});

describe("the sign-in pages", { tags: ["003-US4"] }, () => {
  it("names the guest an emailed login link is for", async () => {
    await open({
      handler: withBo,
      path: "/auth/login?guest=bo&code=ABCD2345",
      identity: null,
    });

    expect(
      await screen.findByRole("heading", { name: "Log in as Bo" })
    ).toBeTruthy();
  });

  it("says a login link naming nobody is invalid", async () => {
    await open({
      handler: withBo,
      path: "/auth/login?guest=nobody",
      identity: null,
    });

    expect(await screen.findByText(/login link is invalid/)).toBeTruthy();
  });

  it("opens the password form from a reset link", async () => {
    await open({
      handler: withBo,
      path: "/auth/reset?guest=bo&token=t",
      identity: null,
    });

    expect(
      await screen.findByRole("heading", { name: "Set a password for Bo" })
    ).toBeTruthy();
  });

  it("says so when the names cannot be loaded for a login link", async () => {
    await open({
      handler: (call) =>
        call.path.startsWith("/api/v1/attendees")
          ? problem(500, "server.error")
          : answers(call),
      path: "/auth/login?guest=bo",
      identity: null,
    });

    expect(await screen.findByText(/Could not load the names/)).toBeTruthy();
  });

  it("asks to select a name before showing account security", async () => {
    await open({
      handler: (call) =>
        call.path.startsWith("/api/v1/me/")
          ? problem(403, "guest.unselected")
          : answers(call),
      path: "/account-security",
      identity: null,
    });

    expect(await screen.findByText(/Choose who you are/)).toBeTruthy();
  });
});

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
