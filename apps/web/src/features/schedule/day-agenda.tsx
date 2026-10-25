import { Fragment, useMemo, type ReactNode } from "react";
import type { Location } from "@schellingboard/domain/location";
import type { Session } from "@schellingboard/domain/session";
import { shownSlotStart } from "@schellingboard/domain/meeting-slots";
import {
  formatDayLabel,
  formatOptionalTime,
  formatSlotLabel,
  TIME_FORMAT,
} from "@schellingboard/domain/time";
import { cx } from "../../ui/cx";
import {
  AcademicCapIcon,
  CheckCircleIcon,
  LockIcon,
  UserIcon,
} from "../../ui/icons";
import {
  agendaGroups,
  nowMarkerIndex,
  timeState,
  type TimeState,
} from "./agenda";
import { useSchedule } from "./context";
import { getNowOffsetPx } from "./grid-layout";
import { statusLine } from "./meeting-rules";
import type { MeetingView } from "./meeting-view";
import type { DayWithSessions } from "./model";
import { sessionLink } from "./session-link";

/**
 * One day as a list, every session under the time it starts: what a narrow
 * screen can scroll through, where the grid has to be scrolled both ways.
 */
export function DayAgenda({
  day,
  sessions,
  meetings,
  locations,
  filtering,
  stickyTop,
}: {
  day: DayWithSessions;
  /** The day's sessions and 1-on-1s left after the location filter and search. */
  sessions: Session[];
  meetings: MeetingView[];
  locations: Location[];
  filtering: boolean;
  /** Where the time headings stick: below whatever is pinned above them. */
  stickyTop: number;
}) {
  const { data, timezone, slotIncrement, breakMinutes } = useSchedule();
  const { now } = data;
  const groups = useMemo(
    () =>
      agendaGroups({ sessions, meetings, locations, breakMinutes }).map(
        (group) => ({
          ...group,
          label: formatSlotLabel(group.start, day.start, timezone),
        })
      ),
    [day, sessions, meetings, locations, breakMinutes, timezone]
  );
  // Same condition as the grid's now line, so "Now" in the toolbar always has
  // something to jump to when it is offered.
  const nowIndex =
    getNowOffsetPx(day, now, slotIncrement) === null
      ? null
      : nowMarkerIndex(groups, now);
  const headingId = `agenda-day-${day.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto w-full max-w-3xl px-2"
    >
      <h2 id={headingId} className="pb-1 pt-4 text-lg font-bold">
        {formatDayLabel(day, timezone)}
      </h2>
      {groups.length === 0 && (
        <p className="text-sm italic text-fg-subtle">
          {filtering ? "No matching sessions" : "No sessions"}
        </p>
      )}
      {groups.map((group, i) => (
        <Fragment key={group.start.getTime()}>
          {nowIndex === i && <NowMarker now={now} timezone={timezone} />}
          <section aria-label={group.label}>
            <h3
              style={{ top: stickyTop }}
              className="sticky z-10 border-b border-line-subtle bg-surface py-1 text-sm font-semibold"
            >
              {group.label}
            </h3>
            <ul className="divide-y divide-line-subtle">
              {group.meetings.map((meeting) => (
                <MeetingRow
                  key={meeting.id}
                  meeting={meeting}
                  timezone={timezone}
                />
              ))}
              {group.sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  start={group.start}
                  locations={locations}
                  timezone={timezone}
                />
              ))}
            </ul>
          </section>
        </Fragment>
      ))}
      {nowIndex === groups.length && (
        <NowMarker now={now} timezone={timezone} />
      )}
    </section>
  );
}

// The agenda's counterpart of the grid's red now line; carries the same test
// id so the toolbar's "Now" scrolls to it unchanged.
function NowMarker({ now, timezone }: { now: Date; timezone: string }) {
  return (
    <div
      data-testid="now-line"
      className="flex items-center gap-2 py-1 text-xs font-semibold text-danger-fg"
    >
      <span aria-hidden className="h-0.5 flex-1 bg-danger" />
      Now · {formatOptionalTime(now, timezone, TIME_FORMAT)}
      <span aria-hidden className="h-0.5 flex-1 bg-danger" />
    </div>
  );
}

function AgendaRow({
  state,
  swatchClass,
  title,
  details,
  trailing,
  href,
  onOpen,
}: {
  state: TimeState;
  swatchClass: string;
  title: ReactNode;
  details: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onOpen?: () => void;
}) {
  const body = (
    <>
      <span
        aria-hidden
        className={cx(
          "w-1 shrink-0 rounded-full",
          swatchClass,
          state === "ended" && "opacity-40"
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-1 text-sm font-medium leading-tight">
          {title}
        </span>
        <span className="block text-xs text-fg-subtle">
          {state === "running" && (
            <span className="mr-1 rounded bg-danger px-1 font-semibold text-on-danger">
              Now
            </span>
          )}
          {details}
        </span>
      </span>
      {trailing && (
        <span className="flex shrink-0 items-center gap-1 self-start text-xs text-fg-subtle">
          {trailing}
        </span>
      )}
    </>
  );
  const className = cx(
    "flex gap-2 py-2 pr-2",
    href && "hover:bg-surface-hover",
    state === "ended" && "text-fg-muted"
  );
  return (
    <li>
      {href ? (
        <a
          {...(onOpen ? sessionLink(href, onOpen) : { href })}
          className={className}
        >
          {body}
        </a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}

function SessionRow({
  session,
  start,
  locations,
  timezone,
}: {
  session: Session;
  /** The group's shown start, which is the session's too. */
  start: Date;
  locations: Location[];
  timezone: string;
}) {
  const { data, links, params, openSession } = useSchedule();
  const state = timeState(start, session.endTime ?? start, data.now);
  const until = `until ${formatOptionalTime(session.endTime, timezone, TIME_FORMAT)}`;
  const inRooms = locations.filter((loc) =>
    session.locations.some((l) => l.id === loc.id)
  );
  const rooms =
    inRooms.length === locations.length && inRooms.length > 1
      ? "All rooms"
      : inRooms.map((r) => r.name).join(", ");
  const color = inRooms[0]?.color;

  if (session.blocker) {
    return (
      <AgendaRow
        state={state}
        swatchClass="bg-line"
        title={session.title || "Blocked"}
        details={`${rooms} · ${until}`}
      />
    );
  }

  const rsvpd = data.guestId ? data.rsvpd(session.id) : false;
  const hosting =
    !!data.guestId && session.hosts.some((h) => h.id === data.guestId);
  const hosts = session.hosts.map((h) => h.name).join(", ");
  return (
    <AgendaRow
      state={state}
      swatchClass={cx("loc-swatch", color && `loc-${color}`)}
      href={links.session(params, session.id)}
      onOpen={() => openSession(session.id)}
      title={
        <>
          {session.closed && (
            <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg-muted" />
          )}
          <span className="line-clamp-2">{session.title}</span>
        </>
      }
      details={[rooms, until, hosts].filter(Boolean).join(" · ")}
      trailing={
        <>
          {hosting && (
            <AcademicCapIcon
              className="h-4 w-4"
              aria-hidden={false}
              role="img"
              aria-label="You are hosting this session"
            />
          )}
          {rsvpd && (
            <CheckCircleIcon
              className="h-4 w-4"
              aria-hidden={false}
              role="img"
              aria-label="You have RSVP'd to this session"
            />
          )}
          <UserIcon aria-hidden className="h-3 w-3" />
          {session.numRsvps}
          {session.capacity > 0 && `/${session.capacity}`}
        </>
      }
    />
  );
}

// One of the viewer's own 1-on-1s; opens the same popup as the grid's column.
function MeetingRow({
  meeting,
  timezone,
}: {
  meeting: MeetingView;
  timezone: string;
}) {
  const { data, links, params, breakMinutes } = useSchedule();
  const start = shownSlotStart(new Date(meeting.slotStart), breakMinutes);
  const end = new Date(meeting.slotEnd);
  return (
    <AgendaRow
      state={timeState(start, end, data.now)}
      swatchClass={
        meeting.status === "accepted" ? "bg-brand-accent" : "bg-line"
      }
      href={links.meeting(params, meeting.id)}
      title={`1-on-1 with ${meeting.otherName}`}
      details={`${meeting.meetingPoint} · until ${formatOptionalTime(end, timezone, TIME_FORMAT)} · ${statusLine(meeting)}`}
      trailing={
        meeting.status === "accepted" && (
          <CheckCircleIcon
            className="h-4 w-4"
            aria-hidden={false}
            role="img"
            aria-label="This 1-on-1 is confirmed"
          />
        )
      }
    />
  );
}
