import { rsvpRefusal } from "@schellingboard/domain/rsvp-rule";
import type { SessionHost } from "@schellingboard/domain/session";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Command, Prediction } from "./runner";
import { describeSessionIn } from "./subject";

type Input = { sessionId: string };

const date = (iso: string | null) => (iso ? new Date(iso) : undefined);

function predictRsvp(
  intent: "add" | "withdraw",
  replica: Snapshot,
  now: Date,
  { sessionId }: Input
): Prediction {
  const { me, event } = replica;
  const session = replica.sessions.find((s) => s.id === sessionId);
  if (!me || !session) return { refusal: "guest.notInEvent" };

  const held = me.rsvps.some((r) => r.sessionId === sessionId);
  const count = replica.counts[sessionId] ?? 0;
  const refusal = rsvpRefusal({
    intent,
    event: {
      proposalPhaseStart: date(event.proposalPhaseStart),
      votingPhaseStart: date(event.votingPhaseStart),
      schedulingPhaseStart: date(event.schedulingPhaseStart),
      schedulingPhaseEnd: date(event.schedulingPhaseEnd),
      rsvpCapacityHardLimit: event.rsvpCapacityHardLimit,
    },
    now,
    guestId: me.guestId,
    guestInEvent: replica.guests.some((g) => g.id === me.guestId && g.member),
    session: {
      capacity: session.capacity,
      numRsvps: count,
      hosts: session.hostIds.map((id): SessionHost => ({ id, name: "" })),
    },
    alreadyRsvped: held,
  });
  if (refusal) return { refusal };

  const target = intent === "add";
  const delta = held === target ? 0 : target ? 1 : -1;
  return {
    project: (current) => {
      if (!current.me) return current;
      const hasIt = current.me.rsvps.some((r) => r.sessionId === sessionId);
      const rsvps =
        hasIt === target
          ? current.me.rsvps
          : target
            ? [
                ...current.me.rsvps,
                { id: "", guestId: current.me.guestId, sessionId },
              ]
            : current.me.rsvps.filter((r) => r.sessionId !== sessionId);
      // Once the feed has moved the count, the prediction no longer adds to it.
      const counts =
        delta !== 0 && current.counts[sessionId] === count
          ? { ...current.counts, [sessionId]: count + delta }
          : current.counts;
      return rsvps === current.me.rsvps && counts === current.counts
        ? current
        : { ...current, me: { ...current.me, rsvps }, counts };
    },
  };
}

const target = (replica: Snapshot, { sessionId }: Input) => ({
  params: { path: { id: sessionId, guestId: replica.me?.guestId ?? "" } },
});

const PATH = "/api/v1/sessions/{id}/rsvps/{guestId}" as const;

export const addRsvp: Command<Input> = {
  kind: "rsvp.add",
  describe: (replica, { sessionId }) =>
    `RSVP to ${describeSessionIn(replica, sessionId)}`,
  target: ({ sessionId }) => `rsvp:${sessionId}`,
  predict: (replica, now, input) => predictRsvp("add", replica, now, input),
  call: (api, input, key, replica) =>
    api.PUT(PATH, {
      ...target(replica, input),
      headers: { "Idempotency-Key": key },
    }),
};

export const removeRsvp: Command<Input> = {
  kind: "rsvp.remove",
  describe: (replica, { sessionId }) =>
    `withdraw your RSVP to ${describeSessionIn(replica, sessionId)}`,
  target: ({ sessionId }) => `rsvp:${sessionId}`,
  predict: (replica, now, input) =>
    predictRsvp("withdraw", replica, now, input),
  call: (api, input, key, replica) =>
    api.DELETE(PATH, {
      ...target(replica, input),
      headers: { "Idempotency-Key": key },
    }),
};
