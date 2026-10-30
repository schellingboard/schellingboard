import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { signInCalls } from "../../commands/sign-in";
import type { AccountSecurityState } from "../../queries/account-security";
import { NoticeProvider } from "../../ui/notices";
import { AccountSecurityScreen } from "./account-security";

afterEach(cleanup);

const session = (id: string, current: boolean, device: string | null) => ({
  id,
  current,
  assurance: "verified" as const,
  device,
  createdAt: "2026-10-01T10:00:00.000Z",
  lastSeenAt: "2026-10-29T10:00:00.000Z",
  expiresAt: "2026-11-28T10:00:00.000Z",
});

const ready = (
  over: Partial<Extract<AccountSecurityState, { status: "ready" }>> = {}
): AccountSecurityState => ({
  status: "ready",
  authProtected: true,
  username: "ada",
  sessions: [session("s1", true, "Firefox"), session("s2", false, "Safari")],
  ...over,
});

function setup(
  state: AccountSecurityState,
  handler: FakeHandler = () => new Response(null, { status: 204 })
) {
  const { api, calls } = fakeApi(handler);
  const reload = vi.fn();
  render(
    <NoticeProvider>
      <AccountSecurityScreen
        state={state}
        calls={signInCalls(api)}
        guest={{ id: "g1", name: "Ada" }}
        reload={reload}
        backHref="/settings"
      />
    </NoticeProvider>
  );
  return { calls, reload };
}

describe("account security: protection", { tags: ["003-US3"] }, () => {
  it("offers to enable protection by emailed link on an open name", async () => {
    const { calls } = setup(ready({ authProtected: false }));

    await userEvent.click(
      screen.getByRole("button", { name: "Enable protection" })
    );

    expect(calls[0]).toMatchObject({
      path: "/api/v1/auth/reset-link",
      body: { guestId: "g1" },
    });
    expect((await screen.findByRole("status")).textContent).toBe(
      "Check your email for a link to set your password"
    );
  });

  it("changes the password with the current one", async () => {
    const { calls, reload } = setup(ready());

    await userEvent.click(
      screen.getByRole("button", { name: "Change password" })
    );
    await userEvent.type(
      screen.getByLabelText("Current password"),
      "old password"
    );
    await userEvent.type(
      screen.getByLabelText("New password (at least 8 characters)"),
      "new password!"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Change password" })
    );

    expect((await screen.findByRole("status")).textContent).toBe(
      "Password changed"
    );
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/me/credentials/password",
      body: { currentPassword: "old password", newPassword: "new password!" },
    });
    expect(reload).toHaveBeenCalled();
  });

  it("says what the server said about a wrong current password", async () => {
    setup(ready(), () =>
      problem(403, "auth.credentialWrong", "Wrong password")
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Turn off protection" })
    );
    await userEvent.type(screen.getByLabelText("Current password"), "nope");

    await userEvent.click(
      screen.getByRole("button", { name: "Turn off protection" })
    );

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Wrong password"
    );
  });

  it("turns protection off", async () => {
    const { calls, reload } = setup(ready(), () =>
      Response.json({ guestId: "g1" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Turn off protection" })
    );
    await userEvent.type(screen.getByLabelText("Current password"), "pw");

    await userEvent.click(
      screen.getByRole("button", { name: "Turn off protection" })
    );

    expect((await screen.findByRole("status")).textContent).toBe(
      "Protection turned off"
    );
    expect(calls[0].path).toBe("/api/v1/me/credentials/unprotect");
    expect(reload).toHaveBeenCalled();
  });
});

describe("account security: username", { tags: ["003-US4"] }, () => {
  it("shows the username and saves a changed one", async () => {
    const { calls } = setup(ready(), (call) =>
      Response.json({ username: (call.body as { username: string }).username })
    );
    const field = screen.getByLabelText<HTMLInputElement>("Username");
    expect(field.value).toBe("ada");

    await userEvent.clear(field);
    await userEvent.type(field, "Lovelace");
    await userEvent.click(
      screen.getByRole("button", { name: "Save username" })
    );

    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/me/credentials/username",
      body: { username: "Lovelace" },
    });
    expect((await screen.findByRole("status")).textContent).toBe(
      "Username saved"
    );
  });

  it("removes the username when the field is emptied", async () => {
    const { calls } = setup(ready(), () => Response.json({ username: null }));

    await userEvent.clear(screen.getByLabelText("Username"));
    await userEvent.click(
      screen.getByRole("button", { name: "Save username" })
    );

    expect(calls[0].body).toEqual({ username: null });
  });

  it("says a username is taken", async () => {
    setup(ready(), () =>
      problem(409, "username.taken", "That username is taken")
    );

    await userEvent.type(screen.getByLabelText("Username"), "x");
    await userEvent.click(
      screen.getByRole("button", { name: "Save username" })
    );

    expect((await screen.findByRole("alert")).textContent).toContain(
      "That username is taken"
    );
  });
});

describe("account security: login sessions", { tags: ["003-US2"] }, () => {
  it("lists this browser and the others, and signs another out", async () => {
    const { calls, reload } = setup(ready());
    const list = screen.getByRole("list", { name: "Signed-in browsers" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText(/This browser/)).toBeTruthy();

    await userEvent.click(
      screen.getByRole("button", { name: "Sign out Safari" })
    );

    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/me/login-sessions/s2",
    });
    expect(reload).toHaveBeenCalled();
    expect(screen.queryByText(/Safari/)).toBeNull();
    expect(screen.getByText(/Firefox/)).toBeTruthy();
  });
});

describe("account security: loading", { tags: ["003-US3"] }, () => {
  it("says it is loading and says when it cannot be shown", () => {
    setup({ status: "loading" });
    expect(screen.getByRole("status").textContent).toBe("Loading…");
    cleanup();
    setup({ status: "error", code: "guest.unselected" });
    expect(screen.getByRole("alert").textContent).toMatch(
      /Choose who you are/i
    );
  });
});
