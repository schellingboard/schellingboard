// @module-tag 009-US1
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReplicaStore } from "../replica/store";
import { iso, snapshot as fixture } from "../replica/snapshot-fixture";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { FeedMessage } from "@schellingboard/contracts/feed";
import { fakeApi, problem } from "./fake-api";
import { createCommandRunner } from "./runner";
import { addRsvp, removeRsvp } from "./rsvp";

afterEach(() => vi.useRealTimers());

const snapshot: Snapshot = { ...fixture, now: iso(10) };
const withoutRsvp: Snapshot = {
  ...snapshot,
  me: { ...snapshot.me!, rsvps: [] },
};

const delivered = (seq: number, commandKey: string | null): FeedMessage => ({
  seq,
  commandKey,
  type: "session.attendanceChanged",
  sessionId: "s",
  numRsvps: 5,
});

function setup(
  handler: Parameters<typeof fakeApi>[0] = () =>
    new Response(null, { status: 204 }),
  base = withoutRsvp
) {
  const store = createReplicaStore(base);
  const { api, calls } = fakeApi(handler);
  let n = 0;
  const runner = createCommandRunner({
    store,
    api,
    newKey: () => `key-${++n}`,
    retryDelays: [10, 20],
  });
  return { store, runner, calls };
}

const rsvped = (s: Snapshot) => s.me!.rsvps.some((r) => r.sessionId === "s");

