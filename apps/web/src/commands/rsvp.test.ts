// @module-tag 009-US1
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { describe, expect, it } from "vitest";
import { iso, snapshot as fixture } from "../replica/snapshot-fixture";

const snapshot: Snapshot = { ...fixture, now: iso(10) };
import { createReplicaStore } from "../replica/store";
import { fakeApi } from "./fake-api";
import { createCommandRunner } from "./runner";
import { addRsvp } from "./rsvp";

function refusal(patch: Partial<Snapshot>) {
  const { api, calls } = fakeApi(() => new Response(null, { status: 204 }));
  const store = createReplicaStore({
    ...snapshot,
    me: { ...snapshot.me!, rsvps: [] },
    ...patch,
  });
  const runner = createCommandRunner({ store, api, newKey: () => "k" });
  return runner.run(addRsvp, { sessionId: "s" }).then((o) => ({ o, calls }));
}

describe("RSVP prediction follows the domain policy", () => {
  it("refuses a host of the session", async () => {
    const { o, calls } = await refusal({
      me: { ...snapshot.me!, guestId: "host", rsvps: [] },
      guests: snapshot.guests.map((g) => ({ ...g, member: true })),
    });
    expect(o).toEqual({ ok: false, code: "rsvp.ownSession" });
    expect(calls).toEqual([]);
  });

  it("refuses outside the scheduling phase", async () => {
    const { o } = await refusal({
      event: {
        ...snapshot.event,
        schedulingPhaseStart: "2099-01-01T00:00:00.000Z",
      },
    });
    expect(o).toEqual({ ok: false, code: "event.notSchedulingPhase" });
  });

  it("refuses a viewer who is not signed in", async () => {
    const { o } = await refusal({ me: null });
    expect(o).toEqual({ ok: false, code: "guest.notInEvent" });
  });
});
