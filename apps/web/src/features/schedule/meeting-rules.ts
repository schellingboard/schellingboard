import { plural, t } from "@lingui/core/macro";
import type { Event } from "@schellingboard/domain/event";
import { shownSlotStart } from "@schellingboard/domain/meeting-slots";
import { inSchedPhase } from "@schellingboard/domain/phase";
import { TIME_FORMAT } from "@schellingboard/domain/time";
import { DateTime } from "luxon";

import type { MeetingView } from "./meeting-view";

// Before scheduling there is no schedule to arrange a meeting around, and after
// it there is nothing left to arrange (#952).
export function meetingsOpen(event: Event, now: Date): boolean {
  return event.meetingsEnabled && inSchedPhase(event, now);
}

/**
 * Whether this guest may call the meeting off. A confirmed one is either
 * party's to cancel; while it is pending only the requester's, since the
 * person asked has Decline instead. Never once the slot has begun: the server
 * refuses that, and an accepted meeting stays on the grid after its slot
 * passes, so the modal has to know before offering the button.
 */
export function canCancel(
  meeting: Pick<MeetingView, "status" | "role" | "slotStart">,
  now: Date
): boolean {
  if (new Date(meeting.slotStart).getTime() <= now.getTime()) return false;
  return (
    meeting.status === "accepted" ||
    (meeting.status === "pending" && meeting.role === "requester")
  );
}

/**
 * The span a block of 1-on-1s covers, shaped like a meeting's own `timeLabel`.
 * Meetings that overlap without sharing a start share a block, so the first
 * one's time is not the block's.
 */
export function blockTimeLabel(
  meetings: Pick<MeetingView, "slotStart" | "slotEnd">[],
  breakMinutes: number,
  timezone: string,
  format = TIME_FORMAT
): string {
  const clock = (date: Date) =>
    DateTime.fromJSDate(date).setZone(timezone).toFormat(format);
  const starts = meetings.map((m) => m.slotStart).sort();
  const ends = meetings.map((m) => m.slotEnd).sort();
  const start = shownSlotStart(new Date(starts[0]), breakMinutes);
  return `${clock(start)} – ${clock(new Date(ends[ends.length - 1]))}`;
}

/**
 * The one line a slot of several 1-on-1s has room for under its count. What is
 * waiting on the reader comes first: it is the only part they can act on.
 */
export function slotSummaryLine(
  meetings: Pick<MeetingView, "status" | "role">[]
): string {
  const { kind, count } = slotSummary(meetings);
  if (kind === "yours") {
    return plural(count, {
      one: "# needs your reply",
      other: "# need your reply",
    });
  }
  if (kind === "pending") {
    return plural(count, {
      one: "# waiting for reply",
      other: "# waiting for reply",
    });
  }
  return t`all confirmed`;
}

/** What `slotSummaryLine` says, as data, for messages that embed it. */
export function slotSummary(meetings: Pick<MeetingView, "status" | "role">[]): {
  kind: "yours" | "pending" | "confirmed";
  count: number;
} {
  const pending = meetings.filter((m) => m.status === "pending");
  const yours = pending.filter(needsReply).length;
  if (yours > 0) return { kind: "yours", count: yours };
  if (pending.length > 0) return { kind: "pending", count: pending.length };
  return { kind: "confirmed", count: 0 };
}

export function meetingTitle(meeting: Pick<MeetingView, "otherName">): string {
  const { otherName } = meeting;
  return t`1-on-1 with ${otherName}`;
}

export function needsReply(
  meeting: Pick<MeetingView, "status" | "role">
): boolean {
  return meeting.status === "pending" && meeting.role === "recipient";
}

/** The state in a couple of words, where `statusLine` would not fit. */
export function blockStatus(
  meeting: Pick<MeetingView, "status" | "role">
): string {
  switch (blockStatusKey(meeting)) {
    case "needsReply":
      return t`needs your reply`;
    case "waiting":
      return t`waiting for reply`;
    case "confirmed":
      return t({
        message: "confirmed",
        comment: "State of a 1-on-1 on the grid, lower case",
      });
    case "declined":
      return t({
        message: "declined",
        comment: "State of a 1-on-1 on the grid, lower case",
      });
    case "canceled":
      return t({
        message: "canceled",
        comment: "State of a 1-on-1 on the grid, lower case",
      });
    case "unanswered":
      return t`unanswered`;
  }
}

export type BlockStatusKey =
  | "needsReply"
  | "waiting"
  | "confirmed"
  | "declined"
  | "canceled"
  | "unanswered";

export function blockStatusKey(
  meeting: Pick<MeetingView, "status" | "role">
): BlockStatusKey {
  switch (meeting.status) {
    case "pending":
      return needsReply(meeting) ? "needsReply" : "waiting";
    case "accepted":
      return "confirmed";
    case "declined":
      return "declined";
    case "canceled":
      return "canceled";
    case "expired":
      return "unanswered";
  }
}

/** What has become of the request, in the words of whoever is reading. */
export function statusLine(
  meeting: Pick<MeetingView, "status" | "role" | "otherName">
): string {
  const them = meeting.otherName;
  switch (meeting.status) {
    case "pending":
      return meeting.role === "recipient"
        ? t`${them} is waiting for your answer.`
        : t`Waiting for ${them} to answer.`;
    case "accepted":
      return t`Confirmed — see you there.`;
    case "declined":
      return meeting.role === "recipient"
        ? t`You declined this.`
        : t`${them} declined this.`;
    case "canceled":
      return t`This 1-on-1 was canceled.`;
    case "expired":
      // Nobody is at fault for an unanswered request, so it is not phrased as
      // one: the slot simply came and went (issue #392, section 1.4).
      return t`Nobody answered before the slot began.`;
  }
}
