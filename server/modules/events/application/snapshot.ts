import type { Repositories } from "@/db/container";

export async function eventScheduleBySlug(
  q: Pick<Repositories, "events" | "days" | "sharedMoments">,
  slug: string
) {
  const event = await q.events.findBySlug(slug);
  if (!event) return undefined;
  return {
    event,
    days: await q.days.listByEvent(event.id),
    moments: await q.sharedMoments.listByEvent(event.id),
  };
}
