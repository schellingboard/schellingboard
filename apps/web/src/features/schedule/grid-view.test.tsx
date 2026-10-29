// @module-tag 007-US1
import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GridView } from "./grid-view";
import {
  dataOf,
  entriesOf,
  iso,
  renderScheduled,
  snapshotWith,
} from "./test-support";
import { snapshot } from "../../replica/snapshot-fixture";

function Grid({
  data,
  folded = new Set<string>(),
  unfolded = new Set<string>(),
  onToggleFold = () => {},
}: {
  data: Parameters<typeof entriesOf>[0];
  folded?: Set<string>;
  unfolded?: Set<string>;
  onToggleFold?: (id: string) => void;
}) {
  return (
    <GridView
      entries={entriesOf(data)}
      locations={data.locations}
      timezone={data.event.timezone}
      toolbar={null}
      filterBar={null}
      footer={null}
      scrollerRef={createRef<HTMLDivElement>()}
      defaultFolded={folded}
      unfolded={unfolded}
      onToggleFold={onToggleFold}
      filtering={false}
      statusHeight={0}
      matching={0}
    />
  );
}

const twoDays = snapshotWith({
  days: [
    ...snapshot.days,
    {
      ...snapshot.days[0],
      id: "d2",
      start: new Date(Date.UTC(2026, 5, 16, 8)).toISOString(),
      end: new Date(Date.UTC(2026, 5, 16, 18)).toISOString(),
      startBookings: new Date(Date.UTC(2026, 5, 16, 9)).toISOString(),
      endBookings: new Date(Date.UTC(2026, 5, 16, 17)).toISOString(),
    },
  ],
});

describe("GridView", () => {
  it("shows a column per room with its sessions linking to the session", () => {
    renderScheduled(<Grid data={dataOf()} />);
    expect(screen.getByRole("heading", { name: "Room" })).toBeTruthy();
    const link = screen.getByRole("link", { name: "Talk" });
    expect(link.getAttribute("href")).toBe("/conf?viewSession=s");
  });

  it("labels the time axis in the event's zone, not the ambient one", () => {
    const tokyo = snapshotWith({
      event: { ...snapshot.event, timezone: "Asia/Tokyo" },
    });
    renderScheduled(<Grid data={dataOf(tokyo)} />, { snapshot: tokyo });
    // The day starts at 08:00Z, which is 17:00 in Tokyo.
    expect(screen.getAllByText("17:00").length).toBeGreaterThan(0);
    expect(screen.queryByText("08:00")).toBeNull();
  });

  it("draws the now line only on the day the moment falls inside", () => {
    const data = dataOf(twoDays);
    const { unmount } = renderScheduled(<Grid data={data} />, {
      snapshot: twoDays,
      now: new Date(iso(9)),
    });
    expect(screen.getAllByTestId("now-line")).toHaveLength(1);
    unmount();
    const night = new Date(Date.UTC(2026, 5, 15, 22));
    const later = renderScheduled(<Grid data={data} />, {
      snapshot: twoDays,
      now: night,
    });
    expect(later.queryByTestId("now-line")).toBeNull();
  });

  it("folds a passed day behind a bar that opens it", async () => {
    const data = dataOf(twoDays);
    const toggled: string[] = [];
    const folded = new Set(["d"]);
    const view = renderScheduled(
      <Grid
        data={data}
        folded={folded}
        onToggleFold={(id) => toggled.push(id)}
      />,
      { snapshot: twoDays }
    );
    expect(screen.queryByRole("link", { name: "Talk" })).toBeNull();
    const bar = screen.getByRole("button", { name: /day has passed/ });
    expect(bar.textContent).toContain("Monday, June 15");
    await userEvent.click(bar);
    expect(toggled).toEqual(["d"]);
    view.unmount();
    renderScheduled(
      <Grid data={data} folded={folded} unfolded={new Set(["d"])} />,
      { snapshot: twoDays }
    );
    expect(screen.getByRole("link", { name: "Talk" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /day has passed/ })
        .getAttribute("aria-expanded")
    ).toBe("true");
  });

  it("offers an empty bookable slot as a link that adds a session there", () => {
    renderScheduled(<Grid data={dataOf()} />);
    const add = screen.getAllByRole("link", { name: "Add session" });
    const hrefs = add.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain(
      "/conf/add-session?location=Room&time=10%3A00&day=2026-06-15"
    );
    // The booked 09:00 slot and the room's unavailable 12:00 hour offer none.
    expect(hrefs.join()).not.toContain("time=09%3A00");
    expect(hrefs.join()).not.toContain("time=12%3A00");
  });

  it("describes a room by its details", () => {
    renderScheduled(<Grid data={dataOf()} />);
    expect(
      within(screen.getByRole("heading", { name: "Room" })).getByRole("button")
    ).toBeTruthy();
  });
});
