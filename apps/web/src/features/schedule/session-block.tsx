import { DateTime } from "luxon";
import type { Location } from "@schellingboard/domain/location";
import type { Session } from "@schellingboard/domain/session";
import { isBookableSlot } from "@schellingboard/domain/session-bookable";
import { formatOptionalTime, TIME_FORMAT } from "@schellingboard/domain/time";
import { cx } from "../../ui/cx";
import {
  AcademicCapIcon,
  ClockIcon,
  LockIcon,
  PlusIcon,
  UserIcon,
} from "../../ui/icons";
import { plainText } from "../../ui/plain-text";
import { Tooltip } from "../../ui/tooltip";
import {
  CURRENT_MATCH_CLASS,
  GHOST_CLASS,
  useSchedule,
  useScheduleMatch,
} from "./context";
import type { ColumnItem } from "./column";
import type { DayWithSessions } from "./model";
import { useRsvp } from "./use-rsvp";
import { sessionLink } from "./session-link";
import {
  PositionedBlock,
  TITLE_MIN_PX,
  type Position,
} from "./positioned-block";

export function SessionBlock({
  item,
  location,
  day,
}: {
  item: ColumnItem;
  location: Location;
  day: DayWithSessions;
}) {
  const { data, timezone } = useSchedule();
  const position = { top: item.topPx, height: item.heightPx };

  if (item.kind === "free") {
    const bookable = isBookableSlot({
      locationBookable: !!location.bookable,
      startTime: item.start.getTime(),
      now: data.now.getTime(),
      startBookings: day.startBookings?.getTime(),
      endBookings: day.endBookings?.getTime(),
    });
    return bookable ? (
      <BookableSessionCard
        startTime={item.start}
        location={location}
        position={position}
        timezone={timezone}
      />
    ) : null;
  }
  const { session } = item;
  return session.blocker ? (
    <BlockerSessionCard
      title={session.title || "Blocked"}
      position={position}
    />
  ) : (
    <RealSessionCard
      session={session}
      location={location}
      position={position}
    />
  );
}

function BookableSessionCard({
  position,
  startTime,
  location,
  timezone,
}: {
  location: Location;
  startTime: Date;
  position: Position;
  timezone: string;
}) {
  const { links } = useSchedule();
  const start = DateTime.fromJSDate(startTime).setZone(timezone);
  const { filtering } = useScheduleMatch();
  return (
    <PositionedBlock position={position}>
      <a
        aria-label="Add session"
        className={cx(
          "flex h-full w-full items-center justify-center rounded bg-surface-muted font-roboto hover:bg-surface-hover",
          filtering && GHOST_CLASS
        )}
        href={links.addSession({
          location: location.name,
          day: start.toFormat("yyyy-MM-dd"),
          time: start.toFormat("HH:mm"),
        })}
      >
        <PlusIcon aria-hidden="true" className="h-4 w-4 text-fg-subtle" />
      </a>
    </PositionedBlock>
  );
}

function BlockerSessionCard({
  title,
  position,
}: {
  title: string;
  position: Position;
}) {
  const { filtering } = useScheduleMatch();
  return (
    <PositionedBlock position={position} className="overflow-hidden">
      <div
        className={cx(
          "flex h-full flex-col justify-center overflow-hidden rounded border-2 border-line bg-surface-hover px-1 font-roboto text-fg",
          filtering && GHOST_CLASS
        )}
      >
        <p
          className={cx(
            "text-center text-xs font-medium leading-[1.15]",
            position.height < TITLE_MIN_PX
              ? "sr-only"
              : position.height >= 80
                ? "line-clamp-2"
                : "line-clamp-1"
          )}
        >
          {title}
        </p>
      </div>
    </PositionedBlock>
  );
}

function SessionInfo({
  session,
  hosts,
  timezone,
}: {
  session: Session;
  hosts: string;
  timezone: string;
}) {
  const description = plainText(session.description);
  return (
    <div className="p-2">
      <h4 className="flex items-center gap-1 text-lg font-bold leading-tight">
        {session.closed && (
          <LockIcon className="h-4 w-4 flex-shrink-0 text-fg-muted" />
        )}
        {session.title}
      </h4>
      <p className="mb-2 mt-1 text-xs text-fg-subtle">Hosted by {hosts}</p>
      <p className="whitespace-pre-line text-sm">
        {description.length > 210
          ? description.substring(0, 200) + "..."
          : description}
      </p>
      <div className="mt-2 flex justify-between gap-4 text-xs text-fg-subtle">
        <div className="flex gap-1">
          <UserIcon className="h-4 w-4" />
          <span>
            {session.numRsvps} RSVPs (max capacity {session.capacity})
          </span>
        </div>
        <div className="flex gap-1">
          <ClockIcon className="h-4 w-4" />
          <span>
            {formatOptionalTime(session.startTime, timezone, TIME_FORMAT)} -{" "}
            {formatOptionalTime(session.endTime, timezone, TIME_FORMAT)}
          </span>
        </div>
      </div>
    </div>
  );
}

