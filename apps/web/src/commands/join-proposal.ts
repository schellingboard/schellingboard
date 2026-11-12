import { t } from "@lingui/core/macro";
import { wantsHost } from "@schellingboard/domain/session";

import type { Command } from "./runner";
import { describeProposalIn } from "./subject";

type Input = { proposalId: string };

/** Joining as a host takes the vote back, as on the server. */
export const joinProposal: Command<Input> = {
  kind: "proposal.join",
  describe: (replica, { proposalId }) => {
    const proposal = describeProposalIn(replica, proposalId);
    return proposal
      ? {
          failed: t`Could not join ${proposal} as a host.`,
          unsure: t`Your request to join ${proposal} as a host might not have been saved.`,
        }
      : {
          failed: t`Could not join the proposal as a host.`,
          unsure: t`Your request to join the proposal as a host might not have been saved.`,
        };
  },
  target: ({ proposalId }) => `join:${proposalId}`,
  predict: (replica, now, { proposalId }) => {
    const { me } = replica;
    const proposal = replica.proposals.find((p) => p.id === proposalId);
    const guest = replica.guests.find((g) => g.id === me?.guestId);
    if (!me || !guest?.member) return { refusal: "guest.notInEvent" };
    if (!proposal) return { refusal: "proposal.notFound" };
    if (proposal.hosts.some((h) => h.id === me.guestId))
      return { refusal: "proposal.alreadyHost" };
    if (!wantsHost(proposal)) return { refusal: "proposal.hostNotWanted" };
    return {
      project: (current) =>
        !current.me
          ? current
          : {
              ...current,
              proposals: current.proposals.map((p) =>
                p.id === proposalId && !p.hosts.some((h) => h.id === guest.id)
                  ? {
                      ...p,
                      hosts: [...p.hosts, { id: guest.id, name: guest.name }],
                      cohostWanted: false,
                      cohostWantedNote: null,
                      updatedTime: now.toISOString(),
                    }
                  : p
              ),
              me: {
                ...current.me,
                votes: current.me.votes.filter(
                  (v) => v.proposalId !== proposalId
                ),
              },
            },
    };
  },
  call: (api, { proposalId }, key) =>
    api.POST("/api/v1/proposals/{id}/hosts", {
      params: { path: { id: proposalId } },
      headers: { "Idempotency-Key": key },
    }),
};
