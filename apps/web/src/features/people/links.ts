export type PeopleLinks = {
  /** The profile of a guest, carrying the list's search, filters and sort. */
  guest: (guestId: string, listQuery: string) => string;
  edit: string;
};

/** The profile screens are still legacy pages. */
export const legacyPeopleLinks: PeopleLinks = {
  guest: (id, listQuery) =>
    listQuery ? `/legacy/guests/${id}?${listQuery}` : `/legacy/guests/${id}`,
  edit: "/legacy/guests/edit",
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

export const legacyProfileLinks: ProfileLinks = {
  edit: "/legacy/guests/edit",
  guest: (id) => `/legacy/guests/${id}`,
  list: (listQuery) =>
    listQuery ? `/legacy/guests?${listQuery}` : "/legacy/guests",
  session: (slug, id) => `/${slug}?${new URLSearchParams({ viewSession: id })}`,
  proposal: (slug, id) =>
    `/${slug}/proposals?${new URLSearchParams({ viewProposal: id })}`,
};
