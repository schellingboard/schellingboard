export type ProposalLinks = {
  schedule: string;
  proposals: string;
  add: string;
  quickVoting: string;
  view: (proposalId: string) => string;
  edit: (proposalId: string) => string;
  scheduleProposal: (proposalId: string) => string;
  guest: (guestId: string) => string;
  session: (sessionId: string) => string;
};

/** The add-session form is still a legacy page; every proposal address is the SPA's. */
export function proposalLinks(eventSlug: string): ProposalLinks {
  const base = `/${eventSlug}/proposals`;
  return {
    schedule: `/${eventSlug}`,
    proposals: base,
    add: `${base}/new`,
    quickVoting: `${base}/quick-voting`,
    view: (id) => `${base}?${new URLSearchParams({ viewProposal: id })}`,
    edit: (id) => `${base}/${id}/edit`,
    scheduleProposal: (id) =>
      `/legacy/${eventSlug}/add-session?${new URLSearchParams({ proposalID: id })}`,
    guest: (id) => `/guests/${id}`,
    session: (id) =>
      `/${eventSlug}?${new URLSearchParams({ viewSession: id })}`,
  };
}
