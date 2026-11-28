import { act, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  if (call.path === "/api/v1/me/credentials")
    return Response.json({
      authProtected: false,
      username: null,
      hasEmail: true,
      canSetPassword: true,
    });
  if (call.path === "/api/v1/me/login-sessions") return Response.json([]);
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
  labels: [],
  authProtected: true,
};

const withBo = (call: FakeCall): Response | undefined =>
  call.path.startsWith("/api/v1/attendees")
    ? Response.json({ items: [bo], nextCursor: null })
    : answers(call);

describe(
  "login and join links for a proxy person",
  { tags: ["025-US2"] },
  () => {
    const fixed = (call: FakeCall): Response | undefined =>
      call.path === "/api/v1/me/identity"
        ? Response.json({
            guestId: "bo",
            fixedBy: { logoutUrl: "", siteAdmin: false },
          })
        : withBo(call);

    it("shows the fixed name instead of the login form", async () => {
      await open({ handler: fixed, path: "/auth/login", identity: "bo" });

      expect(
        await screen.findByText(/The proxy signs you in as Bo/)
      ).toBeTruthy();
      expect(screen.queryByLabelText("Password")).toBeNull();
    });

    it("lets a site admin without admin rights log in as themself", async () => {
      await open({
        handler: (call) =>
          call.path === "/api/v1/me/identity"
            ? Response.json({
                guestId: "bo",
                fixedBy: { logoutUrl: "", siteAdmin: true },
                adminNeedsSignIn: true,
              })
            : withBo(call),
        path: "/auth/login?redirect=%2Fadmin&guest=someone-else",
        identity: "bo",
      });

      expect(
        await screen.findByRole("heading", { name: "Log in as Bo" })
      ).toBeTruthy();
      expect(
        screen.getByText("Sign in with your password to use admin.")
      ).toBeTruthy();
    });

    it("says so when the join link is another person's", async () => {
      await open({
        handler: (call) =>
          call.path === "/api/v1/auth/join"
            ? problem(403, "identity.fixed")
            : fixed(call),
        path: "/join/tok",
        identity: "bo",
      });

      expect(
        await screen.findByText(/The proxy decides who you are/)
      ).toBeTruthy();
    });
  }
);

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

  it.each([
    ["/admin", "/admin"],
    ["https://evil.example/", "/"],
  ])("after signing in, goes to the redirect %s", async (redirect, target) => {
    await open({
      handler: (call) =>
        call.path === "/api/v1/auth/login"
          ? Response.json({ guestId: "bo", level: "verified" })
          : withBo(call),
      path: `/auth/login?redirect=${encodeURIComponent(redirect)}`,
      identity: null,
    });

    await userEvent.type(
      await screen.findByLabelText("Email or username"),
      "bo"
    );
    await userEvent.type(
      screen.getByLabelText("Password or emailed code"),
      "pw"
    );
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith(target));
  });

  it(
    "asks a site admin whose session gives no rights for the password",
    { tags: ["016-US4"] },
    async () => {
      await open({
        handler: (call) =>
          call.path === "/api/v1/me/identity"
            ? Response.json({ guestId: "bo", adminNeedsSignIn: true })
            : withBo(call),
        path: "/auth/login?redirect=%2Fadmin",
        identity: "bo",
      });

      expect(
        await screen.findByText("Sign in with your password to use admin.")
      ).toBeTruthy();
      expect(
        screen.getByRole("heading", { name: "Log in as Bo" })
      ).toBeTruthy();
    }
  );

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

  it("sends the old account security address to the security section of settings", async () => {
    const { router } = await open({
      handler: answers,
      path: "/account-security",
      identity: "al",
    });

    expect(
      await screen.findByRole("heading", { name: "Settings" })
    ).toBeTruthy();
    expect(router.history.location.pathname).toBe("/settings");
    expect(router.history.location.hash).toBe("#security");
    expect(
      screen.getByRole("heading", { name: "Account security" })
    ).toBeTruthy();
    expect(
      await screen.findByRole("button", { name: "Set a password" })
    ).toBeTruthy();
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

  it("hides the account security section while a proxy fixes the identity", async () => {
    const fixed = (siteAdmin: boolean) => (call: FakeCall) =>
      call.path === "/api/v1/me/identity"
        ? Response.json({
            guestId: "al",
            fixedBy: { logoutUrl: "", siteAdmin },
          })
        : answers(call);

    await open({ handler: fixed(false), path: "/settings", identity: "al" });
    await screen.findByText(/Email me when/);
    expect(
      screen.queryByRole("heading", { name: "Account security" })
    ).toBeNull();
    cleanup();

    await open({ handler: fixed(true), path: "/settings", identity: "al" });
    expect(
      await screen.findByRole("heading", { name: "Account security" })
    ).toBeTruthy();
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

    expect(await screen.findByText(/Select your name/)).toBeTruthy();
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

  it("shows a notification the moment the server pushes it", async () => {
    let items = [notification("Anna", "/conf?viewSession=s1")];
    const { notifications } = await open({
      handler: (call) =>
        call.method === "GET" &&
        call.path.startsWith("/api/v1/me/notifications?")
          ? Response.json({
              items,
              nextCursor: null,
              unreadCount: items.length,
            })
          : answers(call),
      path: "/notifications",
      identity: "al",
    });
    await screen.findByRole("button", { name: /Anna commented/ });
    act(() => notifications[0].emit("unread", { unreadCount: 1 }));

    items = [notification("Bo", "/conf?viewSession=s2"), ...items];
    act(() => notifications[0].emit("unread", { unreadCount: 2 }));

    expect(
      await screen.findByRole("button", { name: /Bo commented/ })
    ).toBeTruthy();
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

    expect(await screen.findByText(/Select your name/)).toBeTruthy();
  });
});
