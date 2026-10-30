import type { LoginAssurance } from "@schellingboard/domain/auth";
import {
  ADMIN_COOKIE_NAME,
  GUEST_COOKIE_NAME,
  isAdminCookieValid,
} from "@/utils/auth-cookies";

export interface Actor {
  admin: boolean;
  guest: {
    id: string;
    level: LoginAssurance;
    sessionId?: string;
    siteAdmin?: boolean;
  } | null;
}

export interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export type GuestIdentity = NonNullable<Actor["guest"]>;

/** Finds the live login session a cookie token names. */
export type SessionLookup = (token: string) => Promise<{
  guestId: string;
  level: LoginAssurance;
  id: string;
  siteAdmin?: boolean;
} | null>;

export async function readGuestIdentity(
  value: string | undefined,
  lookup: SessionLookup
): Promise<GuestIdentity | null> {
  if (!value) return null;
  if (value.includes(".")) return null;
  const session = await lookup(value);
  return session
    ? {
        id: session.guestId,
        level: session.level,
        sessionId: session.id,
        siteAdmin: session.siteAdmin,
      }
    : null;
}

// What the cookies prove, nothing more: whether a protected guest may be acted
// as is decided per use case, since it needs the guest's stored protection.
export async function resolveActor(
  cookies: CookieReader,
  lookup: SessionLookup
): Promise<Actor> {
  const [admin, guest] = await Promise.all([
    isAdminCookieValid(cookies.get(ADMIN_COOKIE_NAME)?.value),
    readGuestIdentity(cookies.get(GUEST_COOKIE_NAME)?.value, lookup),
  ]);
  // A claimed session proves nothing, so the role needs a verified one.
  const siteAdmin = guest?.level === "verified" && guest.siteAdmin === true;
  return { admin: admin || siteAdmin, guest };
}
