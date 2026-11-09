import type { EmailMessage } from "@/utils/mailer";

// Sent to the RSVP'd guests when a session is left without a host.
export function sessionLostHostEmail(props: {
  title: string;
  sessionUrl: string;
}): EmailMessage {
  return {
    subject: `No host for: ${props.title}`,
    body: (
      <>
        <h1>{props.title}</h1>
        <p>A session you RSVP&rsquo;d to has no host now.</p>
        <p>It may be cancelled. You can become its host on the session page.</p>
        <p>
          <a href={props.sessionUrl}>View the session</a>
        </p>
      </>
    ),
  };
}
