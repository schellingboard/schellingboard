import {
  and,
  count,
  eq,
  exists,
  inArray,
  isNotNull,
  or,
  sql,
} from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type {
  SessionProposalCreateInput,
  SessionProposalPage,
  SessionProposalUpdateInput,
  SessionProposalsRepository,
} from "../interfaces";
import type {
  ProposalHost,
  SessionProposal,
} from "@schellingboard/domain/session";

type DB = BetterSQLite3Database<typeof schema>;
type ProposalRow = typeof schema.sessionProposals.$inferSelect;

// Escape LIKE meta-characters so user input is matched literally. Pairs with an
// explicit `ESCAPE '\'` clause in the query below.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

export class SqliteSessionProposalsRepository implements SessionProposalsRepository {
  constructor(private readonly db: DB) {}

  private enrichProposals(rows: ProposalRow[]): SessionProposal[] {
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);

    const hostRows = this.db
      .select({
        proposalId: schema.proposalHosts.proposalId,
        id: schema.guests.id,
        name: schema.guests.name,
      })
      .from(schema.proposalHosts)
      .innerJoin(
        schema.guests,
        eq(schema.proposalHosts.guestId, schema.guests.id)
      )
      .where(inArray(schema.proposalHosts.proposalId, ids))
      .all();

    const voteRows = this.db
      .select({
        proposalId: schema.votes.proposalId,
        total: count(),
        interested: sql<number>`sum(case when ${schema.votes.choice} = 'interested' then 1 else 0 end)`,
        maybe: sql<number>`sum(case when ${schema.votes.choice} = 'maybe' then 1 else 0 end)`,
        skip: sql<number>`sum(case when ${schema.votes.choice} = 'skip' then 1 else 0 end)`,
      })
      .from(schema.votes)
      .where(inArray(schema.votes.proposalId, ids))
      .groupBy(schema.votes.proposalId)
      .all();

    const sessionRows = this.db
      .select({
        proposalId: schema.sessions.proposalId,
        id: schema.sessions.id,
      })
      .from(schema.sessions)
      .where(
        and(
          isNotNull(schema.sessions.proposalId),
          inArray(schema.sessions.proposalId, ids)
        )
      )
      .all();

    const hostsByProposal = new Map<string, ProposalHost[]>();
    for (const r of hostRows) {
      const list = hostsByProposal.get(r.proposalId) ?? [];
      list.push({ id: r.id, name: r.name });
      hostsByProposal.set(r.proposalId, list);
    }

    const voteCountsByProposal = new Map<
      string,
      { total: number; interested: number; maybe: number; skip: number }
    >();
    for (const r of voteRows) {
      voteCountsByProposal.set(r.proposalId, {
        total: r.total,
        interested: r.interested,
        maybe: r.maybe,
        skip: r.skip,
      });
    }

    const sessionIdsByProposal = new Map<string, string[]>();
    for (const r of sessionRows) {
      const list = sessionIdsByProposal.get(r.proposalId!) ?? [];
      list.push(r.id);
      sessionIdsByProposal.set(r.proposalId!, list);
    }

