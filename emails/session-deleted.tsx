import { msg } from "@lingui/core/macro";

import {
  formatPlaces,
  formatTime,
  type PlacesProp,
  type TimeProp,
} from "@/server/kernel/localized-text";
import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

// Sent to hosts and RSVP'd guests when a session is deleted. Time and
// location describe the session as it was; the link goes to the schedule,
// since the session itself is gone.
//
// The session's description is deliberately left out: it is not what the
// notification is about, and there is no reason to hand it to the recipient's
// email provider.
export function sessionDeletedEmail(
  props: {
    recipient: "host" | "attendee";
    title: string;
    time: TimeProp;
    location: PlacesProp;
    eventUrl: string;
  },
  t: Translate
): EmailMessage {
  const { title } = props;
  return {
    subject: t(msg`Session deleted: ${title}`),
    body: (
      <>
        <h1>{title}</h1>
        <p>
          {props.recipient === "host"
            ? t(msg`A session you’re hosting has been deleted.`)
            : t(msg`A session you RSVP’d to has been deleted.`)}
        </p>
        <p>
          <strong>{t(msg`Time:`)}</strong> {formatTime(props.time, t)}
        </p>
        <p>
          <strong>{t(msg`Location:`)}</strong> {formatPlaces(props.location, t)}
        </p>
        <p>
          <a href={props.eventUrl}>{t(msg`View the schedule`)}</a>
        </p>
      </>
    ),
  };
}
