import { claimRefusal } from "@schellingboard/domain/session-claim";
import type { Command } from "./runner";
import { describeSessionIn } from "./subject";

type Input = { sessionId: string };

const date = (iso: string | null) => (iso ? new Date(iso) : undefined);

export const claimSession: Command<Input, unknown> = {
  kind: "session.claim",
  describe: (replica, { sessionId }) =>
    `become the host of ${describeSessionIn(replica, sessionId)}`,
  target: ({ sessionId }) => `claim:${sessionId}`,
  predict: (replica, now, { sessionId }) => {
    const { me, event } = replica;
    const session = replica.sessions.find((s) => s.id === sessionId);
    const guest = replica.guests.find((g) => g.id === me?.guestId);
    if (!me || !guest) return { refusal: "guest.notInEvent" };
    if (!session) return { refusal: "session.notFound" };
    const refusal = claimRefusal({
      event: {
        proposalPhaseStart: date(event.proposalPhaseStart),
        votingPhaseStart: date(event.votingPhaseStart),
        schedulingPhaseStart: date(event.schedulingPhaseStart),
        schedulingPhaseEnd: date(event.schedulingPhaseEnd),
      },
      now,
      guestInEvent: guest.member,
      session: { ...session, hosts: session.hostIds },
    });
    if (refusal) return { refusal };
    const held = me.rsvps.some((r) => r.sessionId === sessionId);
    const count = replica.counts[sessionId] ?? 0;
    return {
      project: (current) =>
        !current.me
          ? current
          : {
              ...current,
              counts:
                held && current.counts[sessionId] === count
                  ? { ...current.counts, [sessionId]: count - 1 }
                  : current.counts,
              sessions: current.sessions.map((s) =>
                s.id === sessionId && s.hostIds.length === 0
                  ? { ...s, hostIds: [guest.id] }
                  : s
              ),
              me: {
                ...current.me,
                rsvps: current.me.rsvps.filter(
                  (r) => r.sessionId !== sessionId
                ),
              },
            },
    };
  },
  call: (api, { sessionId }, key, replica) =>
    api.POST("/api/v1/sessions/{id}/hosts", {
      params: { path: { id: sessionId } },
      body: {
        expectedVersion:
          replica.sessions.find((s) => s.id === sessionId)?.version ?? 0,
      },
      headers: { "Idempotency-Key": key },
    }),
};
