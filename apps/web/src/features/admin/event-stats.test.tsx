import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EventStatistics } from "@schellingboard/contracts/stats";
import { EventStatsScreen } from "./event-stats";

afterEach(cleanup);

const stats: EventStatistics = {
  event: { id: "e1", name: "Conf", slug: "conf" },
  filterSummary: "Excluding blockers",
  filterOptions: {
    locations: [
      { id: "l1", name: "Volunteers 1" },
      { id: "l2", name: "Main Hall" },
    ],
    hosts: [{ id: "g1", name: "Olga Organizer" }],
  },
  tables: [
    {
      id: "overview-headline",
      title: "Headline numbers",
      columns: [
        { key: "figure", label: "Figure", type: "text" },
        { key: "value", label: "Value", type: "integer" },
      ],
      rows: [
        ["Members", 12],
        ["Sessions", 3],
        ["Sessions with an attendee report", null],
      ],
    },
    {
      id: "overview-funnel",
      title: "Participation funnel",
      columns: [
        { key: "step", label: "Step", type: "text" },
        { key: "members", label: "Members", type: "integer" },
        { key: "share", label: "Share of members (%)", type: "percent" },
      ],
      rows: [
        ["Members", 12, 100],
        ["Voted", 5, 41.6666],
      ],
    },
  ],
};

function renderScreen(
  query = "",
  props: Partial<Parameters<typeof EventStatsScreen>[0]> = {}
) {
  const onParams = vi.fn();
  render(
    <EventStatsScreen
      eventId="e1"
      status="ready"
      stats={stats}
      params={new URLSearchParams(query)}
      onParams={onParams}
      {...props}
    />
  );
  return { onParams };
}

const href = (link: HTMLElement) => link.getAttribute("href");
const checked = (box: HTMLElement) => (box as HTMLInputElement).checked;
const sortOf = (header: HTMLElement) => header.getAttribute("aria-sort");

const valuesOf = (table: HTMLElement) =>
  within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);

describe("the statistics screen", { tags: ["021-US1"] }, () => {
  it("shows each table with formatted cells and No data", () => {
    renderScreen();

    const table = screen.getByRole("table", { name: "Headline numbers" });
    expect(valuesOf(table)).toEqual([
      "Members",
      "Sessions",
      "Sessions with an attendee report",
    ]);
    expect(within(table).getByText("No data")).toBeTruthy();
    expect(screen.getByText("41.7%")).toBeTruthy();
  });

  it("draws the participation funnel as a chart named by its figures", async () => {
    renderScreen();

    const chart = await screen.findByRole("img", {
      name: "Participation funnel: Members 12, Voted 5",
    });
    await waitFor(() => expect(chart.querySelector("svg")).toBeTruthy());
  });

  it("sorts a table by a column, both ways", async () => {
    renderScreen();
    const table = screen.getByRole("table", { name: "Headline numbers" });

    await userEvent.click(within(table).getByRole("button", { name: "Value" }));
    expect(valuesOf(table)).toEqual([
      "Sessions",
      "Members",
      "Sessions with an attendee report",
    ]);
    expect(
      sortOf(within(table).getByRole("columnheader", { name: "Value" }))
    ).toBe("ascending");

    await userEvent.click(within(table).getByRole("button", { name: "Value" }));
    expect(valuesOf(table)).toEqual([
      "Members",
      "Sessions",
      "Sessions with an attendee report",
    ]);
    expect(
      sortOf(within(table).getByRole("columnheader", { name: "Value" }))
    ).toBe("descending");
  });

  it("says what is loading or wrong", () => {
    renderScreen("", { status: "loading", stats: undefined });
    expect(screen.getByText("Loading…")).toBeTruthy();
    cleanup();
    renderScreen("", { status: "error", stats: undefined });
    expect(screen.getByRole("alert").textContent).toBe(
      "Could not load the statistics."
    );
  });

  it("keeps the figures and the filter when a changed filter fails to load", () => {
    renderScreen("", { status: "error" });

    expect(screen.getByRole("alert").textContent).toBe(
      "Could not load the statistics."
    );
    expect(
      screen.getByRole("table", { name: "Headline numbers" })
    ).toBeTruthy();
    expect(screen.getByRole("group", { name: "Locations" })).toBeTruthy();
  });
});

describe("downloading statistics", { tags: ["021-US2"] }, () => {
  it("links each table's CSV and the ZIP, with the filter in the address", () => {
    renderScreen("excludeLocations=l1");

    expect(
      href(
        screen.getByRole("link", { name: "Download CSV of Headline numbers" })
      )
    ).toBe(
      "/api/v1/admin/events/e1/stats/overview-headline.csv?excludeLocations=l1"
    );
    expect(screen.getByRole("link", { name: "Download all" })).toBeTruthy();
  });
});

describe("the statistics filter panel", { tags: ["021-US3"] }, () => {
  it("shows the summary and the sections, keeping the filter in their links", () => {
    renderScreen("excludeLocations=l1");

    expect(screen.getByText("Excluding blockers")).toBeTruthy();
    const nav = screen.getByRole("navigation", { name: "Statistics sections" });
    expect(href(within(nav).getByRole("link", { name: "Overview" }))).toBe(
      "?excludeLocations=l1&section=overview"
    );
  });

  it("offers every location, host and origin, with blockers left out", () => {
    renderScreen();

    expect(
      within(screen.getByRole("group", { name: "Locations" })).getAllByRole(
        "checkbox"
      )
    ).toHaveLength(2);
    expect(
      checked(screen.getByRole("checkbox", { name: "Olga Organizer" }))
    ).toBe(false);
    const origins = screen.getByRole("group", { name: "Session origins" });
    expect(
      checked(within(origins).getByRole("checkbox", { name: "Blockers" }))
    ).toBe(true);
    expect(
      checked(
        within(origins).getByRole("checkbox", { name: "Organizer sessions" })
      )
    ).toBe(false);
  });

  it("puts an excluded location in the address", async () => {
    const { onParams } = renderScreen("excludeHosts=g1");

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Volunteers 1" })
    );

    expect(onParams).toHaveBeenCalledWith(
      { excludeLocations: "l1", excludeHosts: "g1", excludeOrigins: null },
      { push: false }
    );
  });

  it("takes an exclusion back out", async () => {
    const { onParams } = renderScreen("excludeLocations=l1");
    expect(
      checked(screen.getByRole("checkbox", { name: "Volunteers 1" }))
    ).toBe(true);

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Volunteers 1" })
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Blockers" }));

    expect(onParams).toHaveBeenLastCalledWith(
      { excludeLocations: "l1", excludeHosts: null, excludeOrigins: "" },
      { push: false }
    );
  });
});
