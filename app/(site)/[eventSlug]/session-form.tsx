"use client";
import { useEffect, useState, useContext } from "react";
import { DateTime } from "luxon";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/app/input";
import { SelectHosts } from "@/app/select-hosts";
import {
  convertParamDateTime,
  dateOnDay,
  formatDayLabel,
  formatDuration,
  formatSlotLabel,
  durationMinusBreak,
  TIME_FORMAT,
} from "@/utils/utils";
import {
  gridEndingDurations,
  snapDurationToSlots,
} from "@schellingboard/domain/slots";
import { slotIsFree } from "@/utils/schedule-column";
import { MyListbox, type Option } from "./select";
import { viewProposalLinkFromElsewhere } from "./modal-nav";
import type { SessionProposal, Session } from "@schellingboard/domain/session";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
import type { Guest } from "@schellingboard/domain/guest";
import type { Day, Event } from "@schellingboard/domain/event";
import { ConfirmDeletionModal } from "../modals";
import { EventContext, UserContext } from "../context";
import { newEmptySession, sessionRooms } from "../session_utils";
import { useToast } from "../toast";
import {
  buildSessionInterval,
  CAPACITY_ERROR,
  sessionHasStarted,
} from "@/app/api/session-form-utils";
import { revalidateEvent } from "./session-actions";
import { detectGuestClashes, type GuestClash } from "./clash-actions";
import { MarkdownHint } from "@/app/(site)/markdown";
import { ScheduledSessionsNotice } from "./scheduled-sessions-notice";
import { BackLink } from "@/app/components/back-link";
import { FormActions } from "./form-actions";
import { SUBMIT_BUTTON } from "@/app/components/buttons";
import { MarkdownTextarea } from "@/app/components/markdown-textarea";

// A save confirmation is routine news, so it clears itself — but late enough
// that someone who looked away as the page changed still catches it.
const CONFIRMATION_MS = 10_000;

interface ErrorResponse {
  error?: string;
}

