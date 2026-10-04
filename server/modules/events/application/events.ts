import type { Day, Event } from "@schellingboard/domain/event";
import { isEventIconName } from "@schellingboard/domain/event-icons";
import {
  SLOT_INCREMENT_OPTIONS,
  isSlotAligned,
  isValidSlotIncrement,
} from "@schellingboard/domain/slots";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  forbidden,
  invalid,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import {
  eventNameToSlug,
  normalizeWebsiteUrl,
  RESERVED_EVENT_SLUGS,
} from "@/utils/utils";
import type { EventDeps } from "../ports";

export interface EventSettingsInput {
  name: string;
  description: string;
  website: string;
  timezone: string;
  maxSessionDuration: number;
  breakMinutes: number;
  slotIncrementMinutes: number;
  rsvpCapacityHardLimit?: boolean;
  icon?: string | null;
}

export const PHASE_FIELDS = [
  ["proposalPhaseStart", "proposal phase start"],
  ["proposalPhaseEnd", "proposal phase end"],
  ["votingPhaseStart", "voting phase start"],
  ["votingPhaseEnd", "voting phase end"],
  ["schedulingPhaseStart", "scheduling phase start"],
  ["schedulingPhaseEnd", "scheduling phase end"],
] as const;

type PhaseField = (typeof PHASE_FIELDS)[number][0];

/** An unset field clears that date; an invalid Date is refused. */
export type EventPhasesInput = { id: string } & Record<
  PhaseField,
  Date | undefined
>;

type EventPhases = Partial<Record<PhaseField, Date | undefined>>;

export const adminRequired = () => forbidden("admin.required", "Unauthorized");
export const eventNotFound = () =>
  notFound("event.notFound", "Event not found");

// Phase dates and the meeting settings are deliberately excluded: they are
// managed only by updateEventPhases and the admin Meetings section, so
// leaving them out is what keeps a basic-info save from touching them.
type EventSettings = Pick<
  Event,
  | "name"
  | "description"
  | "website"
  | "timezone"
  | "maxSessionDuration"
  | "breakMinutes"
  | "slotIncrementMinutes"
  | "rsvpCapacityHardLimit"
  | "icon"
>;

function isKnownTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function parseSettings(
  input: EventSettingsInput
): { data: EventSettings } | Failure {
  const name = input.name.trim();
  if (!name) return invalid("event.nameRequired", "Name is required");

  // The form only offers known zones; a script's typo would break every page
  // that formats the event's times.
  const timezone = input.timezone.trim() || "UTC";
  if (!isKnownTimeZone(timezone)) {
    return invalid("event.timezoneUnknown", "Unknown timezone");
  }

  const { maxSessionDuration, breakMinutes, slotIncrementMinutes } = input;
  if (isNaN(maxSessionDuration) || maxSessionDuration <= 0) {
    return invalid(
      "event.durationInvalid",
      "Max session duration must be a positive number"
    );
  }
  if (isNaN(breakMinutes) || breakMinutes < 0) {
    return invalid(
      "event.breakInvalid",
      "Break must be zero or a positive number"
    );
  }
  if (!isValidSlotIncrement(slotIncrementMinutes)) {
    return invalid(
      "event.slotIncrementInvalid",
      `Slot increment must be one of ${SLOT_INCREMENT_OPTIONS.join(", ")} minutes`
    );
  }
  // Seeding scripts send raw JSON, so the type isn't guaranteed at runtime.
  const rsvpCapacityHardLimit = input.rsvpCapacityHardLimit ?? false;
  if (typeof rsvpCapacityHardLimit !== "boolean") {
    return invalid(
      "event.rsvpCapacityHardLimitInvalid",
      "RSVP capacity hard limit must be a boolean"
    );
  }

  const icon = input.icon?.trim() || undefined;
  if (icon && !isEventIconName(icon)) {
    return invalid("event.iconUnknown", "Unknown icon");
  }

  return {
    data: {
      name,
      description: input.description.trim(),
      website: normalizeWebsiteUrl(input.website),
      timezone,
      maxSessionDuration,
      breakMinutes,
      slotIncrementMinutes,
      rsvpCapacityHardLimit,
      icon,
    },
  };
}

// The schedule grid anchors its slots at each day's start, so a new increment
// only works if every day window still falls on slot boundaries. The admin
// must fix the misaligned days first.
function misalignedDays(days: Day[], incrementMinutes: number): Failure | null {
  const dayAligned = (d: Day) =>
    isSlotAligned(d.end, d.start, incrementMinutes) &&
    isSlotAligned(d.startBookings, d.start, incrementMinutes) &&
    isSlotAligned(d.endBookings, d.start, incrementMinutes);
  return days.every(dayAligned)
    ? null
    : conflict(
        "event.slotIncrementMisaligned",
        `Cannot change the slot increment: some day windows are not aligned to ${incrementMinutes}-minute slots. Adjust the days first.`
      );
}

