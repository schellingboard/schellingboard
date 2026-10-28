import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FakeCall } from "../commands/fake-api";
import { open } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});

const person = (id: string, name: string, patch = {}) => ({
  id,
  name,
  aboutMe: null,
  avatarUrl: null,
  pronouns: null,
  basedIn: null,
  prompts: null,
  languages: null,
  contacts: null,
  profileUpdatedAt: null,
  version: 2,
  isHost: false,
  openToMeetings: false,
  authProtected: false,
  ...patch,
});

const everyone = [
  person("al", "Al", { aboutMe: "Likes bees", authProtected: true }),
  person("bo", "Bo"),
];

const answers = (call: FakeCall): Response | undefined => {
  if (call.path.startsWith("/api/v1/attendees"))
    return Response.json({ items: everyone, nextCursor: null });
  if (call.path.endsWith("/activity"))
    return Response.json({ hosting: [], proposals: [] });
  if (call.path.endsWith("/meeting-options"))
    return Response.json({ options: [] });
  if (call.path.endsWith("/comments"))
    return Response.json({ items: [], nextCursor: null });
  if (call.method === "PUT" && call.path === "/api/v1/me/profile")
    return Response.json({ ...everyone[0], version: 3 });
  return undefined;
};

describe("the people pages", { tags: ["011-US3"] }, () => {
  it("lists the attendees, and opens a profile over the list on a new history entry", async () => {
    const { router } = await open({
      handler: answers,
      path: "/guests?q=bo",
      identity: "al",
    });

    await userEvent.click(await screen.findByRole("link", { name: /^Bo/ }));

    const profile = await screen.findByRole("dialog", { name: "Bo" });
    expect(router.history.location.pathname).toBe("/guests/bo");
    expect(router.history.location.search).toBe("?q=bo");
    await userEvent.click(
      within(profile).getByRole("button", { name: "Close" })
    );
    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/guests")
    );
    expect(router.history.location.search).toBe("?q=bo");
  });

  it("offers every attendee in the name picker", async () => {
    await open({ handler: answers, path: "/guests", identity: null });

    await userEvent.click(
      await screen.findByRole("button", { name: "Your name" })
    );

    const names = await screen.findByRole("listbox", { name: "Names" });
    expect(within(names).getByText("Al")).toBeTruthy();
    expect(within(names).getByText("(password)")).toBeTruthy();
  });
});

describe("the edit-profile page", { tags: ["011-US1"] }, () => {
  it("asks to select a name first", async () => {
    await open({ handler: answers, path: "/guests/edit", identity: null });

    expect(await screen.findByText(/select who you are/)).toBeTruthy();
  });

  it("asks to log in when the chosen name is protected", async () => {
    await open({
      handler: (call) =>
        call.path === "/api/v1/me/identity" && call.method === "GET"
          ? Response.json({ guestId: null, awaitingLogin: true })
          : answers(call),
      path: "/guests/edit",
      identity: null,
    });

    expect(await screen.findByText(/This name is protected/)).toBeTruthy();
  });

  it("saves the viewer's own profile and lands on it", async () => {
    const { calls, router } = await open({
      handler: answers,
      path: "/guests/edit",
      identity: "al",
    });

    await userEvent.type(await screen.findByLabelText("Based in"), "Oslo");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/guests/al")
    );
    expect(
      calls.find((c) => c.path === "/api/v1/me/profile")?.body
    ).toMatchObject({ basedIn: "Oslo", expectedVersion: 2 });
  });
});
