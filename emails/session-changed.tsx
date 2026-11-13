import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

import {
  formatPlaces,
  formatTime,
  hasNoPlaces,
  isUnscheduled,
  type PlacesProp,
  type TimeProp,
} from "./format";

// Sent to hosts and RSVP'd guests when a session changes time and/or
// location. The old value is given only for what actually changed.
//
// The session's description is deliberately left out: it is not what the
// notification is about, and there is no reason to hand it to the recipient's
// email provider.
export function sessionChangedEmail(
  props: {
    recipient: "host" | "attendee";
    title: string;
    newTime: TimeProp;
    oldTime?: TimeProp;
    newLocation: PlacesProp;
    oldLocation?: PlacesProp;
    sessionUrl: string;
  },
  t: Translate
): EmailMessage {
  const { title } = props;
  const host = props.recipient === "host";
  const both = props.oldTime && props.oldLocation;
  const oldTimeText = props.oldTime ? formatTime(props.oldTime, t) : "";
  const oldLocationText = props.oldLocation
    ? formatPlaces(props.oldLocation, t)
    : "";
  const wasTime =
    props.oldTime &&
    (isUnscheduled(props.oldTime)
      ? t(msg`(was unscheduled)`)
      : t(msg`(was ${oldTimeText})`));
  const wasLocation =
    props.oldLocation &&
    (hasNoPlaces(props.oldLocation)
      ? t(msg`(was no location)`)
      : t(msg`(was ${oldLocationText})`));
  return {
    subject: both
      ? t(msg`Session time and location changed: ${title}`)
      : props.oldTime
        ? t(msg`Session time changed: ${title}`)
        : t(msg`Session location changed: ${title}`),
    body: (
      <>
        <h1>{title}</h1>
        <p>
          {both
            ? host
              ? t(msg`A session you’re hosting has changed time and location.`)
              : t(msg`A session you RSVP’d to has changed time and location.`)
            : props.oldTime
              ? host
                ? t(msg`A session you’re hosting has changed time.`)
                : t(msg`A session you RSVP’d to has changed time.`)
              : host
                ? t(msg`A session you’re hosting has changed location.`)
                : t(msg`A session you RSVP’d to has changed location.`)}
        </p>
        <p>
          <strong>{t(msg`Time:`)}</strong> {formatTime(props.newTime, t)}
          {wasTime && <> {wasTime}</>}
        </p>
        <p>
          <strong>{t(msg`Location:`)}</strong>{" "}
          {formatPlaces(props.newLocation, t)}
          {wasLocation && <> {wasLocation}</>}
        </p>
        <p>
          <a href={props.sessionUrl}>{t(msg`View the session`)}</a>
        </p>
      </>
    ),
  };
}
