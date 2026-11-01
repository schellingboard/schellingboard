import {
  COOKIE_MAX_AGE_SEC,
  signCookieValue,
  cookieOptions,
} from "@/utils/auth-cookies";

export {
  GUEST_COOKIE_NAME,
  isAuthCookieValid,
  isPasswordProtectionEnabled,
  createGuestCookie,
  createGuestLogoutCookie,
} from "@/utils/auth-cookies";

export const AUTH_COOKIE_NAME = "site-auth";
export { safeRedirectPath } from "@schellingboard/domain/safe-redirect";

const encoder = new TextEncoder();

// Constant-time string comparison for the shared site password. This
// file must stay free of node:crypto (see utils/user-credentials.ts), so no
// timingSafeEqual: instead XOR every byte and fold the result, always walking
// the longer input so timing reveals nothing beyond the secret's length.
function timingSafeEqualString(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let diff = aBytes.length ^ bBytes.length;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export function verifyPassword(inputPassword: string): boolean {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return true; // No protection if password not set
  }
  return timingSafeEqualString(inputPassword, sitePassword);
}

// Cookie attributes are spread flat onto the returned object, not nested under
// an `options` key, which a cookie setter would silently ignore. See
// tests/unit/auth.test.ts ("emitted Set-Cookie header").
export async function createAuthCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: await signCookieValue(),
    ...cookieOptions(COOKIE_MAX_AGE_SEC),
  };
}

export function createLogoutCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    ...cookieOptions(0),
  };
}
