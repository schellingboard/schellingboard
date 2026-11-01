import type { EmailMessage } from "@/utils/mailer";

export function joinLinkEmail(props: {
  name: string;
  eventName: string;
  joinUrl: string;
}): EmailMessage {
  return {
    subject: `Your link to ${props.eventName}`,
    body: (
      <>
        <p>Hi {props.name},</p>
        <p>
          Use this personal link to join {props.eventName}. It signs you in as
          you, so keep it to yourself:
        </p>
        <p>
          <a href={props.joinUrl}>Join {props.eventName}</a>
        </p>
        <p>
          A newer link replaces this one, and so does setting a password: the
          link then asks you to sign in first.
        </p>
      </>
    ),
  };
}

// Sent when an organizer makes a link to hand over themselves, so a scam to
// get someone's link is noticed.
export function joinLinkMadeEmail(props: {
  name: string;
  eventName: string;
}): EmailMessage {
  return {
    subject: `A new link to ${props.eventName} was made for you`,
    body: (
      <>
        <p>Hi {props.name},</p>
        <p>
          An organizer made a new personal link for you to join{" "}
          {props.eventName}. Links sent to you before no longer work.
        </p>
        <p>
          If you did not expect this, do not share the link with anyone who asks
          for it.
        </p>
      </>
    ),
  };
}
