import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FakeCall } from "../commands/fake-api";
import { open } from "./page-test-support";

const hardNavigate = vi.hoisted(() => vi.fn());
vi.mock("./hard-navigate", () => ({ hardNavigate, hardReload: vi.fn() }));

afterEach(() => {
  cleanup();
  hardNavigate.mockClear();
});
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});

let title = "Con";

const event = {
  id: "e1",
  slug: "con",
  name: "Spring Con",
  description: "",
  website: "",
  timezone: "Europe/Berlin",
  firstDayStart: "2030-05-01T08:00:00Z",
  lastDayStart: "2030-05-03T08:00:00Z",
  version: 1,
};

const guest = (id: string, name: string, eventIds: string[]) => ({
  id,
  name,
  email: `${name.toLowerCase()}@example.com`,
  eventIds,
  version: 1,
});

const answers = (call: FakeCall): Response | undefined => {
  if (call.path === "/api/v1/admin/settings" && call.method === "PUT")
    return Response.json({
      title: "Renamed",
      description: "",
      mapImageUrl: "",
    });
  if (call.path === "/api/v1/admin/settings") {
    return Response.json({ title, description: "", mapImageUrl: "" });
  }
  if (call.path === "/api/v1/events")
    return Response.json({ events: [event], now: "2030-01-01T00:00:00Z" });
  if (call.path === "/api/v1/events/e1")
    return Response.json({ event, days: [] });
  if (call.path === "/api/v1/admin/guests")
    return Response.json({
      items: [guest("g1", "Alice", ["e1"]), guest("g2", "Bob", [])],
      nextCursor: null,
    });
  return undefined;
};

describe("the admin pages", { tags: ["015-US1"] }, () => {
  beforeEach(() => {
    title = "Con";
  });

  it("opens the events list from the admin home", async () => {
    const { router } = await open({ handler: answers, path: "/admin" });

    expect(await screen.findByText("Spring Con")).toBeTruthy();
    expect(router.history.location.pathname).toBe("/admin/events");
  });

  it("moves between admin pages without leaving the app", async () => {
    await open({ handler: answers, path: "/admin/events" });

    await userEvent.click(
      within(
        await screen.findByRole("navigation", { name: "Admin" })
      ).getByRole("link", { name: "Users" })
    );

    expect(await screen.findByText("alice@example.com")).toBeTruthy();
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it("shows an event's tab with the event's own guests marked", async () => {
    await open({ handler: answers, path: "/admin/events/e1/guests" });

    expect(
      await screen.findByRole("heading", { name: "Spring Con" })
    ).toBeTruthy();
    expect(
      (await screen.findAllByText("bob@example.com")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Guests" }).getAttribute("aria-current")
    ).toBe("page");
  });

  it("shows a new site title in the header after the settings are saved", async () => {
    await open({ handler: answers, path: "/admin/settings" });
    await screen.findByRole("heading", { name: "Settings" });

    title = "Renamed";
    await userEvent.click(
      screen.getByRole("button", { name: "Save settings" })
    );

    expect(
      await screen.findByRole("link", { name: "Renamed Admin" })
    ).toBeTruthy();
  });

  it("hands the admin login to the legacy app", async () => {
    await open({ handler: answers, path: "/admin/login" });

    await vi.waitFor(() =>
      expect(hardNavigate).toHaveBeenCalledWith("/legacy/admin/login")
    );
  });
});
