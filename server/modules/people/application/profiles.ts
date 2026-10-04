import {
  sanitizeGuest,
  type CompleteGuest,
  type Guest,
  type ProfileContact,
  type ProfilePrompt,
} from "@schellingboard/domain/guest";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { invalid, notFound, ok, type Result } from "@/server/kernel/result";
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
}

const profileNotFound = () => notFound("profile.notFound", "Profile not found");

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

type ProfileFields = Omit<ProfileInput, "avatar">;

// Files first, then the row is read just before it is written: a photo upload
// and a profile save racing each other must not revert one another's fields.
async function saveProfile(
  { repos, avatars }: PeopleDeps,
  guestId: string,
  avatar: ValidatedImage | null | undefined,
  fields: (current: CompleteGuest) => ProfileFields,
  now: Date
): Promise<Result<Guest>> {
  let avatarUrl: string | null | undefined;
  if (avatar === null) {
    await avatars.delete(guestId);
    avatarUrl = null;
  } else if (avatar) {
    avatarUrl = await avatars.save(guestId, avatar.buffer, avatar.ext);
  }

  const current = await repos.guests.findById(guestId);
  if (!current) return profileNotFound();
  const updated = await repos.guests.updateProfile(
    guestId,
    {
      ...fields(current),
      avatarUrl:
        avatarUrl === undefined ? (current.avatarUrl ?? null) : avatarUrl,
    },
    now
  );
  if (!updated) return profileNotFound();
  return ok(sanitizeGuest(updated));
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
    const { avatar, ...fields } = input;
    return saveProfile(deps, acting.value, avatar, () => fields, now);
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
    { image }: { image: Buffer },
    now: Date
  ): Promise<Result<Guest>> => {
    const acting = await actingGuest(actor, deps.repos.guests);
    if (!acting.ok) return acting;
    const validated = await deps.avatars.validate(image);
    if ("error" in validated) return invalid("avatar.invalid", validated.error);
    return saveProfile(deps, acting.value, validated, currentFields, now);
  };

export const removeMyAvatar =
  (deps: PeopleDeps) =>
  async (actor: Actor, now: Date): Promise<Result<Guest>> => {
    const acting = await actingGuest(actor, deps.repos.guests);
    if (!acting.ok) return acting;
    return saveProfile(deps, acting.value, null, currentFields, now);
  };
