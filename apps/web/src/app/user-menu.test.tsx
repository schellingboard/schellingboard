import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "./user-menu";
import { hardNavigate, hardReload } from "./hard-navigate";
import { endSiteSession } from "./site-session";

vi.mock("./site-session", () => ({ endSiteSession: vi.fn() }));
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
  render(
    <UserMenu
      viewer={{ guestId, choose, signOut, refresh: vi.fn() }}
      guests={guests}
    />
  );
  return { choose, signOut, user: userEvent.setup() };
}

describe("UserMenu", () => {
  beforeEach(() => vi.clearAllMocks());

  it("asks an anonymous visitor to select a name", async () => {
    const { user, choose } = setup();

    await user.click(screen.getByRole("button", { name: "Your name" }));
    const dialog = screen.getByRole("dialog", { name: "Who are you?" });
    await user.click(within(dialog).getByRole("option", { name: "Alan" }));

    expect(choose).toHaveBeenCalledWith("g3");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("filters the names by what is typed", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Your name" }));

    await user.type(
      screen.getByRole("combobox", { name: "My name is:" }),
      "gr"
    );

    expect(screen.queryByRole("option", { name: "Alan" })).toBeNull();
    expect(screen.getByRole("option", { name: /Grace/ })).toBeTruthy();
  });

  describe("name picker keyboard", () => {
    const open = async () => {
      const ctx = setup();
      await ctx.user.click(screen.getByRole("button", { name: "Your name" }));
      return {
        ...ctx,
        input: screen.getByRole("combobox", { name: "My name is:" }),
      };
    };
    const activeName = (input: HTMLElement) => {
      const id = input.getAttribute("aria-activedescendant");
      return id ? document.getElementById(id)?.textContent : undefined;
    };

    it("moves through the names with the arrow keys, wrapping at the ends", async () => {
      const { user, input } = await open();

      await user.keyboard("{ArrowDown}");
      expect(activeName(input)).toBe("Ada");
      await user.keyboard("{ArrowDown}{ArrowDown}");
      expect(activeName(input)).toBe("Alan");
      await user.keyboard("{ArrowDown}");
      expect(activeName(input)).toBe("Ada");
      await user.keyboard("{ArrowUp}");
      expect(activeName(input)).toBe("Alan");
    });

    it("jumps to the first and last name with Home and End", async () => {
      const { user, input } = await open();

      await user.keyboard("{End}");
      expect(activeName(input)).toBe("Alan");
      await user.keyboard("{Home}");
      expect(activeName(input)).toBe("Ada");
    });

    it("picks the active name with Enter", async () => {
      const { user, choose } = await open();

      await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");

      expect(choose).toHaveBeenCalledWith("g3");
    });

    it("makes the first match active as soon as something is typed", async () => {
      const { user, input, choose } = await open();

      await user.type(input, "gr");
      expect(activeName(input)).toBe("Grace(password)");
      await user.keyboard("{Enter}");

      expect(choose).toHaveBeenCalledWith("g2");
    });

    it("marks the active option selected and keeps options out of the tab order", async () => {
      const { user } = await open();

      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(options[0].getAttribute("aria-selected")).toBe("true");
      expect(options[1].getAttribute("aria-selected")).toBe("false");
      for (const o of options) expect(o.getAttribute("tabindex")).toBe("-1");
    });

    it("makes the hovered option active", async () => {
      const { user, input } = await open();

      await user.hover(screen.getByRole("option", { name: "Alan" }));

      expect(activeName(input)).toBe("Alan");
    });

    it("ignores the arrow keys when nothing matches", async () => {
      const { user, input, choose } = await open();

      await user.type(input, "zzz");
      await user.keyboard("{ArrowDown}{End}{Enter}");

      expect(input.getAttribute("aria-activedescendant")).toBeNull();
      expect(choose).not.toHaveBeenCalled();
    });

    it("starts with no active name when the picker is opened again", async () => {
      const { user, input } = await open();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Escape}");

      await user.click(screen.getByRole("button", { name: "Your name" }));

      expect(
        screen
          .getByRole("combobox", { name: "My name is:" })
          .getAttribute("aria-activedescendant")
      ).toBeNull();
      expect(input.isConnected).toBe(false);
    });

    it("does nothing on Enter when no name is active", async () => {
      const { user, choose } = await open();

      await user.keyboard("{Enter}");

      expect(choose).not.toHaveBeenCalled();
    });
  });

  it("sends a protected name to the legacy login", async () => {
    const { user, choose } = setup({
      choose: vi
        .fn<Choose>()
        .mockResolvedValue({ ok: false, code: "guest.protected" }),
    });
    await user.click(screen.getByRole("button", { name: "Your name" }));

    await user.click(screen.getByRole("option", { name: /Grace/ }));

    expect(choose).toHaveBeenCalledWith("g2");
    expect(hardNavigate).toHaveBeenCalledWith("/auth/login?guest=g2");
  });

  it("says so when the name cannot be chosen", async () => {
    const { user } = setup({
      choose: vi
        .fn<Choose>()
        .mockResolvedValue({ ok: false, code: "guest.notFound" }),
    });
    await user.click(screen.getByRole("button", { name: "Your name" }));

    await user.click(screen.getByRole("option", { name: "Alan" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /try again/i
    );
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it("shows the chosen name with links to the legacy profile pages", async () => {
    const { user } = setup({ guestId: "g1" });

    await user.click(screen.getByRole("button", { name: "Your name: Ada" }));

    const href = (name: string) =>
      screen.getByRole("menuitem", { name }).getAttribute("href");
    expect(href("My profile")).toBe("/guests/g1");
    expect(href("Edit profile")).toBe("/guests/edit");
    expect(href("Settings")).toBe("/settings");
  });

  it("closes after a link is followed, which may leave the page in place", async () => {
    const { user } = setup({ guestId: "g1" });
    await user.click(screen.getByRole("button", { name: "Your name: Ada" }));

    await user.click(screen.getByRole("menuitem", { name: "My profile" }));

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("logs out and reloads the page", async () => {
    const { user, signOut } = setup({ guestId: "g1" });
    await user.click(screen.getByRole("button", { name: "Your name: Ada" }));

    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(signOut).toHaveBeenCalled();
    expect(endSiteSession).toHaveBeenCalled();
    expect(hardReload).toHaveBeenCalled();
  });

  it("says so when logging out fails, and stays on the page", async () => {
    const { user } = setup({
      guestId: "g1",
      signOut: vi.fn().mockRejectedValue(new TypeError("offline")),
    });
    await user.click(screen.getByRole("button", { name: "Your name: Ada" }));

    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /try again/i
    );
    expect(hardReload).not.toHaveBeenCalled();
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeTruthy();
  });

  it("shows nothing while the viewer is unknown", () => {
    render(
      <UserMenu
        viewer={{
          guestId: undefined,
          choose: vi.fn(),
          signOut: vi.fn(),
          refresh: vi.fn(),
        }}
        guests={guests}
      />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers no name to pick while the names are still loading", () => {
    render(
      <UserMenu
        viewer={{
          guestId: "g1",
          choose: vi.fn(),
          signOut: vi.fn(),
          refresh: vi.fn(),
        }}
        guests={undefined}
      />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
