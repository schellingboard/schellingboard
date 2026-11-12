import { select, t } from "@lingui/core/macro";
import type { meetingSchema } from "@schellingboard/contracts/meeting";
import type { Snapshot } from "@schellingboard/contracts/snapshot";

import { canCancel } from "../features/schedule/meeting-rules";
import { meetingViewsFrom } from "../features/schedule/meetings";
import type { Described } from "./failure-message";
import type { Command, Prediction } from "./runner";

type Status = (typeof meetingSchema)["_output"]["status"];

const viewOf = (replica: Snapshot, meetingId: string) =>
  meetingViewsFrom(replica, new Date(replica.now)).find(
    (m) => m.id === meetingId
  );

function settle(
  replica: Snapshot,
  meetingId: string,
  status: Status,
  cancelNote = ""
): Snapshot {
  const me = replica.me;
  if (!me) return replica;
  return {
    ...replica,
    me: {
      ...me,
      meetings: me.meetings.map((m) =>
        m.id === meetingId ? { ...m, status, cancelNote } : m
      ),
    },
  };
}

export const answerMeeting: Command<
  {
    meetingId: string;
    response: "accept" | "decline";
  },
  unknown
> = {
  kind: "meeting.answer",
  describe: (replica, { meetingId, response }): Described => {
    const view = viewOf(replica, meetingId);
    if (!view)
      return {
        failed: select(response, {
          accept: "Could not accept the 1-on-1.",
          decline: "Could not decline the 1-on-1.",
          other: "Could not decline the 1-on-1.",
        }),
        unsure: select(response, {
          accept:
            "Your request to accept the 1-on-1 might not have been saved.",
          decline:
            "Your request to decline the 1-on-1 might not have been saved.",
          other:
            "Your request to decline the 1-on-1 might not have been saved.",
        }),
      };
    const { otherName: name, dayLabel: day, timeLabel: time } = view;
    return {
      failed: select(response, {
        accept: `Could not accept the 1-on-1 with ${name} (${day}, ${time}).`,
        decline: `Could not decline the 1-on-1 with ${name} (${day}, ${time}).`,
        other: `Could not decline the 1-on-1 with ${name} (${day}, ${time}).`,
      }),
      unsure: select(response, {
        accept: `Your request to accept the 1-on-1 with ${name} (${day}, ${time}) might not have been saved.`,
        decline: `Your request to decline the 1-on-1 with ${name} (${day}, ${time}) might not have been saved.`,
        other: `Your request to decline the 1-on-1 with ${name} (${day}, ${time}) might not have been saved.`,
      }),
    };
  },
  target: ({ meetingId }) => `meeting:${meetingId}`,
  predict: (replica, now, { meetingId, response }): Prediction => {
    const view = viewOf(replica, meetingId);
    if (!view) return { refusal: "meeting.notFound" };
    if (view.role !== "recipient") return { refusal: "meeting.notRecipient" };
    if (view.status === "expired") return { refusal: "meeting.started" };
    if (view.status !== "pending")
      return { refusal: "meeting.alreadyAnswered" };
    if (new Date(view.slotStart) <= now) return { refusal: "meeting.started" };
    return {
      project: (current) =>
        settle(
          current,
          meetingId,
          response === "accept" ? "accepted" : "declined"
        ),
    };
  },
  call: (api, { meetingId, response }, key) =>
    api.POST(`/api/v1/meetings/{id}/${response}`, {
      params: { path: { id: meetingId } },
      headers: { "Idempotency-Key": key },
    }),
};

export const cancelMeeting: Command<
  { meetingId: string; note: string },
  unknown
> = {
  kind: "meeting.cancel",
  describe: (replica, { meetingId }): Described => {
    const view = viewOf(replica, meetingId);
    if (!view)
      return {
        failed: t`Could not cancel the 1-on-1.`,
        unsure: t`Your request to cancel the 1-on-1 might not have been saved.`,
      };
    const { otherName: name, dayLabel: day, timeLabel: time } = view;
    return {
      failed: t`Could not cancel the 1-on-1 with ${name} (${day}, ${time}).`,
      unsure: t`Your request to cancel the 1-on-1 with ${name} (${day}, ${time}) might not have been saved.`,
    };
  },
  target: ({ meetingId }) => `meeting:${meetingId}`,
  predict: (replica, now, { meetingId, note }): Prediction => {
    const view = viewOf(replica, meetingId);
    if (!view) return { refusal: "meeting.notFound" };
    if (new Date(view.slotStart) <= now) return { refusal: "meeting.started" };
    if (!canCancel(view, now)) return { refusal: "meeting.nothingToCancel" };
    return {
      project: (current) => settle(current, meetingId, "canceled", note.trim()),
    };
  },
  call: (api, { meetingId, note }, key) =>
    api.POST("/api/v1/meetings/{id}/cancel", {
      params: { path: { id: meetingId } },
      body: { note },
      headers: { "Idempotency-Key": key },
    }),
};
