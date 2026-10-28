import type { meetingSchema } from "@schellingboard/contracts/meeting";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { canCancel } from "../features/schedule/meeting-rules";
import type { MeetingView } from "../features/schedule/meeting-view";
import { meetingViewsFrom } from "../features/schedule/meetings";
import type { Command, Prediction } from "./runner";

type Status = (typeof meetingSchema)["_output"]["status"];

const viewOf = (replica: Snapshot, meetingId: string) =>
  meetingViewsFrom(replica, new Date(replica.now)).find(
    (m) => m.id === meetingId
  );

const describeMeeting = (view: MeetingView | undefined) =>
  view
    ? `the 1-on-1 with ${view.otherName} (${view.dayLabel}, ${view.timeLabel})`
    : "the 1-on-1";

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
  describe: (replica, { meetingId, response }) =>
    `${response} ${describeMeeting(viewOf(replica, meetingId))}`,
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
  describe: (replica, { meetingId }) =>
    `cancel ${describeMeeting(viewOf(replica, meetingId))}`,
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
