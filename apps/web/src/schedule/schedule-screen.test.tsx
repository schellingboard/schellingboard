import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { snapshot as base, iso } from "../replica/snapshot-fixture";
import { legacyScheduleLinks } from "./links";
import { ScheduleScreen, type ScheduleActions } from "./schedule-screen";

const sessionOf = (
  id: string,
  title: string,
  hostIds: string[],
  locationIds: string[],
  startHour = 9
) => ({
  ...base.sessions[0],
  id,
  title,
  hostIds,
  locationIds,
  startTime: iso(startHour),
  endTime: iso(startHour + 1),
});

const second = {
  ...base.locations[0],
  id: "r2",
  name: "Barn",
  sortIndex: 1,
};

const snap: Snapshot = {
  ...base,
  locations: [base.locations[0], second],
  sessions: [
    sessionOf("s", "Talk", ["host"], ["r"]),
    sessionOf("w", "Workshop", ["host"], ["r2"], 11),
  ],
  counts: { s: 4, w: 1 },
  unavailability: [],
};

function fakeActions(
  result: Awaited<ReturnType<ScheduleActions["toggleRsvp"]>> = { ok: true }
) {
  return {
    toggleRsvp: vi.fn<ScheduleActions["toggleRsvp"]>(() =>
      Promise.resolve(result)
    ),
    pickName: vi.fn<ScheduleActions["pickName"]>(),
    attendees: vi.fn<ScheduleActions["attendees"]>(),
    attendeeCount: {
      load: vi.fn(),
      save: vi.fn(),
    },
    comments: vi.fn<ScheduleActions["comments"]>(),
  };
}

function screenAt(
  params = "",
  {
    snapshot = snap,
    now = new Date(iso(9)),
    actions = fakeActions(),
  }: { snapshot?: Snapshot; now?: Date; actions?: ScheduleActions } = {}
) {
  const onParamsChange = vi.fn<(params: URLSearchParams) => void>();
  render(
    <ScheduleScreen
      snapshot={snapshot}
      now={now}
      links={legacyScheduleLinks(snapshot.event.slug)}
      params={new URLSearchParams(params)}
      onParamsChange={onParamsChange}
      sync={<span>Live</span>}
      footer={<footer>Footer</footer>}
      onReload={() => {}}
      actions={actions}
    />
  );
  return { onParamsChange };
}

const scrollIntoView = vi.fn();

afterEach(() => sessionStorage.clear());

beforeEach(() => {
  Element.prototype.scrollIntoView = scrollIntoView as never;
  Element.prototype.scrollTo = vi.fn() as never;
});

