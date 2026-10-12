import {
  sanitizeGuest,
  type CompleteGuest,
  type Guest,
  type ProfileContact,
  type ProfilePrompt,
} from "@schellingboard/domain/guest";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  versionConflict,
  type Result,
} from "@/server/kernel/result";
import type { PeopleDeps, ValidatedImage } from "../ports";

export interface ProfileInput {
  name: string;
  aboutMe: string | null;
  pronouns: string | null;
  basedIn: string | null;
  prompts: ProfilePrompt[] | null;
  languages: string[] | null;
  contacts: ProfileContact[] | null;
  /** Left out keeps the current photo; null removes it. */
  avatar?: ValidatedImage | null;
  expectedVersion: number;
}

const profileNotFound = () => notFound("profile.notFound", "Profile not found");

export const listEventProfiles =
  ({ repos }: PeopleDeps) =>
  async (
    actor: Actor,
    { eventId }: { eventId: string }
  ): Promise<Result<Guest[]>> => {
    const acting = actor.admin ? null : await actingGuest(actor, repos.guests);
    if (acting && !acting.ok) return acting;
    if (!(await repos.events.findById(eventId)))
      return notFound("event.notFound", "Event not found");
    if (acting) {
      const attending = await repos.guests.listEventsByGuests([acting.value]);
      if (!attending.get(acting.value)?.some((e) => e.id === eventId))
        return forbidden("guest.notInEvent", "You are not part of this event");
    }
    return ok(await repos.guests.listProfilesByEvent(eventId));
  };

export const getProfile =
  ({ repos }: PeopleDeps) =>
  async (
    _actor: Actor,
    { guestId }: { guestId: string }
  ): Promise<Result<Guest>> => {
    const guest = await repos.guests.findById(guestId);
    if (!guest) return profileNotFound();
    return ok(sanitizeGuest(guest));
  };

type ProfileFields = Omit<ProfileInput, "avatar" | "expectedVersion">;

const profileConflict = (current: CompleteGuest) =>
  versionConflict(
    "profile",
    sanitizeGuest(current),
    "Someone changed this profile while you edited it. Copy your edits somewhere safe: reloading the page discards them."
  );

// Files first, then the row is read and written in one transaction, so a photo
// upload and a profile save racing each other never revert each other's fields.
async function saveProfile(
  { uow, avatars, repos }: PeopleDeps,
  guestId: string,
  avatar: ValidatedImage | null | undefined,
  fields: (current: CompleteGuest) => ProfileFields,
  now: Date,
  expectedVersion: number
): Promise<Result<Guest>> {
  if (avatar !== undefined) {
    const current = await repos.guests.findById(guestId);
    if (!current) return profileNotFound();
    if (current.profileVersion !== expectedVersion)
      return profileConflict(current);
  }
  let avatarUrl: string | null | undefined;
  if (avatar === null) {
    await avatars.delete(guestId);
    avatarUrl = null;
  } else if (avatar) {
    avatarUrl = await avatars.save(guestId, avatar.buffer, avatar.ext);
  }

  const saved = await uow.run(async (tx) => {
    const current = await tx.guests.findById(guestId);
    if (!current) return profileNotFound();
    const updated = await tx.guests.updateProfile(
      guestId,
      {
        ...fields(current),
        avatarUrl:
          avatarUrl === undefined ? (current.avatarUrl ?? null) : avatarUrl,
        expectedVersion,
      },
      now
    );
    if (updated) return ok(sanitizeGuest(updated));
    const after = await tx.guests.findById(guestId);
    return after ? profileConflict(after) : profileNotFound();
  });
  if (!saved.ok && saved.error.code === "profile.notFound" && avatarUrl)
    await avatars.delete(guestId);
  return saved;
}

export const updateMyProfile =
  (deps: PeopleDeps) =>
  async (
    actor: Actor,
    input: ProfileInput,
    now: Date
  ): Promise<Result<Guest>> => {
    const acting = await actingGuest(actor, deps.repos.guests);
    if (!acting.ok) return acting;
    const { avatar, expectedVersion, ...fields } = input;
    return saveProfile(
      deps,
      acting.value,
      avatar,
      () => fields,
      now,
      expectedVersion
    );
  };

const currentFields = (current: CompleteGuest): ProfileFields => ({
  name: current.name,
  aboutMe: current.aboutMe ?? null,
  pronouns: current.pronouns ?? null,
  basedIn: current.basedIn ?? null,
  prompts: current.prompts ?? null,
  languages: current.languages ?? null,
  contacts: current.contacts ?? null,
});

export const replaceMyAvatar =
  (deps: PeopleDeps) =>
  async (
    actor: Actor,
    { image, expectedVersion }: { image: Buffer; expectedVersion: number },
    now: Date
  ): Promise<Result<Guest>> => {
    const acting = await actingGuest(actor, deps.repos.guests);
    if (!acting.ok) return acting;
    const validated = await deps.avatars.validate(image);
    if ("error" in validated) return invalid("avatar.invalid", validated.error);
    return saveProfile(
      deps,
      acting.value,
      validated,
      currentFields,
      now,
      expectedVersion
    );
  };

export const removeMyAvatar =
  (deps: PeopleDeps) =>
  async (
    actor: Actor,
    { expectedVersion }: { expectedVersion: number },
    now: Date
  ): Promise<Result<Guest>> => {
    const acting = await actingGuest(actor, deps.repos.guests);
    if (!acting.ok) return acting;
    return saveProfile(
      deps,
      acting.value,
      null,
      currentFields,
      now,
      expectedVersion
    );
  };
