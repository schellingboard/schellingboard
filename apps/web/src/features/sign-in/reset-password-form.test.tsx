import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { signInCalls } from "../../commands/sign-in";
import { NoticeProvider } from "../../ui/notices";
import { ResetScreen } from "./reset-password-form";

afterEach(cleanup);

function setup(
  handler: FakeHandler,
  props: Partial<Parameters<typeof ResetScreen>[0]> = {}
) {
  const { api, calls } = fakeApi(handler);
  render(
    <NoticeProvider>
      <ResetScreen
        calls={signInCalls(api)}
        guest={{ id: "g1", name: "Ada" }}
        token="tok"
        signInHref="/auth/login"
        {...props}
      />
    </NoticeProvider>
  );
  return calls;
}

describe(
  "setting a password from an emailed link",
  { tags: ["003-US5"] },
  () => {
    it("sets the password, then points to the sign-in", async () => {
      const calls = setup(() => new Response(null, { status: 204 }));
      expect(
        screen.getByRole("heading", { name: "Set a password for Ada" })
      ).toBeTruthy();

      await userEvent.type(
        screen.getByLabelText("New password (at least 8 characters)"),
        "a brand new password"
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Set password" })
      );

      expect((await screen.findByRole("status")).textContent).toContain(
        "Password set."
      );
      expect(
        screen.getByRole("link", { name: "Go to sign in" }).getAttribute("href")
      ).toBe("/auth/login");
      expect(calls[0]).toMatchObject({
        path: "/api/v1/auth/reset",
        body: {
          guestId: "g1",
          token: "tok",
          newPassword: "a brand new password",
        },
      });
    });

    it("says why a spent link was refused", async () => {
      setup(() =>
        problem(
          403,
          "auth.credentialWrong",
          "This link is invalid or has expired"
        )
      );
      await userEvent.type(
        screen.getByLabelText("New password (at least 8 characters)"),
        "a brand new password"
      );

      await userEvent.click(
        screen.getByRole("button", { name: "Set password" })
      );

      expect((await screen.findByRole("alert")).textContent).toContain(
        "This link is invalid or has expired"
      );
    });

    it("explains a link that names nobody or carries no token", () => {
      setup(() => new Response(null, { status: 204 }), { guest: null });

      expect(screen.getByText(/This password link is invalid/)).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Set password" })).toBeNull();
    });
  }
);
