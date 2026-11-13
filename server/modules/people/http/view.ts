import type {
  attendeeViewSchema,
  publicProfileSchema,
} from "@schellingboard/contracts/guest";
import type { eventGuestSchema } from "@schellingboard/contracts/snapshot";
import type { Guest } from "@schellingboard/domain/guest";
import type { z } from "zod";

import type { LabelledAttendee } from "../application/profiles";

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
    version: g.profileVersion,
  };
}

export function toAttendeeView(
  a: LabelledAttendee
): z.input<typeof attendeeViewSchema> {
  return {
    ...toProfileView(a),
    isHost: a.isHost,
    openToMeetings: a.openToMeetings,
    authProtected: a.authProtected ?? false,
    labels: a.labels,
  };
}

export function toEventGuestView(g: Guest): z.input<typeof eventGuestSchema> {
  return {
    id: g.id,
    name: g.name,
    avatarUrl: g.avatarUrl ?? null,
    aboutMe: g.aboutMe ?? null,
    authProtected: g.authProtected ?? false,
    profileVersion: g.profileVersion,
  };
}
