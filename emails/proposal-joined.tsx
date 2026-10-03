import type { EmailMessage } from "@/utils/mailer";

export function proposalJoinedEmail(props: {
  title: string;
  joinerName: string;
  proposalUrl: string;
}): EmailMessage {
  return {
    subject: `${props.joinerName} joined your proposal: ${props.title}`,
    body: (
      <>
        <h1>{props.title}</h1>
        <p>
          {props.joinerName} joined this proposal as a co-host and can now edit
          it with you. It is no longer marked as looking for a co-host.
        </p>
        <p>
          <a href={props.proposalUrl}>View the proposal</a>
        </p>
      </>
    ),
  };
}
