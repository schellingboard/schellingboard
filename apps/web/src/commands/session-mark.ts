import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Command, Prediction } from "./runner";
import { describeSessionIn } from "./subject";

type Input = { sessionId: string };
type Marks = NonNullable<Snapshot["me"]>["marks"];
type Mark = Marks[number]["kind"];

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

function addMark(
  kind: Mark,
  label: (title: string) => string,
  command: string
): Command<Input> {
  return {
    kind: command,
    describe: (replica, { sessionId }) =>
      label(describeSessionIn(replica, sessionId)),
    target: ({ sessionId }) => `mark:${sessionId}`,
    predict: (replica, _now, input) =>
      predict(replica, input, (held) => [
        ...others(held, input.sessionId),
        { sessionId: input.sessionId, kind },
      ]),
    call: (api, input, key, replica) =>
      api.PUT(PATH, {
        params: { path: path(replica, input) },
        body: { kind },
        headers: { "Idempotency-Key": key },
      }),
  };
}

function removeMark(
  label: (title: string) => string,
  command: string
): Command<Input> {
  return {
    kind: command,
    describe: (replica, { sessionId }) =>
      label(describeSessionIn(replica, sessionId)),
    target: ({ sessionId }) => `mark:${sessionId}`,
    predict: (replica, _now, input) =>
      predict(replica, input, (held) => others(held, input.sessionId)),
    call: (api, input, key, replica) =>
      api.DELETE(PATH, {
        params: { path: path(replica, input) },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export const addBookmark = addMark(
  "bookmark",
  (title) => `bookmark ${title}`,
  "mark.bookmark"
);
export const removeBookmark = removeMark(
  (title) => `remove the bookmark from ${title}`,
  "mark.clear"
);
export const addHidden = addMark(
  "hidden",
  (title) => `hide ${title}`,
  "mark.hide"
);
export const removeHidden = removeMark(
  (title) => `show ${title} again`,
  "mark.unhide"
);
