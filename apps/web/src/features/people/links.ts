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
