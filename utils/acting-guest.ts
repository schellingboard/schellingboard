import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
export { actingGuestRefusalMessage };
import { pageReads } from "@/server/composition";
import { guestOfCookie } from "@/server/kernel/session-actor";
import { GUEST_COOKIE_NAME } from "./auth";

// Server-side enforcement for guest account security (issue #370): a request
// acting as an auth-protected guest must carry that guest's verified
// login session. Unprotected guests stay freely impersonable by design.
//
// Kept separate from utils/auth.ts because these helpers hit the database.

/**
 * Whether a request carrying `guestCookieValue` may act as `guestId`.
 * True for unprotected and unknown guests — existence checks and their
 * error responses stay with the caller. A protected guest is honoured only
 * when the cookie is a "verified" proof issued for exactly that guest.
 */
export async function isVerifiedAsGuest(
  guestId: string,
  guestCookieValue: string | undefined
): Promise<boolean> {
  const creds = await pageReads().guestAuthProtection(guestId);
  if (!creds || !creds.authProtected) return true;
  const parsed = await guestOfCookie(guestCookieValue);
  return parsed?.id === guestId && parsed.level === "verified";
}

// Shared 403 body for writes attempted as a protected guest without a
// verified session, kept in one place so the copy can't drift across routes.
export const NAME_PROTECTED_ERROR =
  "This name is protected — switch to it with your password or emailed code first";

/** 403 response for an unverified write acting as a protected guest. */
export function guestProtectionError(): Response {
  return Response.json({ error: NAME_PROTECTED_ERROR }, { status: 403 });
}

type ReadonlyCookies = {
  get(name: string): { value: string } | undefined;
};

async function guestExists(id: string): Promise<boolean> {
  // The cheapest existence probe the repository offers: two columns, where
  // findById assembles the whole profile.
  return (await pageReads().guestAuthProtection(id)) !== null;
}

/**
 * The current user id from the guest cookie, for server components and
 * actions — but null when that guest is protected and the cookie isn't a
 * verified proof, so an unauthenticated visitor can't act (or render private
 * state) as a protected guest merely by forging an "open" selection cookie.
 */
export async function verifiedCurrentUser(
  cookieStore: ReadonlyCookies
): Promise<string | null> {
  const value = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  const guestId = await currentGuestSelection(cookieStore);
  if (!guestId) return null;
  return (await isVerifiedAsGuest(guestId, value)) ? guestId : null;
}

/**
 * The selected guest id regardless of verification, or null if none is
 * selected. Use only to tell "no name selected" apart from "a protected name
 * selected but not yet verified" — never to authorize acting as the guest
 * (use verifiedCurrentUser for that).
 *
 * A cookie naming a guest the database no longer has counts as no selection:
 * it outlives the guest when an organizer deletes one, or when a development
 * database is reseeded under the browser. The header chip already reads that
 * state as "Select your name" — everything else has to agree, or the page
 * keeps offering actions that die on a foreign key (#931).
 */
export async function currentGuestSelection(
  cookieStore: ReadonlyCookies
): Promise<string | null> {
  const parsed = await guestOfCookie(cookieStore.get(GUEST_COOKIE_NAME)?.value);
  if (!parsed) return null;
  return (await guestExists(parsed.id)) ? parsed.id : null;
}

/**
 * What to tell a visitor that {@link verifiedCurrentUser} refused. It returns
 * null both when no name is selected and when the selected name is protected
 * without a verified session (protection enabled from another device), and the
 * two need different advice: being told to pick a name you have already picked
 * helps nobody. Kept here, like NAME_PROTECTED_ERROR, so the copy can't drift
 * across the pages that make this check. `task` completes "before …", e.g.
 * "changing your settings".
 */
export async function unverifiedUserMessage(
  cookieStore: ReadonlyCookies,
  task: string
): Promise<string> {
  return actingGuestRefusalMessage(
    (await currentGuestSelection(cookieStore))
      ? "guest.protected"
      : "guest.unselected",
    task
  );
}
