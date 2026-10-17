import type { Repositories } from "@/db/container";

export const allEvents = (q: Pick<Repositories, "events">) => q.events.list();

export const eventBySlug = async (
  q: Pick<Repositories, "events">,
  slug: string
) => (await q.events.findBySlug(slug)) ?? null;

export const eventById = async (q: Pick<Repositories, "events">, id: string) =>
  (await q.events.findById(id)) ?? null;

export const eventDays = (q: Pick<Repositories, "days">, eventId: string) =>
  q.days.listByEvent(eventId);
