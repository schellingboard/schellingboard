import type {
  Day,
  Event,
  SharedMoment,
  StoredEvent,
} from "@schellingboard/domain/event";

import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";

import type { EventDeps } from "../ports";
import { adminRequired, eventNotFound } from "./events";

// Events are public to everyone past the site password.
export const listEvents =
  ({ repos }: EventDeps) =>
  async (): Promise<Result<Event[]>> => {
    return ok(await repos.events.list());
  };

export const getEventAsAdmin =
  ({ repos }: EventDeps) =>
  async (actor: Actor, input: { id: string }): Promise<Result<StoredEvent>> => {
    if (!actor.admin) return adminRequired();
    const event = await repos.events.findById(input.id);
    return event ? ok(event) : eventNotFound();
  };

export const getEvent =
  ({ repos }: EventDeps) =>
  async (
    _actor: Actor,
    input: { id: string }
  ): Promise<
    Result<{ event: Event; days: Day[]; moments: SharedMoment[] }>
  > => {
    const event = await repos.events.findById(input.id);
    if (!event) return eventNotFound();
    return ok({
      event,
      days: await repos.days.listByEvent(input.id),
      moments: await repos.sharedMoments.listByEvent(input.id),
    });
  };
