import { getRepositories } from "@/db/container";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { authCodeEmail } from "@/emails/auth-code";
import { authPasswordResetEmail } from "@/emails/auth-password-reset";
import { authSecurityChangedEmail } from "@/emails/auth-security-changed";
import { joinLinkEmail, joinLinkMadeEmail } from "@/emails/join-link";
import { testEmail } from "@/emails/test-email";
import { dispatchDueReminders } from "@/utils/reminder-dispatch";
import { getImageRepositories } from "@/utils/images";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { siteUrl } from "@/utils/site-url";
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
  createMeetingUseCases,
  guestSchedules,
  meetingViews,
  type MeetingUseCases,
} from "@/server/modules/meetings/module";
import {
  createNotificationUseCases,
  type NotificationUseCases,
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
    loginMail: {
      configured: () => isMailerConfigured(),
      send: ({ guestId, name, email, code, validMinutes }) =>
        sendMail({
          to: email,
          ...authCodeEmail({
            name,
            code,
            loginUrl: `${siteUrl()}/auth/login?guest=${encodeURIComponent(
              guestId
            )}&code=${encodeURIComponent(code)}`,
            validMinutes,
          }),
        }),
      sendResetLink: ({ guestId, name, email, token, validMinutes }) =>
        sendMail({
          to: email,
          ...authPasswordResetEmail({
            name,
            resetUrl: `${siteUrl()}/auth/reset?guest=${encodeURIComponent(
              guestId
            )}&token=${encodeURIComponent(token)}`,
            validMinutes,
          }),
        }),
      sendJoinLink: ({ name, email, eventName, token }) =>
        sendMail({
          to: email,
          ...joinLinkEmail({
            name,
            eventName,
            joinUrl: `${siteUrl()}/join/${encodeURIComponent(token)}`,
          }),
        }),
      sendJoinLinkMade: ({ name, email, eventName }) =>
        sendMail({ to: email, ...joinLinkMadeEmail({ name, eventName }) }),
      sendSecurityChanged: ({ name, email, change }) =>
        sendMail({ to: email, ...authSecurityChangedEmail({ name, change }) }),
    },
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
  };
}

export function dispatchReminders(now: Date) {
  return dispatchDueReminders(now, getRepositories());
}
