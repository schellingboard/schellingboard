// @module-tag 002-US2
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { paramsUpdater } from "../../ui/list-paging";
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
        params={new URLSearchParams()}
        onParams={vi.fn()}
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

describe("paging the event list", { tags: ["002-US2"] }, () => {
  const many = Array.from({ length: 60 }, (_, i) =>
    event({
      slug: `e${i}`,
      name: `Con ${String(i).padStart(2, "0")}`,
      firstDayStart: new Date(Date.UTC(2026, 5, i + 1, 8)).toISOString(),
    })
  );
  function Page({ start = "" }: { start?: string }) {
    const [params, setParams] = useState(new URLSearchParams(start));
    return (
      <EventListScreen
        site={site}
        events={many}
        params={params}
        onParams={paramsUpdater(params, setParams)}
      />
    );
  }
  const names = () =>
    screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

  it("shows 50 events a page and the rest on the next", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(<Page />);

    expect(names()).toHaveLength(50);
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(names()).toHaveLength(10);
    expect(names()[0]).toBe("Con 50");
    expect(scroll).toHaveBeenCalledWith({ block: "start" });
  });

  it("shows the last page for a page past the end", () => {
    render(<Page start="page=99" />);

    expect(names()).toHaveLength(10);
  });
});
