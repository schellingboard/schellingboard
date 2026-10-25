export type ProposalLinks = {
  schedule: string;
  add: string;
  quickVoting: string;
  view: (proposalId: string) => string;
  edit: (proposalId: string) => string;
  scheduleProposal: (proposalId: string) => string;
  guest: (guestId: string) => string;
};

/** Where the proposals list's links go until the pages they open are SPA screens. */
export function legacyProposalLinks(eventSlug: string): ProposalLinks {
  const legacy = `/legacy/${eventSlug}`;
  return {
    schedule: `/${eventSlug}`,
    add: `${legacy}/proposals/new`,
    quickVoting: `${legacy}/proposals/quick-voting`,
    view: (id) =>
      `${legacy}/proposals?${new URLSearchParams({ viewProposal: id })}`,
    edit: (id) => `${legacy}/proposals/${id}/edit`,
    scheduleProposal: (id) =>
      `${legacy}/add-session?${new URLSearchParams({ proposalID: id })}`,
    guest: (id) => `/legacy/guests/${id}`,
  };
}