function RealSessionCard({
  session,
  position,
  location,
}: {
  session: Session;
  position: Position;
  location: Location;
}) {
  const { height } = position;
  const { data, links, params, timezone, openSession } = useSchedule();
  const hosting =
    !!data.guestId && session.hosts.some((h) => h.id === data.guestId);
  const lowerOpacity = !data.rsvpd(session.id) && !hosting;
  const { filtering, matchesSession, currentMatchId } = useScheduleMatch();
  const ghost = filtering && !matchesSession(session);
  const hosts = session.hosts.map((h) => h.name).join(", ") || "No hosts";
  const showTitle = height >= TITLE_MIN_PX;
  const hostLines =
    height >= 150 ? 3 : height >= 100 ? 2 : height >= 56 ? 1 : 0;

  return (
    <PositionedBlock position={position}>
      <Tooltip
        content={
          <SessionInfo session={session} hosts={hosts} timezone={timezone} />
        }
        className="group h-full overflow-hidden"
      >
        <div
          data-match-id={filtering && !ghost ? session.id : undefined}
          className={cx(
            "group relative flex h-full w-full flex-col overflow-hidden rounded border-2 px-1 font-roboto",
            height >= 40 ? "py-1" : "py-0.5",
            `loc-${location.color}`,
            lowerOpacity ? "loc-block-dim" : "loc-block",
            ghost && GHOST_CLASS,
            currentMatchId === session.id && CURRENT_MATCH_CLASS
          )}
        >
          <a
            {...sessionLink(links.session(params, session.id), () =>
              openSession(session.id)
            )}
            className="cursor-pointer after:absolute after:inset-0 after:content-['']"
          >
            <p
              className={cx(
                "flex items-start gap-1 text-left text-xs font-medium leading-[1.15]",
                !showTitle
                  ? "sr-only"
                  : height >= 100
                    ? "line-clamp-2"
                    : "line-clamp-1",
                // Keeps a one-line block's title clear of the RSVP badge.
                height < 40 && "pr-10"
              )}
            >
              {session.closed && (
                <LockIcon className="mt-0 h-3 w-3 flex-shrink-0" />
              )}
              <span className="flex-1">{session.title}</span>
            </p>
            {ghost && <span className="sr-only"> — doesn&apos;t match</span>}
          </a>
          {hostLines > 0 && (
            <p
              className={cx(
                "text-left text-[10px] leading-tight",
                hostLines === 3
                  ? "line-clamp-3"
                  : hostLines === 2
                    ? "line-clamp-2"
                    : "line-clamp-1"
              )}
            >
              {hosts}
            </p>
          )}
          <div
            className={cx(
              "absolute bottom-0 right-0 z-10 flex items-end gap-1",
              !showTitle && "hidden"
            )}
          >
            {hosting && (
              <div
                className="flex items-center py-[2px]"
                title="You are hosting this session"
              >
                <AcademicCapIcon className="h-3 w-3" />
              </div>
            )}
            <RsvpBadge session={session} hosting={hosting} />
          </div>
        </div>
      </Tooltip>
    </PositionedBlock>
  );
}

function RsvpBadge({
  session,
  hosting,
}: {
  session: Session;
  hosting: boolean;
}) {
  const { rsvpd, click, dialogs } = useRsvp(session);

  const count = (
    <>
      <UserIcon aria-hidden className="h-2.5 w-2.5" />
      {session.numRsvps}
      {session.capacity > 0 && `/${session.capacity}`}
    </>
  );
  const badge =
    "loc-badge flex items-center gap-0.5 rounded-tl px-1 py-[1px] text-[10px]";
  if (hosting) return <div className={badge}>{count}</div>;
  return (
    <>
      <button
        type="button"
        aria-label={`${rsvpd ? "Withdraw RSVP from" : "RSVP to"} ${session.title}`}
        onClick={click}
        className={cx(badge, "cursor-pointer hover:opacity-80")}
      >
        {count}
      </button>
      {dialogs}
    </>
  );
}
