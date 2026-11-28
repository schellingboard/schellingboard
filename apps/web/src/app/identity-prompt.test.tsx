import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRequireIdentity } from "../ui/require-identity";
import { IdentityPrompt } from "./identity-prompt";
import { goToSignIn } from "./sign-in-redirect";
import { ViewerContext } from "./viewer";

vi.mock("./sign-in-redirect", () => ({ goToSignIn: vi.fn() }));

afterEach(cleanup);

const guests = [{ id: "g1", name: "Ada", authProtected: false }];

function setup(
  fixed?: { logoutUrl: string; siteAdmin: boolean },
  signInOnly = false
) {
  const then = vi.fn();
  const choose = vi.fn().mockResolvedValue({ ok: true });
  function Action() {
    const requireIdentity = useRequireIdentity();
    return (
      <>
        <button onClick={() => requireIdentity(then)}>Act</button>
        <button onClick={() => requireIdentity()}>Act without follow-up</button>
      </>
    );
  }
  render(
    <ViewerContext.Provider
      value={{
        guestId: fixed ? "g1" : null,
        fixed,
        choose,
        signOut: vi.fn(),
        refresh: vi.fn(),
      }}
    >
      <IdentityPrompt guests={guests} signInOnly={signInOnly}>
        <Action />
      </IdentityPrompt>
    </ViewerContext.Provider>
  );
  return { then };
}

describe("IdentityPrompt", () => {
  it("never opens the picker while a proxy fixes the identity", async () => {
    const { then } = setup({ logoutUrl: "", siteAdmin: false });

    await userEvent.click(screen.getByRole("button", { name: "Act" }));

    expect(then).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the name picker and continues once a name is chosen", async () => {
    const { then } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Act" }));
    expect(then).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("option", { name: "Ada" }));

    expect(then).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("option", { name: "Ada" })).toBeNull();
  });

  it("does not run an earlier follow-up for a later request", async () => {
    const { then } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Act" }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(
      screen.getByRole("button", { name: "Act without follow-up" })
    );
    await userEvent.click(screen.getByRole("option", { name: "Ada" }));

    expect(then).not.toHaveBeenCalled();
  });

  it("sends a verified event's visitor to sign in, with no list of names", async () => {
    const { then } = setup(undefined, true);

    await userEvent.click(screen.getByRole("button", { name: "Act" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("Ada")).toBeNull();
    expect(then).not.toHaveBeenCalled();
    expect(goToSignIn).toHaveBeenCalledWith();
  });
});
