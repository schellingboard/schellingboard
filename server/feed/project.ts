import type { FeedMessage } from "@schellingboard/contracts/feed";
import type { RecordedChange, Viewer } from "@schellingboard/domain/change";
import { toDayView, toEventView } from "@/server/modules/events/module";
import {
  toMeetingPointView,
  toMeetingView,
} from "@/server/modules/meetings/module";
import { toSnapshotProposalView } from "@/server/modules/proposals/module";
import { toEventGuestView } from "@/server/modules/people/module";
import { toLocationView } from "@/server/modules/venue/module";
import {
  toSnapshotSessionView,
  toUnavailabilityView,
} from "@/server/modules/sessions/module";

// Only the actor learns the key: keys are unique per actor. Coarser than ADR
// 0012 section 5's scope (no admin id, no cookie level); see ADR 0014.
function commandKeyFor(change: RecordedChange, viewer: Viewer): string | null {
  const { actor } = change;
  const own =
    actor.type === "guest"
      ? actor.id === viewer.guestId
      : actor.type === "admin" && viewer.admin;
  return own ? change.commandKey : null;
}

export function project(
  change: RecordedChange,
  viewer: Viewer
): FeedMessage | undefined {
  const common = { seq: change.seq, commandKey: commandKeyFor(change, viewer) };
  switch (change.type) {
    case "event.changed":
      return {
        ...common,
        type: change.type,
        event: toEventView(change.payload.event),
      };
    case "event.deleted":
      return { ...common, type: change.type };
    case "location.changed":
      return {
        ...common,
        type: change.type,
        location: toLocationView(change.payload.location),
      };
    case "location.removed":
      return { ...common, type: change.type, locationId: change.subjectId };
    case "unavailability.added":
      return {
        ...common,
        type: change.type,
        period: toUnavailabilityView(change.payload.period),
      };
    case "unavailability.removed":
      return { ...common, type: change.type, periodId: change.subjectId };
    case "guest.changed":
      return {
        ...common,
        type: change.type,
        guest: {
          ...toEventGuestView(change.payload.guest),
          member: change.payload.member,
        },
      };
    case "guest.removed":
      return { ...common, type: change.type, guestId: change.subjectId };
    case "meetingPoint.changed":
      return {
        ...common,
        type: change.type,
        meetingPoint: toMeetingPointView(change.payload.point),
      };
    case "meetingPoint.removed":
      return { ...common, type: change.type, meetingPointId: change.subjectId };
    case "meeting.changed":
      return {
        ...common,
        type: change.type,
        meeting: toMeetingView(change.payload.meeting),
      };
    case "meeting.deleted":
      return { ...common, type: change.type, meetingId: change.subjectId };
    case "availability.changed":
      return {
        ...common,
        type: change.type,
        slotStarts: change.payload.slotStarts,
      };
    case "day.created":
    case "day.changed":
      return {
        ...common,
        type: change.type,
        day: toDayView(change.payload.day),
      };
    case "day.deleted":
      return { ...common, type: change.type, dayId: change.subjectId };
    case "proposal.created":
    case "proposal.changed":
      return {
        ...common,
        type: change.type,
        proposal: toSnapshotProposalView(change.payload.proposal),
      };
    case "proposal.deleted":
      return { ...common, type: change.type, proposalId: change.subjectId };
    case "session.created":
      return {
        ...common,
        type: change.type,
        session: toSnapshotSessionView(change.payload.session),
      };
    case "session.changed":
      return {
        ...common,
        type: change.type,
        session: toSnapshotSessionView(change.payload.after),
      };
    case "session.deleted":
      return { ...common, type: change.type, sessionId: change.subjectId };
    case "session.attendanceChanged":
      return {
        ...common,
        type: change.type,
        sessionId: change.subjectId,
        numRsvps: change.payload.numRsvps,
      };
    case "rsvp.added":
      return { ...common, type: change.type, rsvp: change.payload.rsvp };
    case "rsvp.removed":
      return { ...common, type: change.type, ...change.payload };
    default:
      return undefined;
  }
}