describe("a command", () => {
  it("shows its prediction at once and sends the call with its key", async () => {
    const { runner, calls } = setup();

    const done = runner.run(addRsvp, { sessionId: "s" });

    expect(rsvped(runner.view())).toBe(true);
    expect(runner.view().counts.s).toBe(5);
    expect(runner.pending().map((p) => p.key)).toEqual(["key-1"]);
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/sessions/s/rsvps/mia",
      key: "key-1",
    });
    expect(await done).toEqual({ ok: true, data: undefined });
  });

  it("is settled by the feed message that carries its key, which replaces the prediction", async () => {
    const { store, runner } = setup();
    await runner.run(addRsvp, { sessionId: "s" });
    expect(runner.pending()).toHaveLength(1);

    store.applyMessage({
      seq: 8,
      commandKey: "key-1",
      type: "rsvp.added",
      rsvp: { id: "r1", sessionId: "s", guestId: "mia" },
    });
    store.applyMessage(delivered(9, "key-1"));

    expect(runner.pending()).toEqual([]);
    expect(runner.view()).toBe(store.get());
    expect(store.get().counts.s).toBe(5);
  });

  it("is settled by the feed even before the response arrives", async () => {
    let answer: ((r: Response) => void) | undefined;
    const { store, runner } = setup(
      () => new Promise<Response>((resolve) => (answer = resolve))
    );
    const done = runner.run(addRsvp, { sessionId: "s" });
    await vi.waitFor(() => expect(answer).toBeDefined());

    store.applyMessage(delivered(8, "key-1"));
    expect(runner.pending()).toEqual([]);
    answer!(new Response(null, { status: 204 }));

    expect(await done).toEqual({ ok: true, data: undefined });
  });

  it("keeps the prediction after the response until the feed catches up, then drops it once the feed has moved on", async () => {
    vi.useFakeTimers();
    const { store, runner } = setup();
    await runner.run(addRsvp, { sessionId: "s" });
    expect(runner.pending()).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(5000);
    expect(runner.pending()).toHaveLength(1);

    store.applyMessage(delivered(8, "someone-else"));
    await vi.advanceTimersByTimeAsync(3000);
    expect(runner.pending()).toEqual([]);
  });

  it("is dropped at once by the response when it changes nothing", async () => {
    const { runner } = setup(undefined, snapshot);

    const outcome = await runner.run(addRsvp, { sessionId: "s" });

    expect(outcome.ok).toBe(true);
    expect(runner.pending()).toEqual([]);
  });

  it("is refused before any call when the domain policy refuses it", async () => {
    const { runner, calls } = setup(undefined, {
      ...withoutRsvp,
      event: { ...withoutRsvp.event, rsvpCapacityHardLimit: true },
      counts: { ...withoutRsvp.counts, s: 10 },
    });

    const outcome = await runner.run(addRsvp, { sessionId: "s" });

    expect(outcome).toEqual({ ok: false, code: "session.full" });
    expect(calls).toEqual([]);
    expect(runner.pending()).toEqual([]);
  });

  it("rolls the prediction back and reports the code on a 4xx", async () => {
    const { store, runner } = setup(() => problem(409, "session.full"));
    const seen = vi.fn();
    runner.subscribe(seen);

    const outcome = await runner.run(addRsvp, { sessionId: "s" });

    expect(outcome).toEqual({ ok: false, code: "session.full" });
    expect(runner.pending()).toEqual([]);
    expect(runner.view()).toBe(store.get());
    expect(seen).toHaveBeenCalled();
  });

  it("retries a network error with the same key, then succeeds", async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const { runner, calls } = setup(() => {
      if (++attempts < 3) throw new TypeError("Failed to fetch");
      return new Response(null, { status: 204 });
    });

    const done = runner.run(addRsvp, { sessionId: "s" });
    await vi.advanceTimersByTimeAsync(100);

    expect(await done).toEqual({ ok: true, data: undefined });
    expect(calls.map((c) => c.key)).toEqual(["key-1", "key-1", "key-1"]);
    expect(rsvped(runner.view())).toBe(true);
  });

  it("retries a 5xx the same way", async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const { runner, calls } = setup(() =>
      ++attempts < 2
        ? problem(503, "server.unavailable")
        : new Response(null, { status: 204 })
    );

    const done = runner.run(addRsvp, { sessionId: "s" });
    await vi.advanceTimersByTimeAsync(100);

    expect((await done).ok).toBe(true);
    expect(calls).toHaveLength(2);
  });

  it("gives up after its retries and rolls back", async () => {
    vi.useFakeTimers();
    const { runner, calls } = setup(() => {
      throw new TypeError("Failed to fetch");
    });

    const done = runner.run(addRsvp, { sessionId: "s" });
    await vi.advanceTimersByTimeAsync(1000);

    expect(await done).toEqual({ ok: false, code: "network.unreachable" });
    expect(calls).toHaveLength(3);
    expect(runner.pending()).toEqual([]);
  });

  it("stops retrying once stopped, and drops what is pending", async () => {
    vi.useFakeTimers();
    const { runner, calls } = setup(() => {
      throw new TypeError("Failed to fetch");
    });
    const done = runner.run(addRsvp, { sessionId: "s" });
    await vi.advanceTimersByTimeAsync(5);

    runner.stop();
    await vi.advanceTimersByTimeAsync(1000);

    expect(await done).toEqual({ ok: false, code: "command.cancelled" });
    expect(calls).toHaveLength(1);
    expect(runner.pending()).toEqual([]);
  });

  it("forgets a prediction made for a guest who is no longer the viewer", () => {
    const { store, runner } = setup(() => new Promise<Response>(() => {}));
    void runner.run(addRsvp, { sessionId: "s" });
    expect(runner.pending()).toHaveLength(1);

    store.replace({
      ...withoutRsvp,
      me: { ...withoutRsvp.me!, guestId: "bo" },
    });

    expect(runner.pending()).toEqual([]);
  });

  it("withdraws: the RSVP and its count go at once, and a withdraw of a missing RSVP changes nothing", async () => {
    const { runner, calls } = setup(undefined, snapshot);

    const done = runner.run(removeRsvp, { sessionId: "s" });

    expect(rsvped(runner.view())).toBe(false);
    expect(runner.view().counts.s).toBe(3);
    await done;
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/sessions/s/rsvps/mia",
    });

    const idle = setup(undefined, withoutRsvp);
    await idle.runner.run(removeRsvp, { sessionId: "s" });
    expect(idle.runner.pending()).toEqual([]);
  });

  it("does not move the count if the feed delivered it before the key", () => {
    const { store, runner } = setup(() => new Promise<Response>(() => {}));
    void runner.run(addRsvp, { sessionId: "s" });

    store.applyMessage(delivered(8, null));

    expect(runner.view().counts.s).toBe(5);
  });

  it("predicts a quick second click against what the first one shows", async () => {
    const { runner, calls } = setup(() => new Response(null, { status: 204 }));

    const add = runner.run(addRsvp, { sessionId: "s" });
    const remove = runner.run(removeRsvp, { sessionId: "s" });

    expect(rsvped(runner.view())).toBe(false);
    expect(runner.view().counts.s).toBe(4);
    await Promise.all([add, remove]);
    expect(calls.map((c) => c.method)).toEqual(["PUT", "DELETE"]);
  });

  it("sends commands for the same session one after the other", async () => {
    const answers: ((r: Response) => void)[] = [];
    const { runner, calls } = setup(
      () => new Promise<Response>((resolve) => answers.push(resolve))
    );

    void runner.run(addRsvp, { sessionId: "s" });
    void runner.run(removeRsvp, { sessionId: "s" });
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    await new Promise((r) => setTimeout(r, 20));
    expect(calls).toHaveLength(1);

    answers[0](new Response(null, { status: 204 }));
    await vi.waitFor(() => expect(calls).toHaveLength(2));
    expect(calls.map((c) => c.method)).toEqual(["PUT", "DELETE"]);
  });

  it("retries while the server is still working on the same key", async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const { runner, calls } = setup(() =>
      ++attempts < 2
        ? problem(409, "idempotency.inProgress")
        : new Response(null, { status: 204 })
    );

    const done = runner.run(addRsvp, { sessionId: "s" });
    await vi.advanceTimersByTimeAsync(100);

    expect((await done).ok).toBe(true);
    expect(calls).toHaveLength(2);
  });

  it("reports a 401 and rolls back", async () => {
    const { runner } = setup(() => problem(401, "auth.required"));
    expect(await runner.run(addRsvp, { sessionId: "s" })).toEqual({
      ok: false,
      code: "auth.required",
    });
    expect(runner.pending()).toEqual([]);
  });

  it("does not keep an answered prediction forever when a resync leaves the seq lower", async () => {
    vi.useFakeTimers();
    const { store, runner } = setup();
    await runner.run(addRsvp, { sessionId: "s" });

    store.replace({ ...withoutRsvp, seq: 2 });
    await vi.advanceTimersByTimeAsync(3000);

    expect(runner.pending()).toEqual([]);
  });

  it("refuses to run once stopped", async () => {
    const { runner, calls } = setup();
    runner.stop();
    expect(await runner.run(addRsvp, { sessionId: "s" })).toEqual({
      ok: false,
      code: "command.cancelled",
    });
    expect(calls).toEqual([]);
    expect(runner.pending()).toEqual([]);
  });
});
