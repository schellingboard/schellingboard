import type { Repositories } from "@/db/container";

export const allGuests = (q: Pick<Repositories, "guests">) => q.guests.list();

export const guestById = async (q: Pick<Repositories, "guests">, id: string) =>
  (await q.guests.findById(id)) ?? null;

export const attendees = (q: Pick<Repositories, "guests">, now: Date) =>
  q.guests.listAttendees(now);
