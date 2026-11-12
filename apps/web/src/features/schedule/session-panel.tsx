import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { schedulingEnded } from "@schellingboard/domain/phase";
import type { Session } from "@schellingboard/domain/session";
import { claimRefusal } from "@schellingboard/domain/session-claim";
import { overlappingMoment } from "@schellingboard/domain/shared-moment";
import {
  formatInLocalZone,
  formatOptionalTime,
} from "@schellingboard/domain/time";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useTimeFormat } from "../../app/time-format";
import {
  attendeeGuests,
  type AttendeesQuery,
  type AttendeesState,
} from "../../queries/attendees";
import { CopyLinkButton } from "../../ui/copy-link-button";
import {
  AcademicCapIcon,
  BookmarkIcon,
  BookmarkSolidIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockIcon,
} from "../../ui/icons";
import { Markdown } from "../../ui/markdown";
import { SidePanel } from "../../ui/side-panel";
import { Tooltip } from "../../ui/tooltip";
import { Unavailable } from "../../ui/unavailable";
import { PersonLink } from "../people/person-link";
import { AttendeeCountField } from "./attendee-count-field";
import { clashSummary } from "./clashes";
import { useSchedule } from "./context";
import { SessionComments } from "./session-comments";
import { useRsvp } from "./use-rsvp";

const ACTION =
  "inline-flex items-center justify-center rounded-md border border-brand-accent px-2 py-1 text-xs font-medium text-brand-fg hover:bg-brand-tint focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

/** A session's details in the side panel. */
export function SessionPanel({
  sessionId,
  onClose,
  onBack,
}: {
  sessionId: string;
  onClose: () => void;
  onBack?: () => void;
}) {
  const { data } = useSchedule();
  const session = data.sessions.find((s) => s.id === sessionId);
  return (
    <SidePanel
      label={t`Session details`}
      title={session ? session.title : t`Session details`}
      titleAction={session && <BookmarkToggle sessionId={session.id} />}
      onClose={onClose}
      onBack={onBack}
    >
      {session ? (
        <Details session={session} />
      ) : (
        <p>
          <Trans>Session not found.</Trans>
        </p>
      )}
    </SidePanel>
  );
}

function BookmarkToggle({ sessionId }: { sessionId: string }) {
  const { data, actions } = useSchedule();
  const noteId = useId();
  const note = t`Only you see your bookmarks. This is not an RSVP.`;
  if (!data.guestId) return null;
  const marked = data.bookmarked(sessionId);
  const Icon = marked ? BookmarkSolidIcon : BookmarkIcon;
  return (
    <Tooltip content={<p className="px-2 py-1 text-xs">{note}</p>}>
      <button
        type="button"
        aria-pressed={marked}
        aria-label={marked ? t`Remove bookmark` : t`Bookmark this session`}
        aria-describedby={noteId}
        onClick={() => void actions.setBookmark(sessionId, !marked)}
        className="-my-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        <Icon className="h-5 w-5" />
      </button>
      <span id={noteId} className="sr-only">
        {note}
      </span>
    </Tooltip>
  );
}

function useAttendees(sessionId: string, numRsvps: number) {
  const { actions } = useSchedule();
  const [state, setState] = useState<AttendeesState | null>(null);
  const query = useRef<AttendeesQuery | null>(null);
  useEffect(() => {
    const created = actions.attendees(sessionId);
    query.current = created;
    // A fetch in flight leaves what is shown as it is; nothing shows before the first.
    const unsubscribe = created.subscribe(() => {
      const next = created.get();
      if (next.status === "ready" || next.status === "error") setState(next);
    });
    return () => {
      unsubscribe();
      created.destroy();
      query.current = null;
    };
  }, [actions, sessionId]);
  // Someone else's RSVP moves the count; the list follows without clearing.
  useEffect(() => {
    void query.current?.refresh();
  }, [sessionId, numRsvps, actions]);
  return state;
}

