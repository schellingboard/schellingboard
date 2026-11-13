import { msg, select } from "@lingui/core/macro";
import type { NoticeMessage } from "@schellingboard/domain/notification";
import type { ReminderKind } from "@schellingboard/domain/reminder";

import type { CommentRecipient, CommentSubject } from "@/emails/comment";
import type { MeetingOutcome } from "@/emails/meeting";
import {
  type EmailTime,
  hasNoPlaces,
  isUnscheduled,
} from "@/server/kernel/localized-text";
import { toNotice } from "@/server/kernel/notice";

// `msg` types its values as text. A time or a list of places is stored as it
// is and written in the reader's language by `renderNotice`.
const asText = (value: EmailTime | string[]) => value as unknown as string;

export function commentNotice(
  subject: CommentSubject,
  to: CommentRecipient,
  commenterName: string
): NoticeMessage {
  if (subject.kind === "profile") {
    const { ownerName } = subject;
    return toNotice(
      to === "responsible"
        ? msg`${commenterName} commented on your profile`
        : msg`${commenterName} commented on ${ownerName}'s profile`
    );
  }
  const { title } = subject;
  return toNotice(msg`${commenterName} commented on "${title}"`);
}

export function meetingRequestNotice(
  requesterName: string,
  at: EmailTime
): NoticeMessage {
  const time = asText(at);
  return toNotice(msg`${requesterName} asked you for a 1-on-1 on ${time}`);
}

export function meetingOutcomeNotice(
  actorName: string,
  outcome: MeetingOutcome,
  at: EmailTime
): NoticeMessage {
  const time = asText(at);
  return toNotice(
    {
      accepted: msg`${actorName} accepted your 1-on-1 request for ${time}`,
      declined: msg`${actorName} declined your 1-on-1 request for ${time}`,
      canceled: msg`${actorName} canceled the 1-on-1 on ${time}`,
    }[outcome]
  );
}

export function meetingNudgeNotice(
  askerName: string,
  eventName: string
): NoticeMessage {
  return toNotice(
    msg`${askerName} would like to book a 1-on-1 with you at ${eventName}. Say when you are free in Settings, under 1-on-1s.`
  );
}

export function meetingNudgeAnsweredNotice(
  recipientName: string,
  eventName: string
): NoticeMessage {
  return toNotice(msg`${recipientName} is open to 1-on-1s at ${eventName}`);
}

// Names the session and the ask and nothing else: a notification renders on a
// (site) page, where guest switching is unauthenticated (FR-022).
export function reminderNotice(
  kind: ReminderKind,
  title: string
): NoticeMessage {
  return toNotice(
    kind === "headsUp"
      ? msg`You're hosting "${title}" shortly — count the people who come`
      : msg`How many people came to "${title}"?`
  );
}

export type SessionChange = {
  newTime: EmailTime;
  oldTime?: EmailTime;
  newLocation: string[];
  oldLocation?: string[];
};

// Both old values are named: someone told their session moved wants to know
// which slot just freed up, to fill it or to host in it.
export function sessionChangedNotice(
  to: "host" | "attendee",
  title: string,
  change: SessionChange
): NoticeMessage {
  const host = to === "host";
  const newTime = asText(change.newTime);
  const newLocation = asText(change.newLocation);
  const oldTime = change.oldTime ? asText(change.oldTime) : "";
  const oldLocation = change.oldLocation ? asText(change.oldLocation) : "";
  const newTimeKind = isUnscheduled(change.newTime) ? "none" : "some";
  const newLocationKind = hasNoPlaces(change.newLocation) ? "none" : "some";
  const oldTimeKind =
    change.oldTime && isUnscheduled(change.oldTime) ? "none" : "some";
  const oldLocationKind =
    change.oldLocation && hasNoPlaces(change.oldLocation) ? "none" : "some";
  if (oldTime && oldLocation) {
    return toNotice(
      host
        ? msg`Your session "${title}" is now ${select(newTimeKind, { none: "unscheduled", other: newTime })}, ${select(newLocationKind, { none: "no location", other: newLocation })} (was ${select(oldTimeKind, { none: "unscheduled", other: oldTime })}, ${select(oldLocationKind, { none: "no location", other: oldLocation })})`
        : msg`"${title}" is now ${select(newTimeKind, { none: "unscheduled", other: newTime })}, ${select(newLocationKind, { none: "no location", other: newLocation })} (was ${select(oldTimeKind, { none: "unscheduled", other: oldTime })}, ${select(oldLocationKind, { none: "no location", other: oldLocation })})`
    );
  }
  if (oldTime) {
    return toNotice(
      host
        ? msg`Your session "${title}" moved to ${select(newTimeKind, { none: "unscheduled", other: newTime })} (was ${select(oldTimeKind, { none: "unscheduled", other: oldTime })})`
        : msg`"${title}" moved to ${select(newTimeKind, { none: "unscheduled", other: newTime })} (was ${select(oldTimeKind, { none: "unscheduled", other: oldTime })})`
    );
  }
  return toNotice(
    host
      ? msg`Your session "${title}" moved to ${select(newLocationKind, { none: "no location", other: newLocation })} (was ${select(oldLocationKind, { none: "no location", other: oldLocation })})`
      : msg`"${title}" moved to ${select(newLocationKind, { none: "no location", other: newLocation })} (was ${select(oldLocationKind, { none: "no location", other: oldLocation })})`
  );
}

export function sessionDeletedNotice(
  to: "host" | "attendee",
  title: string
): NoticeMessage {
  return toNotice(
    to === "host"
      ? msg`Your session "${title}" was deleted`
      : msg`"${title}" was deleted`
  );
}

export function sessionLostHostNotice(title: string): NoticeMessage {
  return toNotice(msg`"${title}" has no host now`);
}

export function cohostAddedNotice(
  title: string,
  soleHost: boolean
): NoticeMessage {
  return toNotice(
    soleHost
      ? msg`You were added as the host of "${title}"`
      : msg`You were added as a co-host of "${title}"`
  );
}

export function proposalJoinedNotice(
  joinerName: string,
  title: string
): NoticeMessage {
  return toNotice(msg`${joinerName} joined "${title}" as a co-host`);
}
