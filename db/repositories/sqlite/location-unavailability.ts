import { asc, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type {
  LocationUnavailability,
  LocationUnavailabilityRepository,
} from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

function rowToPeriod(
  row: typeof schema.locationUnavailability.$inferSelect
): LocationUnavailability {
  return {
    id: row.id,
    eventId: row.eventId,
    locationId: row.locationId,
    start: new Date(row.start),
    end: new Date(row.end),
  };
}

export class SqliteLocationUnavailabilityRepository implements LocationUnavailabilityRepository {
  constructor(private readonly db: DB) {}

  async listByEvent(eventId: string): Promise<LocationUnavailability[]> {
    return this.db
      .select()
      .from(schema.locationUnavailability)
      .where(eq(schema.locationUnavailability.eventId, eventId))
      .orderBy(asc(schema.locationUnavailability.start))
      .all()
      .map(rowToPeriod);
  }

  async findById(id: string): Promise<LocationUnavailability | undefined> {
    const row = this.db
      .select()
      .from(schema.locationUnavailability)
      .where(eq(schema.locationUnavailability.id, id))
      .get();
    return row ? rowToPeriod(row) : undefined;
  }

  async create(
    data: Omit<LocationUnavailability, "id">
  ): Promise<LocationUnavailability> {
    const id = nanoid();
    this.db
      .insert(schema.locationUnavailability)
      .values({
        id,
        eventId: data.eventId,
        locationId: data.locationId,
        start: data.start.toISOString(),
        end: data.end.toISOString(),
      })
      .run();
    return { id, ...data };
  }

  async delete(id: string): Promise<void> {
    this.db
      .delete(schema.locationUnavailability)
      .where(eq(schema.locationUnavailability.id, id))
      .run();
  }
}
