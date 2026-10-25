import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { iso, snapshot as base } from "../../replica/snapshot-fixture";
import { ScheduleProvider, type ScheduleActions } from "./context";
import { scheduleDataFrom } from "./data";
import { legacyScheduleLinks } from "./links";
import { createScheduleMatch, scheduleEntries } from "./model";

export { iso };

export const noMatch = createScheduleMatch({
  search: "",
  filters: [],
  guestId: null,
  rsvpd: () => false,
});

export function snapshotWith(patch: Partial<Snapshot>): Snapshot {
  return { ...base, ...patch };
}

export function renderScheduled(
  ui: ReactNode,
  {
    snapshot = base,
    now = new Date(iso(9)),
    params = new URLSearchParams(),
    actions = {},
  }: {
    snapshot?: Snapshot;
    now?: Date;
    params?: URLSearchParams;
    actions?: Partial<ScheduleActions>;
  } = {}
) {
  const data = scheduleDataFrom(snapshot, now);
  return {
    data,
    ...render(
      <ScheduleProvider
        value={{
          data,
          links: legacyScheduleLinks(snapshot.event.slug),
          params,
          openSession: () => {},
          setHash: (hash) => {
            window.location.hash = hash;
          },
          actions: {
            toggleRsvp: () => Promise.resolve(),
            pickName: () => {},
            attendeeCount: {
              load: () => Promise.resolve({ ok: true, count: null }),
              save: () => Promise.resolve({ ok: true, count: null }),
            },
            attendees: () => {
              throw new Error("no attendees in this test");
            },
            comments: () => {
              throw new Error("no comments in this test");
            },
            ...actions,
          },
        }}
      >
        {ui}
      </ScheduleProvider>
    ),
  };
}

export const dataOf = (snapshot: Snapshot = base, now = new Date(iso(9))) =>
  scheduleDataFrom(snapshot, now);

export function entriesOf(data: ReturnType<typeof scheduleDataFrom>) {
  return scheduleEntries({
    days: data.days,
    locations: data.locations,
    locParams: [],
    meetings: data.meetings,
    match: noMatch,
  });
}
