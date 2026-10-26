import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Day, Event } from "@schellingboard/domain/event";
import type { Guest } from "@schellingboard/domain/guest";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
import type { LoggedProposal } from "@schellingboard/domain/change";
import type { Rsvp, Session } from "@schellingboard/domain/session";
import type { VoteChoice } from "@schellingboard/domain/vote";

type DayWithSessions = Day & { sessions: Session[] };

const date = (iso: string) => new Date(iso);
const optionalDate = (iso: string | null) => (iso ? new Date(iso) : undefined);

export function toEvent(e: Snapshot["event"]): Event {
  return {
    ...e,
    firstDayStart: optionalDate(e.firstDayStart),
    lastDayStart: optionalDate(e.lastDayStart),
    proposalPhaseStart: optionalDate(e.proposalPhaseStart),
    proposalPhaseEnd: optionalDate(e.proposalPhaseEnd),
    votingPhaseStart: optionalDate(e.votingPhaseStart),
    votingPhaseEnd: optionalDate(e.votingPhaseEnd),
    schedulingPhaseStart: optionalDate(e.schedulingPhaseStart),
    schedulingPhaseEnd: optionalDate(e.schedulingPhaseEnd),
  };
}

function toDay(d: Snapshot["days"][number]): Day {
  return {
    ...d,
    start: date(d.start),
    end: date(d.end),
    startBookings: date(d.startBookings),
    endBookings: date(d.endBookings),
  };
}

function toLocation(l: Snapshot["locations"][number]): Location {
  const { areaDescription, ...rest } = l;
  return areaDescription === null ? rest : { ...rest, areaDescription };
}

// The schedule's screens still take today's denormalized shapes (ADR 0014
// section 8); a host missing from `guests` is left out rather than unnamed.
export function eventContextFrom(snapshot: Snapshot) {
  const guestsById = new Map(snapshot.guests.map((g) => [g.id, g]));
  const locations = snapshot.locations.map(toLocation);
  const locationsById = new Map(locations.map((l) => [l.id, l]));

  const roomsOf = (ids: string[]) => {
    const wanted = new Set(ids);
    return locations
      .filter((room) => wanted.has(room.id))
      .map(({ id, name, color }) => ({ id, name, color }));
  };

  const sessions: Session[] = snapshot.sessions.map(
    ({ hostIds, locationIds, startTime, endTime, proposalId, ...s }) => ({
      ...s,
      startTime: optionalDate(startTime),
      endTime: optionalDate(endTime),
      proposalId: proposalId ?? undefined,
      hosts: hostIds.flatMap((id) => {
        const host = guestsById.get(id);
        return host ? [{ id, name: host.name }] : [];
      }),
      locations: roomsOf(locationIds),
      numRsvps: snapshot.counts[s.id] ?? 0,
    })
  );

  const days: DayWithSessions[] = snapshot.days.map(toDay).map((day) => ({
    ...day,
    sessions: sessions.filter(
      (s) =>
        s.startTime &&
        s.endTime &&
        day.start.getTime() <= s.startTime.getTime() &&
        day.end.getTime() >= s.endTime.getTime()
    ),
  }));

  const unavailability: LocationUnavailability[] = snapshot.unavailability
    .filter((u) => locationsById.has(u.locationId))
    .map((u) => ({ ...u, start: date(u.start), end: date(u.end) }));

  // The schedule's guest lists (host picker, attendee count) are members only.
  // Like the lean list they replace, they carry no admin `version`.
  const guests = snapshot.guests
    .filter((g) => g.member)
    .map((g) => {
      const guest = {
        id: g.id,
        name: g.name,
        avatarUrl: g.avatarUrl,
        aboutMe: g.aboutMe,
        authProtected: g.authProtected,
        profileVersion: g.profileVersion,
        info: undefined,
      } satisfies Omit<Guest, "version">;
      return guest as Guest;
    });

  const rsvps: Rsvp[] = snapshot.me?.rsvps ?? [];

  return {
    event: toEvent(snapshot.event),
    days,
    sessions,
    locations,
    unavailability,
    guests,
    rsvps,
  };
}

/** Oldest first, which is stable; the screens sort and filter from here. */
export function proposalsFrom(snapshot: Snapshot): LoggedProposal[] {
  return snapshot.proposals
    .map(
      ({
        description,
        durationMinutes,
        cohostWantedNote,
        createdTime,
        updatedTime,
        ...p
      }): LoggedProposal => ({
        ...p,
        description: description ?? undefined,
        durationMinutes: durationMinutes ?? undefined,
        cohostWantedNote: cohostWantedNote ?? undefined,
        createdTime: date(createdTime),
        updatedTime: date(updatedTime),
      })
    )
    .sort(
      (a, b) =>
        a.createdTime.getTime() - b.createdTime.getTime() ||
        (a.id < b.id ? -1 : 1)
    );
}

export function ownVotesFrom(snapshot: Snapshot): Map<string, VoteChoice> {
  return new Map(
    (snapshot.me?.votes ?? []).map((v) => [v.proposalId, v.choice])
  );
}
