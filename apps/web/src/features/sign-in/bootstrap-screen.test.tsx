import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeApi, type FakeHandler, problem } from "../../commands/fake-api";
import { signInCalls } from "../../commands/sign-in";
import { NoticeProvider } from "../../ui/notices";
import { BootstrapScreen } from "./bootstrap-screen";

afterEach(cleanup);

function setup(
  handler: FakeHandler,
  props: Partial<Parameters<typeof BootstrapScreen>[0]> = {}
) {
  const { api, calls } = fakeApi(handler);
  const onDone = vi.fn();
  render(
    <NoticeProvider>
      <BootstrapScreen
        calls={signInCalls(api)}
        token="tok"
        guests={[{ id: "g1", name: "Ada" }]}
        onBootstrapped={onDone}
        {...props}
      />
    </NoticeProvider>
  );
  return { calls, onDone };
}

async function pick(label: string, option: string) {
  await userEvent.click(screen.getByLabelText(label));
  await userEvent.click(screen.getByRole("option", { name: option }));
}

const ok = () => Response.json({ guestId: "g1" });

describe("the bootstrap page for a proxy person", { tags: ["025-US1"] }, () => {
  it("shows a note and one button, and sends only the link", async () => {
    const { calls, onDone } = setup(ok, { proxyPerson: { name: "Ada" } });

    expect(screen.getByText(/identifies you as Ada/)).toBeTruthy();
    expect(screen.queryByLabelText("Username")).toBeNull();
    expect(screen.queryByLabelText("Who are you?")).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Become site admin" })
    );

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[0].path).toBe("/api/v1/auth/bootstrap");
    expect(calls[0].body).toEqual({ token: "tok" });
  });

  it("explains a refusal while the proxy gives no site admin rights", async () => {
    setup(() => problem(403, "bootstrap.proxyAdminsOff"), {
      proxyPerson: { name: "Ada" },
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Become site admin" })
    );

    expect(await screen.findByText(/SB_DISABLE_PROXY_SIGN_IN/)).toBeTruthy();
  });
});

describe("the bootstrap page", { tags: ["015-US6"] }, () => {
  it("makes an existing person the site admin", async () => {
    const { calls, onDone } = setup(ok);

    await pick("Who are you?", "Ada");
    await userEvent.type(screen.getByLabelText("Username"), "ada");
    await userEvent.type(
      screen.getByLabelText("Password (at least 8 characters)"),
      "correct horse"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Become site admin" })
    );

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      path: "/api/v1/auth/bootstrap",
      body: {
        token: "tok",
        guestId: "g1",
        username: "ada",
        password: "correct horse",
      },
    });
  });

  it("makes a new person from a name and an email", async () => {
    const { calls } = setup(ok);

    await pick("Who are you?", "Someone new");
    await userEvent.type(screen.getByLabelText("Name"), "Grace");
    await userEvent.type(screen.getByLabelText("Email"), "grace@example.org");
    await userEvent.type(screen.getByLabelText("Username"), "grace");
    await userEvent.type(
      screen.getByLabelText("Password (at least 8 characters)"),
      "correct horse"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Become site admin" })
    );

    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toEqual({
      token: "tok",
      name: "Grace",
      email: "grace@example.org",
      username: "grace",
      password: "correct horse",
    });
  });

  it("says why a spent link was refused", async () => {
    setup(() =>
      problem(
        403,
        "bootstrap.tokenWrong",
        "This link is invalid, expired or already used"
      )
    );
    await pick("Who are you?", "Ada");
    await userEvent.type(screen.getByLabelText("Username"), "ada");
    await userEvent.type(
      screen.getByLabelText("Password (at least 8 characters)"),
      "correct horse"
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Become site admin" })
    );

    expect((await screen.findByRole("alert")).textContent).toContain(
      "invalid, expired or already used"
    );
  });

  it("explains a page opened without a link", () => {
    setup(ok, { token: undefined });

    expect(screen.getByText(/This link is invalid/)).toBeTruthy();
    expect(screen.queryByLabelText("Who are you?")).toBeNull();
  });
});
