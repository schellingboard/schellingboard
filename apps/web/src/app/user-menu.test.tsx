import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "./user-menu";
import { hardNavigate, hardReload } from "./hard-navigate";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

const guests = [
  { id: "g1", name: "Ada", authProtected: false },
  { id: "g2", name: "Grace", authProtected: true },
  { id: "g3", name: "Alan", authProtected: false },
];

type Choose = (
  id: string
) => Promise<{ ok: true } | { ok: false; code: string }>;

function setup({
  guestId = null as string | null,
  choose = vi.fn<Choose>().mockResolvedValue({ ok: true }),
  signOut = vi.fn().mockResolvedValue(undefined),
} = {}) {
  render(<UserMenu viewer={{ guestId, choose, signOut }} guests={guests} />);
  return { choose, signOut, user: userEvent.setup() };
}

describe("UserMenu", () => {
  beforeEach(() => vi.clearAllMocks());

  it("asks an anonymous visitor to select a name", async () => {
    const { user, choose } = setup();

    await user.click(screen.getByRole("button", { name: "Your name" }));
    const dialog = screen.getByRole("dialog", { name: "My name is" });
    await user.click(within(dialog).getByRole("button", { name: "Alan" }));

    expect(choose).toHaveBeenCalledWith("g3");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("filters the names by what is typed", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Your name" }));

    await user.type(
      screen.getByRole("searchbox", { name: "Find your name" }),
      "gr"
    );

    expect(screen.queryByRole("button", { name: "Alan" })).toBeNull();
    expect(screen.getByRole("button", { name: /Grace/ })).toBeTruthy();
  });

  it("sends a protected name to the legacy login", async () => {
    const { user, choose } = setup({
      choose: vi
        .fn<Choose>()
        .mockResolvedValue({ ok: false, code: "guest.protected" }),
    });
    await user.click(screen.getByRole("button", { name: "Your name" }));

    await user.click(screen.getByRole("button", { name: /Grace/ }));

    expect(choose).toHaveBeenCalledWith("g2");
    expect(hardNavigate).toHaveBeenCalledWith("/legacy/auth/login?guest=g2");
  });

  it("says so when the name cannot be chosen", async () => {
    const { user } = setup({
      choose: vi
        .fn<Choose>()
        .mockResolvedValue({ ok: false, code: "guest.notFound" }),
    });
    await user.click(screen.getByRole("button", { name: "Your name" }));

    await user.click(screen.getByRole("button", { name: "Alan" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /try again/i
    );
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it("shows the chosen name with links to the legacy profile pages", async () => {
    const { user } = setup({ guestId: "g1" });

    await user.click(screen.getByRole("button", { name: "Your name: Ada" }));

    const href = (name: string) =>
      screen.getByRole("link", { name }).getAttribute("href");
    expect(href("My profile")).toBe("/legacy/guests/g1");
    expect(href("Edit profile")).toBe("/legacy/guests/edit");
    expect(href("Settings")).toBe("/legacy/settings");
  });

  it("logs out and reloads the page", async () => {
    const { user, signOut } = setup({ guestId: "g1" });
    await user.click(screen.getByRole("button", { name: "Your name: Ada" }));

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(signOut).toHaveBeenCalled();
    expect(hardReload).toHaveBeenCalled();
  });

  it("says so when logging out fails, and stays on the page", async () => {
    const { user } = setup({
      guestId: "g1",
      signOut: vi.fn().mockRejectedValue(new TypeError("offline")),
    });
    await user.click(screen.getByRole("button", { name: "Your name: Ada" }));

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /try again/i
    );
    expect(hardReload).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Log out" })).toBeTruthy();
  });

  it("shows nothing while the viewer is unknown", () => {
    render(
      <UserMenu
        viewer={{ guestId: undefined, choose: vi.fn(), signOut: vi.fn() }}
        guests={guests}
      />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
