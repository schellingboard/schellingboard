import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result, unavailable } from "@/server/kernel/result";
import { realNow } from "@/utils/real-clock";
import { PASSWORD_LINK_VALID_MINUTES } from "@/utils/user-credentials";

import type { PeopleDeps } from "../ports";
import { adminRequired, noEmail } from "./admin-guests";
import { issuePasswordToken } from "./auth-tokens";

const unknownGuest = () => notFound("guest.notFound", "Unknown user");

/** A password link an admin hands over; the token is shown only here. */
export const createPasswordLink =
  ({ repos }: PeopleDeps) =>
  async (
    actor: Actor,
    { id }: { id: string }
  ): Promise<Result<{ token: string }>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.guests.findById(id))) return unknownGuest();
    const token = await issuePasswordToken(
      repos,
      id,
      PASSWORD_LINK_VALID_MINUTES,
      realNow()
    );
    return ok({ token });
  };

export const mailPasswordLink =
  ({ repos, loginMail }: PeopleDeps) =>
  async (actor: Actor, { id }: { id: string }): Promise<Result<null>> => {
    if (!actor.admin) return adminRequired();
    if (!loginMail.configured())
      return unavailable(
        "auth.mailUnavailable",
        "This server cannot send email, so copy the password link instead"
      );
    const guest = await repos.guests.findById(id);
    if (!guest) return unknownGuest();
    if (!guest.info.email) return noEmail();
    const token = await issuePasswordToken(
      repos,
      id,
      PASSWORD_LINK_VALID_MINUTES,
      realNow()
    );
    try {
      await loginMail.sendResetLink({
        guestId: id,
        name: guest.name,
        email: guest.info.email,
        locale: guest.info.locale,
        token,
        validMinutes: PASSWORD_LINK_VALID_MINUTES,
        fromAdmin: true,
      });
    } catch (err) {
      console.error("Failed to send password link email:", err);
      return unavailable(
        "auth.mailFailed",
        "The email could not be sent — try again"
      );
    }
    return ok(null);
  };
