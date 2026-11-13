import { msg } from "@lingui/core/macro";

import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

import {
  formatPlaces,
  formatTime,
  type PlacesProp,
  type TimeProp,
} from "./format";

// Sent to a guest when someone adds them as a co-host of a session (or
// creates a session listing them).
//
// The session's description is deliberately left out: it is not what the
// notification is about, and there is no reason to hand it to the recipient's
// email provider.
export function cohostAddedEmail(
  props: {
    title: string;
    time: TimeProp;
    location: PlacesProp;
    sessionUrl: string;
    soleHost?: boolean;
  },
  t: Translate
): EmailMessage {
  const { title } = props;
  return {
    subject: props.soleHost
      ? t(msg`You are now the host of: ${title}`)
      : t(msg`You are now a co-host of: ${title}`),
    body: (
      <>
        <h1>{title}</h1>
        <p>
          {props.soleHost
            ? t(msg`You’ve been added as the host of this session.`)
            : t(msg`You’ve been added as a co-host of this session.`)}
        </p>
        <p>
          <strong>{t(msg`Time:`)}</strong> {formatTime(props.time, t)}
        </p>
        <p>
          <strong>{t(msg`Location:`)}</strong> {formatPlaces(props.location, t)}
        </p>
        <p>
          <a href={props.sessionUrl}>{t(msg`View the session`)}</a>
        </p>
      </>
    ),
  };
}
