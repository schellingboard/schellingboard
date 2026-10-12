import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import {
  createGuestCookie,
  createGuestLogoutCookie,
} from "@/utils/auth-cookies";
import type { Identity } from "../application/identity";

export async function setGuestCookie(c: Context, identity: Identity) {
  const { name, value, ...options } =
    identity.guestId === null
      ? createGuestLogoutCookie()
      : await createGuestCookie(identity.guestId, identity.level);
  setCookie(c, name, value, options);
}
