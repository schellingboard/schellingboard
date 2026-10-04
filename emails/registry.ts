import type { EmailMessage } from "@/utils/mailer";
import { cohostAddedEmail } from "./cohost-added";
import { commentEmail } from "./comment";
import { meetingOutcomeEmail, meetingRequestEmail } from "./meeting";
import { proposalJoinedEmail } from "./proposal-joined";
import { sessionChangedEmail } from "./session-changed";
import { sessionDeletedEmail } from "./session-deleted";

// The emails a notification may send. A queued email is stored as which of
// these to build and with what, since a built message holds a React element:
// props may gain optional fields, but anything else needs a new key.
const templates = {
  cohostAdded: cohostAddedEmail,
  comment: commentEmail,
  meetingOutcome: meetingOutcomeEmail,
  meetingRequest: meetingRequestEmail,
  proposalJoined: proposalJoinedEmail,
  sessionChanged: sessionChangedEmail,
  sessionDeleted: sessionDeletedEmail,
};

type Templates = typeof templates;

export type EmailRecipe = {
  [K in keyof Templates]: { template: K; props: Parameters<Templates[K]>[0] };
}[keyof Templates];

/** Thrown for a queued email whose template this version no longer has. */
export class UnknownTemplateError extends Error {}

export function buildEmail(recipe: EmailRecipe): EmailMessage {
  const build = templates[recipe.template] as
    ((props: EmailRecipe["props"]) => EmailMessage) | undefined;
  if (!build) {
    throw new UnknownTemplateError(
      `Unknown email template: ${recipe.template}`
    );
  }
  return build(recipe.props);
}
