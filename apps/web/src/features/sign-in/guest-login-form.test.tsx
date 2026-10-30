import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { signInCalls } from "../../commands/sign-in";
import { NoticeProvider } from "../../ui/notices";
import { GuestLoginForm } from "./guest-login-form";

afterEach(cleanup);

function setup(
  handler: FakeHandler,
  props: Partial<Parameters<typeof GuestLoginForm>[0]> = {}
) {
  const { api, calls } = fakeApi(handler);
  const onSignedIn = vi.fn();
  render(
    <NoticeProvider>
      <GuestLoginForm
        calls={signInCalls(api)}
        onSignedIn={onSignedIn}
        {...props}
      />
    </NoticeProvider>
  );
  return { calls, onSignedIn };
}

const ada = { id: "g1", name: "Ada" };

describe("logging in to a protected name", { tags: ["003-US4"] }, () => {
  it("names the guest a link points at and logs in with a typed code", async () => {
    const { calls, onSignedIn } = setup(
      () => Response.json({ guestId: "g1" }),
      { guest: ada, initialCredential: "ABCD2345" }
    );
    expect(screen.getByLabelText<HTMLInputElement>("Logging in as").value).toBe(
      "Ada"
    );

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(calls[0]).toMatchObject({
      path: "/api/v1/auth/login",
      body: { guestId: "g1", credential: "ABCD2345" },
    });
    expect(onSignedIn).toHaveBeenCalledWith("g1");
  });

  it("takes an email or username when no guest is named", async () => {
    const { calls, onSignedIn } = setup(() => Response.json({ guestId: "g1" }));
    await userEvent.type(
      screen.getByLabelText("Email or username"),
      "ada@example.org"
    );
    await userEvent.type(
      screen.getByLabelText("Password or emailed code"),
      "hunter2 forever"
    );

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(calls[0].body).toEqual({
      identifier: "ada@example.org",
      credential: "hunter2 forever",
    });
    expect(onSignedIn).toHaveBeenCalledWith("g1");
  });

  it("says what the server said about a wrong password", async () => {
    const { onSignedIn } = setup(
      () => problem(403, "auth.credentialWrong", "Wrong password or code"),
      { guest: ada, initialCredential: "nope" }
    );

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Wrong password or code"
    );
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it("emails a code and a reset link for the named guest", async () => {
    const { calls } = setup(() => new Response(null, { status: 204 }), {
      guest: ada,
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Email me a code" })
    );
    expect((await screen.findByRole("status")).textContent).toBe(
      "Code sent — check your email"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Forgot your password?" })
    );

    expect(calls.map((c) => [c.path, c.body])).toEqual([
      ["/api/v1/auth/login-code", { guestId: "g1" }],
      ["/api/v1/auth/reset-link", { guestId: "g1" }],
    ]);
  });

  it("reads a link mailed moments ago as news, not an error", async () => {
    setup(
      () =>
        problem(
          409,
          "auth.codeRecentlySent",
          "A code was emailed to you moments ago"
        ),
      { guest: ada }
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Email me a code" })
    );

    expect((await screen.findByRole("status")).textContent).toBe(
      "A code was emailed to you moments ago"
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("asks for the email or username before mailing a code", async () => {
    const { calls } = setup(() => new Response(null, { status: 204 }));

    expect(
      screen.getByRole("button", { name: "Email me a code" })
    ).toHaveProperty("disabled", true);
    await userEvent.type(screen.getByLabelText("Email or username"), "ada");
    await userEvent.click(
      screen.getByRole("button", { name: "Email me a code" })
    );

    expect(calls[0].body).toEqual({ identifier: "ada" });
  });

  it("mails a reset link to whoever the typed email or username names", async () => {
    const { calls } = setup(() => new Response(null, { status: 204 }));

    await userEvent.type(screen.getByLabelText("Email or username"), "ada");
    await userEvent.click(
      screen.getByRole("button", { name: "Forgot your password?" })
    );

    expect(calls[0]).toMatchObject({
      path: "/api/v1/auth/reset-link",
      body: { identifier: "ada" },
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Reset link sent"
    );
  });
});
