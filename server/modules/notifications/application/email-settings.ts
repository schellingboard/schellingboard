import type { EmailSettings } from "@schellingboard/domain/guest";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import type { NotificationDeps } from "../ports";

const profileNotFound = () => notFound("profile.notFound", "Profile not found");

export const getMyEmailSettings =
  ({ repos }: NotificationDeps) =>
  async (actor: Actor): Promise<Result<EmailSettings>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const guest = await repos.guests.findById(acting.value);
    if (!guest) return profileNotFound();
    return ok(guest.info.emailSettings);
  };

export const updateMyEmailSettings =
  ({ repos }: NotificationDeps) =>
  async (actor: Actor, settings: EmailSettings): Promise<Result<void>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const updated = await repos.guests.updateEmailSettings(
      acting.value,
      settings
    );
    if (!updated) return profileNotFound();
    return ok(undefined);
  };
