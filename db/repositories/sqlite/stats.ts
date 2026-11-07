import { and, eq, isNotNull } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import * as schema from "../../schema";
import type { StatsRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

function grouped<K, V>(pairs: [K, V][]): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const [key, value] of pairs) {
    const list = map.get(key);
    if (list) list.push(value);
    else map.set(key, [value]);
  }
  return map;
}

export class SqliteStatsRepository implements StatsRepository {
  constructor(private readonly db: DB) {}

  async getEventFacts(eventId: string): Promise<EventFacts | null> {
    const { db } = this;
    const event = db
      .select({
        id: schema.events.id,
        name: schema.events.name,
        slug: schema.events.slug,
      })
      .from(schema.events)
      .where(eq(schema.events.id, eventId))
      .get();
    if (!event) return null;

    const members = db
      .select({ id: schema.eventGuests.guestId })
      .from(schema.eventGuests)
      .where(eq(schema.eventGuests.eventId, eventId))
      .all()
      .map((r) => r.id);

    const locations = db
      .select({ id: schema.locations.id, name: schema.locations.name })
      .from(schema.eventLocations)
      .innerJoin(
        schema.locations,
        eq(schema.eventLocations.locationId, schema.locations.id)
      )
      .where(eq(schema.eventLocations.eventId, eventId))
      .all();

    const proposalRows = db
      .select({ id: schema.sessionProposals.id })
      .from(schema.sessionProposals)
      .where(eq(schema.sessionProposals.eventId, eventId))
      .all();
    const proposalHosts = grouped(
      db
        .select({
          proposalId: schema.proposalHosts.proposalId,
          guestId: schema.proposalHosts.guestId,
        })
        .from(schema.proposalHosts)
        .innerJoin(
          schema.sessionProposals,
          eq(schema.proposalHosts.proposalId, schema.sessionProposals.id)
        )
        .where(eq(schema.sessionProposals.eventId, eventId))
        .all()
        .map((r) => [r.proposalId, r.guestId] as [string, string])
    );

    const votes = db
      .select({
        proposalId: schema.votes.proposalId,
        guestId: schema.votes.guestId,
      })
      .from(schema.votes)
      .innerJoin(
        schema.sessionProposals,
        eq(schema.votes.proposalId, schema.sessionProposals.id)
      )
      .where(eq(schema.sessionProposals.eventId, eventId))
      .all();

    const sessionRows = db
      .select({
        id: schema.sessions.id,
        blocker: schema.sessions.blocker,
        proposalId: schema.sessions.proposalId,
        adminManaged: schema.sessions.adminManaged,
        reported: isNotNull(schema.sessions.attendeeCount).mapWith(Boolean),
      })
      .from(schema.sessions)
      .where(eq(schema.sessions.eventId, eventId))
      .all();
    const sessionHosts = grouped(
      db
        .select({
          sessionId: schema.sessionHosts.sessionId,
          guestId: schema.sessionHosts.guestId,
        })
        .from(schema.sessionHosts)
        .innerJoin(
          schema.sessions,
          eq(schema.sessionHosts.sessionId, schema.sessions.id)
        )
        .where(eq(schema.sessions.eventId, eventId))
        .all()
        .map((r) => [r.sessionId, r.guestId] as [string, string])
    );
    const sessionLocations = grouped(
      db
        .select({
          sessionId: schema.sessionLocations.sessionId,
          locationId: schema.sessionLocations.locationId,
        })
        .from(schema.sessionLocations)
        .innerJoin(
          schema.sessions,
          eq(schema.sessionLocations.sessionId, schema.sessions.id)
        )
        .where(eq(schema.sessions.eventId, eventId))
        .all()
        .map((r) => [r.sessionId, r.locationId] as [string, string])
    );

    const rsvps = db
      .select({
        sessionId: schema.rsvps.sessionId,
        guestId: schema.rsvps.guestId,
      })
      .from(schema.rsvps)
      .innerJoin(
        schema.sessions,
        eq(schema.rsvps.sessionId, schema.sessions.id)
      )
      .where(eq(schema.sessions.eventId, eventId))
      .all();

    const proposalCommenters = db
      .select({ id: schema.comments.authorId })
      .from(schema.proposalComments)
      .innerJoin(
        schema.comments,
        eq(schema.proposalComments.commentId, schema.comments.id)
      )
      .innerJoin(
        schema.sessionProposals,
        eq(schema.proposalComments.proposalId, schema.sessionProposals.id)
      )
      .where(
        and(
          eq(schema.sessionProposals.eventId, eventId),
          eq(schema.comments.deleted, false)
        )
      )
      .all();
    const sessionCommenters = db
      .select({ id: schema.comments.authorId })
      .from(schema.sessionComments)
      .innerJoin(
        schema.comments,
        eq(schema.sessionComments.commentId, schema.comments.id)
      )
      .innerJoin(
        schema.sessions,
        eq(schema.sessionComments.sessionId, schema.sessions.id)
      )
      .where(
        and(
          eq(schema.sessions.eventId, eventId),
          eq(schema.comments.deleted, false)
        )
      )
      .all();

    const meetingOffererIds = db
      .selectDistinct({ id: schema.meetingAvailability.guestId })
      .from(schema.meetingAvailability)
      .where(eq(schema.meetingAvailability.eventId, eventId))
      .all()
      .map((r) => r.id);

    const hosts = db
      .selectDistinct({ id: schema.guests.id, name: schema.guests.name })
      .from(schema.sessionHosts)
      .innerJoin(
        schema.sessions,
        eq(schema.sessionHosts.sessionId, schema.sessions.id)
      )
      .innerJoin(
        schema.guests,
        eq(schema.sessionHosts.guestId, schema.guests.id)
      )
      .where(eq(schema.sessions.eventId, eventId))
      .all();

    return {
      event,
      members,
      locations,
      hosts,
      proposals: proposalRows.map((p) => ({
        id: p.id,
        hostIds: proposalHosts.get(p.id) ?? [],
      })),
      votes,
      sessions: sessionRows.map((s) => ({
        id: s.id,
        blocker: s.blocker,
        proposalId: s.proposalId,
        adminManaged: s.adminManaged,
        hostIds: sessionHosts.get(s.id) ?? [],
        locationIds: sessionLocations.get(s.id) ?? [],
        attendeeReported: s.reported,
      })),
      rsvps,
      commenterIds: [...proposalCommenters, ...sessionCommenters]
        .map((r) => r.id)
        .filter((id): id is string => id !== null),
      meetingOffererIds,
    };
  }
}
