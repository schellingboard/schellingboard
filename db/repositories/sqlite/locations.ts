import { and, eq, inArray, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type { LocationsRepository } from "../interfaces";
import type { Location } from "@schellingboard/domain/location";

type DB = BetterSQLite3Database<typeof schema>;
type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

function rowToLocation(row: typeof schema.locations.$inferSelect): Location {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.imageUrl,
    description: row.description,
    capacity: row.capacity,
    color: row.color,
    bookable: row.bookable,
    sortIndex: row.sortIndex,
    areaDescription: row.areaDescription ?? undefined,
    version: row.version,
  };
}

export class SqliteLocationsRepository implements LocationsRepository {
  constructor(private readonly db: DB) {}

  async list(): Promise<Location[]> {
    return this.db
      .select()
      .from(schema.locations)
      .orderBy(schema.locations.sortIndex, schema.locations.id)
      .all()
      .map(rowToLocation);
  }

  async listByEvent(eventId: string): Promise<Location[]> {
    return this.db
      .select()
      .from(schema.locations)
      .innerJoin(
        schema.eventLocations,
        eq(schema.locations.id, schema.eventLocations.locationId)
      )
      .where(eq(schema.eventLocations.eventId, eventId))
      .orderBy(schema.locations.sortIndex, schema.locations.id)
      .all()
      .map((row) => rowToLocation(row.locations));
  }

  async listBookableByEvent(eventId: string): Promise<Location[]> {
    return this.db
      .select()
      .from(schema.locations)
      .innerJoin(
        schema.eventLocations,
        eq(schema.locations.id, schema.eventLocations.locationId)
      )
      .where(
        and(
          eq(schema.eventLocations.eventId, eventId),
          eq(schema.locations.bookable, true)
        )
      )
      .orderBy(schema.locations.sortIndex, schema.locations.id)
      .all()
      .map((row) => rowToLocation(row.locations));
  }

  async findById(id: string): Promise<Location | undefined> {
    return this.findByIdSync(id);
  }

