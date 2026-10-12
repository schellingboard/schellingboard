// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { FeedMessage } from "@schellingboard/contracts/feed";
import { apply } from "@/app/(site)/[eventSlug]/replica/apply";
import { snapshot } from "../helpers/snapshot-fixture";

const [talk] = snapshot.sessions;

const changed = (seq: number, id: string, title: string): FeedMessage => ({
  seq,
  type: "session.changed",
  commandKey: null,
  session: { ...talk, id, title },
});

const deleted = (seq: number, sessionId: string): FeedMessage => ({
  seq,
  type: "session.deleted",
  commandKey: null,
  sessionId,
});

const replay = (messages: FeedMessage[], from = snapshot) =>
  messages.reduce(apply, from);

describe("apply", () => {
  it("replaces a changed session and adds a new one", () => {
    const after = replay([changed(8, "s", "Renamed"), changed(9, "n", "New")]);

    expect(after.seq).toBe(9);
    expect(after.sessions.map((s) => [s.id, s.title])).toEqual([
      ["s", "Renamed"],
      ["unscheduled", "Later"],
      ["n", "New"],
    ]);
    expect(after.counts).toEqual({ s: 4, unscheduled: 0, n: 0 });
  });

  it("removes a deleted session and its count", () => {
    const after = apply(snapshot, deleted(8, "s"));

    expect(after.sessions.map((s) => s.id)).toEqual(["unscheduled"]);
    expect(after.counts).toEqual({ unscheduled: 0 });
  });

  it("sets a session's count, leaving a session it does not hold", () => {
    const counted = (sessionId: string): FeedMessage => ({
      seq: 8,
      type: "session.attendanceChanged",
      commandKey: null,
      sessionId,
      numRsvps: 9,
    });

    expect(apply(snapshot, counted("s")).counts).toEqual({
      s: 9,
      unscheduled: 0,
    });
    expect(apply(snapshot, counted("gone")).counts).toEqual(snapshot.counts);
  });

  it("adds and removes the viewer's own RSVP, once", () => {
    const mine = snapshot.me!.guestId;
    const added: FeedMessage = {
      seq: 8,
      type: "rsvp.added",
      commandKey: null,
      rsvp: { id: "r", sessionId: "unscheduled", guestId: mine },
    };
    const withRsvp = apply(snapshot, added);
    const removed: FeedMessage = {
      seq: 9,
      type: "rsvp.removed",
      commandKey: null,
      sessionId: "unscheduled",
      guestId: mine,
    };

    expect(withRsvp.me!.rsvps.filter((r) => r.id === "r")).toHaveLength(1);
    expect(apply(withRsvp, removed).me!.rsvps).toEqual(snapshot.me!.rsvps);
  });

  it("ignores an RSVP of another guest", () => {
    const other: FeedMessage = {
      seq: 8,
      type: "rsvp.added",
      commandKey: null,
      rsvp: { id: "r", sessionId: "s", guestId: "someone-else" },
    };

    expect(apply(snapshot, other).me).toEqual(snapshot.me);
  });

  it("ignores a change it already holds", () => {
    expect(apply(snapshot, changed(7, "s", "Stale"))).toBe(snapshot);
  });

  it("skips a type it does not know, moving past it", () => {
    const unknown = { seq: 8, type: "session.renamed.v9" } as unknown;

    const after = apply(snapshot, unknown as FeedMessage);

    expect(after).toEqual({ ...snapshot, seq: 8 });
  });

  it("ends in the same state however often a feed is replayed", () => {
    const message = fc.record({
      gap: fc.integer({ min: 1, max: 3 }),
      again: fc.boolean(),
      body: fc.oneof(
        fc
          .tuple(fc.constantFrom("s", "t", "u"), fc.string())
          .map(([id, title]) => ({ kind: "changed" as const, id, title })),
        fc
          .constantFrom("s", "t", "u")
          .map((id) => ({ kind: "deleted" as const, id }))
      ),
    });
    fc.assert(
      fc.property(
        fc.array(message, { maxLength: 20 }),
        fc.nat(),
        (drawn, cut) => {
          let seq = snapshot.seq;
          const feed = drawn.map(({ gap, body }) => {
            seq += gap;
            return body.kind === "changed"
              ? changed(seq, body.id, body.title)
              : deleted(seq, body.id);
          });
          const delivered = feed.flatMap((m, i) =>
            drawn[i].again ? [m, m] : [m]
          );
          const once = replay(feed);
          const resumed = replay(
            delivered,
            replay(delivered.slice(0, cut % (delivered.length + 1)))
          );
          expect(replay(delivered)).toEqual(once);
          expect(replay(feed, once)).toEqual(once);
          expect(resumed).toEqual(once);
        }
      ),
      { seed: 1169, numRuns: 200 }
    );
  });
});
