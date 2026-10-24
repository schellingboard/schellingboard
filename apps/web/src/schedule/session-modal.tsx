import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@schellingboard/domain/session";
import { formatOptionalTime, TIME_FORMAT } from "@schellingboard/domain/time";
import {
  attendeeGuests,
  type AttendeesQuery,
  type AttendeesState,
} from "../queries/attendees";
import { Dialog } from "../ui/dialog";
import { AcademicCapIcon, CheckCircleIcon, LockIcon } from "../ui/icons";
import { Markdown } from "../ui/markdown";
import { useSchedule } from "./context";
import { AttendeeCountField } from "./attendee-count-field";
import { SessionComments } from "./session-comments";
import { useRsvp } from "./use-rsvp";

const ACTION =
  "inline-flex items-center justify-center rounded-md border border-brand-accent px-2 py-1 text-xs font-medium text-brand-fg hover:bg-brand-tint focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-50";

/** A session's details over the schedule, opened by `?viewSession=`. */
export function SessionModal({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const { data } = useSchedule();
  const session = data.sessions.find((s) => s.id === sessionId);
  return (
    <Dialog
      open
      wide
      onClose={onClose}
      label="Session details"
      title={session?.title ?? "Session details"}
    >
      {session ? <Details session={session} /> : <p>Session not found.</p>}
    </Dialog>
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
  const { data, links, params, timezone } = useSchedule();
  const { rsvpd, busy, click, dialogs } = useRsvp(session);
  const attendeeState = useAttendees(session.id, session.numRsvps);

  const isHost =
    data.guestId !== null && session.hosts.some((h) => h.id === data.guestId);
  // Admin-managed sessions count: a host records the count for one they cannot edit.
  const canRecordAttendance =
    isHost && session.endTime !== undefined && session.endTime <= data.now;
  const rooms = data.locations.filter((l) =>
    session.locations.some((room) => room.id === l.id)
  );
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

  return (
    <div className="break-words">
      {dialogs}
      {session.closed && (
        <div className="mb-4 border-l-4 border-warning bg-warning-tint p-3 text-sm text-warning-fg">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <LockIcon className="h-4 w-4" />
            Closed Session
          </div>
          <p>
            This is a closed session, meaning you can at most arrive 5 minutes
            late. If you arrive later you may not join and please do not knock
            or otherwise disrupt the session.
          </p>
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {!isHost && (
          <button
            type="button"
            onClick={click}
            disabled={busy || (!rsvpd && full)}
            className={ACTION}
          >
            {busy ? "..." : rsvpd ? "Un-RSVP" : full ? "Session full" : "RSVP"}
          </button>
        )}
        {isHost && !session.adminManaged && (
          <a href={links.editSession(session.id)} className={ACTION}>
            Edit
          </a>
        )}
        {isHost && (
          <span title="You are hosting this session">
            <AcademicCapIcon className="h-5 w-5" />
          </span>
        )}
        {rsvpd && (
          <span title="You have RSVP'd to this session">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mb-6 space-y-2 text-sm text-fg-muted">
        <div className="flex gap-2">
          <span className="font-medium">Hosts(s):</span>
          <span>
            {session.hosts.map((h, i) => (
              <span key={h.id}>
                {i > 0 && ", "}
                <a
                  href={links.guest(h.id)}
                  className="text-brand-fg hover:underline"
                >
                  {h.name}
                </a>
              </span>
            ))}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="font-medium">Location:</span>
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
          <span className="font-medium">Time:</span>
          <span>
            {formatOptionalTime(
              session.startTime,
              timezone,
              `EEEE ${TIME_FORMAT}`
            )}
            {" - "}
            {formatOptionalTime(session.endTime, timezone, TIME_FORMAT)}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="font-medium">
            {`Attendees (${attendees ? attendees.length : session.numRsvps}${session.capacity > 0 ? ` / ${session.capacity}` : ""}):`}
          </span>
          <span>
            {attendees === null
              ? "Loading…"
              : attendees.length === 0
                ? "No attendees yet"
                : attendees.map((a, i) => (
                    <span key={a.id}>
                      {i > 0 && ", "}
                      <a
                        href={links.guest(a.id)}
                        className="text-brand-fg hover:underline"
                      >
                        {a.name}
                      </a>
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
        <h3 className="mb-2 font-semibold">Description</h3>
        <Markdown>{session.description}</Markdown>
      </div>
      {session.proposalId && (
        <p className="text-sm text-fg-muted">
          This session was scheduled from a proposal. See it{" "}
          <a
            href={links.proposal(session.proposalId)}
            className="text-brand-fg underline"
          >
            here
          </a>
          .
        </p>
      )}
      <SessionComments sessionId={session.id} />
    </div>
  );
}
