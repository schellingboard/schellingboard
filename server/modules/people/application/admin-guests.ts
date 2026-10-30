import { credentialsChanged } from "@/server/kernel/credential-changes";
import {
  createGuestSchema,
  updateGuestSchema,
} from "@schellingboard/contracts/guest";
import type { z } from "zod";
import { changes } from "@schellingboard/domain/change";
import type { CompleteGuest } from "@schellingboard/domain/guest";
import type { Actor } from "@/server/kernel/actor";
import { byAdmin } from "@/server/kernel/change-context";
import { recordingProposalCascade } from "@/server/kernel/proposal-cascade";
import { recordingSessionCascade } from "@/server/kernel/session-cascade";
import { recordingShownGuests } from "@/server/kernel/shown-guests";
import { withStoredFile } from "@/server/kernel/stored-files";
import {
  conflict,
  forbidden,
  invalidFields,
  notFound,
  ok,
  unavailable,
  versionConflict,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { PeopleDeps } from "../ports";

export interface AdminGuest {
  id: string;
  name: string;
  email: string;
  authProtected: boolean;
  siteAdmin: boolean;
  hasPassword: boolean;
  eventIds: string[];
  version: number;
}

export interface GuestInput {
  name: string;
  email: string;
}

export const adminRequired = () => forbidden("admin.required", "Unauthorized");
const lastSiteAdmin = () =>
  conflict(
    "siteAdmin.last",
    "This is the last site admin — make someone else one first"
  );
const isLastSiteAdmin = async (
  guests: PeopleDeps["repos"]["guests"],
  id: string
) => {
  const admins = await guests.listSiteAdminIds();
  return admins.length === 1 && admins[0] === id;
};
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

function toAdminGuest(
  guest: CompleteGuest,
  eventIds: string[],
  siteAdmin: boolean,
  hasPassword: boolean
): AdminGuest {
  return {
    id: guest.id,
    name: guest.name,
    email: guest.info.email,
    authProtected: guest.authProtected ?? false,
    siteAdmin,
    hasPassword,
    eventIds,
    version: guest.version,
  };
}

async function withEvents(
  guests: PeopleDeps["repos"]["guests"],
  guest: CompleteGuest
): Promise<AdminGuest> {
  const events = await guests.listEventsByGuests([guest.id]);
  return toAdminGuest(
    guest,
    (events.get(guest.id) ?? []).map((e) => e.id),
    await guests.getSiteAdmin(guest.id),
    !!(await guests.getAuthCredentials(guest.id))?.passwordHash
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
    const admins = new Set(await repos.guests.listSiteAdminIds());
    const withPassword = new Set(await repos.guests.listPasswordIds());
    return ok(
      guests.map((g) =>
        toAdminGuest(
          g,
          (events.get(g.id) ?? []).map((e) => e.id),
          admins.has(g.id),
          withPassword.has(g.id)
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
    return ok(toAdminGuest(guest, [], false, false));
  };

// For seeding scripts: re-running one must not fail on guests it already made.
export const ensureGuest =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: GuestInput & { eventSlug?: string },
    now: Date
  ): Promise<Result<{ id: string; created: boolean }>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseGuest(createGuestSchema, input);
    if (!parsed.ok) return parsed;
    const { name, email } = parsed.value;

    return uow.run(async (tx) => {
      let eventId: string | undefined;
      if (input.eventSlug) {
        const event = await tx.events.findBySlug(input.eventSlug);
        if (!event) return eventNotFound();
        eventId = event.id;
      }
      const { guest, created } = await tx.guests.findOrCreateByEmail({
        name,
        info: { email },
      });
      if (eventId)
        await recordingShownGuests(
          tx,
          [eventId],
          () => tx.guests.assignToEvent(eventId, [guest.id]),
          byAdmin(actor, now)
        );
      return ok({ id: guest.id, created });
    });
  };

export const updateGuest =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: unknown,
    now: Date
  ): Promise<Result<AdminGuest>> => {
    if (!actor.admin) return adminRequired();
    const parsed = parseGuest(updateGuestSchema, input);
    if (!parsed.ok) return parsed;
    const { id, name, email, expectedVersion } = parsed.value;

    return uow.run(async (tx) => {
      const current = await tx.guests.findById(id);
      if (!current) return guestNotFound();
      if (current.version !== expectedVersion)
        return versionConflict(
          "guest",
          await withEvents(tx.guests, current),
          "Someone changed this guest while you edited it. Copy your edits somewhere safe: reloading the page discards them."
        );
      const existing = await tx.guests.findByEmail(email);
      if (existing && existing.id !== id) return emailTaken();
      const by = byAdmin(actor, now);
      const updated = await recordingShownGuests(
        tx,
        await tx.guests.listShownEventIds(id),
        async () =>
          recordingProposalCascade(
            tx,
            await tx.sessionProposals.listByHost(id),
            () =>
              tx.guests.update(id, { name, info: { email }, expectedVersion }),
            by
          ),
        by
      );
      if (!updated) return guestNotFound();
      return ok(await withEvents(tx.guests, updated));
    });
  };

export const deleteGuest =
  ({ uow, avatars }: PeopleDeps) =>
  async (
    actor: Actor,
    input: { id: string },
    now: Date
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    const result = await withStoredFile(avatars, null, (replaces) =>
      uow.run(async (tx) => {
        const guest = await tx.guests.findById(input.id);
        if (!guest) return guestNotFound();
        if (await isLastSiteAdmin(tx.guests, input.id)) return lastSiteAdmin();
        const by = byAdmin(actor, now);
        const sessions = new Map(
          [
            ...(await tx.sessions.listHostedByGuest(input.id)),
            ...(await tx.sessions.listRsvpdByGuest(input.id)),
          ].map((s) => [s.id, s])
        );
        const meetings = await tx.meetings.listByGuest(input.id);
        const proposals = await tx.sessionProposals.listByHost(input.id);
        await recordingShownGuests(
          tx,
          await tx.guests.listShownEventIds(input.id),
          () =>
            recordingProposalCascade(
              tx,
              proposals,
              () =>
                recordingSessionCascade(
                  tx,
                  [...sessions.values()],
                  () => tx.guests.delete(input.id),
                  by
                ),
              by
            ),
          by
        );
        for (const meeting of meetings)
          tx.record(changes.meetingDeleted(meeting, by));
        replaces(guest.avatarUrl);
        return ok(undefined);
      })
    );
    if (result.ok) credentialsChanged(input.id);
    return result;
  };

/** Never the last admin: the site would have none left to sign in as. */
export const setSiteAdmin =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: { id: string; siteAdmin: boolean },
    now: Date
  ): Promise<Result<AdminGuest>> => {
    if (!actor.admin) return adminRequired();
    const result = await uow.run(async (tx) => {
      if (!input.siteAdmin && (await isLastSiteAdmin(tx.guests, input.id)))
        return lastSiteAdmin();
      const done = await recordingShownGuests(
        tx,
        await tx.guests.listShownEventIds(input.id),
        () => tx.guests.setSiteAdmin(input.id, input.siteAdmin),
        byAdmin(actor, now)
      );
      if (!done) return guestNotFound();
      const guest = await tx.guests.findById(input.id);
      return guest ? ok(await withEvents(tx.guests, guest)) : guestNotFound();
    });
    if (result.ok) credentialsChanged(input.id);
    return result;
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
