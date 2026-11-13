import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

import {
  formatPlaces,
  formatTime,
  type PlacesProp,
  type TimeProp,
} from "./format";

// Sent to each host an hour before their session's displayed start. It does
// double duty (FR-009): the reminder that they are hosting shortly, and the
// ask to count the room while they are in it.
export function attendeeCountHeadsUpEmail(
  props: {
    title: string;
    time: TimeProp;
    location: PlacesProp;
    sessionUrl: string;
  },
  t: Translate
): EmailMessage {
  const { title } = props;
  return {
    subject: t(msg`You're hosting "${title}" shortly`),
    body: (
      <>
        <h1>{title}</h1>
        <p>{t(msg`You’re hosting this session in about an hour.`)}</p>
        <p>
          <strong>{t(msg`Time:`)}</strong> {formatTime(props.time, t)}
        </p>
        <p>
          <strong>{t(msg`Location:`)}</strong> {formatPlaces(props.location, t)}
        </p>
        <p>
          {t(
            msg`While you’re there, please count how many people attend. Once the session has finished you’ll be able to record the number, and we’ll remind you when it’s time.`
          )}
        </p>
        <p>
          <a href={props.sessionUrl}>{t(msg`View the session`)}</a>
        </p>
      </>
    ),
  };
}
