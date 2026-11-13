import type {
  DueReminderCandidate,
  ReminderKey,
} from "@schellingboard/domain/reminder";
import {
  ABANDON_AFTER_HOURS,
  followUpEligible,
  headsUpEligible,
} from "@schellingboard/domain/reminder-schedule";

import type { Repositories } from "@/db/container";
import { attendeeCountFollowUpEmail } from "@/emails/attendee-count-followup";
import { attendeeCountHeadsUpEmail } from "@/emails/attendee-count-headsup";
import { emailInstant } from "@/server/kernel/localized-text";
import { renderNotice } from "@/server/kernel/notice";
import { notificationsChanged } from "@/server/kernel/notification-changes";
import { type Translate, translatorFor } from "@/server/kernel/translator";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { reminderNotice } from "@/utils/notices";
import { sessionPath } from "@/utils/notifications";
import { siteUrl } from "@/utils/site-url";

export type DispatchSummary = {
  /** In-app notifications created. */
  notified: number;
  /**
   * Reminders *settled* — a confirmed send, or nothing to mail. Not "emails
   * sent": what the caller needs is how many this run finished with, whatever
   * the mail configuration.
   */
  sent: number;
  /** Candidates that never got a claim: ineligible, or the claim was lost. */
  skipped: number;
  failed: number;
  abandoned: number;
};

const ABANDON_AFTER_MS = ABANDON_AFTER_HOURS * 60 * 60 * 1000;

// One dispatch run. Takes `now` as an argument rather than reading the clock,
// so tests drive it without a timer.
//
// A reminder is delivered on two channels: the in-app notification always,
// the email only where there is one to send. An instance with no mail
// configured still reminds its hosts (FR-021).
export async function dispatchDueReminders(
  now: Date,
  repos: Pick<Repositories, "notifications" | "reminders">
): Promise<DispatchSummary> {
  const summary: DispatchSummary = {
    notified: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    abandoned: 0,
  };

  const { notifications, reminders } = repos;
  const base = siteUrl();

  // Re-arms the reminder for the next tick, or gives up on it once the first
  // failure is 24 hours old. Both delivery channels share it: one host's
  // failure must not cost the others theirs, whichever channel it was on.
  async function recordFailure(
    key: ReminderKey,
    candidate: DueReminderCandidate,
    err: unknown
  ): Promise<void> {
    const { abandoned } = await reminders.markFailed(
      key,
      now,
      ABANDON_AFTER_MS
    );
    if (!abandoned) {
      summary.failed += 1;
      return;
    }
    summary.abandoned += 1;
    // Names the session and the kind only: a recipient's address is personal
    // data and never belongs in a log (FR-016).
    console.error(
      `Abandoning ${candidate.kind} reminder for session ${candidate.sessionId} after ${ABANDON_AFTER_HOURS}h of failures:`,
      err
    );
  }

  for (const candidate of await reminders.listCandidates(now)) {
    if (!eligible(candidate, now)) {
      summary.skipped += 1;
      continue;
    }
    const key = {
      sessionId: candidate.sessionId,
      guestId: candidate.guestId,
      kind: candidate.kind,
    };

    // listCandidates snapshots the run up front and each send takes seconds,
    // so a session or host deleted inside that window fails a foreign key
    // here. The claim wrote nothing, so there is nothing to re-arm.
    let claimed: boolean;
    let notifyOwed: boolean;
    try {
      ({ claimed, notifyOwed } = await reminders.claim(
        key,
        candidate.dueTime,
        now
      ));
    } catch (err) {
      console.error(
        `Could not claim the ${candidate.kind} reminder for session ${candidate.sessionId}:`,
        err
      );
      summary.skipped += 1;
      continue;
    }
    if (!claimed) {
      summary.skipped += 1;
      continue;
    }

    if (notifyOwed) {
      try {
        const notice = reminderNotice(candidate.kind, candidate.sessionTitle);
        await notifications.create({
          guestId: candidate.guestId,
          type:
            candidate.kind === "headsUp"
              ? "sessionHeadsUp"
              : "attendeeCountReminder",
          text: renderNotice(notice, translatorFor(null)),
          message: notice,
          url: recordPath(candidate),
          createdAt: now,
        });
        notificationsChanged(candidate.guestId);
        await reminders.markNotified(key, now);
        summary.notified += 1;
      } catch (err) {
        // Unnotified but claimed would settle the reminder having delivered
        // nothing, on either channel, for good.
        await recordFailure(key, candidate, err);
        continue;
      }
    }

    // Nothing to mail is not a failure and has nothing to retry: the claim
    // already settled the reminder, so this only drops a stale failure
    // history. Never markSent — no email went out.
    const email = candidate.guestEmail;
    if (
      email === null ||
      !candidate.reminderOptIn ||
      !isMailerConfigured() ||
      base === null
    ) {
      await reminders.markSkipped(key);
      summary.sent += 1;
      continue;
    }

    try {
      await sendMail({
        to: email,
        ...message(candidate, base, translatorFor(candidate.guestLocale)),
      });
      await reminders.markSent(key, now);
      summary.sent += 1;
    } catch (err) {
      await recordFailure(key, candidate, err);
    }
  }
  return summary;
}

function eligible(candidate: DueReminderCandidate, now: Date): boolean {
  return candidate.kind === "headsUp"
    ? headsUpEligible({
        now,
        startTime: candidate.sessionStartTime,
        endTime: candidate.sessionEndTime,
        storedDueTime: candidate.storedDueTime,
        storedClaimedAt: candidate.storedClaimedAt,
        alreadyNotifiedHost: candidate.storedNotifiedAt !== null,
      })
    : followUpEligible({
        now,
        endTime: candidate.sessionEndTime,
        hasRecordedCount: candidate.hasRecordedCount,
        storedDueTime: candidate.storedDueTime,
        storedClaimedAt: candidate.storedClaimedAt,
      });
}

// Where the reminder points. The follow-up adds the auto-focus parameter only
// it uses; see research.md §8.
function recordPath(candidate: DueReminderCandidate): string {
  const path = sessionPath(candidate.eventSlug, candidate.sessionId);
  return candidate.kind === "headsUp" ? path : `${path}?record=count`;
}

function message(candidate: DueReminderCandidate, base: string, t: Translate) {
  const url = base + recordPath(candidate);
  const zone = candidate.eventTimezone;
  if (candidate.kind === "headsUp") {
    return attendeeCountHeadsUpEmail(
      {
        title: candidate.sessionTitle,
        time: emailInstant(candidate.sessionStartTime, zone),
        location: candidate.sessionLocationNames,
        sessionUrl: url,
      },
      t
    );
  }
  return attendeeCountFollowUpEmail(
    {
      title: candidate.sessionTitle,
      time: emailInstant(candidate.sessionEndTime, zone),
      recordUrl: url,
    },
    t
  );
}
