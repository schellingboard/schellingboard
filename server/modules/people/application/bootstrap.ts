import { createGuestSchema } from "@schellingboard/contracts/guest";
import type { Actor } from "@/server/kernel/actor";
import { byAdmin } from "@/server/kernel/change-context";
import { recordingShownGuests } from "@/server/kernel/shown-guests";
import { credentialsChanged } from "@/server/kernel/credential-changes";
import {
  conflict,
  forbidden,
  invalidFields,
  notFound,
  ok,
  type Result,
} from "@/server/kernel/result";
import {
  generateSessionToken,
  hashSessionToken,
} from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";
import { hashUserPassword } from "@/utils/user-credentials";
import type { PeopleDeps } from "../ports";
import { signIn, type SignedIn } from "./identity";

const tokenWrong = () =>
  forbidden(
    "bootstrap.tokenWrong",
    "This link is invalid, expired or already used"
  );

const BOOTSTRAP_VALID_MS = 24 * 60 * 60 * 1000;

/** Replaces any earlier link; the token is shown once, here. */
export const issueBootstrapToken =
  ({ repos }: PeopleDeps) =>
  async (): Promise<{ token: string; expiresAt: Date }> => {
    const token = generateSessionToken();
    const now = realNow();
    const expiresAt = new Date(now.getTime() + BOOTSTRAP_VALID_MS);
    await repos.bootstrapTokens.replace({
      hash: hashSessionToken(token),
      createdAt: now,
      expiresAt,
    });
    return { token, expiresAt };
  };

/**
 * A new link while the site has no admin; `force` also issues one when admins
 * exist (recovery). A link logged earlier stays valid until it expires.
 */
export const announceBootstrap = (deps: PeopleDeps) => {
  const issue = issueBootstrapToken(deps);
  return async (force = false) =>
    force || (await deps.repos.guests.listSiteAdminIds()).length === 0
      ? issue()
      : null;
};

export type BootstrapInput = {
  token: string;
  guestId?: string;
  name?: string;
  email?: string;
  username: string;
  password: string;
  device?: string | null;
};

/**
 * Spends the link: the chosen or new guest becomes a site admin with a
 * username and password, and the visitor is signed in as them.
 */
export const bootstrapAdmin = (deps: PeopleDeps) => {
  const start = signIn(deps);
  return async (
    actor: Actor,
    input: BootstrapInput
  ): Promise<Result<SignedIn>> => {
    const hash = hashSessionToken(input.token);
    // Before the scrypt work, so a wrong link cannot make the server spend it.
    if (!(await deps.repos.bootstrapTokens.findLive(hash, realNow())))
      return tokenWrong();
    const passwordHash = await hashUserPassword(input.password);
    const done = await deps.uow.run(async (tx) => {
      if (!(await tx.bootstrapTokens.findLive(hash, realNow())))
        return tokenWrong();
      let guestId = input.guestId;
      if (guestId !== undefined) {
        if (!(await tx.guests.findById(guestId)))
          return notFound("guest.notFound", "Unknown user");
      } else {
        const parsed = createGuestSchema.safeParse(input);
        if (!parsed.success)
          return invalidFields(
            "guest.invalid",
            parsed.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            }))
          );
        const made = await tx.guests.findOrCreateByEmail({
          name: parsed.data.name,
          info: { email: parsed.data.email },
        });
        if (!made.created)
          return conflict(
            "guest.emailTaken",
            "A user with this email already exists"
          );
        guestId = made.guest.id;
      }
      const id = guestId;
      const username = await recordingShownGuests(
        tx,
        await tx.guests.listShownEventIds(id),
        async () => {
          const stored = await tx.guests.setUsername(id, input.username);
          await tx.guests.setAuthProtection(id, {
            authProtected: true,
            passwordHash,
          });
          await tx.guests.setSiteAdmin(id, true);
          return stored;
        },
        byAdmin(actor, realNow())
      );
      if (username === "taken")
        return conflict("username.taken", "That username is taken");
      await tx.bootstrapTokens.delete(hash);
      await tx.loginSessions.deleteForGuest(guestId);
      return ok(guestId);
    });
    if (!done.ok) return done;
    credentialsChanged(done.value);
    return ok(
      await start(actor, {
        guestId: done.value,
        level: "verified",
        device: input.device,
      })
    );
  };
};
