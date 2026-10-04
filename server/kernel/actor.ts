import {
  ADMIN_COOKIE_NAME,
  GUEST_COOKIE_NAME,
  isAdminCookieValid,
  readGuestCookie,
  type GuestAuthLevel,
} from "@/utils/auth-cookies";

export interface Actor {
  admin: boolean;
  guest: { id: string; level: GuestAuthLevel } | null;
}

export interface CookieReader {
  get(name: string): { value: string } | undefined;
}

// What the cookies prove, nothing more: whether a protected guest may be acted
// as is decided per use case, since it needs the guest's stored protection.
export async function resolveActor(cookies: CookieReader): Promise<Actor> {
  const [admin, guest] = await Promise.all([
    isAdminCookieValid(cookies.get(ADMIN_COOKIE_NAME)?.value),
    readGuestCookie(cookies.get(GUEST_COOKIE_NAME)?.value),
  ]);
  return {
    admin,
    guest: guest ? { id: guest.guestId, level: guest.level } : null,
  };
}
