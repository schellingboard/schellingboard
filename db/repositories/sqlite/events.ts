import { eq, getTableColumns, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import { eventNameToSlug } from "@/utils/utils";
import type { EventsRepository } from "../interfaces";
import type { Event, EventMeetingSettings } from "@schellingboard/domain/event";

type EventRow = typeof schema.events.$inferInsert;

type DB = BetterSQLite3Database<typeof schema>;

// Qualified by hand: drizzle drops table names in a single-table select, which
// would compare days.event_id with days.id.
const eventColumns = {
  ...getTableColumns(schema.events),
  firstDayStart: sql<
    string | null
  >`(select min("days"."start") from "days" where "days"."event_id" = "events"."id")`,
  lastDayStart: sql<
    string | null
  >`(select max("days"."start") from "days" where "days"."event_id" = "events"."id")`,
};

type EventSelectRow = typeof schema.events.$inferSelect & {
  firstDayStart: string | null;
  lastDayStart: string | null;
};

function rowToEvent(row: EventSelectRow): Event {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    website: row.website,
    firstDayStart: row.firstDayStart ? new Date(row.firstDayStart) : undefined,
    lastDayStart: row.lastDayStart ? new Date(row.lastDayStart) : undefined,
    proposalPhaseStart: row.proposalPhaseStart
      ? new Date(row.proposalPhaseStart)
      : undefined,
    proposalPhaseEnd: row.proposalPhaseEnd
      ? new Date(row.proposalPhaseEnd)
      : undefined,
    votingPhaseStart: row.votingPhaseStart
      ? new Date(row.votingPhaseStart)
      : undefined,
    votingPhaseEnd: row.votingPhaseEnd
      ? new Date(row.votingPhaseEnd)
      : undefined,
    schedulingPhaseStart: row.schedulingPhaseStart
      ? new Date(row.schedulingPhaseStart)
      : undefined,
    schedulingPhaseEnd: row.schedulingPhaseEnd
      ? new Date(row.schedulingPhaseEnd)
      : undefined,
    maxSessionDuration: row.maxSessionDuration,
    breakMinutes: row.breakMinutes,
    slotIncrementMinutes: row.slotIncrementMinutes,
    timezone: row.timezone,
    rsvpCapacityHardLimit: row.rsvpCapacityHardLimit,
    icon: row.icon ?? undefined,
    meetingsEnabled: row.meetingsEnabled,
    maxOpenMeetingRequests: row.maxOpenMeetingRequests,
  };
}

export class SqliteEventsRepository implements EventsRepository {
  constructor(private readonly db: DB) {}

  async list(): Promise<Event[]> {
    return this.db
      .select(eventColumns)
      .from(schema.events)
      .all()
      .map(rowToEvent);
  }

  async findById(id: string): Promise<Event | undefined> {
    const row = this.db
      .select(eventColumns)
      .from(schema.events)
      .where(eq(schema.events.id, id))
      .get();
    return row ? rowToEvent(row) : undefined;
  }

  async findByName(name: string): Promise<Event | undefined> {
    const row = this.db
      .select(eventColumns)
      .from(schema.events)
      .where(eq(schema.events.name, name))
      .get();
    return row ? rowToEvent(row) : undefined;
  }

  async findBySlug(slug: string): Promise<Event | undefined> {
    const row = this.db
      .select(eventColumns)
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .get();
    return row ? rowToEvent(row) : undefined;
  }

  async create(
    data: Omit<Event, "id" | "slug" | keyof EventMeetingSettings> &
      Partial<EventMeetingSettings>
  ): Promise<Event> {
    const id = nanoid();
    const slug = eventNameToSlug(data.name);
    this.db
      .insert(schema.events)
      .values({
        id,
        name: data.name,
        slug,
        description: data.description,
        website: data.website,
        proposalPhaseStart: data.proposalPhaseStart?.toISOString() ?? null,
        proposalPhaseEnd: data.proposalPhaseEnd?.toISOString() ?? null,
        votingPhaseStart: data.votingPhaseStart?.toISOString() ?? null,
        votingPhaseEnd: data.votingPhaseEnd?.toISOString() ?? null,
        schedulingPhaseStart: data.schedulingPhaseStart?.toISOString() ?? null,
        schedulingPhaseEnd: data.schedulingPhaseEnd?.toISOString() ?? null,
        maxSessionDuration: data.maxSessionDuration,
        breakMinutes: data.breakMinutes,
        slotIncrementMinutes: data.slotIncrementMinutes,
        timezone: data.timezone,
        rsvpCapacityHardLimit: data.rsvpCapacityHardLimit,
        icon: data.icon ?? null,
        ...(data.meetingsEnabled !== undefined && {
          meetingsEnabled: data.meetingsEnabled,
        }),
        ...(data.maxOpenMeetingRequests !== undefined && {
          maxOpenMeetingRequests: data.maxOpenMeetingRequests,
        }),
      })
      .run();
    // Read back rather than returning `data`: the meeting settings are
    // optional, and the caller must see the defaults the schema supplied.
    const created = await this.findById(id);
    if (!created) throw new Error("Failed to create event");
    return created;
  }

  async update(
    id: string,
    patch: Partial<Omit<Event, "id" | "slug">>
  ): Promise<Event | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const set: Partial<EventRow> = {};
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.description !== undefined) set.description = patch.description;
    if (patch.website !== undefined) set.website = patch.website;
    if ("proposalPhaseStart" in patch)
      set.proposalPhaseStart = patch.proposalPhaseStart?.toISOString() ?? null;
    if ("proposalPhaseEnd" in patch)
      set.proposalPhaseEnd = patch.proposalPhaseEnd?.toISOString() ?? null;
    if ("votingPhaseStart" in patch)
      set.votingPhaseStart = patch.votingPhaseStart?.toISOString() ?? null;
    if ("votingPhaseEnd" in patch)
      set.votingPhaseEnd = patch.votingPhaseEnd?.toISOString() ?? null;
    if ("schedulingPhaseStart" in patch)
      set.schedulingPhaseStart =
        patch.schedulingPhaseStart?.toISOString() ?? null;
    if ("schedulingPhaseEnd" in patch)
      set.schedulingPhaseEnd = patch.schedulingPhaseEnd?.toISOString() ?? null;
    if (patch.maxSessionDuration !== undefined)
      set.maxSessionDuration = patch.maxSessionDuration;
    if (patch.breakMinutes !== undefined) set.breakMinutes = patch.breakMinutes;
    if (patch.slotIncrementMinutes !== undefined)
      set.slotIncrementMinutes = patch.slotIncrementMinutes;
    if (patch.timezone !== undefined) set.timezone = patch.timezone;
    if (patch.rsvpCapacityHardLimit !== undefined)
      set.rsvpCapacityHardLimit = patch.rsvpCapacityHardLimit;
    if ("icon" in patch) set.icon = patch.icon ?? null;
    if (patch.meetingsEnabled !== undefined)
      set.meetingsEnabled = patch.meetingsEnabled;
    if (patch.maxOpenMeetingRequests !== undefined)
      set.maxOpenMeetingRequests = patch.maxOpenMeetingRequests;

    this.db
      .update(schema.events)
      .set(set)
      .where(eq(schema.events.id, id))
      .run();

    return { ...existing, ...patch };
  }

  async delete(id: string): Promise<void> {
    this.db.delete(schema.events).where(eq(schema.events.id, id)).run();
  }
}