function Details({ session }: { session: Session }) {
  const { data, links, params, timezone, actions } = useSchedule();
  const timeFormat = useTimeFormat();
  const { rsvpd, busy, click, dialogs } = useRsvp(session);
  const attendeeState = useAttendees(session.id, session.numRsvps);

  const start = data.event.schedulingPhaseStart;
  const opensAt = start ? formatInLocalZone(start, timezone, null) : null;
  const rsvpWhy = schedulingEnded(data.event, data.now)
    ? t`Scheduling has ended`
    : opensAt
      ? t`Scheduling will be enabled at ${opensAt}`
      : t`Scheduling is not enabled`;
  const clashes = data.clashes(session.id);
  const isHost =
    data.guestId !== null && session.hosts.some((h) => h.id === data.guestId);
  const canBecomeHost =
    data.guestId !== null &&
    claimRefusal({
      event: data.event,
      now: data.now,
      guestInEvent: data.isMember,
      session,
    }) === undefined;
  // Admin-managed sessions count: a host records the count for one they cannot edit.
  const canRecordAttendance =
    isHost && session.endTime !== undefined && session.endTime <= data.now;
  const rooms = data.locations.filter((l) =>
    session.locations.some((room) => room.id === l.id)
  );
  const moment =
    session.startTime && session.endTime
      ? overlappingMoment(
          data.days.flatMap((d) => d.moments),
          session.startTime,
          session.endTime
        )
      : undefined;
  const full =
    data.event.rsvpCapacityHardLimit &&
    session.capacity > 0 &&
    session.numRsvps >= session.capacity;

  // The viewer's own RSVP comes from the replica, which moves before the list.
  const attendees = useMemo(() => {
    if (!attendeeState) return null;
    const others = attendeeState.rsvps.filter(
      (r) => r.guestId !== data.guestId
    );
    const all =
      data.guestId && rsvpd ? [...others, { guestId: data.guestId }] : others;
    return attendeeGuests(all, data.guests).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [attendeeState, data.guests, data.guestId, rsvpd]);

  const startsAt = formatOptionalTime(
    session.startTime,
    timezone,
    `EEEE ${timeFormat}`
  );
  const endsAt = formatOptionalTime(session.endTime, timezone, timeFormat);
  const momentTitle = moment?.title ?? "";
  const momentStart = formatOptionalTime(moment?.start, timezone, timeFormat);
  const momentEnd = formatOptionalTime(moment?.end, timezone, timeFormat);
  const { capacity } = session;
  const attendeeCount = attendees ? attendees.length : session.numRsvps;

  return (
    <div className="break-words">
      {dialogs}
      {session.closed && (
        <div className="mb-4 border-l-4 border-warning bg-warning-tint p-3 text-sm text-warning-fg">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <LockIcon className="h-4 w-4" />
            <Trans>Closed Session</Trans>
          </div>
          <p>
            <Trans>
              This is a closed session, meaning you can at most arrive 5 minutes
              late. If you arrive later you may not join and please do not knock
              or otherwise disrupt the session.
            </Trans>
          </p>
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {!isHost && (
          <Unavailable blocked={data.readOnly} why={rsvpWhy}>
            <button
              type="button"
              onClick={click}
              disabled={!data.readOnly && (busy || (!rsvpd && full))}
              className={ACTION}
            >
              {busy
                ? "..."
                : rsvpd
                  ? t`Un-RSVP`
                  : full
                    ? t`Session full`
                    : t`RSVP`}
            </button>
          </Unavailable>
        )}
        {canBecomeHost && (
          <button
            type="button"
            onClick={() => void actions.becomeHost(session.id)}
            className={ACTION}
          >
            <Trans>Become host</Trans>
          </button>
        )}
        {isHost && !session.adminManaged && !data.readOnly && (
          <a href={links.editSession(session.id)} className={ACTION}>
            <Trans>Edit</Trans>
          </a>
        )}
        {isHost && (
          <span title={t`You are hosting this session`}>
            <AcademicCapIcon className="h-5 w-5" />
          </span>
        )}
        {rsvpd && (
          <span title={t`You have RSVP'd to this session`}>
            <CheckCircleIcon className="h-5 w-5" />
          </span>
        )}
      </div>
      {data.guestId && !isHost && !rsvpd && (
        <Tooltip
          content={
            data.hidden(session.id)
              ? t`Shows this session on your schedule again.`
              : t`Hides this session on your schedule, for you only. Use it if you are not interested or for any other reason. You can show it again here.`
          }
          className="-mt-4 mb-6 w-fit"
        >
          <button
            type="button"
            onClick={() =>
              void actions.setHidden(session.id, !data.hidden(session.id))
            }
            className="text-xs text-fg-subtle underline hover:text-fg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            {data.hidden(session.id)
              ? t`Show on the schedule`
              : t`Hide on the schedule`}
          </button>
        </Tooltip>
      )}
      {clashes.length > 0 && (
        <p className="mb-6 flex items-start gap-2 rounded-md bg-warning-tint p-3 text-sm text-warning-fg">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {clashSummary(clashes, data.guestId)}
        </p>
      )}
      <div className="mb-6 space-y-2 text-sm text-fg-muted">
        <div className="flex gap-2">
          <span className="font-medium">
            <Trans>Host(s):</Trans>
          </span>
          <span>
            {session.hosts.map((h, i) => (
              <span key={h.id}>
                {i > 0 && ", "}
                <PersonLink
                  guestId={h.id}
                  href={links.guest(h.id)}
                  name={h.name}
                  className="text-brand-fg hover:underline"
                />
              </span>
            ))}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="font-medium">
            <Trans>Location:</Trans>
          </span>
          <span className="flex flex-wrap gap-1">
            {rooms.map((location) => (
              <span
                key={location.id}
                className={`loc-tag loc-${location.color} flex w-fit items-center gap-2 rounded-full border-2 px-2 py-0.5 text-xs font-semibold`}
              >
                {location.name}
              </span>
            ))}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="font-medium">
            <Trans>Time:</Trans>
          </span>
          <span>{t`${startsAt} - ${endsAt}`}</span>
        </div>
        {moment && (
          <p className="text-fg-muted">
            {t`During ${momentTitle} (${momentStart}–${momentEnd})`}
          </p>
        )}
        <div className="flex gap-2">
          <span className="font-medium">
            {capacity > 0
              ? t`Attendees (${attendeeCount} / ${capacity}):`
              : t`Attendees (${attendeeCount}):`}
          </span>
          <span>
            {attendees === null
              ? t`Loading…`
              : attendees.length === 0
                ? t`No attendees yet`
                : attendees.map((a, i) => (
                    <span key={a.id}>
                      {i > 0 && ", "}
                      <PersonLink
                        guestId={a.id}
                        href={links.guest(a.id)}
                        name={a.name}
                        className="text-brand-fg hover:underline"
                      />
                    </span>
                  ))}
          </span>
        </div>
      </div>
      {canRecordAttendance && (
        <AttendeeCountField
          key={session.id}
          sessionId={session.id}
          autoFocus={params.get("record") === "count"}
        />
      )}
      <div className="mb-6">
        <h3 className="mb-2 font-semibold">
          <Trans>Description</Trans>
        </h3>
        <Markdown className="text-base leading-relaxed">
          {session.description}
        </Markdown>
      </div>
      {session.proposalId && (
        <p className="text-sm text-fg-muted">
          <Trans>
            This session was scheduled from a proposal. See it{" "}
            <a
              href={links.proposal(session.proposalId)}
              className="text-brand-fg underline"
            >
              here
            </a>
            .
          </Trans>
        </p>
      )}
      <CopyLinkButton className="mt-6" />
      <SessionComments sessionId={session.id} />
    </div>
  );
}
