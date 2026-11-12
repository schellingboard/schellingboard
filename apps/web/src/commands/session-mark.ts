import { t } from "@lingui/core/macro";
import type { Snapshot } from "@schellingboard/contracts/snapshot";

import type { Described } from "./failure-message";
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
  label: (session: string | undefined) => Described,
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
  label: (session: string | undefined) => Described,
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
  (session) =>
    session
      ? {
          failed: t`Could not bookmark ${session}.`,
          unsure: t`Your request to bookmark ${session} might not have been saved.`,
        }
      : {
          failed: t`Could not bookmark the session.`,
          unsure: t`Your request to bookmark the session might not have been saved.`,
        },
  "mark.bookmark"
);
export const removeBookmark = removeMark(
  (session) =>
    session
      ? {
          failed: t`Could not remove the bookmark from ${session}.`,
          unsure: t`Your request to remove the bookmark from ${session} might not have been saved.`,
        }
      : {
          failed: t`Could not remove the bookmark from the session.`,
          unsure: t`Your request to remove the bookmark from the session might not have been saved.`,
        },
  "mark.clear"
);
export const addHidden = addMark(
  "hidden",
  (session) =>
    session
      ? {
          failed: t`Could not hide ${session}.`,
          unsure: t`Your request to hide ${session} might not have been saved.`,
        }
      : {
          failed: t`Could not hide the session.`,
          unsure: t`Your request to hide the session might not have been saved.`,
        },
  "mark.hide"
);
export const removeHidden = removeMark(
  (session) =>
    session
      ? {
          failed: t`Could not show ${session} again.`,
          unsure: t`Your request to show ${session} again might not have been saved.`,
        }
      : {
          failed: t`Could not show the session again.`,
          unsure: t`Your request to show the session again might not have been saved.`,
        },
  "mark.unhide"
);
