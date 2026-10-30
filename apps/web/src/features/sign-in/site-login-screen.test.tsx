import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { signInCalls } from "../../commands/sign-in";
import { NoticeProvider } from "../../ui/notices";
import { SiteLoginScreen } from "./site-login-screen";

afterEach(cleanup);

function setup(handler: FakeHandler) {
  const { api, calls } = fakeApi(handler);
  const onEntered = vi.fn();
  render(
    <NoticeProvider>
      <SiteLoginScreen calls={signInCalls(api)} onEntered={onEntered} />
    </NoticeProvider>
  );
  return { calls, onEntered, user: userEvent.setup() };
}

describe("the site password screen", { tags: ["002-US1"] }, () => {
  it("sends the password and lets the visitor in", async () => {
    const { calls, onEntered, user } = setup(
      () => new Response(null, { status: 204 })
    );

    await user.type(screen.getByLabelText("Password"), "site-pw");
    await user.click(screen.getByRole("button", { name: "Access Site" }));

    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/auth/site",
      body: { password: "site-pw" },
    });
    await vi.waitFor(() => expect(onEntered).toHaveBeenCalled());
  });

  it("says when the password is wrong and stays", async () => {
    const { onEntered, user } = setup(() =>
      problem(403, "site.passwordWrong", "Invalid password")
    );

    await user.type(screen.getByLabelText("Password"), "nope");
    await user.click(screen.getByRole("button", { name: "Access Site" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/password/i);
    expect(onEntered).not.toHaveBeenCalled();
  });
});
