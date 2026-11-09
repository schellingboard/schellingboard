import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Command, Prediction } from "./runner";
import { describeSessionIn } from "./subject";

type Input = { sessionId: string };
type Marks = NonNullable<Snapshot["me"]>["marks"];

const PATH = "/api/v1/sessions/{id}/marks/{guestId}" as const;

const path = (replica: Snapshot, { sessionId }: Input) => ({
  id: sessionId,
  guestId: replica.me?.guestId ?? "",
});

function predict(
  replica: Snapshot,
  { sessionId }: Input,
  marks: (held: Marks) => Marks
): Prediction {
  if (!replica.me) return { refusal: "guest.notInEvent" };
  if (!replica.sessions.some((s) => s.id === sessionId))
    return { refusal: "session.notFound" };
  return {
    project: (current) =>
      current.me
        ? { ...current, me: { ...current.me, marks: marks(current.me.marks) } }
        : current,
  };
}

const others = (held: Marks, sessionId: string) =>
  held.filter((m) => m.sessionId !== sessionId);

export const addBookmark: Command<Input> = {
  kind: "mark.bookmark",
  describe: (replica, { sessionId }) =>
    `bookmark ${describeSessionIn(replica, sessionId)}`,
  target: ({ sessionId }) => `mark:${sessionId}`,
  predict: (replica, _now, input) =>
    predict(replica, input, (held) => [
      ...others(held, input.sessionId),
      { sessionId: input.sessionId, kind: "bookmark" },
    ]),
  call: (api, input, key, replica) =>
    api.PUT(PATH, {
      params: { path: path(replica, input) },
      body: { kind: "bookmark" },
      headers: { "Idempotency-Key": key },
    }),
};

export const removeBookmark: Command<Input> = {
  kind: "mark.clear",
  describe: (replica, { sessionId }) =>
    `remove the bookmark from ${describeSessionIn(replica, sessionId)}`,
  target: ({ sessionId }) => `mark:${sessionId}`,
  predict: (replica, _now, input) =>
    predict(replica, input, (held) => others(held, input.sessionId)),
  call: (api, input, key, replica) =>
    api.DELETE(PATH, {
      params: { path: path(replica, input) },
      headers: { "Idempotency-Key": key },
    }),
};
