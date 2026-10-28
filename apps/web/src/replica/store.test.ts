// @module-tag 007-US8
import { describe, it, expect } from "vitest";
import { createReplicaStore } from "./store";
import { snapshot } from "./snapshot-fixture";

describe("replica store", () => {
  it("replace swaps the replica, even for a lower seq, and notifies", () => {
    const store = createReplicaStore(snapshot);
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);

    store.replace({ ...snapshot, seq: 1 });
    unsubscribe();
    store.replace({ ...snapshot, seq: 2 });

    expect(store.get().seq).toBe(2);
    expect(calls).toBe(1);
  });

  it("knows the event is gone once it is deleted, until a snapshot replaces it", () => {
    const store = createReplicaStore(snapshot);
    let calls = 0;
    store.subscribe(() => calls++);

    store.applyMessage({
      seq: snapshot.seq + 1,
      type: "event.deleted",
      commandKey: null,
    });

    expect(store.gone()).toBe(true);
    expect(calls).toBe(1);
    store.replace(snapshot);
    expect(store.gone()).toBe(false);
  });

  it("remembers the keys whose RSVP count has arrived, and notifies", () => {
    const store = createReplicaStore(snapshot);
    let calls = 0;
    store.subscribe(() => calls++);
    const count = (seq: number, commandKey: string | null) => ({
      seq,
      type: "session.attendanceChanged" as const,
      commandKey,
      sessionId: "s",
      numRsvps: seq,
    });

    store.applyMessage(count(snapshot.seq + 1, null));
    expect(store.deliveredKeys().size).toBe(0);
    const before = store.deliveredKeys();
    store.applyMessage(count(snapshot.seq + 2, "click-1"));

    expect(store.deliveredKeys().has("click-1")).toBe(true);
    expect(store.deliveredKeys()).not.toBe(before);
    expect(calls).toBe(2);
  });

  it("adopt takes a seed at or above the replica's seq, never a lower one", () => {
    const store = createReplicaStore({ ...snapshot, seq: 10 });

    store.adopt({ ...snapshot, seq: 9 });
    expect(store.get().seq).toBe(10);
    store.adopt({ ...snapshot, seq: 11 });
    expect(store.get().seq).toBe(11);
  });

  it("moves the meetings revision for what the meetings column depends on", () => {
    const store = createReplicaStore(snapshot);
    const start = store.meetingsRevision();

    store.applyMessage({
      seq: snapshot.seq + 1,
      type: "session.attendanceChanged",
      commandKey: null,
      sessionId: "s",
      numRsvps: 9,
    });
    expect(store.meetingsRevision()).toBe(start + 1);

    store.applyMessage({
      seq: snapshot.seq + 2,
      type: "rsvp.removed",
      commandKey: null,
      sessionId: "s",
      guestId: "mia",
    });
    expect(store.meetingsRevision()).toBe(start + 2);

    store.applyMessage({
      seq: snapshot.seq + 3,
      type: "meeting.deleted",
      commandKey: null,
      meetingId: "none",
    });
    expect(store.meetingsRevision()).toBe(start + 3);
  });

  it("leaves the meetings revision alone when a seed is adopted", () => {
    const store = createReplicaStore(snapshot);
    const start = store.meetingsRevision();

    store.adopt({ ...snapshot, sessions: [...snapshot.sessions], seq: 20 });

    expect(store.meetingsRevision()).toBe(start);
  });
});
