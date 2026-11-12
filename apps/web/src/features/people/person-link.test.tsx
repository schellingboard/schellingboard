// @module-tag 011-US6
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDirectoryQuery } from "../../queries/directory";
import { PersonCardsProvider } from "./person-cards";
import { PersonLink } from "./person-link";

const person = {
  id: "cy",
  name: "Cy",
  aboutMe: "Into bees and other small things",
  avatarUrl: null,
  pronouns: "they/them",
  basedIn: "Oslo",
  prompts: null,
  languages: null,
  contacts: null,
  profileUpdatedAt: null,
  version: 1,
  isHost: true,
  openToMeetings: false,
  authProtected: false,
};

function fakeApi() {
  const get = vi.fn(() =>
    Promise.resolve({
      data: { items: [person], nextCursor: null },
      response: { status: 200 },
    })
  );
  const api = { GET: get } as unknown as Parameters<
    typeof createDirectoryQuery
  >[0]["api"];
  return { query: createDirectoryQuery({ api }), get };
}

function setup({ hover }: { hover: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: hover && query === "(hover: hover)" }))
  );
  const { query, get } = fakeApi();
  render(
    <PersonCardsProvider query={query}>
      <PersonLink guestId="cy" href="/guests/cy" name="Cy" />
    </PersonCardsProvider>
  );
  return { get };
}

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("a person's name", () => {
  it("shows a card once hovered, with what the directory shows", async () => {
    setup({ hover: true });
    const link = screen.getByRole("link", { name: "Cy" });
    await user().hover(link);
    await vi.advanceTimersByTimeAsync(700);
    const card = await screen.findByRole("tooltip");
    expect(card.textContent).toContain("they/them · Oslo");
    expect(card.textContent).toContain("Into bees");
    expect(card.textContent).toContain("Session host");
    expect(link.getAttribute("href")).toBe("/guests/cy");
    expect(link.textContent, "the card is not part of the name").toBe("Cy");
  });

  it("keeps the card open while the pointer moves onto it", async () => {
    setup({ hover: true });
    const u = user();
    await u.hover(screen.getByRole("link", { name: "Cy" }));
    await vi.advanceTimersByTimeAsync(700);
    const card = await screen.findByRole("tooltip");
    await u.unhover(screen.getByRole("link", { name: "Cy" }));
    await u.hover(card);
    await vi.advanceTimersByTimeAsync(500);
    expect(screen.queryByRole("tooltip")).toBeTruthy();
    await u.unhover(card);
    await vi.advanceTimersByTimeAsync(500);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows a card on keyboard focus", async () => {
    setup({ hover: true });
    await user().tab();
    const card = await screen.findByRole("tooltip");
    expect(
      screen.getByRole("link", { name: "Cy" }).getAttribute("aria-describedby")
    ).toBe(card.id);
  });

  it("is a plain link on a touch screen and loads nothing", async () => {
    const { get } = setup({ hover: false });
    await user().hover(screen.getByRole("link", { name: "Cy" }));
    await vi.advanceTimersByTimeAsync(700);
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });

  it("is a plain link without the provider", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<PersonLink guestId="cy" href="/guests/cy" name="Cy" />);
    await user().hover(screen.getByRole("link", { name: "Cy" }));
    await vi.advanceTimersByTimeAsync(700);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
