// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import { apply } from "@/app/legacy/(site)/[eventSlug]/replica/apply";
import {
  dropFrom,
  expirePendingRsvps,
  nextExpiryAt,
  settlePendingRsvps,
  withPendingRsvps,
  type PendingRsvp,
} from "@/app/legacy/(site)/[eventSlug]/replica/rsvp-overlay";
import { snapshot } from "../helpers/snapshot-fixture";

const pendingAdd: PendingRsvp = {
  id: 1,
  guestId: "mia",
  sessionId: "unscheduled",
  remove: false,
  key: "add-key",
  baseCount: 0,
  noop: false,
  acknowledged: false,
};
const pendingRemove: PendingRsvp = {
  id: 2,
  guestId: "mia",
  sessionId: "s",
  remove: true,
  key: "remove-key",
  baseCount: 4,
  noop: false,
  acknowledged: false,
};

const none = new Set<string>();
const delivered = (...keys: string[]) => new Set(keys);

const echo = (replica: typeof snapshot, remove: boolean, key = "k") => {
  const [rsvp, count] = remove
    ? [
        {
          seq: replica.seq + 1,
          type: "rsvp.removed" as const,
          commandKey: null,
          sessionId: "s",
          guestId: "mia",
        },
        { sessionId: "s", numRsvps: 3 },
      ]
    : [
        {
          seq: replica.seq + 1,
          type: "rsvp.added" as const,
          commandKey: null,
          rsvp: { id: "n", sessionId: "unscheduled", guestId: "mia" },
        },
        { sessionId: "unscheduled", numRsvps: 1 },
      ];
  return [
    rsvp,
    {
      seq: replica.seq + 2,
      type: "session.attendanceChanged" as const,
      commandKey: key,
      ...count,
    },
  ] as const;
};

describe("optimistic RSVPs over the replica", () => {
  it("shows a pending add and remove at once, in the RSVPs and the count", () => {
    const shown = withPendingRsvps(snapshot, [pendingAdd, pendingRemove]);

    expect(shown.me!.rsvps.map((r) => r.sessionId)).toEqual(["unscheduled"]);
    expect(shown.counts).toEqual({ s: 3, unscheduled: 1 });
  });

  it("counts an add once while only one half of its echo has arrived", () => {
    const [rsvp, count] = echo(snapshot, false);
    const pending = [pendingAdd];

    const afterRsvp = apply(snapshot, rsvp);
    expect(settlePendingRsvps(afterRsvp, pending, none)).toEqual(pending);
    expect(withPendingRsvps(afterRsvp, pending).counts.unscheduled).toBe(1);

    const afterCount = apply(afterRsvp, count);
    expect(
      settlePendingRsvps(afterCount, pending, delivered("add-key"))
    ).toEqual([]);
    expect(afterCount.counts.unscheduled).toBe(1);

    const countFirst = apply(snapshot, count);
    expect(withPendingRsvps(countFirst, pending).counts.unscheduled).toBe(1);
  });

  it("settles a toggle on its own key, not on any count change", () => {
    const [rsvp, count] = echo(snapshot, false);
    const someoneElses = apply(apply(snapshot, rsvp), count);

    expect(settlePendingRsvps(someoneElses, [pendingAdd], none)).toEqual([
      pendingAdd,
    ]);
    expect(
      settlePendingRsvps(someoneElses, [pendingAdd], delivered("add-key"))
    ).toEqual([]);
  });

  it("settles a remove when its key arrives", () => {
    expect(
      settlePendingRsvps(snapshot, [pendingRemove], delivered("remove-key"))
    ).toEqual([]);
  });

  it("settles a toggle that changed nothing on the server's answer", () => {
    const again: PendingRsvp = {
      ...pendingAdd,
      sessionId: "s",
      baseCount: 4,
      noop: true,
    };

    expect(settlePendingRsvps(snapshot, [again], none)).toEqual([again]);
    expect(
      settlePendingRsvps(snapshot, [{ ...again, acknowledged: true }], none)
    ).toEqual([]);
  });

  it("keeps an acknowledged op until its echo arrives", () => {
    const pending = [{ ...pendingAdd, acknowledged: true }];

    expect(settlePendingRsvps(snapshot, pending, none)).toEqual(pending);
  });

  it("does not settle a later toggle on a state the first one has not reached yet", () => {
    const undo: PendingRsvp = {
      ...pendingAdd,
      id: 3,
      remove: true,
      key: "remove-key",
    };

    expect(
      settlePendingRsvps(snapshot, [pendingAdd, undo], delivered("remove-key"))
    ).toEqual([pendingAdd, undo]);
    expect(
      withPendingRsvps(snapshot, [pendingAdd, undo]).counts.unscheduled
    ).toBe(0);
  });

  it("ignores another guest's RSVP, which has no echo here", () => {
    const other = { ...pendingAdd, guestId: "zed" };

    expect(withPendingRsvps(snapshot, [other]).me).toEqual(snapshot.me);
  });

  it("shows no count change for a toggle that changes nothing", () => {
    const again: PendingRsvp = {
      ...pendingAdd,
      sessionId: "s",
      baseCount: 4,
      noop: true,
    };

    expect(withPendingRsvps(snapshot, [again]).counts.s).toBe(4);
  });

  it("expires an answered toggle after 3 s, once the feed has moved on since the click", () => {
    const answered = {
      ...pendingAdd,
      acknowledged: true,
      acknowledgedAt: 1000,
      clickSeq: 7,
    };
    const waiting = { ...pendingRemove };
    const pending = [answered, waiting];

    expect(expirePendingRsvps(pending, 3999, 9)).toBe(pending);
    expect(expirePendingRsvps(pending, 4000, 9)).toEqual([waiting]);
    expect(expirePendingRsvps(pending, 60_000, 9)).toEqual([waiting]);
  });

  it("keeps an answered toggle while the feed has said nothing since the click", () => {
    const answered = {
      ...pendingAdd,
      acknowledged: true,
      acknowledgedAt: 1000,
      clickSeq: 7,
    };
    const pending = [answered];

    expect(expirePendingRsvps(pending, 60_000, 7)).toBe(pending);
  });

  it("times the expiry from the first answered toggle the feed has moved past", () => {
    const answered = (id: number, at: number, clickSeq: number) => ({
      ...pendingAdd,
      id,
      acknowledged: true,
      acknowledgedAt: at,
      clickSeq,
    });
    const pending = [
      answered(1, 1000, 9),
      answered(2, 2000, 7),
      answered(3, 500, 8),
      pendingRemove,
    ];

    expect(nextExpiryAt(pending, 9)).toBe(3500);
    expect(nextExpiryAt(pending, 8)).toBe(5000);
    expect(nextExpiryAt(pending, 7)).toBeNull();
    expect(nextExpiryAt([pendingRemove], 99)).toBeNull();
  });

  it("drops a failed toggle and the later ones of its session only", () => {
    const earlier = { ...pendingAdd, id: 1 };
    const failed = { ...pendingAdd, id: 2 };
    const later = { ...pendingAdd, id: 3, remove: true };
    const elsewhere = { ...pendingAdd, id: 4, sessionId: "s" };

    expect(
      dropFrom([earlier, failed, later, elsewhere], 2, "unscheduled")
    ).toEqual([earlier, elsewhere]);
  });
});
