import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

import { formatTime, type TimeProp } from "./format";

/** How a pending 1-on-1 ended, from the point of view of the guest being told. */
export type MeetingOutcome = "accepted" | "declined" | "canceled";

// The one-line version, for the in-app notification. The time is what tells
// two requests from the same person apart, so it is always named.
export function meetingRequestNoticeText(
  requesterName: string,
  time: string
): string {
  return `${requesterName} asked you for a 1-on-1 on ${time}`;
}

export function meetingOutcomeNoticeText(
  actorName: string,
  outcome: MeetingOutcome,
  time: string
): string {
  return outcome === "canceled"
    ? `${actorName} canceled the 1-on-1 on ${time}`
    : `${actorName} ${outcome} your 1-on-1 request for ${time}`;
}

// Sent when someone asks the guest for a 1-on-1.
//
// The requester's line of context is deliberately left out, as comment text
// is: it is enough to say there is a request and link to it, and what guests
// write to each other need not go to their email providers.
export function meetingRequestEmail(
  props: {
    requesterName: string;
    time: TimeProp;
    meetingPoint: string;
    url: string;
  },
  t: Translate
): EmailMessage {
  const { requesterName } = props;
  return {
    subject: t(msg`1-on-1 request from ${requesterName}`),
    body: (
      <>
        <h1>{t(msg`${requesterName} would like to meet you`)}</h1>
        <p>
          <strong>{t(msg`When:`)}</strong> {formatTime(props.time, t)}
        </p>
        <p>
          <strong>{t(msg`Where:`)}</strong> {props.meetingPoint}
        </p>
        <p>
          <a href={props.url}>{t(msg`Accept or decline`)}</a>
        </p>
      </>
    ),
  };
}

// Sent to the other party when a 1-on-1 is accepted, declined or canceled.
export function meetingOutcomeEmail(
  props: {
    actorName: string;
    outcome: MeetingOutcome;
    time: TimeProp;
    meetingPoint: string;
    url: string;
  },
  t: Translate
): EmailMessage {
  const { actorName } = props;
  const time = formatTime(props.time, t);
  const [subject, heading] = {
    accepted: [
      t(msg`1-on-1 accepted: ${time}`),
      t(msg`${actorName} accepted your 1-on-1 request for ${time}`),
    ],
    declined: [
      t(msg`1-on-1 declined: ${time}`),
      t(msg`${actorName} declined your 1-on-1 request for ${time}`),
    ],
    canceled: [
      t(msg`1-on-1 canceled: ${time}`),
      t(msg`${actorName} canceled the 1-on-1 on ${time}`),
    ],
  }[props.outcome];
  return {
    subject,
    body: (
      <>
        <h1>{heading}</h1>
        {props.outcome === "accepted" && (
          <p>
            <strong>{t(msg`Where:`)}</strong> {props.meetingPoint}
          </p>
        )}
        <p>
          <a href={props.url}>{t(msg`View the 1-on-1`)}</a>
        </p>
      </>
    ),
  };
}

function meetingNudgeHeadline(askerName: string, eventName: string): string {
  return `${askerName} would like to book a 1-on-1 with you at ${eventName}`;
}

export function meetingNudgeNoticeText(
  askerName: string,
  eventName: string
): string {
  return `${meetingNudgeHeadline(askerName, eventName)}. Say when you are free in Settings, under 1-on-1s.`;
}

export function meetingNudgeAnsweredNoticeText(
  recipientName: string,
  eventName: string
): string {
  return `${recipientName} is open to 1-on-1s at ${eventName}`;
}

// Sent when someone asks the guest to say when they are free for 1-on-1s.
export function meetingNudgeEmail(
  props: { askerName: string; eventName: string; url: string },
  t: Translate
): EmailMessage {
  const { askerName, eventName } = props;
  return {
    subject: t(msg`${askerName} would like a 1-on-1 with you`),
    body: (
      <>
        <h1>
          {t(
            msg`${askerName} would like to book a 1-on-1 with you at ${eventName}`
          )}
        </h1>
        <p>{t(msg`They can only book you once you are open to 1-on-1s.`)}</p>
        <p>
          {t(
            msg`To open up, go to Settings and find 1-on-1s. Open ${eventName}, tick "I'm open to 1-on-1s at this event", choose when you are free and save.`
          )}
        </p>
        <p>
          <a href={props.url}>{t(msg`Open your 1-on-1 settings`)}</a>
        </p>
      </>
    ),
  };
}

// Sent to whoever asked, once the guest has declared their first free slots.
export function meetingNudgeAnsweredEmail(
  props: { recipientName: string; eventName: string; url: string },
  t: Translate
): EmailMessage {
  const { recipientName, eventName } = props;
  return {
    subject: t(msg`${recipientName} is open to 1-on-1s`),
    body: (
      <>
        <h1>{t(msg`${recipientName} is open to 1-on-1s at ${eventName}`)}</h1>
        <p>
          <a href={props.url}>{t(msg`Schedule a 1-on-1`)}</a>
        </p>
      </>
    ),
  };
}