  private findByIdSync(id: string): Location | undefined {
    const row = this.db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.id, id))
      .get();
    return row ? rowToLocation(row) : undefined;
  }

  private eventIdsSync(id: string): string[] {
    return this.db
      .select({ eventId: schema.eventLocations.eventId })
      .from(schema.eventLocations)
      .where(eq(schema.eventLocations.locationId, id))
      .orderBy(schema.eventLocations.eventId)
      .all()
      .map((r) => r.eventId);
  }

  private bumpVersions(tx: Tx, ids: string[]) {
    if (ids.length === 0) return;
    tx.update(schema.locations)
      .set({ version: sql`${schema.locations.version} + 1` })
      .where(inArray(schema.locations.id, ids))
      .run();
  }

  private replaceEventIds(tx: Tx, id: string, eventIds: string[]) {
    tx.delete(schema.eventLocations)
      .where(eq(schema.eventLocations.locationId, id))
      .run();
    for (const eventId of eventIds) {
      tx.insert(schema.eventLocations)
        .values({ eventId, locationId: id })
        .run();
    }
  }

  async create(data: Omit<Location, "id" | "version">): Promise<Location> {
    const id = nanoid();
    this.db
      .insert(schema.locations)
      .values({
        id,
        name: data.name,
        imageUrl: data.imageUrl,
        description: data.description,
        capacity: data.capacity,
        color: data.color,
        bookable: data.bookable,
        sortIndex: data.sortIndex,
        areaDescription: data.areaDescription ?? null,
      })
      .run();
    return { id, ...data, version: 1 };
  }

  async update(
    id: string,
    {
      eventIds,
      expectedVersion,
      ...data
    }: Omit<Location, "id" | "version"> & {
      eventIds?: string[];
      expectedVersion?: number;
    }
  ): Promise<Location | undefined> {
    const state = () =>
      JSON.stringify([this.findByIdSync(id), this.eventIdsSync(id)]);
    const applied = this.db.transaction(
      (tx) => {
        const before = this.findByIdSync(id);
        if (
          !before ||
          (expectedVersion !== undefined && before.version !== expectedVersion)
        )
          return false;
        const beforeState = state();
        tx.update(schema.locations)
          .set({
            name: data.name,
            imageUrl: data.imageUrl,
            description: data.description,
            capacity: data.capacity,
            color: data.color,
            bookable: data.bookable,
            sortIndex: data.sortIndex,
            areaDescription: data.areaDescription ?? null,
          })
          .where(eq(schema.locations.id, id))
          .run();
        if (eventIds) this.replaceEventIds(tx, id, eventIds);
        if (state() !== beforeState) this.bumpVersions(tx, [id]);
        return true;
      },
      { behavior: "immediate" }
    );
    return applied ? this.findByIdSync(id) : undefined;
  }

  async delete(id: string): Promise<void> {
    // session_locations and event_locations are removed by ON DELETE CASCADE.
    this.db.delete(schema.locations).where(eq(schema.locations.id, id)).run();
  }

  async countSessionLinks(id: string): Promise<number> {
    const row = this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.sessionLocations)
      .where(eq(schema.sessionLocations.locationId, id))
      .get();
    return row?.count ?? 0;
  }

  async countSessionLinksByLocations(
    ids: string[]
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>(ids.map((id) => [id, 0]));
    if (ids.length === 0) return result;
    const rows = this.db
      .select({
        locationId: schema.sessionLocations.locationId,
        count: sql<number>`count(*)`,
      })
      .from(schema.sessionLocations)
      .where(inArray(schema.sessionLocations.locationId, ids))
      .groupBy(schema.sessionLocations.locationId)
      .all();
    for (const row of rows) result.set(row.locationId, row.count);
    return result;
  }

  async listEventIds(id: string): Promise<string[]> {
    return this.db
      .select({ eventId: schema.eventLocations.eventId })
      .from(schema.eventLocations)
      .where(eq(schema.eventLocations.locationId, id))
      .all()
      .map((r) => r.eventId);
  }

  async listEventIdsByLocations(ids: string[]): Promise<Map<string, string[]>> {
    const result = new Map<string, string[]>(ids.map((id) => [id, []]));
    if (ids.length === 0) return result;
    const rows = this.db
      .select({
        locationId: schema.eventLocations.locationId,
        eventId: schema.eventLocations.eventId,
      })
      .from(schema.eventLocations)
      .where(inArray(schema.eventLocations.locationId, ids))
      .all();
    for (const row of rows) result.get(row.locationId)?.push(row.eventId);
    return result;
  }

  async listLocationIdsByEvent(eventId: string): Promise<string[]> {
    return this.db
      .select({ locationId: schema.eventLocations.locationId })
      .from(schema.eventLocations)
      .where(eq(schema.eventLocations.eventId, eventId))
      .all()
      .map((r) => r.locationId);
  }

  async setEventIds(id: string, eventIds: string[]): Promise<void> {
    this.db.transaction((tx) => {
      const before = this.eventIdsSync(id).join();
      this.replaceEventIds(tx, id, eventIds);
      if (this.eventIdsSync(id).join() !== before) this.bumpVersions(tx, [id]);
    });
  }

  async findExistingIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    return this.db
      .select({ id: schema.locations.id })
      .from(schema.locations)
      .where(inArray(schema.locations.id, ids))
      .all()
      .map((r) => r.id);
  }

  async assignToEvent(eventId: string, locationIds: string[]): Promise<void> {
    if (locationIds.length === 0) return;
    this.db.transaction((tx) => {
      const added = tx
        .insert(schema.eventLocations)
        .values(locationIds.map((locationId) => ({ eventId, locationId })))
        .onConflictDoNothing()
        .returning({ locationId: schema.eventLocations.locationId })
        .all();
      this.bumpVersions(
        tx,
        added.map((r) => r.locationId)
      );
    });
  }

  async removeFromEvent(eventId: string, locationIds: string[]): Promise<void> {
    if (locationIds.length === 0) return;
    this.db.transaction((tx) => {
      const removed = tx
        .delete(schema.eventLocations)
        .where(
          and(
            eq(schema.eventLocations.eventId, eventId),
            inArray(schema.eventLocations.locationId, locationIds)
          )
        )
        .returning({ locationId: schema.eventLocations.locationId })
        .all();
      this.bumpVersions(
        tx,
        removed.map((r) => r.locationId)
      );
    });
  }

  async move(id: string, direction: "up" | "down"): Promise<boolean> {
    return this.db.transaction((tx) => {
      const ordered = tx
        .select({
          id: schema.locations.id,
          sortIndex: schema.locations.sortIndex,
        })
        .from(schema.locations)
        .orderBy(schema.locations.sortIndex, schema.locations.id)
        .all();
      const index = ordered.findIndex((l) => l.id === id);
      if (index === -1) return false;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= ordered.length) return false;
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      ordered.forEach((l, sortIndex) => {
        if (l.sortIndex === sortIndex) return;
        tx.update(schema.locations)
          .set({ sortIndex, version: sql`${schema.locations.version} + 1` })
          .where(eq(schema.locations.id, l.id))
          .run();
      });
      return true;
    });
  }
}
