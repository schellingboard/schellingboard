import type { Repositories } from "@/db/container";

export const eventProposals = (
  q: Pick<Repositories, "sessionProposals">,
  eventId: string
) => q.sessionProposals.listByEvent(eventId);

export const proposalById = async (
  q: Pick<Repositories, "sessionProposals">,
  id: string
) => (await q.sessionProposals.findById(id)) ?? null;

export const hostedProposals = (
  q: Pick<Repositories, "sessionProposals">,
  guestId: string
) => q.sessionProposals.listByHost(guestId);

export const guestVotes = (
  q: Pick<Repositories, "votes">,
  guestId: string,
  eventId: string
) => q.votes.listByGuestAndEvent(guestId, eventId);
