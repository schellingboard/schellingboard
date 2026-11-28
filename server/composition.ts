import { getRepositories } from "@/db/container";
import { authCodeEmail } from "@/emails/auth-code";
import { authPasswordResetEmail } from "@/emails/auth-password-reset";
import { authSecurityChangedEmail } from "@/emails/auth-security-changed";
import { joinLinkEmail, joinLinkMadeEmail } from "@/emails/join-link";
import { testEmail } from "@/emails/test-email";
import { translatorFor } from "@/server/kernel/translator";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import {
  type CommentUseCases,
  createCommentUseCases,
  proposalComments,
} from "@/server/modules/comments/module";
import {
  allEvents,
  createEventUseCases,
  eventById,
  eventBySlug,
  eventDays,
  type EventUseCases,
} from "@/server/modules/events/module";
import {
  createMeetingUseCases,
  guestSchedules,
  type MeetingUseCases,
  meetingViews,
} from "@/server/modules/meetings/module";
import {
  createNotificationUseCases,
  type NotificationUseCases,
  unreadNotificationCount,
} from "@/server/modules/notifications/module";
import {
  allGuests,
  attendees,
  createPeopleUseCases,
  guestAuthProtection,
  guestById,
  type PeopleUseCases,
} from "@/server/modules/people/module";
import {
  createProposalUseCases,
  eventProposals,
  guestVotes,
  hostedProposals,
  proposalById,
  type ProposalUseCases,
} from "@/server/modules/proposals/module";
import {
  createSessionUseCases,
  hostedSessions,
  sessionsOfEvent,
  type SessionUseCases,
} from "@/server/modules/sessions/module";
import {
  createSettingsUseCases,
  type SettingsUseCases,
  siteSettings,
} from "@/server/modules/settings/module";
import {
  createStatsUseCases,
  type StatsUseCases,
} from "@/server/modules/stats/module";
import {
  createReleaseCheck,
  createUpdateUseCases,
  fetchLatestRelease,
  type UpdateUseCases,
} from "@/server/modules/updates/module";
import {
  createVenueUseCases,
  eventLocations,
  type VenueUseCases,
} from "@/server/modules/venue/module";
import { getAppVersion } from "@/utils/git";
import { getImageRepositories } from "@/utils/images";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { mapImages } from "@/utils/map-image";
import { generateVapidKeys } from "@/utils/push";
import { dispatchDueReminders } from "@/utils/reminder-dispatch";
import { siteUrl } from "@/utils/site-url";

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
      send: ({ guestId, name, email, locale, code, validMinutes }) =>
        sendMail({
          to: email,
          ...authCodeEmail(
            {
              name,
              code,
              loginUrl: `${siteUrl()}/auth/login?guest=${encodeURIComponent(
                guestId
              )}&code=${encodeURIComponent(code)}`,
              validMinutes,
            },
            translatorFor(locale)
          ),
        }),
      sendResetLink: ({
        guestId,
        name,
        email,
        locale,
        token,
        validMinutes,
        fromAdmin,
      }) =>
        sendMail({
          to: email,
          ...authPasswordResetEmail(
            {
              name,
              resetUrl: `${siteUrl()}/auth/reset?guest=${encodeURIComponent(
                guestId
              )}&token=${encodeURIComponent(token)}`,
              validMinutes,
              fromAdmin,
            },
            translatorFor(locale)
          ),
        }),
      sendJoinLink: ({ name, email, locale, eventName, token }) =>
        sendMail({
          to: email,
          ...joinLinkEmail(
            {
              name,
              eventName,
              joinUrl: `${siteUrl()}/join/${encodeURIComponent(token)}`,
            },
            translatorFor(locale)
          ),
        }),
      sendJoinLinkMade: ({ name, email, locale, eventName }) =>
        sendMail({
          to: email,
          ...joinLinkMadeEmail({ name, eventName }, translatorFor(locale)),
        }),
      sendSecurityChanged: ({ name, email, locale, change }) =>
        sendMail({
          to: email,
          ...authSecurityChangedEmail({ name, change }, translatorFor(locale)),
        }),
    },
    sendTestEmail: ({ name, email, locale }) =>
      sendMail({ to: email, ...testEmail({ name }, translatorFor(locale)) }),
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
    mailConfigured: isMailerConfigured,
    uow: unitOfWork,
  });
}

export function statsUseCases(): StatsUseCases {
  return createStatsUseCases({
    repos: getRepositories(),
    version: getAppVersion,
    now: () => new Date(),
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
