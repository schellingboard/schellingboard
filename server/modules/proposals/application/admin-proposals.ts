import type { SessionProposal } from "@schellingboard/domain/session";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { ProposalDeps } from "../ports";
import {
  changedMeanwhile,
  presentOne,
  presenter,
  proposalNotFound,
  type ProposalView,
} from "./queries";

export interface AdminUpdateProposalInput {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  hostIds: string[];
  expectedVersion?: number;
  /** What the web form sends until it sends the version. */
  expectedUpdatedTime?: string;
}

export interface AdminCreateProposalInput {
  event: { id: string } | { slug: string };
  title: string;
  description: string;
  durationMinutes: number | null;
  hostIds: string[];
}

type ProposalFields = Pick<
  AdminUpdateProposalInput,
  "title" | "durationMinutes" | "hostIds"
>;

const adminRequired = () => forbidden("admin.required", "Unauthorized");

function checked(input: ProposalFields): Result<ProposalFields> {
  const title = input.title.trim();
  if (!title) return invalid("proposal.titleRequired", "Title is required");
  const { durationMinutes } = input;
  if (
    durationMinutes !== null &&
    (!Number.isInteger(durationMinutes) || durationMinutes < 0)
  )
    return invalid(
      "proposal.durationInvalid",
      "Duration must be a non-negative integer"
    );
  const hostIds = [...new Set(input.hostIds.filter(Boolean))];
  return ok({ title, durationMinutes, hostIds });
}

async function unknownHost(
  repos: ProposalDeps["repos"],
  hostIds: string[]
): Promise<Failure | null> {
  for (const guestId of hostIds) {
    if (!(await repos.guests.findById(guestId)))
      return invalid("proposal.hostUnknown", `Guest not found: ${guestId}`);
  }
  return null;
}

// For seeding scripts: no phase gate, and the hosts join the event so they
// show up in its guest list.
export const adminCreateProposal =
  ({ repos, uow }: ProposalDeps) =>
  async (
    actor: Actor,
    { event: ref, ...input }: AdminCreateProposalInput,
    now: Date
  ): Promise<Result<ProposalView>> => {
    if (!actor.admin) return adminRequired();
    const fields = checked(input);
    if (!fields.ok) return fields;
    const { title, durationMinutes, hostIds } = fields.value;
    const result = await uow.run(async (tx) => {
      const event =
        "id" in ref
          ? await tx.events.findById(ref.id)
          : await tx.events.findBySlug(ref.slug);
      if (!event) return notFound("event.notFound", "Event not found");
      const refused = await unknownHost(tx, hostIds);
      if (refused) return refused;

      if (hostIds.length > 0) await tx.guests.assignToEvent(event.id, hostIds);
      const created = await tx.sessionProposals.create({
        eventId: event.id,
        title,
        description: input.description.trim() || undefined,
        hostIds,
        durationMinutes: durationMinutes ?? undefined,
        createdTime: now,
      });
      return ok({ created, event });
    });
    if (!result.ok) return result;
    const { created, event } = result.value;
    return ok((await presenter(actor, repos, event, now))(created));
  };

export const adminUpdateProposal =
  ({ repos, uow }: ProposalDeps) =>
  async (
    actor: Actor,
    input: AdminUpdateProposalInput,
    now: Date
  ): Promise<Result<ProposalView>> => {
    if (!actor.admin) return adminRequired();
    const fields = checked(input);
    if (!fields.ok) return fields;
    const { title, durationMinutes, hostIds } = fields.value;
    const expectedUpdatedTime =
      input.expectedUpdatedTime === undefined
        ? undefined
        : new Date(input.expectedUpdatedTime);

    const result = await uow.run(async (tx) => {
      const proposal = await tx.sessionProposals.findById(input.id);
      if (!proposal) return proposalNotFound();
      const refused = await unknownHost(tx, hostIds);
      if (refused) return refused;
      if (expectedUpdatedTime && Number.isNaN(expectedUpdatedTime.getTime()))
        return invalid(
          "proposal.expectedUpdatedTimeInvalid",
          "Invalid expectedUpdatedTime"
        );

      const updated = await tx.sessionProposals.update(input.id, {
        title,
        description: input.description.trim(),
        durationMinutes,
        hostIds,
        expectedUpdatedTime,
        expectedVersion: input.expectedVersion,
        updatedTime: now,
      });
      if (!updated) return changedMeanwhile(actor, tx, input.id, now);
      return ok(updated);
    });
    if (!result.ok) return result;
    return presentOne(actor, repos, result.value, now);
  };

export const adminDeleteProposal =
  ({ uow }: ProposalDeps) =>
  async (
    actor: Actor,
    { id }: { id: string }
  ): Promise<Result<SessionProposal>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      const proposal = await tx.sessionProposals.findById(id);
      if (!proposal) return proposalNotFound();
      await tx.sessionProposals.delete(id);
      return ok(proposal);
    });
  };
