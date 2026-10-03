import clsx from "clsx";
import { ClockIcon, PlusIcon } from "@heroicons/react/24/outline";
import { UserIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import type { Session } from "@/db/repositories/interfaces";
import type { Location } from "@schellingboard/domain/location";
import type { Guest } from "@schellingboard/domain/guest";
import type { DayWithSessions } from "@/app/(site)/context";
import { Tooltip } from "./tooltip";
import { DateTime } from "luxon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useState } from "react";
import { CurrentUserModal, ConfirmationModal, AlertModal } from "../modals";
import { UserContext, EventContext } from "../context";
import { formatOptionalTime, TIME_FORMAT } from "@/utils/utils";
import { isBookableSlot } from "@/utils/session-bookable";
import type { ColumnItem } from "@/utils/schedule-column";
import { LockIcon } from "../lock-icon";
import {
  PositionedBlock,
  TITLE_MIN_PX,
  type Position,
} from "./positioned-block";
import { viewSessionLinkFromOwner } from "./modal-nav";
import { stripMarkdown } from "@/utils/markdown";
import {
  describeRsvpClash,
  findRsvpClash,
  type RsvpClash,
} from "@/utils/rsvp-clash";
import { useMyMeetings } from "./use-meetings";
import {
  CURRENT_MATCH_CLASS,
  GHOST_CLASS,
  useScheduleMatch,
} from "./use-schedule-search";

export function SessionBlock(props: {
  item: ColumnItem;
  location: Location;
  day: DayWithSessions;
  guests: Guest[];
}) {
  const { item, location, day, guests } = props;
  const { rsvpdForSession, event, now } = useContext(EventContext);
  const eventSlug = event?.slug ?? "";
  const timezone = event?.timezone ?? "UTC";
  const position = { top: item.topPx, height: item.heightPx };

  if (item.kind === "free") {
    const bookable = isBookableSlot({
      locationBookable: !!location.bookable,
      startTime: item.start.getTime(),
      now: now.getTime(),
      startBookings: day.startBookings?.getTime(),
      endBookings: day.endBookings?.getTime(),
    });
    return bookable ? (
      <BookableSessionCard
        eventSlug={eventSlug}
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
      eventSlug={eventSlug}
      session={session}
      location={location}
      position={position}
      guests={guests}
      rsvpd={rsvpdForSession(session.id)}
    />
  );
}

export function BookableSessionCard(props: {
  location: Location;
  startTime: Date;
  position: Position;
  eventSlug: string;
  timezone: string;
}) {
  const { position, startTime, location, eventSlug, timezone } = props;
  const start = DateTime.fromJSDate(startTime).setZone(timezone);
  const dayParam = start.toFormat("yyyy-MM-dd");
  const timeParam = start.toFormat("HH:mm");
  const { filtering } = useScheduleMatch();
  return (
    <PositionedBlock position={position}>
      <Link
        aria-label="Add session"
        className={clsx(
          "rounded font-roboto h-full w-full bg-surface-muted hover:bg-surface-hover flex items-center justify-center",
          filtering && GHOST_CLASS
        )}
        href={`/${eventSlug}/add-session?location=${location.name}&time=${timeParam}&day=${dayParam}`}
      >
        <PlusIcon aria-hidden="true" className="h-4 w-4 text-fg-subtle" />
      </Link>
    </PositionedBlock>
  );
}

function BlockerSessionCard(props: { title: string; position: Position }) {
  const { title, position } = props;
  const { filtering } = useScheduleMatch();
  return (
    <PositionedBlock position={position} className="overflow-hidden">
      <div
        className={clsx(
          "px-1 rounded font-roboto h-full flex flex-col justify-center overflow-hidden bg-surface-hover border-2 border-line text-fg",
          filtering && GHOST_CLASS
        )}
      >
        <p
          className={clsx(
            "font-medium text-xs leading-[1.15] text-center",
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

function SessionInfoDisplay({
  session,
  formattedHostNames,
  numRSVPs,
  timezone,
}: {
  session: Session;
  formattedHostNames: string;
  numRSVPs: number;
  timezone: string;
}) {
  const plainDescription = stripMarkdown(session.description);
  return (
    <>
      <h1 className="text-lg font-bold leading-tight flex items-center gap-1">
        {session.closed && (
          <LockIcon className="h-4 w-4 text-fg-muted flex-shrink-0" />
        )}
        {session.title}
      </h1>
      <p className="text-xs text-fg-subtle mb-2 mt-1">
        Hosted by {formattedHostNames}
      </p>
      <p className="text-sm whitespace-pre-line">
        {plainDescription.length > 210
          ? plainDescription.substring(0, 200) + "..."
          : plainDescription}
      </p>
      <div className="flex justify-between mt-2 gap-4 text-xs text-fg-subtle">
        <div className="flex gap-1">
          <UserIcon className="h-4 w-4" />
          <span>
            {numRSVPs} RSVPs (max capacity {session.capacity})
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
    </>
  );
}

export function RealSessionCard(props: {
  eventSlug: string;
  session: Session;
  position: Position;
  location: Location;
  guests: Guest[];
  rsvpd: boolean;
}) {
  const { eventSlug, session, position, location, guests, rsvpd } = props;
  const { height } = position;
  const { user: currentUser } = useContext(UserContext);
  const { localSessions, updateRsvp, userBusySessions, event } =
    useContext(EventContext);
  const { meetings } = useMyMeetings();
  const timezone = event?.timezone ?? "UTC";
  const searchParams = useSearchParams();
  const [isRsvping, setIsRsvping] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [clash, setClash] = useState<RsvpClash | null>(null);
  const [confirmRSVPModalOpen, setConfirmRSVPModalOpen] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  const hostStatus =
    currentUser && session.hosts.some((h) => h.id === currentUser);
  const lowerOpacity = !rsvpd && !hostStatus;
  const { filtering, matchesSession, currentMatchId } = useScheduleMatch();
  const ghost = filtering && !matchesSession(session);
  const formattedHostNames =
    session.hosts.map((h) => h.name).join(", ") || "No hosts";

  const linkProps = viewSessionLinkFromOwner(
    searchParams,
    eventSlug,
    session.id
  );

  const handleRSVP = () => {
    if (!currentUser) {
      setUserModalOpen(true);
      return;
    }

    if (isRsvping) return;

    const currentSession =
      localSessions.find((s) => s.id === session.id) ?? session;

    if (currentSession.hosts.some((h) => h.id === currentUser)) {
      return;
    }

    if (!rsvpd) {
      const found = findRsvpClash(currentSession, userBusySessions(), meetings);
      if (found) {
        setClash(found);
        setConfirmRSVPModalOpen(true);
        return;
      }
    }

    void doRsvp();
  };

  const doRsvp = async () => {
    if (!currentUser || isRsvping) return;

    setIsRsvping(true);
    setRsvpError(null);

    const currentRsvpStatus = rsvpd;

    try {
      const result = await updateRsvp(
        currentUser,
        session.id,
        currentRsvpStatus
      );
      if (!result.ok) {
        setRsvpError(
          result.error ?? "Failed to update RSVP. Please try again."
        );
      }
    } finally {
      setIsRsvping(false);
    }
  };

  const handleConfirmRSVP = () => {
    setConfirmRSVPModalOpen(false);
    setClash(null);
    void doRsvp();
  };

  const numRSVPs =
    localSessions.find((ses) => ses.id === session.id)?.numRsvps ??
    session.numRsvps;

  const showTitle = height >= TITLE_MIN_PX;
  const hostLines =
    height >= 150 ? 3 : height >= 100 ? 2 : height >= 56 ? 1 : 0;

  return (
    <PositionedBlock position={position}>
      <Tooltip
        content={
          <SessionInfoDisplay
            session={session}
            formattedHostNames={formattedHostNames}
            numRSVPs={numRSVPs}
            timezone={timezone}
          />
        }
        className="h-full overflow-hidden group"
        noTap={true}
      >
        <div
          data-match-id={filtering && !ghost ? session.id : undefined}
          className={clsx(
            "px-1 rounded font-roboto h-full flex flex-col relative w-full group border-2 overflow-hidden",
            height >= 40 ? "py-1" : "py-0.5",
            `loc-${location.color}`,
            lowerOpacity ? "loc-block-dim" : "loc-block",
            ghost && GHOST_CLASS,
            currentMatchId === session.id && CURRENT_MATCH_CLASS
          )}
        >
          <Link
            {...linkProps}
            className="cursor-pointer after:content-[''] after:absolute after:inset-0"
          >
            <p
              className={clsx(
                "font-medium text-xs leading-[1.15] text-left flex items-start gap-1",
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
                <LockIcon className="h-3 w-3 flex-shrink-0 mt-0" />
              )}
              <span className="flex-1">{session.title}</span>
            </p>
            {ghost && <span className="sr-only"> — doesn&apos;t match</span>}
          </Link>
          {hostLines > 0 && (
            <p
              className={clsx(
                "text-[10px] leading-tight text-left",
                hostLines === 3
                  ? "line-clamp-3"
                  : hostLines === 2
                    ? "line-clamp-2"
                    : "line-clamp-1"
              )}
            >
              {formattedHostNames}
            </p>
          )}
          <div
            className={clsx(
              "absolute bottom-0 right-0 flex gap-1 items-end z-10",
              !showTitle && "hidden"
            )}
          >
            {hostStatus && (
              <div
                className="py-[2px] flex items-center"
                title="You are hosting this session"
              >
                <AcademicCapIcon className="h-3 w-3" />
              </div>
            )}
            <div
              className="loc-badge py-[1px] px-1 rounded-tl text-[10px] flex gap-0.5 items-center cursor-pointer hover:opacity-80"
              onClick={handleRSVP}
            >
              <UserIcon className="h-.5 w-2.5" />
              {numRSVPs}
              {session.capacity > 0 && `/${session.capacity}`}
            </div>
          </div>
        </div>

        <CurrentUserModal
          open={userModalOpen}
          close={() => setUserModalOpen(false)}
          guests={guests}
          hosts={session.hosts.map((h) => h.name)}
          rsvp={() => void doRsvp()}
          rsvpd={rsvpd}
          portal={true}
        />

        <ConfirmationModal
          open={confirmRSVPModalOpen}
          close={() => setConfirmRSVPModalOpen(false)}
          message={
            clash
              ? `This session clashes with ${describeRsvpClash(clash, currentUser)}. Do you want to RSVP anyway?`
              : ""
          }
          confirm={handleConfirmRSVP}
          portal={true}
        />

        <AlertModal
          open={rsvpError !== null}
          close={() => setRsvpError(null)}
          message={rsvpError ?? ""}
          portal={true}
        />
      </Tooltip>
    </PositionedBlock>
  );
}
