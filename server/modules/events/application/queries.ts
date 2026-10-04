import type { Day, Event } from "@schellingboard/domain/event";
import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";
import type { EventDeps } from "../ports";
import { adminRequired, eventNotFound } from "./events";

export const listEvents =
  ({ repos }: EventDeps) =>
  async (actor: Actor): Promise<Result<Event[]>> => {
    if (!actor.admin) return adminRequired();
    return ok(await repos.events.list());
  };

export const getEvent =
  ({ repos }: EventDeps) =>
  async (
    actor: Actor,
    input: { id: string }
  ): Promise<Result<{ event: Event; days: Day[] }>> => {
    if (!actor.admin) return adminRequired();
    const event = await repos.events.findById(input.id);
    if (!event) return eventNotFound();
    return ok({ event, days: await repos.days.listByEvent(input.id) });
  };
