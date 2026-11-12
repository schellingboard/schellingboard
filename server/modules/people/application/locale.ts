import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import type { PeopleDeps } from "../ports";

export const updateMyLocale =
  ({ repos }: PeopleDeps) =>
  async (actor: Actor, locale: string | null): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const updated = await repos.guests.updateLocale(acting.value, locale);
    if (!updated) return notFound("profile.notFound", "Profile not found");
    return ok(undefined);
  };