describe("ScheduleScreen views", () => {
  it(
    "opens on the grid and switches the view through the params",
    { tags: ["007-US1"] },
    async () => {
      const { onParamsChange } = screenAt();
      expect(
        screen
          .getByRole("button", { name: "Grid" })
          .getAttribute("aria-pressed")
      ).toBe("true");
      await userEvent.click(screen.getByRole("button", { name: "Agenda" }));
      expect(onParamsChange.mock.calls[0][0].toString()).toBe("view=agenda");
    }
  );

  it("lists the day's sessions under their start times in the agenda", () => {
    screenAt("view=agenda");
    expect(
      screen.getByRole("heading", { name: "Monday, June 15", level: 2 })
    ).toBeTruthy();
    const nine = screen.getByRole("region", { name: "09:00" });
    const link = within(nine).getByRole("link", { name: /Talk/ });
    expect(link.getAttribute("href")).toBe(
      "/legacy/conf?view=agenda&viewSession=s"
    );
    expect(within(nine).getByText(/Room · until 10:00/)).toBeTruthy();
    expect(screen.getByText("Now · 09:00")).toBeTruthy();
  });

  it("marks the now line before what is yet to start", () => {
    screenAt("view=agenda", { now: new Date(iso(10)) });
    const marker = screen.getByTestId("now-line");
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(marker.textContent).toContain("Now · 10:00");
    expect(headings.map((h) => h.textContent)).toEqual(["09:00", "11:00"]);
  });

  it("narrows the rooms to ?loc=", () => {
    screenAt("loc=Barn");
    expect(screen.queryByRole("heading", { name: "Room" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Barn" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Workshop" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Talk" })).toBeNull();
  });
});

describe("ScheduleScreen search and filters", () => {
  it(
    "ghosts what a search passes over and says how much matches",
    { tags: ["007-US3"] },
    async () => {
      screenAt();
      await userEvent.type(
        screen.getByRole("searchbox", { name: "Search sessions" }),
        "work"
      );
      const status = await screen.findByText(/1 of 2 match/);
      expect(status.textContent).toContain('"work"');
      expect(
        screen.getByRole("link", { name: /Talk.*doesn't match/ })
      ).toBeTruthy();
      expect(screen.getByRole("link", { name: "Workshop" })).toBeTruthy();
      await userEvent.click(screen.getByRole("button", { name: "Show all" }));
      expect(screen.queryByText(/of 2 match/)).toBeNull();
    }
  );

  it("filters to the viewer's own sessions from the params", () => {
    screenAt("filter=rsvpd");
    expect(screen.getByText(/1 of 2 match · RSVP'd/)).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "RSVP'd" })
        .getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("turns a chip into a param", async () => {
    const { onParamsChange } = screenAt();
    await userEvent.click(screen.getByRole("button", { name: "Hosting" }));
    expect(onParamsChange.mock.calls[0][0].get("filter")).toBe("hosting");
  });

  it("offers no chips without a viewer", () => {
    screenAt("filter=hosting", { snapshot: { ...snap, me: null } });
    expect(screen.queryByRole("group", { name: "Filter sessions" })).toBeNull();
    expect(screen.queryByText(/match/)).toBeNull();
  });

  it("steps through matches in reading order", async () => {
    screenAt();
    const search = screen.getByRole("searchbox", { name: "Search sessions" });
    await userEvent.type(search, "o");
    await screen.findByText(/2 of 2 match/);
    await userEvent.type(search, "{Enter}");
    const stepper = await screen.findByRole("group", {
      name: "Step through matches",
    });
    expect(scrollIntoView).toHaveBeenCalled();
    expect(within(stepper).getByText(/^1\//)).toBeTruthy();
    await userEvent.click(
      within(stepper).getByRole("button", { name: "Next match" })
    );
    expect(within(stepper).getByText(/^2\//)).toBeTruthy();
  });
});

describe("ScheduleScreen scrolling", () => {
  it("returns to where each view was left", { tags: ["007-US1"] }, () => {
    sessionStorage.setItem(
      "schedule-scroll:conf:agenda",
      JSON.stringify({ left: 0, top: 500 })
    );
    screenAt("view=agenda");
    expect(screen.getByTestId("schedule-scroll").scrollTop).toBe(500);
    cleanup();
    screenAt();
    expect(screen.getByTestId("schedule-scroll").scrollTop).toBe(0);
  });
});

describe("ScheduleScreen toolbar", () => {
  it(
    "offers Now only while the event is running",
    { tags: ["007-US4"] },
    () => {
      screenAt();
      expect(screen.getByRole("button", { name: "Now" })).toBeTruthy();
    }
  );

  it("hides Now outside the event", () => {
    screenAt("", { now: new Date(Date.UTC(2026, 5, 20)) });
    expect(screen.queryByRole("button", { name: "Now" })).toBeNull();
  });

  it(
    "shows the event's dates, zone and description in a dialog",
    { tags: ["007-US6"] },
    async () => {
      const withText: Snapshot = {
        ...snap,
        event: { ...snap.event, description: "Bring **a mug**." },
      };
      screenAt("", { snapshot: withText });
      await userEvent.click(
        screen.getByRole("button", { name: "Event details" })
      );
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText(/Jun 15 · UTC/)).toBeTruthy();
      expect(within(dialog).getByText("a mug").tagName).toBe("STRONG");
    }
  );

  it("links the proposals only for an event with phases", () => {
    const phaseless: Snapshot = {
      ...snap,
      event: { ...snap.event, schedulingPhaseStart: null },
    };
    screenAt("", { snapshot: phaseless });
    expect(screen.queryByRole("link", { name: "Proposals" })).toBeNull();
    const phased: Snapshot = {
      ...snap,
      event: { ...snap.event, proposalPhaseStart: iso(0) },
    };
    cleanup();
    screenAt("", { snapshot: phased });
    expect(
      screen.getByRole("link", { name: "Proposals" }).getAttribute("href")
    ).toBe("/legacy/conf/proposals");
  });

  it("shows the sync slot and footer inside the scrolling content", () => {
    screenAt();
    const scroller = screen.getByTestId("schedule-scroll");
    expect(within(scroller).getByText("Live")).toBeTruthy();
    expect(within(scroller).getByText("Footer")).toBeTruthy();
  });
});

describe("ScheduleScreen day folds", () => {
  const twoDays: Snapshot = {
    ...snap,
    days: [
      ...snap.days,
      {
        ...snap.days[0],
        id: "d2",
        start: new Date(Date.UTC(2026, 5, 16, 8)).toISOString(),
        end: new Date(Date.UTC(2026, 5, 16, 18)).toISOString(),
      },
    ],
  };

  it(
    "folds a passed day in both views and opens it from its bar",
    { tags: ["007-US1"] },
    async () => {
      const now = new Date(Date.UTC(2026, 5, 16, 9));
      screenAt("view=agenda", { snapshot: twoDays, now });
      expect(screen.queryByRole("link", { name: /Talk/ })).toBeNull();
      await userEvent.click(
        screen.getByRole("button", { name: /day has passed/ })
      );
      expect(screen.getByRole("link", { name: /Talk/ })).toBeTruthy();
    }
  );

  it("opens passed days while searching", async () => {
    const now = new Date(Date.UTC(2026, 5, 16, 9));
    screenAt("view=agenda", { snapshot: twoDays, now });
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search sessions" }),
      "talk"
    );
    expect(await screen.findByRole("link", { name: /Talk/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /day has passed/ })).toBeNull();
  });
});

describe("ScheduleScreen RSVP badge", () => {
  const overlapping: Snapshot = {
    ...snap,
    sessions: [
      sessionOf("s", "Talk", ["host"], ["r"]),
      sessionOf("w", "Workshop", ["host"], ["r2"], 9),
    ],
  };

  it("RSVPs to a session from its badge", { tags: ["009-US1"] }, async () => {
    const actions = fakeActions();
    screenAt("", { actions });
    await userEvent.click(
      screen.getByRole("button", { name: "RSVP to Workshop" })
    );
    expect(actions.toggleRsvp).toHaveBeenCalledExactlyOnceWith("w", false);
  });

  it("withdraws an RSVP from the badge", { tags: ["009-US1"] }, async () => {
    const actions = fakeActions();
    screenAt("", { actions });
    await userEvent.click(
      screen.getByRole("button", { name: "Withdraw RSVP from Talk" })
    );
    expect(actions.toggleRsvp).toHaveBeenCalledExactlyOnceWith("s", true);
  });

  it("leaves a host's own session alone", () => {
    const hosting: Snapshot = {
      ...snap,
      me: { ...snap.me!, guestId: "host", rsvps: [] },
    };
    screenAt("", { snapshot: hosting });
    expect(
      screen.queryByRole("button", { name: /^(RSVP to|Withdraw RSVP from)/ })
    ).toBeNull();
  });

  it("asks who is RSVPing when nobody is picked", async () => {
    const actions = fakeActions();
    screenAt("", { snapshot: { ...snap, me: null }, actions });
    await userEvent.click(
      screen.getByRole("button", { name: "RSVP to Workshop" })
    );
    expect(actions.pickName).toHaveBeenCalled();
    expect(actions.toggleRsvp).not.toHaveBeenCalled();
  });

  it(
    "warns before RSVPing over a session already attended",
    { tags: ["009-US3"] },
    async () => {
      const actions = fakeActions();
      screenAt("", { snapshot: overlapping, actions });
      await userEvent.click(
        screen.getByRole("button", { name: "RSVP to Workshop" })
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog.textContent).toContain(
        'This session clashes with "Talk", which you are attending. Do you want to RSVP anyway?'
      );
      expect(actions.toggleRsvp).not.toHaveBeenCalled();
      await userEvent.click(
        within(dialog).getByRole("button", { name: "Yes" })
      );
      expect(actions.toggleRsvp).toHaveBeenCalledExactlyOnceWith("w", false);
      expect(screen.queryByRole("dialog")).toBeNull();
    }
  );

  it("drops the RSVP when the warning is declined", async () => {
    const actions = fakeActions();
    screenAt("", { snapshot: overlapping, actions });
    await userEvent.click(
      screen.getByRole("button", { name: "RSVP to Workshop" })
    );
    await userEvent.click(screen.getByRole("button", { name: "No" }));
    expect(actions.toggleRsvp).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("says why an RSVP was refused", async () => {
    const actions = fakeActions({ ok: false, message: "This session is full" });
    screenAt("", { actions });
    await userEvent.click(
      screen.getByRole("button", { name: "RSVP to Workshop" })
    );
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("This session is full");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
