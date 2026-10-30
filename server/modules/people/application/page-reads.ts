import type { Repositories } from "@/db/container";

export const allGuests = (q: Pick<Repositories, "guests">) => q.guests.list();

export const guestById = async (q: Pick<Repositories, "guests">, id: string) =>
  (await q.guests.findById(id)) ?? null;

// Never the credentials themselves: this surface reaches pages and client trees.
export const guestAuthProtection = async (
  q: Pick<Repositories, "guests">,
  id: string
) => {
  const creds = await q.guests.getAuthCredentials(id);
  return creds ? { authProtected: creds.authProtected } : null;
};

export const attendees = (q: Pick<Repositories, "guests">, now: Date) =>
  q.guests.listAttendees(now);
