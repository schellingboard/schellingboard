const REASONS: Record<string, string> = {
  "session.full": "This session is full.",
  "rsvp.ownSession": "Hosts cannot RSVP to their own session.",
  "event.notSchedulingPhase":
    "This can only be changed during the scheduling phase.",
  "event.notVotingPhase": "This can only be changed during the voting phase.",
  "vote.ownProposal": "Hosts cannot vote on their own proposal.",
  "proposal.notFound": "This proposal no longer exists.",
  "guest.notInEvent": "You are not part of this event.",
  "comment.invalid": "A comment cannot be empty.",
  "comment.notAuthor": "Only the author can change a comment.",
  "comment.notFound": "This comment no longer exists.",
  "comment.parentInvalid": "The comment you replied to no longer exists.",
};

export const reasonFor = (code: string): string | undefined => REASONS[code];

export type Failure = { what: string; code: string; gaveUp: boolean };

export function failureMessage({ what, code, gaveUp }: Failure): string {
  if (gaveUp)
    return `Your request to ${what} might not have been saved. Check that it went through, then try again.`;
  return `Could not ${what}. ${REASONS[code] ?? "Please try again."}`;
}
