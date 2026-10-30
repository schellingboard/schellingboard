import { getRepositories } from "@/db/container";
import { createGuest } from "./factories";
import { GUEST_COOKIE_NAME, verifiedGuestValue } from "./guest-cookie";

/** A cookie for a new site admin, signed in with a password. */
export async function createAdminAuthCookie() {
  const guest = await createGuest({ name: "Site Admin" });
  await getRepositories().guests.setSiteAdmin(guest.id, true);
  return {
    name: GUEST_COOKIE_NAME,
    value: await verifiedGuestValue(guest.id),
  };
}
