import {
  type EventLabel,
  isLabelColorName,
} from "@schellingboard/domain/event-label";

import type { Actor } from "@/server/kernel/actor";
import {
  type Failure,
  invalid,
  invalidFields,
  notFound,
  ok,
  type Result,
} from "@/server/kernel/result";

import type { PeopleDeps } from "../ports";
import { adminRequired, eventNotFound } from "./admin-guests";

interface LabelInput {
  name: string;
  description: string;
  color: string;
}

const labelNotFound = () => notFound("label.notFound", "Label not found");

function refusal(code: string, path: string, message: string): Failure {
  return invalidFields(code, [{ path, message }]);
}

function parsed(
  input: LabelInput
): Failure | Pick<EventLabel, "name" | "description" | "color"> {
  const name = input.name.trim();
  if (!name) return refusal("label.nameRequired", "name", "Name is required");
  if (!isLabelColorName(input.color))
    return refusal("label.colorInvalid", "color", "Pick one of the colours");
  return { name, description: input.description.trim(), color: input.color };
}

export const listLabels =
  ({ repos }: PeopleDeps) =>
  async (
    actor: Actor,
    input: { eventId: string }
  ): Promise<Result<EventLabel[]>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();
    return ok(await repos.eventLabels.listByEvent(input.eventId));
  };

export const createLabel =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: LabelInput & { eventId: string }
  ): Promise<Result<EventLabel>> => {
    if (!actor.admin) return adminRequired();
    const fields = parsed(input);
    if ("ok" in fields) return fields;
    return uow.run(async (tx) => {
      if (!(await tx.events.findById(input.eventId))) return eventNotFound();
      return ok(
        await tx.eventLabels.create({ eventId: input.eventId, ...fields })
      );
    });
  };

export const updateLabel =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: LabelInput & { id: string }
  ): Promise<Result<EventLabel>> => {
    if (!actor.admin) return adminRequired();
    const fields = parsed(input);
    if ("ok" in fields) return fields;
    return uow.run(async (tx) => {
      const updated = await tx.eventLabels.update(input.id, fields);
      return updated ? ok(updated) : labelNotFound();
    });
  };

export const deleteLabel =
  ({ uow }: PeopleDeps) =>
  async (actor: Actor, input: { id: string }): Promise<Result<EventLabel>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      const existing = await tx.eventLabels.findById(input.id);
      if (!existing) return labelNotFound();
      await tx.eventLabels.delete(input.id);
      return ok(existing);
    });
  };

export const setGuestLabels =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: { eventId: string; guestId: string; labelIds: string[] }
  ): Promise<Result<EventLabel[]>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      if (!(await tx.events.findById(input.eventId))) return eventNotFound();
      const memberOf = (
        await tx.guests.listEventsByGuests([input.guestId])
      ).get(input.guestId);
      if (!memberOf?.some((e) => e.id === input.eventId))
        return invalid("guest.notInEvent", "The guest is not in this event");
      const known = new Set(
        (await tx.eventLabels.listByEvent(input.eventId)).map((l) => l.id)
      );
      const labelIds = [...new Set(input.labelIds)];
      if (labelIds.some((id) => !known.has(id))) return labelNotFound();
      await tx.eventLabels.setGuestLabels(
        input.eventId,
        input.guestId,
        labelIds
      );
      return ok(await tx.eventLabels.listByEvent(input.eventId));
    });
  };
