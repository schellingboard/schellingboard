import { getRepositories } from "@/db/container";
import {
  type ActionResult,
  runIdempotentAction,
} from "@/server/kernel/idempotency";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { testEmail } from "@/emails/test-email";
import { dispatchDueReminders } from "@/utils/reminder-dispatch";
import { getImageRepositories } from "@/utils/images";
import { sendMail } from "@/utils/mailer";
import { generateVapidKeys } from "@/utils/push";
import { mapImages } from "@/utils/map-image";
import {
  createCommentUseCases,
  type CommentUseCases,
  proposalComments,
} from "@/server/modules/comments/module";
import {
  createEventUseCases,
  type EventUseCases,
  allEvents,
  eventById,
  eventBySlug,
  eventDays,
} from "@/server/modules/events/module";
import {
  availabilityForms,
  createMeetingUseCases,
  guestSchedules,
  meetingOptions,
  meetingViews,
  type MeetingUseCases,
} from "@/server/modules/meetings/module";
import {
  createNotificationUseCases,
  type NotificationUseCases,
  notificationCount,
  notificationPage,
  unreadNotificationCount,
} from "@/server/modules/notifications/module";
import {
  createPeopleUseCases,
  type PeopleUseCases,
  allGuests,
  attendees,
  guestAuthProtection,
  guestById,
} from "@/server/modules/people/module";
import {
  createProposalUseCases,
  type ProposalUseCases,
  eventProposals,
  guestVotes,
  hostedProposals,
  proposalById,
} from "@/server/modules/proposals/module";
import {
  createSessionUseCases,
  type SessionUseCases,
  hostedSessions,
  sessionsOfEvent,
} from "@/server/modules/sessions/module";
import {
  createSettingsUseCases,
  type SettingsUseCases,
  siteSettings,
} from "@/server/modules/settings/module";
import {
  createReleaseCheck,
  createUpdateUseCases,
  fetchLatestRelease,
  type UpdateUseCases,
} from "@/server/modules/updates/module";
import { getAppVersion } from "@/utils/git";
import {
  createVenueUseCases,
  type VenueUseCases,
  eventLocations,
} from "@/server/modules/venue/module";

// Built per call: tests swap the repository container between cases.
export function sessionUseCases(): SessionUseCases {
  return createSessionUseCases({
    repos: getRepositories(),
    uow: unitOfWork,
  });
}

export function proposalUseCases(): ProposalUseCases {
  return createProposalUseCases({
    repos: getRepositories(),
    uow: unitOfWork,
  });
}

export function commentUseCases(): CommentUseCases {
  return createCommentUseCases({
    repos: getRepositories(),
    uow: unitOfWork,
  });
}

export function meetingUseCases(): MeetingUseCases {
  return createMeetingUseCases({
    repos: getRepositories(),
    uow: unitOfWork,
  });
}

export function peopleUseCases(): PeopleUseCases {
  return createPeopleUseCases({
    repos: getRepositories(),
    avatars: getImageRepositories().avatars,
    sendTestEmail: ({ name, email }) =>
      sendMail({ to: email, ...testEmail({ name }) }),
    uow: unitOfWork,
  });
}

export function notificationUseCases(): NotificationUseCases {
  return createNotificationUseCases({
    repos: getRepositories(),
    uow: unitOfWork,
    generateVapidKeys,
  });
}

export function eventUseCases(): EventUseCases {
  return createEventUseCases({ repos: getRepositories(), uow: unitOfWork });
}

export function venueUseCases(): VenueUseCases {
  return createVenueUseCases({
    repos: getRepositories(),
    images: getImageRepositories().locations,
    uow: unitOfWork,
  });
}

export function settingsUseCases(): SettingsUseCases {
  return createSettingsUseCases({
    repos: getRepositories(),
    maps: mapImages,
    uow: unitOfWork,
  });
}

const releaseCheck = createReleaseCheck({
  fetchLatest: fetchLatestRelease,
  now: () => new Date(),
});

export function updateUseCases(): UpdateUseCases {
  return createUpdateUseCases({ check: releaseCheck, version: getAppVersion });
}

// What server-rendered pages read. No actor: these sit behind the site
// password only.
export function pageReads() {
  const repos = getRepositories();
  return {
    siteSettings: () => siteSettings(repos),
    allEvents: () => allEvents(repos),
    eventBySlug: (slug: string) => eventBySlug(repos, slug),
    eventById: (id: string) => eventById(repos, id),
    eventDays: (eventId: string) => eventDays(repos, eventId),
    allGuests: () => allGuests(repos),
    guestById: (id: string) => guestById(repos, id),
    guestAuthProtection: (id: string) => guestAuthProtection(repos, id),
    attendees: (now: Date) => attendees(repos, now),
    notificationPage: (
      guestId: string,
      page: { limit: number; offset: number }
    ) => notificationPage(repos, guestId, page),
    notificationCount: (guestId: string) => notificationCount(repos, guestId),
    unreadNotificationCount: (guestId: string) =>
      unreadNotificationCount(repos, guestId),
    eventProposals: (eventId: string) => eventProposals(repos, eventId),
    proposalById: (id: string) => proposalById(repos, id),
    hostedProposals: (guestId: string) => hostedProposals(repos, guestId),
    guestVotes: (guestId: string, eventId: string) =>
      guestVotes(repos, guestId, eventId),
    proposalComments: (proposalId: string) =>
      proposalComments(repos, proposalId),
    sessionsOfEvent: (eventId: string) => sessionsOfEvent(repos, eventId),
    hostedSessions: (guestId: string) => hostedSessions(repos, guestId),
    eventLocations: (eventId: string) => eventLocations(repos, eventId),
    guestSchedules: (eventId: string, guestIds: string[]) =>
      guestSchedules(repos, eventId, guestIds),
    meetingViews: (viewerId: string, eventId: string, now: Date) =>
      meetingViews(repos, viewerId, eventId, now),
    meetingOptions: (
      viewerId: string | null,
      recipientId: string,
      events: Parameters<typeof meetingOptions>[3]
    ) => meetingOptions(repos, viewerId, recipientId, events),
    availabilityForms: (guestId: string, now: Date) =>
      availabilityForms(repos, guestId, now),
  };
}

export function dispatchReminders(now: Date) {
  return dispatchDueReminders(now, getRepositories());
}

export function idempotentAction<R extends ActionResult>(
  call: Parameters<typeof runIdempotentAction>[1],
  run: () => Promise<R>
) {
  return runIdempotentAction(getRepositories().idempotency, call, run);
}
