import { msg, select } from "@lingui/core/macro";

import { nameOf, whoOf } from "@/server/kernel/localized-text";
import type { Translate } from "@/server/kernel/translator";
import type { EmailMessage } from "@/utils/mailer";

/** What was commented on, and how to name it in the email. */
export type CommentSubject =
  | { kind: "proposal"; title: string }
  | { kind: "session"; title: string }
  | { kind: "profile"; ownerName: string };

/**
 * Who is being told: the guest responsible for the subject — a proposal's or
 * session's host, a profile's owner — or a guest who commented on it earlier.
 */
export type CommentRecipient = "responsible" | "commenter";

// Sent when someone comments on a proposal, a session or a profile.
//
// The comment's text is deliberately left out: it is enough to say that there
// is one and link to it, and there is no reason to hand what guests write to
// each other to their email providers.
export function commentEmail(
  props: {
    subject: CommentSubject;
    recipient: CommentRecipient;
    commenterName: string | undefined;
    url: string;
  },
  t: Translate
): EmailMessage {
  const { subject } = props;
  const commenterKind = whoOf(props.commenterName);
  const commenter = nameOf(props.commenterName);
  const mine = props.recipient === "responsible";
  let heading: string;
  let line: string;
  let subjectLine: string;
  if (subject.kind === "profile") {
    const { ownerName } = subject;
    heading = mine ? t(msg`Your profile`) : t(msg`${ownerName}'s profile`);
    subjectLine = mine
      ? t(msg`New comment on your profile`)
      : t(msg`New comment on: ${ownerName}'s profile`);
    line = mine
      ? t(
          msg`${select(commenterKind, { gone: "Someone", other: commenter })} commented on your profile.`
        )
      : t(
          msg`${select(commenterKind, { gone: "Someone", other: commenter })} commented on a profile you commented on.`
        );
  } else {
    const { title: name } = subject;
    heading = name;
    subjectLine = t(msg`New comment on: ${name}`);
    if (subject.kind === "proposal") {
      line = mine
        ? t(
            msg`${select(commenterKind, { gone: "Someone", other: commenter })} commented on a proposal you're hosting.`
          )
        : t(
            msg`${select(commenterKind, { gone: "Someone", other: commenter })} commented on a proposal you commented on.`
          );
    } else {
      line = mine
        ? t(
            msg`${select(commenterKind, { gone: "Someone", other: commenter })} commented on a session you're hosting.`
          )
        : t(
            msg`${select(commenterKind, { gone: "Someone", other: commenter })} commented on a session you commented on.`
          );
    }
  }
  return {
    subject: subjectLine,
    body: (
      <>
        <h1>{heading}</h1>
        <p>{line}</p>
        <p>
          <a href={props.url}>{t(msg`View the comment`)}</a>
        </p>
      </>
    ),
  };
}
