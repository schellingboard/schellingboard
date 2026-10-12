// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import { eventContextFrom } from "@/app/legacy/(site)/[eventSlug]/replica/selectors";
import { apply } from "@/app/legacy/(site)/[eventSlug]/replica/apply";
import { iso, snapshot } from "../helpers/snapshot-fixture";

describe("eventContextFrom", () => {
  it("rebuilds the schedule's denormalized shapes from a snapshot", () => {
    const context = eventContextFrom(snapshot);

    const [talk] = context.sessions;
    expect(talk).toMatchObject({
      id: "s",
      hosts: [{ id: "host", name: "HOST" }],
      locations: [{ id: "r", name: "Room", color: "blue" }],
      numRsvps: 4,
      startTime: new Date(iso(9)),
      proposalId: undefined,
    });
    expect(context.sessions[1].numRsvps).toBe(0);
    expect(context.days).toMatchObject([
      { id: "d", start: new Date(iso(8)), sessions: [{ id: "s" }] },
    ]);
    expect(context.event).toMatchObject({
      version: 3,
      firstDayStart: new Date(iso(8)),
      proposalPhaseStart: undefined,
    });
    expect(context.unavailability[0].start).toEqual(new Date(iso(12)));
    expect(context.guests.map((g) => g.id)).toEqual(["mia"]);
    expect(context.rsvps).toEqual([
      { id: "x", sessionId: "s", guestId: "mia" },
    ]);
  });

  it("skips a room the replica no longer holds", () => {
    const removed = apply(snapshot, {
      seq: snapshot.seq + 1,
      type: "location.removed",
      commandKey: null,
      locationId: "r",
    });

    const context = eventContextFrom(removed);

    expect(context.locations).toEqual([]);
    expect(context.sessions[0].locations).toEqual([]);
    expect(context.unavailability).toEqual([]);
  });
});
