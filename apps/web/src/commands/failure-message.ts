import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";

import type { Notice } from "../ui/notices";

const CAPACITY_INVALID = msg`Max attendees must be a non-negative whole number`;

export const capacityError = () => i18n._(CAPACITY_INVALID);

const REASONS: Record<string, MessageDescriptor> = {
  "session.full": msg`This session is full.`,
  "rsvp.ownSession": msg`Hosts cannot RSVP to their own session.`,
  "event.notSchedulingPhase": msg`This can only be changed during the scheduling phase.`,
  "event.notVotingPhase": msg`This can only be changed during the voting phase.`,
  "vote.ownProposal": msg`Hosts cannot vote on their own proposal.`,
  "proposal.notFound": msg`This proposal no longer exists.`,
  "proposal.hostNotWanted": msg`This proposal is not looking for a host.`,
  "proposal.notHost": msg`Only a host of this proposal can change it.`,
  "proposal.hostNotInEvent": msg`A host is not part of this event.`,
  "event.proposalsClosed": msg`The proposal phase is over.`,
  "proposal.alreadyHost": msg`You already host this proposal.`,
  "guest.notInEvent": msg`You are not part of this event.`,
  "guest.protected": msg`This name is protected. Sign in with its password.`,
  "guest.unselected": msg`Choose who you are first.`,
  "avatar.invalid": msg`That picture cannot be used.`,
  "meeting.slotsUnavailable": msg`Some of those slots are no longer offered. Reload the page.`,
  "meeting.slotUnavailable": msg`That slot is not available.`,
  "meeting.slotPassed": msg`That slot has already passed.`,
  "meeting.recipientUnavailable": msg`They are not available at that time.`,
  "meeting.recipientNotInEvent": msg`They are not attending this event.`,
  "meeting.duplicate": msg`You have already asked them for that time.`,
  "meeting.tooManyOpen": msg`You have too many requests waiting for an answer. Wait for a reply, or cancel one first.`,
  "meeting.tooLong": msg`That 1-on-1 is longer than the event allows.`,
  "meeting.pointRequired": msg`Choose or type where to meet.`,
  "event.meetingsDisabled": msg`1-on-1s are not enabled for this event.`,
  "meeting.notFound": msg`This 1-on-1 no longer exists.`,
  "meeting.notRecipient": msg`Only the person asked can answer.`,
  "meeting.alreadyAnswered": msg`This request has already been answered.`,
  "meeting.started": msg`That slot has already started.`,
  "meeting.notParticipant": msg`You are not part of this 1-on-1.`,
  "meeting.nothingToCancel": msg`There is nothing left to cancel.`,
  "meeting.recipientMustDecline": msg`Decline it instead of canceling.`,
  "session.clash": msg`Another session already uses that room at that time.`,
  "session.startsInPast": msg`That start time has already passed.`,
  "session.outsideBookingWindow": msg`That time is outside the hours sessions can be booked.`,
  "session.durationNotAllowed": msg`That length is not allowed for this event.`,
  "session.locationUnavailable": msg`That room is unavailable at that time.`,
  "session.locationNotBookable": msg`That room cannot be booked.`,
  "session.dayUnknown": msg`That day is no longer part of this event.`,
  "session.hostNotInEvent": msg`A host is not part of this event.`,
  "session.notHost": msg`Only a host of this session can change it.`,
  "session.started": msg`This session has already started, so it can no longer be moved.`,
  "session.managedByOrganizer": msg`An organizer manages this session.`,
  "session.notFound": msg`This session no longer exists.`,
  "session.hasHost": msg`This session already has a host.`,
  "session.versionConflict": msg`This session changed meanwhile. Check it and try again.`,
  "session.capacityInvalid": CAPACITY_INVALID,
  "comment.invalid": msg`A comment cannot be empty.`,
  "comment.notAuthor": msg`Only the author can change a comment.`,
  "comment.notAllowed": msg`You cannot remove this comment.`,
  "comment.notFound": msg`This comment no longer exists.`,
  "comment.parentInvalid": msg`The comment you replied to no longer exists.`,
};

export const reasonFor = (code: string): string | undefined =>
  Object.hasOwn(REASONS, code) ? i18n._(REASONS[code]) : undefined;

/** The two sentences that open a toast about a command, by how it ended. */
export type Described = { failed: string; unsure: string };

export type Failure = { described: Described; code: string; gaveUp: boolean };

export function failureMessage({ described, code, gaveUp }: Failure): string {
  if (gaveUp)
    return `${described.unsure} ${t`Check that it went through, then try again.`}`;
  return `${described.failed} ${reasonFor(code) ?? t`Please try again.`}`;
}

/** The person must check a given-up command themselves, so its notice waits for them. */
export const failureNotice = (failure: Failure): Notice => ({
  tone: "failure",
  message: failureMessage(failure),
  sticky: failure.gaveUp,
});