export const createEvent =
  ({ repos }: EventDeps) =>
  async (
    actor: Actor,
    { phases = {}, ...input }: EventSettingsInput & { phases?: EventPhases }
  ): Promise<Result<Event>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseSettings(input);
    if (!("data" in parsed)) return parsed;
    const phasesRefused = phasesError(phases);
    if (phasesRefused) return phasesRefused;

    const slug = eventNameToSlug(parsed.data.name);
    if (!slug) {
      return invalid("event.slugEmpty", "Name must contain a letter or number");
    }
    if (RESERVED_EVENT_SLUGS.has(slug.toLowerCase())) {
      return invalid(
        "event.slugReserved",
        `"${slug}" is a reserved URL and cannot be used as an event name`
      );
    }
    const existing = await repos.events.findBySlug(slug);
    if (existing) {
      return conflict(
        "event.slugTaken",
        `An event with the URL "${slug}" already exists ("${existing.name}")`
      );
    }

    try {
      return ok(await repos.events.create({ ...parsed.data, ...phases }));
    } catch (e) {
      // A concurrent create can win the race between the findBySlug check
      // above and this insert.
      if (
        e instanceof Error &&
        e.message.includes("UNIQUE constraint failed: events.slug")
      ) {
        return conflict(
          "event.slugTaken",
          `An event with the URL "${slug}" already exists`
        );
      }
      throw e;
    }
  };

export const updateEvent =
  ({ repos }: EventDeps) =>
  async (
    actor: Actor,
    input: EventSettingsInput & { id: string }
  ): Promise<Result<Event>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseSettings(input);
    if (!("data" in parsed)) return parsed;

    const existing = await repos.events.findById(input.id);
    if (!existing) return eventNotFound();

    const incrementChanged =
      parsed.data.slotIncrementMinutes !== existing.slotIncrementMinutes;
    if (incrementChanged) {
      const misaligned = misalignedDays(
        await repos.days.listByEvent(input.id),
        parsed.data.slotIncrementMinutes
      );
      if (misaligned) return misaligned;
    }

    const updated = await repos.events.update(input.id, parsed.data);
    if (!updated) return eventNotFound();

    // 1-on-1 slots are this same grid, so a new increment re-reads what people
    // declared. A coarser grid is the dangerous direction: a surviving 10:00 row
    // would advertise 10:00-11:00 when the guest only ever offered 10:00-10:30.
    // A finer grid could in principle be kept; it isn't worth the special case.
    if (incrementChanged) {
      await repos.meetingAvailability.deleteByEvent(input.id);
    }
    return ok(updated);
  };

function phaseOrderError(p: EventPhases) {
  const {
    proposalPhaseStart: pStart,
    proposalPhaseEnd: pEnd,
    votingPhaseStart: vStart,
    votingPhaseEnd: vEnd,
    schedulingPhaseStart: sStart,
    schedulingPhaseEnd: sEnd,
  } = p;
  if (pStart && pEnd && pEnd <= pStart) {
    return "Proposal phase end must be after its start";
  }
  if (vStart && vEnd && vEnd <= vStart) {
    return "Voting phase end must be after its start";
  }
  if (sStart && sEnd && sEnd <= sStart) {
    return "Scheduling phase end must be after its start";
  }
  if (pEnd && vStart && vStart < pEnd) {
    return "Voting phase must not start before proposal phase ends";
  }
  if (vEnd && sStart && sStart < vEnd) {
    return "Scheduling phase must not start before voting phase ends";
  }
  // A phase without an explicit end implicitly ends when the next phase starts,
  // so the starts themselves must stay in order.
  if (pStart && vStart && vStart < pStart) {
    return "Voting phase must not start before proposal phase starts";
  }
  if (vStart && sStart && sStart < vStart) {
    return "Scheduling phase must not start before voting phase starts";
  }
  // When voting is unset, the checks above leave scheduling unconstrained
  // relative to the proposal phase. Constrain it directly so scheduling can
  // never start before the proposal phase starts or ends.
  if (pStart && sStart && sStart < pStart) {
    return "Scheduling phase must not start before proposal phase starts";
  }
  if (pEnd && sStart && sStart < pEnd) {
    return "Scheduling phase must not start before proposal phase ends";
  }
  return null;
}

function phasesError(phases: EventPhases): Failure | null {
  for (const [field, label] of PHASE_FIELDS) {
    const date = phases[field];
    if (date && isNaN(date.getTime())) {
      return invalid("event.phaseDateInvalid", `Invalid ${label}`);
    }
  }
  const orderError = phaseOrderError(phases);
  return orderError ? invalid("event.phasesOutOfOrder", orderError) : null;
}

export const updateEventPhases =
  ({ repos }: EventDeps) =>
  async (actor: Actor, input: EventPhasesInput): Promise<Result<Event>> => {
    if (!actor.admin) return adminRequired();
    const { id, ...phases } = input;
    const refused = phasesError(phases);
    if (refused) return refused;

    const updated = await repos.events.update(id, phases);
    return updated ? ok(updated) : eventNotFound();
  };

export const deleteEvent =
  ({ repos }: EventDeps) =>
  async (actor: Actor, input: { id: string }): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(input.id))) return eventNotFound();
    await repos.events.delete(input.id);
    return ok(undefined);
  };
