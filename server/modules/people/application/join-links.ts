import type { Actor } from "@/server/kernel/actor";
import { byGuest } from "@/server/kernel/change-context";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  unavailable,
  type Result,
} from "@/server/kernel/result";
import { recordingShownGuests } from "@/server/kernel/shown-guests";
import {
  generateSessionToken,
  hashSessionToken,
} from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";
import type { PeopleDeps } from "../ports";
import { adminRequired, eventNotFound } from "./admin-guests";
import { signIn, type SignedIn } from "./identity";

const tokenWrong = () =>
  forbidden("join.tokenWrong", "This link is invalid or was replaced");

const guestMissing = () => notFound("guest.notFound", "User not found");

const hasEmail = (email: string) => email.trim() !== "";

async function issue(
  { repos }: PeopleDeps,
  guestId: string,
  eventId: string
): Promise<string> {
  const token = generateSessionToken();
  await repos.joinTokens.replace({
    hash: hashSessionToken(token),
    guestId,
    eventId,
    createdAt: realNow(),
  });
  return token;
}

export const createJoinLink = (deps: PeopleDeps) => {
  const { repos, loginMail } = deps;
  return async (
    actor: Actor,
    input: { eventId: string; guestId: string }
  ): Promise<Result<{ token: string }>> => {
    if (!actor.admin) return adminRequired();
    const event = await repos.events.findById(input.eventId);
    if (!event) return eventNotFound();
    const guest = await repos.guests.findById(input.guestId);
    if (!guest) return guestMissing();
    const token = await issue(deps, guest.id, event.id);
    // Best effort: a failed heads-up never blocks the link the organizer
    // is about to hand over.
    if (loginMail.configured() && hasEmail(guest.info.email)) {
      try {
        await loginMail.sendJoinLinkMade({
          name: guest.name,
          email: guest.info.email,
          eventName: event.name,
        });
      } catch (err) {
        console.error("Failed to send join-link notice to %s:", guest.id, err);
      }
    }
    return ok({ token });
  };
};

export const mailJoinLinks =
  (deps: PeopleDeps) =>
  async (
    actor: Actor,
    input: { eventId: string; guestIds?: string[] }
  ): Promise<
    Result<{ sent: number; withoutEmail: number; failed: number }>
  > => {
    const { repos, loginMail } = deps;
    if (!actor.admin) return adminRequired();
    const event = await repos.events.findById(input.eventId);
    if (!event) return eventNotFound();
    if (!loginMail.configured())
      return unavailable(
        "auth.mailUnavailable",
        "This server cannot send email, so links cannot be mailed"
      );
    const everyone = await repos.guests.listFull();
    const known = new Set(everyone.map((g) => g.id));
    if (input.guestIds?.some((id) => !known.has(id)))
      return invalid("guest.unknown", "Guest not found");
    const wanted = new Set(
      input.guestIds ??
        (await repos.guests.listByEvent(event.id)).map((g) => g.id)
    );
    const guests = everyone.filter((g) => wanted.has(g.id));
    const result = { sent: 0, withoutEmail: 0, failed: 0 };
    for (const guest of guests) {
      if (!hasEmail(guest.info.email)) {
        result.withoutEmail++;
        continue;
      }
      const token = await issue(deps, guest.id, event.id);
      try {
        await loginMail.sendJoinLink({
          name: guest.name,
          email: guest.info.email,
          eventName: event.name,
          token,
        });
        result.sent++;
      } catch (err) {
        console.error("Failed to send join link to %s:", guest.id, err);
        result.failed++;
      }
    }
    return ok(result);
  };

export type JoinOutcome = {
  guestId: string;
  eventSlug: string;
  joined: boolean;
  session?: SignedIn;
};

export const joinWithLink = (deps: PeopleDeps) => {
  const start = signIn(deps);
  return async (
    actor: Actor,
    input: { token: string; device?: string | null }
  ): Promise<Result<JoinOutcome>> => {
    const { repos, uow } = deps;
    const link = await repos.joinTokens.findByHash(
      hashSessionToken(input.token)
    );
    if (!link) return tokenWrong();
    const event = await repos.events.findById(link.eventId);
    if (!event) return tokenWrong();
    const base = { guestId: link.guestId, eventSlug: event.slug };

    const passwordSetAt = await repos.guests.getPasswordSetAt(link.guestId);
    const signedInAlready =
      actor.guest?.id === link.guestId && actor.guest.level === "verified";
    // A link that signed a site admin in would hand out admin rights.
    const trusted =
      (!passwordSetAt || passwordSetAt <= link.createdAt) &&
      !(await repos.guests.getSiteAdmin(link.guestId));
    if (!signedInAlready && !trusted) return ok({ ...base, joined: false });

    await uow.run((tx) =>
      recordingShownGuests(
        tx,
        [event.id],
        () => tx.guests.assignToEvent(event.id, [link.guestId]),
        byGuest(link.guestId, realNow()),
        [link.guestId]
      )
    );
    if (signedInAlready) return ok({ ...base, joined: true });
    const session = await start(actor, {
      guestId: link.guestId,
      level: "verified",
      device: input.device,
    });
    return ok({ ...base, joined: true, session });
  };
};
