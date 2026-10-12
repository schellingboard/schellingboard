// @module-tag 012-US5
import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { snapshot as base } from "../replica/snapshot-fixture";
import { GridView } from "./grid-view";
import {
  dataOf,
  entriesOf,
  iso,
  renderScheduled,
  snapshotWith,
} from "./test-support";

const kai = {
  id: "kai",
  name: "Kai",
  avatarUrl: null,
  aboutMe: null,
  authProtected: false,
  profileVersion: 1,
};

const meeting = (
  id: string,
  hour: number,
  status = "accepted",
  other = "kai",
  minutes = 30
) => ({
  id,
  eventId: "e",
  requesterId: "mia",
  recipientId: other,
  slotStart: iso(hour),
  slotEnd: new Date(Date.parse(iso(hour)) + minutes * 60_000).toISOString(),
  meetingPoint: "Coffee bar",
  message: "",
  cancelNote: "",
  status: status as "accepted",
  createdAt: iso(0),
  respondedAt: null,
});

function withMe(
  meetings: ReturnType<typeof meeting>[],
  availability: string[] = [],
  guests = [kai]
): Snapshot {
  return snapshotWith({
    me: { ...base.me!, meetings, meetingGuests: guests, availability },
  });
}

function Grid({ snapshot, now }: { snapshot: Snapshot; now: Date }) {
  const data = dataOf(snapshot, now);
  return (
    <GridView
      entries={entriesOf(data)}
      locations={data.locations}
      timezone="UTC"
      toolbar={null}
      filterBar={null}
      footer={null}
      scrollerRef={createRef<HTMLDivElement>()}
      defaultFolded={new Set()}
      unfolded={new Set()}
      onToggleFold={() => {}}
      filtering={false}
      statusHeight={0}
      matching={0}
    />
  );
}

const at9 = new Date(iso(9));

function show(snapshot: Snapshot, now = at9) {
  return renderScheduled(<Grid snapshot={snapshot} now={now} />, {
    snapshot,
    now,
  });
}

describe("the 1-on-1 column", () => {
  it("is absent for a viewer with no 1-on-1s and no declared availability", () => {
    show(withMe([]));
    expect(screen.queryByRole("heading", { name: "1-on-1s" })).toBeNull();
  });

  it("shows the viewer's own meeting and opens it in the meeting modal", () => {
    show(withMe([meeting("m1", 10)]));
    expect(screen.getByRole("heading", { name: "1-on-1s" })).toBeTruthy();
    expect(screen.getByText("Only you see these")).toBeTruthy();
    const link = screen.getByRole("link", { name: /1-on-1 with Kai at 10:10/ });
    expect(link.getAttribute("aria-label")).toContain("Coffee bar — confirmed");
    expect(link.getAttribute("href")).toBe("/legacy/conf?viewMeeting=m1");
  });

  it("leaves out declined meetings", () => {
    show(withMe([meeting("m1", 10, "declined")]));
    expect(screen.queryByRole("link", { name: /1-on-1 with Kai/ })).toBeNull();
    expect(screen.queryByRole("heading", { name: "1-on-1s" })).toBeNull();
  });

  it("offers a free future slot as a way to arrange a 1-on-1, none that has begun", () => {
    show(withMe([], [iso(10), iso(11)]), new Date(iso(10)));
    expect(
      screen.queryByRole("link", { name: "Arrange a 1-on-1 at 10:10" })
    ).toBeNull();
    const free = screen.getByRole("link", {
      name: "Arrange a 1-on-1 at 11:10",
    });
    expect(free.getAttribute("href")).toBe("/legacy/conf");
  });

  it("says when a slot is one the viewer is not offering", () => {
    show(withMe([], [iso(10)]));
    expect(
      screen.getByRole("link", {
        name: "Arrange a 1-on-1 at 11:10 — you are not offering this slot to others",
      })
    ).toBeTruthy();
  });

  it("stacks 1-on-1s that share a slot, each linking to its own", () => {
    const zoe = { ...kai, id: "zoe", name: "Zoe" };
    show(
      withMe(
        [
          meeting("m1", 10, "accepted", "kai", 60),
          meeting("m2", 10, "pending", "zoe", 60),
        ],
        [],
        [kai, zoe]
      )
    );
    expect(
      screen.getByRole("link", { name: /1-on-1 with Kai at 10:10/ })
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /1-on-1 with Zoe at 10:10/ })
    ).toBeTruthy();
  });

  it("collapses a crowded slot into one control that lists them", async () => {
    const guests = ["a", "b", "c", "d", "e"].map((n) => ({
      ...kai,
      id: n,
      name: n.toUpperCase(),
    }));
    show(
      withMe(
        guests.map((g) => meeting(`m-${g.id}`, 10, "accepted", g.id)),
        [],
        guests
      )
    );
    const summary = screen.getByRole("button", {
      name: /^5 1-on-1s, 10:10 – 10:30/,
    });
    await userEvent.click(summary);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByRole("link")).toHaveLength(5);
    expect(within(dialog).getAllByRole("link")[0].getAttribute("href")).toBe(
      "/legacy/conf?viewMeeting=m-a"
    );
  });
});