    return rows.map((row) => {
      const votes = voteCountsByProposal.get(row.id) ?? {
        total: 0,
        interested: 0,
        maybe: 0,
        skip: 0,
      };
      const hosts = hostsByProposal.get(row.id) ?? [];
      // A deleted guest takes their host row with them but leaves the request,
      // so the last host gone is read as the request gone.
      const cohostWanted = row.cohostWanted && hosts.length > 0;
      return {
        id: row.id,
        eventId: row.eventId,
        title: row.title,
        description: row.description ?? undefined,
        durationMinutes: row.durationMinutes ?? undefined,
        createdTime: new Date(row.createdTime),
        updatedTime: new Date(row.updatedTime ?? row.createdTime),
        hosts,
        cohostWanted,
        cohostWantedNote: (cohostWanted && row.cohostWantedNote) || undefined,
        votesCount: votes.total,
        interestedVotesCount: votes.interested,
        maybeVotesCount: votes.maybe,
        skipVotesCount: votes.skip,
        sessionIds: sessionIdsByProposal.get(row.id) ?? [],
        version: row.version,
      };
    });
  }

  async listByEvent(eventId: string): Promise<SessionProposal[]> {
    const rows = this.db
      .select()
      .from(schema.sessionProposals)
      .where(eq(schema.sessionProposals.eventId, eventId))
      .all();
    return this.enrichProposals(rows);
  }

  async listByHost(guestId: string): Promise<SessionProposal[]> {
    const rows = this.db
      .select({ proposal: schema.sessionProposals })
      .from(schema.sessionProposals)
      .innerJoin(
        schema.proposalHosts,
        eq(schema.proposalHosts.proposalId, schema.sessionProposals.id)
      )
      .where(eq(schema.proposalHosts.guestId, guestId))
      .all()
      .map((r) => r.proposal);
    return this.enrichProposals(rows);
  }

  async searchByEvent(
    eventId: string,
    opts: { query?: string; limit: number; offset: number }
  ): Promise<SessionProposalPage> {
    const conditions = [eq(schema.sessionProposals.eventId, eventId)];
    if (opts.query) {
      const pattern = `%${escapeLike(opts.query)}%`;
      // Match the title or any host's name.
      const hostMatch = exists(
        this.db
          .select({ one: sql`1` })
          .from(schema.proposalHosts)
          .innerJoin(
            schema.guests,
            eq(schema.proposalHosts.guestId, schema.guests.id)
          )
          .where(
            and(
              eq(schema.proposalHosts.proposalId, schema.sessionProposals.id),
              sql`${schema.guests.name} like ${pattern} escape '\\'`
            )
          )
      );
      conditions.push(
        or(
          sql`${schema.sessionProposals.title} like ${pattern} escape '\\'`,
          hostMatch
        )!
      );
    }
    const where = and(...conditions);

    const totalRow = this.db
      .select({ count: count() })
      .from(schema.sessionProposals)
      .where(where)
      .get();

    const rows = this.db
      .select()
      .from(schema.sessionProposals)
      .where(where)
      // id as tiebreaker: title is not unique, and without a deterministic
      // order LIMIT/OFFSET pagination can duplicate or skip rows.
      .orderBy(
        sql`${schema.sessionProposals.title} collate nocase`,
        schema.sessionProposals.id
      )
      .limit(opts.limit)
      .offset(opts.offset)
      .all();

    return { rows: this.enrichProposals(rows), total: totalRow?.count ?? 0 };
  }

  async findById(id: string): Promise<SessionProposal | undefined> {
    const row = this.db
      .select()
      .from(schema.sessionProposals)
      .where(eq(schema.sessionProposals.id, id))
      .get();
    if (!row) return undefined;
    return this.enrichProposals([row])[0];
  }

  async create(data: SessionProposalCreateInput): Promise<SessionProposal> {
    const id = nanoid();
    const cohostWanted = !!data.cohostWanted && data.hostIds.length > 0;
    this.db.transaction((tx) => {
      tx.insert(schema.sessionProposals)
        .values({
          id,
          eventId: data.eventId,
          title: data.title,
          description: data.description ?? null,
          durationMinutes: data.durationMinutes ?? null,
          cohostWanted,
          cohostWantedNote: (cohostWanted && data.cohostWantedNote) || null,
          createdTime: data.createdTime.toISOString(),
        })
        .run();
      for (const guestId of data.hostIds) {
        tx.insert(schema.proposalHosts)
          .values({ proposalId: id, guestId })
          .run();
      }
    });
    return (await this.findById(id))!;
  }

  async update(
    id: string,
    patch: SessionProposalUpdateInput
  ): Promise<SessionProposal | undefined> {
    const applied = this.db.transaction(
      (tx) => {
        const before = tx
          .select()
          .from(schema.sessionProposals)
          .where(eq(schema.sessionProposals.id, id))
          .get();
        if (!before) return false;
        if (
          patch.expectedUpdatedTime !== undefined &&
          patch.expectedUpdatedTime.getTime() !==
            new Date(before.updatedTime ?? before.createdTime).getTime()
        )
          return false;
        if (
          patch.expectedVersion !== undefined &&
          patch.expectedVersion !== before.version
        )
          return false;

        const values: Partial<typeof schema.sessionProposals.$inferInsert> = {};
        if (patch.title !== undefined && patch.title !== before.title)
          values.title = patch.title;
        if (
          patch.description !== undefined &&
          patch.description !== before.description
        )
          values.description = patch.description;
        if (
          "durationMinutes" in patch &&
          (patch.durationMinutes ?? null) !== before.durationMinutes
        )
          values.durationMinutes = patch.durationMinutes ?? null;

        const hostsBefore = tx
          .select({ guestId: schema.proposalHosts.guestId })
          .from(schema.proposalHosts)
          .where(eq(schema.proposalHosts.proposalId, id))
          .all()
          .map((r) => r.guestId);
        const hostCount =
          patch.hostIds === undefined
            ? hostsBefore.length
            : new Set(patch.hostIds).size;
        // Without hosts the proposal wants one anyway, and a request left behind
        // would come back unasked on whoever takes the proposal on next.
        const wantedBefore = before.cohostWanted && hostsBefore.length > 0;
        const cohostWanted =
          (patch.cohostWanted ?? wantedBefore) && hostCount > 0;
        const cohostWantedNote = !cohostWanted
          ? null
          : patch.cohostWantedNote === undefined
            ? before.cohostWantedNote
            : patch.cohostWantedNote || null;
        if (cohostWanted !== before.cohostWanted)
          values.cohostWanted = cohostWanted;
        if (cohostWantedNote !== before.cohostWantedNote)
          values.cohostWantedNote = cohostWantedNote;

        let hostsChanged = false;
        if (patch.hostIds !== undefined) {
          const uniqueHostIds = [...new Set(patch.hostIds)];
          hostsChanged =
            uniqueHostIds.length !== hostsBefore.length ||
            uniqueHostIds.some((guestId) => !hostsBefore.includes(guestId));

          tx.delete(schema.proposalHosts)
            .where(eq(schema.proposalHosts.proposalId, id))
            .run();
          for (const guestId of uniqueHostIds) {
            tx.insert(schema.proposalHosts)
              .values({ proposalId: id, guestId })
              .run();
          }
          // Hosts can't vote for their own proposal; remove their votes.
          if (uniqueHostIds.length > 0) {
            tx.delete(schema.votes)
              .where(
                and(
                  eq(schema.votes.proposalId, id),
                  inArray(schema.votes.guestId, uniqueHostIds)
                )
              )
              .run();
          }
        }

        // The forms resubmit every field, so only a real difference counts as
        // an edit; otherwise opening and saving would reorder "recently updated".
        if (Object.keys(values).length > 0 || hostsChanged) {
          tx.update(schema.sessionProposals)
            .set({
              ...values,
              updatedTime: patch.updatedTime.toISOString(),
              version: sql`${schema.sessionProposals.version} + 1`,
            })
            .where(eq(schema.sessionProposals.id, id))
            .run();
        }
        return true;
      },
      { behavior: "immediate" }
    );
    return applied ? this.findById(id) : undefined;
  }

  async addHost(
    id: string,
    guestId: string,
    updatedTime: Date
  ): Promise<boolean> {
    return this.db.transaction((tx) => {
      const proposal = tx
        .select({ cohostWanted: schema.sessionProposals.cohostWanted })
        .from(schema.sessionProposals)
        .where(eq(schema.sessionProposals.id, id))
        .get();
      if (!proposal) return false;
      const hostIds = tx
        .select({ guestId: schema.proposalHosts.guestId })
        .from(schema.proposalHosts)
        .where(eq(schema.proposalHosts.proposalId, id))
        .all()
        .map((r) => r.guestId);
      if (hostIds.includes(guestId)) return false;
      if (hostIds.length > 0 && !proposal.cohostWanted) return false;

      tx.insert(schema.proposalHosts).values({ proposalId: id, guestId }).run();
      // Hosts can't vote for their own proposal; remove their vote.
      tx.delete(schema.votes)
        .where(
          and(
            eq(schema.votes.proposalId, id),
            eq(schema.votes.guestId, guestId)
          )
        )
        .run();
      tx.update(schema.sessionProposals)
        .set({
          cohostWanted: false,
          cohostWantedNote: null,
          updatedTime: updatedTime.toISOString(),
          version: sql`${schema.sessionProposals.version} + 1`,
        })
        .where(eq(schema.sessionProposals.id, id))
        .run();
      return true;
    });
  }

  async delete(id: string): Promise<void> {
    // Cascade the deletion
    this.db.transaction((tx) => {
      const commentIds = tx
        .select({ commentId: schema.proposalComments.commentId })
        .from(schema.proposalComments)
        .where(eq(schema.proposalComments.proposalId, id))
        .all()
        .map((r) => r.commentId);
      if (commentIds.length > 0) {
        tx.delete(schema.comments)
          .where(inArray(schema.comments.id, commentIds))
          .run();
      }
      tx.delete(schema.sessionProposals)
        .where(eq(schema.sessionProposals.id, id))
        .run();
    });
  }
}
