export type PeopleLinks = {
  guest: (guestId: string) => string;
  edit: string;
};

export const peopleLinks: PeopleLinks = {
  guest: (id) => `/guests/${id}`,
  edit: "/guests/edit",
};

export type ProfileLinks = {
  edit: string;
  /** A profile on its own, as a comment author or a comment permalink points at it. */
  guest: (guestId: string) => string;
  session: (eventSlug: string, sessionId: string) => string;
  proposal: (eventSlug: string, proposalId: string) => string;
};

export const profileLinks: ProfileLinks = {
  edit: "/guests/edit",
  guest: (id) => `/guests/${id}`,
  session: (slug, id) => `/${slug}/sessions/${encodeURIComponent(id)}`,
  proposal: (slug, id) => `/${slug}/proposals/${encodeURIComponent(id)}`,
};
