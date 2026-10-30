// @module-tag 002-US2
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { EventSummary } from "../../app/use-events";
import { snapshot } from "../../replica/snapshot-fixture";
import { EventListScreen } from "./event-list-screen";

afterEach(cleanup);

const event = (patch: Partial<EventSummary>): EventSummary => ({
  ...snapshot.event,
  ...patch,
});

const site = { title: "Unconf Hub", description: "All **our** events" };

describe("the event list", () => {
  it("shows the site and each event, soonest first, with a link to it", () => {
    render(
      <EventListScreen
        site={site}
        events={[
          event({
            slug: "late",
            name: "Late con",
            firstDayStart: "2026-09-10T08:00:00Z",
            lastDayStart: "2026-09-12T08:00:00Z",
          }),
          event({
            slug: "early",
            name: "Early con",
            description: "Come _early_",
            website: "https://early.example",
            firstDayStart: "2026-06-01T08:00:00Z",
            lastDayStart: "2026-06-01T08:00:00Z",
          }),
          event({ slug: "tbd", name: "Undated con", firstDayStart: null }),
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: "Unconf Hub" })).toBeTruthy();
    expect(screen.getByText("our").tagName).toBe("STRONG");
    const names = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    expect(names).toEqual(["Early con", "Late con", "Undated con"]);
    const early = screen.getByText("Early con").parentElement as HTMLElement;
    expect(within(early).getByText("Jun 1")).toBeTruthy();
    expect(
      within(early)
        .getByRole("link", { name: "https://early.example" })
        .getAttribute("href")
    ).toBe("https://early.example");
    expect(
      within(early)
        .getByRole("link", { name: "View event" })
        .getAttribute("href")
    ).toBe("/early");
    expect(
      within(
        screen.getByText("Late con").parentElement as HTMLElement
      ).getByText("Sep 10 - Sep 12")
    ).toBeTruthy();
  });
});