export function SessionForm(props: {
  event: Event;
  days: Day[];
  sessions: Session[];
  /** Every room the event shows, bookable or not — see `locations` below. */
  locations: Location[];
  guests: Guest[];
  proposals: SessionProposal[];
  maxSessionDuration: number;
}) {
  const { event, days, sessions, guests, proposals, maxSessionDuration } =
    props;
  const { user: currentUser } = useContext(UserContext);
  const { now, unavailability } = useContext(EventContext);
  const eventName = event.name;
  const timezone = event.timezone ?? "UTC";

  const searchParams = useSearchParams();
  const dayParam = searchParams?.get("day");
  const timeParam = searchParams?.get("time");
  const initLocation = searchParams?.get("location");
  const sessionID = searchParams?.get("sessionID");
  const proposalID = searchParams?.get("proposalID");
  const initialProposal = proposals.find((p) => p.id === proposalID) ?? null;
  const session =
    sessions.find((ses) => ses.id === sessionID) || newEmptySession(event.id);
  const breakMs = event.breakMinutes * 60 * 1000;
  // The form works in slots, and a session starts once its slot's break is
  // over — so an organizer's breakless session sits in a slot off the grid.
  const ownSlot = session.startTime
    ? session.startTime.getTime() - breakMs
    : undefined;
  // A started session keeps the start its attendees turned up for, so that
  // start stops being a form field: it is read from the session rather than
  // from the picker, which need not offer it once another room is selected.
  const lockedStart = sessionHasStarted(session, now) ? ownSlot! : null;
  // Attendees may book only some of the event's rooms; the ones this session
  // is already in are offered too, so keeping them is never what blocks a save.
  const ownRooms = sessionRooms(session, props.locations);
  const locations = props.locations.filter(
    (loc) => loc.bookable || ownRooms.includes(loc)
  );
  const ownRoomsChoice = ownRooms.length > 1 ? KEEP_ROOMS : ownRooms[0]?.id;
  const paramDateTime =
    dayParam && timeParam
      ? convertParamDateTime(dayParam, timeParam, timezone)
      : null;
  const initDateTime = paramDateTime ?? session.startTime ?? null;
  const initDay = initDateTime
    ? days.find((d) => dateOnDay(initDateTime, d))
    : undefined;
  const initSlot = paramDateTime?.getTime() ?? ownSlot;

  // Compute default hosts for new sessions (no initial proposal, no sessionID).
  // Also used as the "reset" target when the user un-selects a proposal.
  const defaultHosts: Guest[] = currentUser
    ? guests.filter((g) => g.id === currentUser)
    : [];
  const initialHosts: Guest[] = initialProposal
    ? guests.filter((g) => initialProposal.hosts.some((h) => h.id === g.id))
    : sessionID
      ? guests.filter((g) => session.hosts.some((h) => h.id === g.id))
      : defaultHosts;
  const sessionDuration =
    sessionID && ownSlot !== undefined
      ? Math.round(((session.endTime?.valueOf() ?? 0) - ownSlot) / 1000 / 60)
      : null;

  const [proposal, setProposal] = useState<SessionProposal | null>(
    initialProposal
  );
  const [usedProposal, setUsedProposal] = useState<boolean>(!!initialProposal);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialProposal?.title ?? session.title);
  const [description, setDescription] = useState(
    initialProposal?.description ?? session.description
  );
  const [closed, setClosed] = useState(session.closed);
  const [day, setDay] = useState(initDay ?? days[0]);
  // Only preselect a location the picker offers: an existing session may sit
  // in one that has since been unassigned from the event.
  const [locationId, setLocationId] = useState<string | undefined>(
    locations.find((l) => l.name === initLocation)?.id ?? ownRoomsChoice
  );
  const rooms =
    locationId === KEEP_ROOMS
      ? ownRooms
      : locations.filter((loc) => loc.id === locationId);
  const location = rooms.length === 1 ? rooms[0] : undefined;
  // Settling on one of several rooms leaves the session where it is, too.
  const staysInRooms =
    rooms.length > 0 && rooms.every((room) => ownRooms.includes(room));
  // null while the field still follows the room. An existing session whose
  // capacity already differs from its room's is a number the host chose, so
  // it survives a move to another room.
  const [capacityInput, setCapacityInput] = useState<string | null>(
    sessionID &&
      (ownRooms.length > 1 || session.capacity !== (ownRooms[0]?.capacity ?? 0))
      ? String(session.capacity)
      : null
  );
  const capacity = capacityInput ?? String(location?.capacity ?? 0);
  const capacityNumber = Number(capacity);
  const capacityValid =
    capacity.trim() !== "" &&
    Number.isInteger(capacityNumber) &&
    capacityNumber >= 0;
  const overRoomCapacity =
    capacityValid &&
    !!location &&
    location.capacity > 0 &&
    capacityNumber > location.capacity;
  const startTimes = getAvailableStartTimes(
    day,
    sessions,
    session,
    maxSessionDuration,
    event.breakMinutes,
    event.slotIncrementMinutes,
    timezone,
    unavailability,
    rooms.map((room) => room.id),
    staysInRooms
  );
  const initTimeValid = startTimes.some((st) => st.time === initSlot);
  const [startTime, setStartTime] = useState<number | undefined>(
    initTimeValid ? initSlot : undefined
  );
  // Derived: the currently-selected startTime if it is still available under
  // the current location/day, otherwise undefined. Avoids a setState-in-effect
  // reset by not storing invalid values downstream.
  const effectiveStartTime = startTimes.some(
    (st) => st.time === startTime && st.available
  )
    ? startTime
    : undefined;
  const chosenStart = lockedStart ?? effectiveStartTime;
  const maxDuration =
    startTimes.find((st) => st.time === chosenStart)?.maxDuration ??
    maxSessionDuration;
  const keepsOwnSlot =
    chosenStart !== undefined && chosenStart === ownSlot && staysInRooms;
  // Proposal durations are free-form, so they get snapped to the nearest
  // selectable slot multiple; an existing session's duration already sits on
  // the grid and passes through unchanged.
  const [duration, setDuration] = useState<number>(
    initialProposal?.durationMinutes
      ? snapDurationToSlots(
          initialProposal.durationMinutes,
          event.slotIncrementMinutes,
          maxDuration
        )
      : (sessionDuration ??
          snapDurationToSlots(60, event.slotIncrementMinutes, maxDuration))
  );
  const offeredDurations = gridEndingDurations({
    slotOffsetMinutes:
      chosenStart === undefined
        ? 0
        : minutesPastGrid(chosenStart, day.start, event.slotIncrementMinutes),
    incrementMinutes: event.slotIncrementMinutes,
    maxDuration,
    breakMinutes: event.breakMinutes,
  });
  // While the session stays in the slot it was placed in, the length it
  // already runs is offered too: an organizer may have given it more than a
  // host may book, and dropping it would move the session's end unasked.
  const durationChoices =
    keepsOwnSlot &&
    sessionDuration !== null &&
    !offeredDurations.includes(sessionDuration)
      ? [...offeredDurations, sessionDuration].sort((a, b) => a - b)
      : offeredDurations;
  // Derived rather than stored, so a chosen value comes back when the choices
  // widen again.
  const effectiveDuration = durationChoices.includes(duration)
    ? duration
    : closestAtMost(durationChoices, duration);
  const [hosts, setHosts] = useState<Guest[]>(initialHosts);

  function applyProposal(next: SessionProposal | null) {
    setProposal(next);
    if (next) {
      setTitle(next.title);
      setDescription(next.description ?? "");
      setHosts(guests.filter((g) => next.hosts.some((h) => h.id === g.id)));
      if (next.durationMinutes) {
        setDuration(
          snapDurationToSlots(
            next.durationMinutes,
            event.slotIncrementMinutes,
            maxDuration
          )
        );
      }
      setUsedProposal(true);
    } else if (usedProposal) {
      setTitle("");
      setDescription("");
      setHosts(defaultHosts);
    }
  }

  let dummySession = newEmptySession(event.id);
  if (chosenStart !== undefined && day) {
    const { start, end } = buildSessionInterval(
      new Date(chosenStart),
      effectiveDuration
    );
    dummySession = {
      ...newEmptySession(event.id),
      startTime: new Date(start.getTime() + breakMs),
      endTime: end,
      id: sessionID || "",
    };
  }

  // Clash detection runs on the server (see clash-actions): a host's RSVP'd
  // sessions are private, so the client never receives them — the server only
  // reports that the host is "busy" for the overlapping interval.
  const [hostClashes, setHostClashes] = useState<GuestClash[]>([]);
  const [isCheckingClashes, setIsCheckingClashes] = useState(false);

  const hostIdsKey = hosts.map((h) => h.id).join(",");
  const candidateStart = dummySession.startTime?.getTime();
  const candidateEnd = dummySession.endTime?.getTime();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!candidateStart || !candidateEnd || !hostIdsKey) {
        setHostClashes((prev) => (prev.length === 0 ? prev : []));
        return;
      }
      setIsCheckingClashes(true);
      try {
        const clashes = await detectGuestClashes({
          eventId: event.id,
          guestIds: hostIdsKey.split(","),
          start: new Date(candidateStart).toISOString(),
          end: new Date(candidateEnd).toISOString(),
          excludeSessionId: sessionID ?? null,
        });
        if (!cancelled) setHostClashes(clashes);
      } catch (error) {
        console.error("Error detecting clashes:", error);
      } finally {
        if (!cancelled) setIsCheckingClashes(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [event.id, hostIdsKey, candidateStart, candidateEnd, sessionID]);

  const clashErrors = hostClashes.map((clash) => {
    const formatTime = (iso: string) =>
      DateTime.fromISO(iso).setZone(timezone).toFormat(TIME_FORMAT);
    const interval = `from ${formatTime(clash.start)} to ${formatTime(clash.end)}`;
    return clash.kind === "hosting"
      ? `${clash.guestName} is hosting ${clash.title} ${interval}`
      : `${clash.guestName} is busy ${interval}`;
  });

  const router = useRouter();
  const showToast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const Submit = async () => {
    setIsSubmitting(true);
    setError(null);
    if (!rooms.length || !day || chosenStart === undefined) {
      setError("Missing required fields");
      setIsSubmitting(false);
      return;
    }
    const endpoint = sessionID ? "/api/update-session" : "/api/add-session";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: sessionID,
        title,
        description,
        closed,
        dayId: day.id,
        location: rooms[0],
        locationIds: rooms.length > 1 ? rooms.map((r) => r.id) : undefined,
        capacity: capacityNumber,
        startTime: new Date(chosenStart).toISOString(),
        duration: effectiveDuration,
        hosts,
        proposal: proposal?.id ?? session.proposalId,
      }),
    });
    if (res.ok) {
      const actionType = sessionID ? "updated" : "added";
      await revalidateEvent(event.slug);
      showToast(
        `Your session “${title}” has been ${actionType} successfully!`,
        { autoDismissMs: CONFIRMATION_MS }
      );
      router.push(`/${event.slug}`);
      console.log(`Session ${actionType} successfully`);
    } else {
      let errorMessage = "Failed to update session";
      try {
        const errorData = (await res.json()) as ErrorResponse;
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = res.statusText || `Server error (${res.status})`;
      }
      setError(errorMessage);
      console.error("Error updating session:", {
        status: res.status,
        statusText: res.statusText,
      });
    }
    setIsSubmitting(false);
  };
  const Delete = async () => {
    setError(null);
    setIsSubmitting(true);
    const res = await fetch("/api/delete-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: sessionID,
      }),
    });
    if (res.ok) {
      console.log("Session deleted successfully");
      await revalidateEvent(event.slug);
      showToast(`Your session “${title}” has been deleted successfully.`, {
        autoDismissMs: CONFIRMATION_MS,
      });
      router.push(`/${event.slug}`);
    } else {
      let errorMessage = "Failed to delete session";
      try {
        const errorData = (await res.json()) as ErrorResponse;
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = res.statusText || `Server error (${res.status})`;
      }
      setError(errorMessage);
      console.error("Error deleting session:", {
        status: res.status,
        statusText: res.statusText,
      });
    }
    setIsSubmitting(false);
  };

  const nullProposalOpts: Option[] = [
    {
      value: "",
      display: "[none]",
      available: true,
    },
  ];
  const proposalSelectOpts = nullProposalOpts.concat(
    proposals.map((pr) => ({
      value: pr.id,
      display: pr.title,
      available: true,
    }))
  );

  return (
    <div className="flex flex-col gap-4">
      <BackLink href={`/${event.slug}`}>Schedule</BackLink>
      <div>
        <h2 className="text-2xl font-bold">
          {eventName}: {sessionID ? "Edit" : "Add a"} session
        </h2>
        <p className="text-sm text-fg-subtle mt-2">
          {sessionID
            ? ""
            : "Fill out this form to add a session to the schedule! "}
          Your session will be added to the schedule immediately, but we may
          reach out to you about rescheduling, relocating, or cancelling.
        </p>
      </div>
      {proposals.length > 0 && !sessionID && (
        <div className="flex flex-col gap-1 w-72">
          <label className="font-medium">Proposal</label>
          <MyListbox
            currValue={proposal?.id ?? ""}
            setCurrValue={(id) =>
              applyProposal(proposals.find((p) => p.id === id) ?? null)
            }
            options={proposalSelectOpts}
            placeholder={"Pre-fill from proposal"}
            truncateText={false}
          />
        </div>
      )}
      {proposal && !sessionID && (
        <ScheduledSessionsNotice proposalId={proposal.id}>
          Submitting adds another session. To change a scheduled one, open it
          and edit it there.
        </ScheduledSessionsNotice>
      )}
      <div className="flex flex-col gap-1">
        <label className="font-medium">
          Session title
          <RequiredStar />
        </label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">Description</label>
        <MarkdownTextarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <MarkdownHint />
      </div>

      {/* Closed session checkbox */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={closed}
            onChange={(e) => setClosed(e.target.checked)}
            className="h-4 w-4 text-brand focus:ring-brand-accent border-line rounded"
          />
          Closed session
        </label>
        <p className="text-sm text-fg-subtle ml-6">
          Check this if attendees can at most arrive 5 minutes late. If they
          arrive later they may not join and should not knock or otherwise
          disrupt the session.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium">
          Hosts
          <RequiredStar />
        </label>
        <p className="text-sm text-fg-subtle">
          You and any cohosts who have agreed to host this session with you.
          Your cohosts will get an email confirmation when this form is
          submitted.
        </p>
        <SelectHosts
          guests={guests}
          hosts={hosts}
          setHosts={setHosts}
          selectMany={true}
        />
      </div>
      <div className="flex flex-col gap-1 w-72">
        <label className="font-medium">
          Location
          <RequiredStar />
        </label>
        <MyListbox
          currValue={locationId}
          setCurrValue={setLocationId}
          options={[
            ...(ownRooms.length > 1
              ? [
                  {
                    value: KEEP_ROOMS,
                    display: ownRooms.map((room) => room.name).join(", "),
                    available: true,
                  },
                ]
              : []),
            ...locations.map((loc) => ({
              value: loc.id,
              display: loc.name,
              available: true,
              helperText: `max ${loc.capacity}`,
            })),
          ]}
          placeholder={"Select a location"}
          truncateText={true}
        />
      </div>
      <div className="flex flex-col gap-1 w-72">
        <label htmlFor="max-attendees" className="font-medium">
          Max attendees
        </label>
        <Input
          id="max-attendees"
          type="number"
          min="0"
          value={capacity}
          onChange={(e) => setCapacityInput(e.target.value)}
          error={!capacityValid}
          errorMessage={CAPACITY_ERROR}
        />
        <p className="text-sm text-fg-subtle">
          Starts at what the room holds. 0 means no limit.
        </p>
        {overRoomCapacity && location && (
          <p className="text-sm text-danger-fg">
            That is more than {location.name} holds ({location.capacity}).
          </p>
        )}
      </div>
      {lockedStart !== null && (
        <p className="text-sm text-fg-subtle">
          This session has already started, so it can no longer be moved to
          another time — but you can still change everything else, including how
          long it runs.
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="font-medium">
          Day
          <RequiredStar />
        </label>
        {lockedStart !== null ? (
          <LockedValue value={formatDayLabel(day, timezone)} />
        ) : (
          <SelectDay
            days={days}
            day={day}
            setDay={setDay}
            timezone={timezone}
          />
        )}
      </div>
      <div className="flex flex-col gap-1 w-72">
        <label className="font-medium">
          Start Time
          <RequiredStar />
        </label>
        {lockedStart !== null ? (
          <LockedValue
            value={formatSlotLabel(
              new Date(lockedStart + breakMs),
              day.start,
              timezone
            )}
          />
        ) : (
          <MyListbox
            currValue={
              effectiveStartTime !== undefined
                ? String(effectiveStartTime)
                : undefined
            }
            setCurrValue={(v) => setStartTime(parseInt(v, 10))}
            options={startTimes.map((st) => ({
              value: String(st.time),
              display: st.formattedTime,
              available: st.available,
            }))}
            placeholder={"Select a start time"}
            truncateText={true}
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-medium">
          Duration
          <RequiredStar />
        </label>
        <SelectDuration
          duration={effectiveDuration}
          setDuration={setDuration}
          choices={durationChoices}
          breakMinutes={event.breakMinutes}
        />
      </div>
      {dummySession.startTime && dummySession.endTime && (
        <p className="text-sm text-fg-muted">
          Your session runs{" "}
          {formatSlotLabel(dummySession.startTime, day.start, timezone)} –{" "}
          {formatSlotLabel(dummySession.endTime, day.start, timezone)}.
        </p>
      )}
      {sessionID && session.proposalId && (
        <p className="text-sm text-fg-muted">
          This session was scheduled from a proposal. See it{" "}
          <Link
            {...viewProposalLinkFromElsewhere(event.slug, session.proposalId)}
            className="text-brand-fg underline"
          >
            here
          </Link>
          .
        </p>
      )}
      {clashErrors.length > 0 && (
        <div className="bg-danger-tint border border-danger-border text-danger-fg px-4 py-3 rounded-md">
          <p className="text-sm font-medium">Warning: schedule clash</p>
          {clashErrors.map((error) => (
            <p key={error} className="text-sm font-medium">
              - {error}
            </p>
          ))}
        </div>
      )}
      {error && (
        <div className="bg-danger-tint border border-danger-border text-danger-fg px-4 py-3 rounded-md">
          <p className="text-sm font-medium">Error: {error}</p>
        </div>
      )}
      <FormActions
        cancelHref={`/${event.slug}`}
        deleteButton={
          sessionID && (
            <ConfirmDeletionModal
              btnDisabled={isSubmitting}
              confirm={Delete}
              itemName="session"
            />
          )
        }
      >
        <button
          type="submit"
          className={SUBMIT_BUTTON}
          disabled={
            !title ||
            chosenStart === undefined ||
            !hosts.length ||
            !locationId ||
            !capacityValid ||
            !day ||
            !effectiveDuration ||
            isCheckingClashes ||
            isSubmitting
          }
          onClick={() => void Submit()}
        >
          Submit
        </button>
      </FormActions>
    </div>
  );
}

// The picker's value for leaving a session in the several rooms an organizer
// gave it; every other value is the id of one room.
const KEEP_ROOMS = "keep-rooms";

const RequiredStar = () => <span className="text-brand-fg mx-1">*</span>;

const LockedValue = ({ value }: { value: string }) => (
  <p className="text-fg-muted">{value}</p>
);

type StartTime = {
  formattedTime: string;
  /** The slot's absolute start, as epoch milliseconds. */
  time: number;
  maxDuration: number;
  available: boolean;
};
function getAvailableStartTimes(
  day: Day,
  sessions: Session[],
  currentSession: Session,
  maxSessionDuration: number,
  breakMinutes: number,
  slotIncrementMinutes: number,
  timezone: string,
  unavailability: LocationUnavailability[],
  roomIds: string[],
  staysInRooms: boolean
) {
  const breakMs = breakMinutes * 60 * 1000;
  const locationSelected = roomIds.length > 0;
  const others = [
    ...sessions.filter(
      (s) =>
        s.locations.some((l) => roomIds.includes(l.id)) &&
        s.id !== currentSession.id
    ),
    ...unavailability
      .filter((u) => roomIds.includes(u.locationId))
      .map((u) => ({ startTime: u.start, endTime: u.end })),
  ];
  const maxDurationFrom = (slot: number) => {
    const nextStart = Math.min(
      day.endBookings.getTime(),
      ...others
        .map((s) => s.startTime?.getTime() ?? Infinity)
        .filter((start) => start >= slot + breakMs)
    );
    return Math.max(
      0,
      Math.min((nextStart - slot) / 1000 / 60, maxSessionDuration)
    );
  };
  const label = (slot: number) =>
    formatSlotLabel(new Date(slot + breakMs), day.start, timezone);

  const startTimes: StartTime[] = [];
  for (
    let t = day.startBookings.getTime();
    t < day.endBookings.getTime();
    t += slotIncrementMinutes * 60 * 1000
  ) {
    const available =
      !locationSelected ||
      slotIsFree(others, new Date(t), slotIncrementMinutes, breakMinutes);
    startTimes.push({
      formattedTime: label(t),
      time: t,
      maxDuration: !available
        ? 0
        : locationSelected
          ? maxDurationFrom(t)
          : maxSessionDuration,
      available,
    });
  }

  // The slot the session already occupies, which an organizer may have put
  // where no host could book one: outside the bookable hours, off the grid, or
  // on top of another session. Keeping it has to stay possible, so it is
  // offered in its own right — only while its rooms and day are still the ones
  // it was placed in, since anywhere else is a move like any other.
  const staysPut =
    currentSession.startTime !== undefined &&
    staysInRooms &&
    dateOnDay(currentSession.startTime, day);
  if (staysPut) {
    const ownSlot = currentSession.startTime!.getTime() - breakMs;
    const slot: StartTime = {
      formattedTime: label(ownSlot),
      time: ownSlot,
      maxDuration: maxDurationFrom(ownSlot),
      available: true,
    };
    const at = startTimes.findIndex((st) => st.time === ownSlot);
    if (at === -1) {
      startTimes.push(slot);
      startTimes.sort((a, b) => a.time - b.time);
    } else {
      startTimes[at] = slot;
    }
  }
  return startTimes;
}

function minutesPastGrid(
  slot: number,
  dayStart: Date,
  incrementMinutes: number
): number {
  const minutes = (slot - dayStart.getTime()) / 60 / 1000;
  return ((minutes % incrementMinutes) + incrementMinutes) % incrementMinutes;
}

function closestAtMost(choices: number[], wanted: number): number {
  const fitting = choices.filter((c) => c <= wanted);
  return fitting.length ? fitting[fitting.length - 1] : (choices[0] ?? 0);
}

function SelectDuration(props: {
  duration: number;
  setDuration: (duration: number) => void;
  choices: number[];
  breakMinutes: number;
}) {
  const { duration, setDuration, choices, breakMinutes } = props;

  return (
    <fieldset>
      <div className="space-y-4">
        {choices.map((value) => (
          <div key={value} className="flex items-center">
            <input
              id={`duration-${value}`}
              type="radio"
              checked={value === duration}
              onChange={() => setDuration(value)}
              className="h-4 w-4 border-line text-brand focus:ring-brand-accent"
            />
            <label
              htmlFor={`duration-${value}`}
              className="ml-3 block text-sm font-medium leading-6 text-fg"
            >
              {formatDuration(durationMinusBreak(value, breakMinutes), true)}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function SelectDay(props: {
  days: Day[];
  day: Day;
  setDay: (day: Day) => void;
  timezone: string;
}) {
  const { days, day, setDay, timezone } = props;
  return (
    <fieldset>
      <div className="space-y-4">
        {days.map((d) => {
          const formattedDay = formatDayLabel(d, timezone);
          return (
            <div key={d.id} className="flex items-center">
              <input
                id={d.id}
                type="radio"
                checked={d.id === day.id}
                onChange={() => setDay(d)}
                className="h-4 w-4 border-line text-brand focus:ring-brand-accent"
              />
              <label
                htmlFor={d.id}
                className="ml-3 block text-sm font-medium leading-6 text-fg"
              >
                {formattedDay}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
