import {
  createGuestSchema,
  updateGuestSchema,
} from "@schellingboard/contracts/guest";
import type { z } from "zod";
import type { CompleteGuest } from "@schellingboard/domain/guest";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalidFields,
  notFound,
  ok,
  unavailable,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { PeopleDeps } from "../ports";

export interface AdminGuest {
  id: string;
  name: string;
  email: string;
  authProtected: boolean;
  eventIds: string[];
}

export interface GuestInput {
  name: string;
  email: string;
}

export const adminRequired = () => forbidden("admin.required", "Unauthorized");
const guestNotFound = () => notFound("guest.notFound", "User not found");
export const eventNotFound = () =>
  notFound("event.notFound", "Event not found");

const EMAIL_TAKEN = "A user with this email already exists";
const emailTaken = (): Failure => ({
  ok: false,
  error: {
    kind: "conflict",
    code: "guest.emailTaken",
    detail: EMAIL_TAKEN,
    errors: [{ path: "email", message: EMAIL_TAKEN }],
  },
});

function parseGuest<T extends GuestInput>(
  schema: z.ZodType<T>,
  input: unknown
): Result<T> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return ok(parsed.data);
  return invalidFields(
    "guest.invalid",
    parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }))
  );
}

function toAdminGuest(guest: CompleteGuest, eventIds: string[]): AdminGuest {
  return {
    id: guest.id,
    name: guest.name,
    email: guest.info.email,
    authProtected: guest.authProtected ?? false,
    eventIds,
  };
}

async function withEvents(
  { repos }: PeopleDeps,
  guest: CompleteGuest
): Promise<AdminGuest> {
  const events = await repos.guests.listEventsByGuests([guest.id]);
  return toAdminGuest(
    guest,
    (events.get(guest.id) ?? []).map((e) => e.id)
  );
}

export const listGuests =
  ({ repos }: PeopleDeps) =>
  async (actor: Actor): Promise<Result<AdminGuest[]>> => {
    if (!actor.admin) return adminRequired();
    const guests = await repos.guests.listFull();
    const events = await repos.guests.listEventsByGuests(
      guests.map((g) => g.id)
    );
    return ok(
      guests.map((g) =>
        toAdminGuest(
          g,
          (events.get(g.id) ?? []).map((e) => e.id)
        )
      )
    );
  };

export const createGuest =
  (deps: PeopleDeps) =>
  async (actor: Actor, input: unknown): Promise<Result<AdminGuest>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseGuest(createGuestSchema, input);
    if (!parsed.ok) return parsed;
    const { name, email } = parsed.value;
    // findOrCreateByEmail is atomic (unique index on lower(email)), so a
    // concurrent create with the same email can't slip past this check.
    const { guest, created } = await deps.repos.guests.findOrCreateByEmail({
      name,
      info: { email },
    });
    if (!created) return emailTaken();
    return ok(toAdminGuest(guest, []));
  };

// For seeding scripts: re-running one must not fail on guests it already made.
export const ensureGuest =
  ({ repos }: PeopleDeps) =>
  async (
    actor: Actor,
    input: GuestInput & { eventSlug?: string }
  ): Promise<Result<{ id: string; created: boolean }>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseGuest(createGuestSchema, input);
    if (!parsed.ok) return parsed;
    const { name, email } = parsed.value;

    let eventId: string | undefined;
    if (input.eventSlug) {
      const event = await repos.events.findBySlug(input.eventSlug);
      if (!event) return eventNotFound();
      eventId = event.id;
    }
    const { guest, created } = await repos.guests.findOrCreateByEmail({
      name,
      info: { email },
    });
    if (eventId) await repos.guests.assignToEvent(eventId, [guest.id]);
    return ok({ id: guest.id, created });
  };

export const updateGuest =
  (deps: PeopleDeps) =>
  async (actor: Actor, input: unknown): Promise<Result<AdminGuest>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseGuest(updateGuestSchema, input);
    if (!parsed.ok) return parsed;
    const { id, name, email } = parsed.value;
    const { guests } = deps.repos;

    const existing = await guests.findByEmail(email);
    if (existing && existing.id !== id) return emailTaken();

    let updated;
    try {
      updated = await guests.update(id, { name, info: { email } });
    } catch (e) {
      // A concurrent update or create can take the email between the check
      // above and this update.
      if (
        e instanceof Error &&
        e.message.includes(
          "UNIQUE constraint failed: index 'guests_email_unique'"
        )
      ) {
        return emailTaken();
      }
      throw e;
    }
    if (!updated) return guestNotFound();
    return ok(await withEvents(deps, updated));
  };

export const deleteGuest =
  ({ repos }: PeopleDeps) =>
  async (actor: Actor, input: { id: string }): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.guests.findById(input.id))) return guestNotFound();
    await repos.guests.delete(input.id);
    return ok(undefined);
  };

export const sendTestEmail =
  ({ repos, sendTestEmail: send }: PeopleDeps) =>
  async (actor: Actor, input: { id: string }): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    const guest = await repos.guests.findById(input.id);
    if (!guest) return guestNotFound();
    try {
      await send({ name: guest.name, email: guest.info.email });
    } catch (err) {
      console.error("Failed to send test email:", err);
      const detail = err instanceof Error ? err.message : String(err);
      return unavailable("mail.failed", `Failed to send test email: ${detail}`);
    }
    return ok(undefined);
  };
