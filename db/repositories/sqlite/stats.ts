import { and, eq, isNotNull, or } from "drizzle-orm";
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
        timezone: schema.events.timezone,
      })
      .from(schema.events)
      .where(eq(schema.events.id, eventId))
      .get();
    if (!event) return null;
    const { timezone, ...eventIdentity } = event;

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
      .select({
        id: schema.sessionProposals.id,
        title: schema.sessionProposals.title,
        createdTime: schema.sessionProposals.createdTime,
        durationMinutes: schema.sessionProposals.durationMinutes,
        cohostWanted: schema.sessionProposals.cohostWanted,
      })
      .from(schema.sessionProposals)
      .where(eq(schema.sessionProposals.eventId, eventId))
      .all();
    const proposalHostRows = db
      .select({
        proposalId: schema.proposalHosts.proposalId,
        guestId: schema.proposalHosts.guestId,
        name: schema.guests.name,
      })
      .from(schema.proposalHosts)
      .innerJoin(
        schema.sessionProposals,
        eq(schema.proposalHosts.proposalId, schema.sessionProposals.id)
      )
      .innerJoin(
        schema.guests,
        eq(schema.proposalHosts.guestId, schema.guests.id)
      )
      .where(eq(schema.sessionProposals.eventId, eventId))
      .all();
    const proposalHosts = grouped(
      proposalHostRows.map((r) => [r.proposalId, r.guestId] as [string, string])
    );
    const proposalHostNames = [
      ...new Map(proposalHostRows.map((r) => [r.guestId, r.name])),
    ].map(([id, name]) => ({ id, name }));

    const votes = db
      .select({
        proposalId: schema.votes.proposalId,
        guestId: schema.votes.guestId,
        choice: schema.votes.choice,
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
        title: schema.sessions.title,
        startTime: schema.sessions.startTime,
        endTime: schema.sessions.endTime,
        capacity: schema.sessions.capacity,
        closed: schema.sessions.closed,
        attendeeCount: schema.sessions.attendeeCount,
        blocker: schema.sessions.blocker,
        proposalId: schema.sessions.proposalId,
        adminManaged: schema.sessions.adminManaged,
      })
      .from(schema.sessions)
      .where(eq(schema.sessions.eventId, eventId))
      .all();
    const followedUp = new Set(
      db
        .select({ sessionId: schema.sessionReminders.sessionId })
        .from(schema.sessionReminders)
        .innerJoin(
          schema.sessions,
          eq(schema.sessionReminders.sessionId, schema.sessions.id)
        )
        .where(
          and(
            eq(schema.sessions.eventId, eventId),
            eq(schema.sessionReminders.kind, "followUp"),
            or(
              isNotNull(schema.sessionReminders.sentAt),
              isNotNull(schema.sessionReminders.notifiedAt)
            )
          )
        )
        .all()
        .map((r) => r.sessionId)
    );
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
      .select({
        id: schema.comments.authorId,
        proposalId: schema.proposalComments.proposalId,
      })
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
      .select({
        id: schema.comments.authorId,
        sessionId: schema.sessionComments.sessionId,
      })
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

    const proposalCommentCounts = new Map<string, number>();
    for (const c of proposalCommenters)
      proposalCommentCounts.set(
        c.proposalId,
        (proposalCommentCounts.get(c.proposalId) ?? 0) + 1
      );
    const commentCounts = new Map<string, number>();
    for (const c of sessionCommenters)
      commentCounts.set(c.sessionId, (commentCounts.get(c.sessionId) ?? 0) + 1);

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
      event: eventIdentity,
      timezone,
      members,
      locations,
      hosts,
      proposalHosts: proposalHostNames,
      proposals: proposalRows.map((p) => ({
        ...p,
        commentCount: proposalCommentCounts.get(p.id) ?? 0,
        hostIds: proposalHosts.get(p.id) ?? [],
      })),
      votes,
      sessions: sessionRows.map((s) => ({
        id: s.id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        closed: s.closed,
        attendeeCount: s.attendeeCount,
        followUpSent: followedUp.has(s.id),
        commentCount: commentCounts.get(s.id) ?? 0,
        blocker: s.blocker,
        proposalId: s.proposalId,
        adminManaged: s.adminManaged,
        hostIds: sessionHosts.get(s.id) ?? [],
        locationIds: sessionLocations.get(s.id) ?? [],
      })),
      rsvps,
      commenterIds: [...proposalCommenters, ...sessionCommenters]
        .map((r) => r.id)
        .filter((id): id is string => id !== null),
      meetingOffererIds,
    };
  }
}
