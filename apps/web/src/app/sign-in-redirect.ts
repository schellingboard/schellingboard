import { hardNavigate } from "./hard-navigate";

/** Opens the login page, which returns to the page the person is on; `guestId` names whose login it is. */
export function goToSignIn(guestId?: string) {
  const back = encodeURIComponent(
    location.pathname + location.search + location.hash
  );
  hardNavigate(
    `/auth/login?${guestId ? `guest=${guestId}&` : ""}redirect=${back}`
  );
}
