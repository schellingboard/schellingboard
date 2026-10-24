// @module-tag 007-US5
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { snapshot as base, iso } from "../replica/snapshot-fixture";
import { createObservable } from "../queries/store";
import type { AttendeesState } from "../queries/attendees";
import { legacyScheduleLinks } from "./links";
import { ScheduleScreen, type ScheduleActions } from "./schedule-screen";

const talk = base.sessions[0];

function snapshotWith(
  change: Partial<(typeof base.sessions)[number]> = {},
  { me = base.me, rsvpCapacityHardLimit = false } = {}
): Snapshot {
  return {
    ...base,
    event: { ...base.event, rsvpCapacityHardLimit },
    sessions: [{ ...talk, description: "About **talk**", ...change }],
    guests: [
      ...base.guests,
      { ...base.guests[1], id: "zed", name: "Zed" },
      { ...base.guests[1], id: "abe", name: "Abe" },
    ],
    me,
  };
}

const notMe = { ...base.me!, rsvps: [] };

function fakeAttendees(guestIds: string[]) {
  const state = createObservable<AttendeesState>({
    status: "idle",
    rsvps: [],
  });
  const refresh = vi.fn(() => {
    state.set({
      status: "ready",
      rsvps: guestIds.map((guestId) => ({
        id: guestId,
        sessionId: "s",
        guestId,
      })),
    });
    return Promise.resolve();
  });
  return {
    get: state.get,
    subscribe: state.subscribe,
    refresh,
    destroy: vi.fn(),
    state,
  };
}

function fakeActions(attendees = fakeAttendees(["zed", "abe"])) {
  return {
    toggleRsvp: vi.fn<ScheduleActions["toggleRsvp"]>(() =>
      Promise.resolve({ ok: true })
    ),
    pickName: vi.fn<ScheduleActions["pickName"]>(),
    attendees: vi.fn<ScheduleActions["attendees"]>(() => attendees),
  };
}

function open(
  snapshot: Snapshot,
  { params = "viewSession=s", actions = fakeActions() } = {}
) {
  const onParamsChange = vi.fn<(params: URLSearchParams) => void>();
  render(
    <ScheduleScreen
      snapshot={snapshot}
      now={new Date(iso(9))}
      links={legacyScheduleLinks("conf")}
      params={new URLSearchParams(params)}
      onParamsChange={onParamsChange}
      sync={null}
      footer={null}
      onReload={() => {}}
      actions={actions}
    />
  );
  return { onParamsChange, actions };
}

const dialog = () => screen.getByRole("dialog", { name: "Session details" });

beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe("the session modal", () => {
  it("is not there without viewSession", () => {
    open(snapshotWith(), { params: "" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the session's details over the schedule", () => {
    open(snapshotWith());
    const d = within(dialog());
    expect(d.getByRole("heading", { name: "Talk" })).toBeTruthy();
    expect(d.getByRole("link", { name: "HOST" }).getAttribute("href")).toBe(
      "/legacy/guests/host"
    );
    expect(d.getByText("Room")).toBeTruthy();
    expect(d.getByText("Monday 09:00 - 10:00")).toBeTruthy();
    expect(d.getByText("talk").tagName).toBe("STRONG");
  });

  it("says so for a session that is not there", () => {
    open(snapshotWith(), { params: "viewSession=nope" });
    expect(within(dialog()).getByText("Session not found.")).toBeTruthy();
  });

  it("names a closed session's rule", () => {
    open(snapshotWith({ closed: true }));
    expect(within(dialog()).getByText("Closed Session")).toBeTruthy();
  });

  it("lists who RSVPed by name, with the count out of capacity", async () => {
    open(snapshotWith(), { actions: fakeActions() });
    const d = within(dialog());
    expect(await d.findByRole("link", { name: "Abe" })).toBeTruthy();
    expect(d.getByRole("link", { name: "Zed" }).getAttribute("href")).toBe(
      "/legacy/guests/zed"
    );
    expect(d.getByText("Attendees (3 / 10):")).toBeTruthy();
  });

  it("counts the reader's own RSVP at once, without waiting for the list", async () => {
    open(snapshotWith(), { actions: fakeActions(fakeAttendees([])) });
    expect(
      await within(dialog()).findByRole("link", { name: "MIA" })
    ).toBeTruthy();
  });

  it("says it is loading until the first answer, and keeps the list while it refreshes", () => {
    const attendees = fakeAttendees(["zed"]);
    attendees.refresh.mockImplementationOnce(() => {
      attendees.state.set({ status: "loading", rsvps: [] });
      return new Promise<void>(() => {});
    });
    open(snapshotWith(), { actions: fakeActions(attendees) });
    expect(within(dialog()).getByText("Loading…")).toBeTruthy();
    expect(within(dialog()).queryByText("No attendees yet")).toBeNull();
  });

  it("lists the rooms in the event's order", () => {
    const snap = snapshotWith();
    snap.locations = [
      { ...base.locations[0], id: "a", name: "Aula", sortIndex: 0 },
      { ...base.locations[0], id: "b", name: "Barn", sortIndex: 1 },
    ];
    snap.sessions[0] = {
      ...snap.sessions[0],
      locationIds: ["b", "a"],
    };
    open(snap);
    const names = within(dialog())
      .getAllByText(/^(Aula|Barn)$/)
      .map((e) => e.textContent);
    expect(names).toEqual(["Aula", "Barn"]);
  });

  it("loads the list when it opens and lets go of the query when it closes", () => {
    const attendees = fakeAttendees(["zed"]);
    const { actions } = open(snapshotWith(), {
      actions: fakeActions(attendees),
    });
    expect(actions.attendees).toHaveBeenCalledWith("s");
    expect(attendees.refresh).toHaveBeenCalledTimes(1);
    cleanup();
    expect(attendees.destroy).toHaveBeenCalled();
  });
});

describe("the session modal's RSVP", () => {
  it("withdraws an RSVP the reader holds", { tags: ["009-US1"] }, async () => {
    const { actions } = open(snapshotWith());
    await userEvent.click(
      within(dialog()).getByRole("button", { name: "Un-RSVP" })
    );
    expect(actions.toggleRsvp).toHaveBeenCalledWith("s", true);
  });

  it("RSVPs the reader who has none", { tags: ["009-US1"] }, async () => {
    const { actions } = open(snapshotWith({}, { me: notMe }));
    await userEvent.click(
      within(dialog()).getByRole("button", { name: "RSVP" })
    );
    expect(actions.toggleRsvp).toHaveBeenCalledWith("s", false);
  });

  it("asks for a name when nobody is picked", async () => {
    const { actions } = open(snapshotWith({}, { me: null }));
    await userEvent.click(
      within(dialog()).getByRole("button", { name: "RSVP" })
    );
    expect(actions.pickName).toHaveBeenCalled();
    expect(actions.toggleRsvp).not.toHaveBeenCalled();
  });

  it("shows a refusal", async () => {
    const actions = fakeActions();
    actions.toggleRsvp.mockResolvedValue({
      ok: false,
      message: "This session is full",
    });
    open(snapshotWith(), { actions });
    await userEvent.click(
      within(dialog()).getByRole("button", { name: "Un-RSVP" })
    );
    expect(await screen.findByText("This session is full")).toBeTruthy();
  });

  it(
    "is disabled as 'Session full' when a hard limit is reached",
    { tags: ["009-US2"] },
    () => {
      const full = {
        ...snapshotWith(
          { capacity: 4 },
          { me: notMe, rsvpCapacityHardLimit: true }
        ),
      };
      open(full);
      const button = within(dialog()).getByRole("button", {
        name: "Session full",
      });
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  );

  it(
    "asks before an RSVP that clashes with another session",
    { tags: ["009-US3"] },
    async () => {
      const snap = snapshotWith({}, { me: notMe });
      snap.sessions.push({
        ...talk,
        id: "other",
        title: "Other",
        hostIds: ["mia"],
      });
      const { actions } = open(snap);
      await userEvent.click(
        within(dialog()).getByRole("button", { name: "RSVP" })
      );
      expect(actions.toggleRsvp).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("button", { name: "Yes" }));
      expect(actions.toggleRsvp).toHaveBeenCalledWith("s", false);
    }
  );

  it("closes only the clash question on Escape, not the modal under it", async () => {
    const snap = snapshotWith({}, { me: notMe });
    snap.sessions.push({
      ...talk,
      id: "other",
      title: "Other",
      hostIds: ["mia"],
    });
    const { onParamsChange } = open(snap);
    await userEvent.click(
      within(dialog()).getByRole("button", { name: "RSVP" })
    );
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Yes" })).toBeNull();
    expect(onParamsChange).not.toHaveBeenCalled();
  });

  it("has no RSVP for the host, but an edit link", () => {
    const hosting = { ...base.me!, guestId: "host", rsvps: [] };
    open(snapshotWith({}, { me: hosting }));
    const d = within(dialog());
    expect(d.queryByRole("button", { name: "RSVP" })).toBeNull();
    expect(d.getByRole("link", { name: "Edit" }).getAttribute("href")).toBe(
      "/legacy/conf/edit-session?sessionID=s"
    );
  });

  it("gives no edit link for an admin-managed session", () => {
    const hosting = { ...base.me!, guestId: "host", rsvps: [] };
    open(snapshotWith({ adminManaged: true }, { me: hosting }));
    expect(within(dialog()).queryByRole("link", { name: "Edit" })).toBeNull();
  });
});

describe("closing the session modal", () => {
  it("drops viewSession and keeps the rest", async () => {
    const { onParamsChange } = open(snapshotWith(), {
      params: "view=agenda&viewSession=s",
    });
    await userEvent.click(
      within(dialog()).getByRole("button", { name: "Close" })
    );
    expect(onParamsChange.mock.calls[0][0].toString()).toBe("view=agenda");
  });

  it("closes on Escape", async () => {
    const { onParamsChange } = open(snapshotWith());
    await userEvent.keyboard("{Escape}");
    expect(onParamsChange).toHaveBeenCalled();
  });
});

describe("the proposal a session came from", () => {
  it("links to it", () => {
    open(snapshotWith({ proposalId: "p1" }));
    expect(
      within(dialog()).getByRole("link", { name: "here" }).getAttribute("href")
    ).toBe("/legacy/conf/proposals?viewProposal=p1");
  });
});
