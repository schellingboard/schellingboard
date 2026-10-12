import { cookies } from "next/headers";
import { createGuestLogoutCookie, createLogoutCookie } from "@/utils/auth";

// What logoutAction does for the legacy pages: the single-page app signs out
// of the site and of the guest name together.
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(createLogoutCookie());
  cookieStore.set(createGuestLogoutCookie());
  return new Response(null, { status: 204 });
}
