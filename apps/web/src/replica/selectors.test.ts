// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import { VoteChoice } from "@schellingboard/domain/vote";
import { eventContextFrom, ownVotesFrom, proposalsFrom } from "./selectors";
import { apply } from "./apply";
import { iso, snapshot } from "./snapshot-fixture";

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

describe("proposalsFrom and ownVotesFrom", () => {
  const proposal = (id: string, createdHour: number) => ({
    id,
    eventId: "e",
    title: `Idea ${id}`,
    description: null,
    durationMinutes: 30,
    createdTime: iso(createdHour),
    updatedTime: iso(createdHour),
    hosts: [{ id: "host", name: "HOST" }],
    cohostWanted: true,
    cohostWantedNote: null,
    version: 1,
  });
  const withProposals = {
    ...snapshot,
    proposals: [proposal("late", 10), proposal("early", 8)],
    me: snapshot.me && {
      ...snapshot.me,
      votes: [{ proposalId: "early", choice: VoteChoice.maybe }],
    },
  };

  it("turns the snapshot's proposals into domain shapes, oldest first", () => {
    const proposals = proposalsFrom(withProposals);

    expect(proposals.map((p) => p.id)).toEqual(["early", "late"]);
    expect(proposals[0]).toMatchObject({
      createdTime: new Date(iso(8)),
      description: undefined,
      durationMinutes: 30,
      cohostWantedNote: undefined,
      hosts: [{ id: "host", name: "HOST" }],
    });
  });

  it("gives the viewer's choice per proposal, none when signed out", () => {
    expect(ownVotesFrom(withProposals).get("early")).toBe(VoteChoice.maybe);
    expect(ownVotesFrom(withProposals).has("late")).toBe(false);
    expect(ownVotesFrom({ ...withProposals, me: null }).size).toBe(0);
  });
});
