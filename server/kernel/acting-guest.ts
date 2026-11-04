import { assuranceRequired } from "@schellingboard/domain/auth";
import type { IdentityMode } from "@schellingboard/domain/event";
import type { Actor } from "./actor";
import { forbidden, ok, type Result } from "./result";

export interface GuestProtectionLookup {
  getAuthCredentials(id: string): Promise<{ authProtected: boolean } | null>;
}

// ADR 0012 section 3 (#370): an unprotected guest may be acted as by whoever
// names it, a protected one only with that guest's verified cookie. A cookie
// naming a guest that no longer exists counts as no selection (#931). Use cases
// on one event pass its mode: a verified event needs a verified login from
// whoever acts, member or not (ADR 0017 section 10).
export async function actingGuest(
  actor: Actor,
  guests: GuestProtectionLookup,
  eventMode: IdentityMode = "open"
): Promise<Result<string>> {
  if (!actor.guest) return forbidden("guest.unselected");
  const creds = await guests.getAuthCredentials(actor.guest.id);
  if (!creds) return forbidden("guest.unselected");
  if (
    assuranceRequired(eventMode, creds.authProtected) === "verified" &&
    actor.guest.level !== "verified"
  )
    return forbidden("guest.protected");
  return ok(actor.guest.id);
}

// The same rule for a guest the request names. An unknown guest passes: the
// use case's own membership or existence check refuses it.
export async function actingAsNamedGuest(
  actor: Actor,
  guestId: string,
  guests: GuestProtectionLookup
): Promise<Result<string>> {
  const creds = await guests.getAuthCredentials(guestId);
  const verified =
    actor.guest?.id === guestId && actor.guest.level === "verified";
  if (creds?.authProtected && !verified) return forbidden("guest.protected");
  return ok(guestId);
}
