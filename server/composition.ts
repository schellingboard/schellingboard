import { after } from "next/server";
import { getRepositories } from "@/db/container";
import { getImageRepositories } from "@/utils/images";
import { nudgeJobs } from "@/utils/jobs/nudge";
import {
  notifyCohostsAdded,
  notifyMeetingOutcome,
  notifyMeetingRequested,
  notifyProfileCommented,
  notifyProposalCommented,
  notifyProposalJoined,
  notifySessionCommented,
} from "@/utils/notifications";
import {
  createCommentUseCases,
  type CommentDeps,
  type CommentUseCases,
} from "@/server/modules/comments/module";
import {
  createEventUseCases,
  type EventUseCases,
} from "@/server/modules/events/module";
import {
  createMeetingUseCases,
  type MeetingUseCases,
} from "@/server/modules/meetings/module";
import {
  createNotificationUseCases,
  type NotificationUseCases,
} from "@/server/modules/notifications/module";
import {
  createPeopleUseCases,
  type PeopleUseCases,
} from "@/server/modules/people/module";
import {
  createProposalUseCases,
  type ProposalUseCases,
} from "@/server/modules/proposals/module";
import {
  createSessionUseCases,
  type SessionUseCases,
} from "@/server/modules/sessions/module";
import {
  createVenueUseCases,
  type VenueUseCases,
} from "@/server/modules/venue/module";

// Built per call: tests swap the repository container between cases.
export function sessionUseCases(): SessionUseCases {
  return createSessionUseCases({
    repos: getRepositories(),
    notifyCohostsAdded,
    nudgeJobs,
  });
}

export function proposalUseCases(): ProposalUseCases {
  return createProposalUseCases({
    repos: getRepositories(),
    notifyProposalJoined: (args) => after(() => notifyProposalJoined(args)),
  });
}

const notifyCommented: CommentDeps["notifyCommented"] = ({
  subject,
  comment,
  now,
}) =>
  after(() => {
    if (subject.kind === "proposal")
      return notifyProposalCommented({ proposalId: subject.id, comment, now });
    if (subject.kind === "session")
      return notifySessionCommented({ sessionId: subject.id, comment, now });
    return notifyProfileCommented({ profileId: subject.id, comment, now });
  });

export function commentUseCases(): CommentUseCases {
  return createCommentUseCases({ repos: getRepositories(), notifyCommented });
}

export function meetingUseCases(): MeetingUseCases {
  return createMeetingUseCases({
    repos: getRepositories(),
    notifyMeetingRequested,
    notifyMeetingOutcome,
  });
}

export function peopleUseCases(): PeopleUseCases {
  return createPeopleUseCases({
    repos: getRepositories(),
    avatars: getImageRepositories().avatars,
  });
}

export function notificationUseCases(): NotificationUseCases {
  return createNotificationUseCases({ repos: getRepositories() });
}

export function eventUseCases(): EventUseCases {
  return createEventUseCases({ repos: getRepositories() });
}

export function venueUseCases(): VenueUseCases {
  return createVenueUseCases({
    repos: getRepositories(),
    images: getImageRepositories().locations,
  });
}
