export type PeopleLinks = {
  /** The profile of a guest, carrying the list's search, filters and sort. */
  guest: (guestId: string, listQuery: string) => string;
  edit: string;
};

export const peopleLinks: PeopleLinks = {
  guest: (id, listQuery) =>
    listQuery ? `/guests/${id}?${listQuery}` : `/guests/${id}`,
  edit: "/guests/edit",
};

export type ProfileLinks = {
  edit: string;
  /** A profile on its own, as a comment author or a comment permalink points at it. */
  guest: (guestId: string) => string;
  /** The directory, carrying the search, filters and sort a profile was opened over. */
  list: (listQuery: string) => string;
  session: (eventSlug: string, sessionId: string) => string;
  proposal: (eventSlug: string, proposalId: string) => string;
};

export const profileLinks: ProfileLinks = {
  edit: "/guests/edit",
  guest: (id) => `/guests/${id}`,
  list: (listQuery) => (listQuery ? `/guests?${listQuery}` : "/guests"),
  session: (slug, id) => `/${slug}?${new URLSearchParams({ viewSession: id })}`,
  proposal: (slug, id) =>
    `/${slug}/proposals?${new URLSearchParams({ viewProposal: id })}`,
};
