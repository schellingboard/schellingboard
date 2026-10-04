import type { EventDeps } from "../ports";
import { createDay, deleteDay, updateDay } from "./days";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  updateEventPhases,
} from "./events";
import { getEvent, listEvents } from "./queries";

export function createEventUseCases(deps: EventDeps) {
  return {
    listEvents: listEvents(deps),
    getEvent: getEvent(deps),
    createEvent: createEvent(deps),
    updateEvent: updateEvent(deps),
    updateEventPhases: updateEventPhases(deps),
    deleteEvent: deleteEvent(deps),
    createDay: createDay(deps),
    updateDay: updateDay(deps),
    deleteDay: deleteDay(deps),
  };
}

export type EventUseCases = ReturnType<typeof createEventUseCases>;
