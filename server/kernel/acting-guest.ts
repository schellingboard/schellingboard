import type { Actor } from "./actor";
import { forbidden, ok, type Result } from "./result";

export interface GuestProtectionLookup {
  getAuthCredentials(id: string): Promise<{ authProtected: boolean } | null>;
}

// ADR 0012 section 3 (#370): an unprotected guest may be acted as by whoever
// names it, a protected one only with that guest's verified cookie. A cookie
// naming a guest that no longer exists counts as no selection (#931).
export async function actingGuest(
  actor: Actor,
  guests: GuestProtectionLookup
): Promise<Result<string>> {
  if (!actor.guest) return forbidden("guest.unselected");
  const creds = await guests.getAuthCredentials(actor.guest.id);
  if (!creds) return forbidden("guest.unselected");
  if (creds.authProtected && actor.guest.level !== "verified")
    return forbidden("guest.protected");
  return ok(actor.guest.id);
}
