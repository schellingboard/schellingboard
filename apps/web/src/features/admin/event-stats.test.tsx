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

  it("shows the Sessions section with its charts and a No data state", async () => {
    const col = (key: string, type: "text" | "integer" = "integer") => ({
      key,
      label: key,
      type,
    });
    const sessionStats: EventStatistics = {
      ...stats,
      tables: [
        ...stats.tables,
        {
          id: "sessions-table",
          title: "Sessions",
          columns: [
            col("title", "text"),
            col("rsvps"),
            col("reported"),
            col("interest"),
            col("parallel"),
            col("predicted"),
            col("low50"),
            col("high50"),
            col("low80"),
            col("high80"),
          ],
          rows: [
            ["Opening", 30, 20, 50, 1, 18, 12, 26, 8, 40],
            ["Closing", 10, null, null, 2, null, null, null, null, null],
          ],
        },
        {
          id: "sessions-duration",
          title: "Session duration",
          columns: [col("from"), col("to"), col("sessions")],
          rows: [],
        },
      ],
    };
    renderScreen("section=sessions", { stats: sessionStats });

    expect(
      await screen.findByRole("img", {
        name: "Most RSVPed sessions: Opening 30, Closing 10",
      })
    ).toBeTruthy();
    expect(
      screen.getByRole("img", { name: /Reported attendees against RSVPs/ })
    ).toBeTruthy();
    expect(
      screen.getByRole("img", { name: /RSVPs against Parallel sessions/ })
    ).toBeTruthy();
    const duration = screen.getByRole("table", { name: "Session duration" });
    expect(within(duration).getByText("No data")).toBeTruthy();
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

describe("predicted attendance", { tags: ["021-US4"] }, () => {
  it("draws predicted against reported attendance with its basis", async () => {
    const col = (key: string) => ({
      key,
      label: key,
      type: "integer" as const,
    });
    renderScreen("section=sessions", {
      stats: {
        ...stats,
        tables: [
          {
            id: "sessions-table",
            title: "Sessions",
            columns: [
              "reported",
              "predicted",
              "low50",
              "high50",
              "low80",
              "high80",
            ].map(col),
            rows: [[20, 18, 12, 26, 8, 40]],
          },
        ],
      },
    });

    expect(
      await screen.findByRole("img", {
        name: "Predicted against reported attendance, 1 session",
      })
    ).toBeTruthy();
    expect(screen.getByText(/fitted on one event, n = 13/)).toBeTruthy();
  });
});

describe("proposal charts", { tags: ["021-US1"] }, () => {
  it("draws interest, lateness, timeline, voter and conversion charts", async () => {
    const c = (
      key: string,
      type: "text" | "integer" | "number" | "boolean" = "integer"
    ) => ({
      key,
      label: key,
      type,
    });
    renderScreen("section=proposals", {
      stats: {
        ...stats,
        tables: [
          {
            id: "proposals-table",
            title: "Proposals",
            columns: [
              c("title", "text"),
              c("daysIn", "number"),
              c("interested"),
              c("voters"),
              c("session", "boolean"),
            ],
            rows: [
              ["Talk A", 0, 5, 8, true],
              ["Talk B", 2, 3, 6, false],
            ],
          },
          {
            id: "proposals-over-time",
            title: "Proposals over time",
            columns: [c("day", "text"), c("proposals")],
            rows: [
              ["2026-01-01", 1],
              ["2026-01-02", 0],
              ["2026-01-03", 1],
            ],
          },
          {
            id: "proposals-voters",
            title: "Votes per voter",
            columns: [c("voter", "text"), c("total"), c("interestedShare")],
            rows: [
              ["P001", 3, 100],
              ["P002", 1, 0],
            ],
          },
          {
            id: "proposals-conversion",
            title: "Conversion to sessions by interest",
            columns: [
              c("group", "text"),
              c("proposals"),
              c("sessions"),
              c("share"),
            ],
            rows: [["Top quarter", 1, 1, 100]],
          },
        ],
      },
    });

    for (const name of [
      "Most popular proposals: Talk A 5, Talk B 3",
      "Voters against Days after the first proposal, 2 proposals",
      "Proposals created per day",
      "Votes per voter, 2 voters",
      "Share interested per voter, 2 voters",
      "Share that became a session: Top quarter 100",
    ])
      expect(await screen.findByRole("img", { name })).toBeTruthy();
  });
});

describe("attendee charts", { tags: ["021-US1"] }, () => {
  it("draws RSVPs per attendee and the gaps between sessions", async () => {
    const c = (key: string, type: "text" | "integer" = "integer") => ({
      key,
      label: key,
      type,
    });
    renderScreen("section=attendees", {
      stats: {
        ...stats,
        tables: [
          {
            id: "attendees-table",
            title: "RSVPs per attendee",
            columns: [c("attendee", "text"), c("rsvps")],
            rows: [
              ["P001", 5],
              ["P002", 1],
            ],
          },
          {
            id: "attendees-gaps",
            title: "Gaps between RSVPed sessions",
            columns: [c("gap", "text"), c("gaps")],
            rows: [
              ["Back to back", 4],
              ["More than 2 h", 2],
            ],
          },
        ],
      },
    });

    expect(screen.getByText(/RSVPs are intent, not attendance/)).toBeTruthy();
    expect(
      await screen.findByRole("img", { name: "RSVPs per attendee, 2 people" })
    ).toBeTruthy();
    expect(
      await screen.findByRole("img", {
        name: "Gaps between RSVPed sessions: Back to back 4, More than 2 h 2",
      })
    ).toBeTruthy();
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
