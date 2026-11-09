// @module-tag 008-US5
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { describe, expect, it } from "vitest";
import { iso, snapshot as fixture } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { claimSession } from "./claim-session";
import { fakeApi, problem } from "./fake-api";
import { createCommandRunner } from "./runner";

const replica: Snapshot = {
  ...fixture,
  now: iso(10),
  guests: fixture.guests.map((g) => ({ ...g, member: true })),
  counts: { ...fixture.counts, unscheduled: 3 },
  me: {
    ...fixture.me!,
    guestId: "mia",
    rsvps: [{ id: "r", guestId: "mia", sessionId: "unscheduled" }],
  },
};

function setup(patch: Partial<Snapshot> = {}, status = 200) {
  const { api, calls } = fakeApi(() =>
    status === 200
      ? Response.json({}, { status })
      : problem(status, "session.versionConflict")
  );
  const runner = createCommandRunner({
    store: createReplicaStore({ ...replica, ...patch }),
    api,
    newKey: () => "k",
  });
  return { runner, calls };
}

describe("becoming the host of a hostless session", () => {
  it("shows the viewer as host at once, without their RSVP", async () => {
    const { runner, calls } = setup();

    const pending = runner.run(claimSession, { sessionId: "unscheduled" });

    const view = runner.view();
    expect(view.sessions.find((s) => s.id === "unscheduled")?.hostIds).toEqual([
      "mia",
    ]);
    expect(view.me?.rsvps).toEqual([]);
    expect(view.counts.unscheduled).toBe(2);
    expect((await pending).ok).toBe(true);
    expect(calls).toMatchObject([
      { method: "POST", path: "/api/v1/sessions/unscheduled/hosts", key: "k" },
    ]);
  });

  it("refuses a session that has a host, without sending", async () => {
    const { runner, calls } = setup();
    expect(await runner.run(claimSession, { sessionId: "s" })).toEqual({
      ok: false,
      code: "session.hasHost",
    });
    expect(calls).toEqual([]);
  });

  it("refuses a viewer who is not in the event", async () => {
    const { runner } = setup({
      guests: replica.guests.map((g) => ({ ...g, member: false })),
    });
    expect(
      await runner.run(claimSession, { sessionId: "unscheduled" })
    ).toEqual({ ok: false, code: "guest.notInEvent" });
  });
});
