import type { publicProfileSchema } from "@schellingboard/contracts/guest";
import type { Guest } from "@schellingboard/domain/guest";
import type { z } from "zod";

export function toProfileView(g: Guest): z.input<typeof publicProfileSchema> {
  return {
    id: g.id,
    name: g.name,
    aboutMe: g.aboutMe ?? null,
    avatarUrl: g.avatarUrl ?? null,
    pronouns: g.pronouns ?? null,
    basedIn: g.basedIn ?? null,
    prompts: g.prompts ?? null,
    languages: g.languages ?? null,
    contacts: g.contacts ?? null,
    profileUpdatedAt: g.profileUpdatedAt?.toISOString() ?? null,
  };
}
