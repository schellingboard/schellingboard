import { createRoute } from "@hono/zod-openapi";
import {
  bootstrapBodySchema,
  identitySchema,
  joinBodySchema,
  joinResultSchema,
  loginBodySchema,
  loginCodeBodySchema,
  resetBodySchema,
  resetLinkBodySchema,
} from "@schellingboard/contracts/auth";
import { problem, problemDefault } from "@/server/http/problem";
import { body, json, noContent, type App } from "@/server/http/route-parts";
import type { PeopleUseCases } from "../application/use-cases";
import { setGuestCookie } from "./guest-cookie";

const targetOf = ({
  guestId,
  identifier,
}: {
  guestId?: string;
  identifier?: string;
}) => guestId ?? { identifier: identifier ?? "" };

const requestLoginCode = createRoute({
  method: "post",
  path: "/auth/login-code",
  tags: ["auth"],
  description:
    "Emails the guest, named by `guestId` or by `identifier` (email or username; exactly one), a single-use login code and link. An identifier nobody holds answers 204 too. `auth.codeRecentlySent` (409) while a code sent within the last minute is still valid; `auth.codeSpent` (409) when it has no guesses left; `auth.tooManyEmails` (429); `auth.mailUnavailable` (503) when the server cannot send email; `auth.mailFailed` (503) when sending failed.",
  request: { body: body(loginCodeBodySchema) },
  responses: { 204: noContent("The code was emailed"), ...problemDefault },
});

const requestResetLink = createRoute({
  method: "post",
  path: "/auth/reset-link",
  tags: ["auth"],
  description:
    "Emails the guest, named by `guestId` or by `identifier` (exactly one; an unknown identifier answers 204 too), a single-use link to set a password; it both protects a name and recovers a forgotten password, and changes nothing until used. `auth.linkRecentlySent` (409) while a link sent within the last minute is still valid; `auth.tooManyEmails` (429); `auth.mailUnavailable` (503); `auth.mailFailed` (503).",
  request: { body: body(resetLinkBodySchema) },
  responses: { 204: noContent("The link was emailed"), ...problemDefault },
});

const resetPassword = createRoute({
  method: "post",
  path: "/auth/reset",
  tags: ["auth"],
  description:
    "Sets the password the emailed link allows and protects the name; signs no one in. Other browsers' sessions of the guest end (all of them when the name was already protected). `auth.credentialWrong` (403) for a wrong, expired or used token; `password.invalid` (400).",
  request: { body: body(resetBodySchema) },
  responses: { 204: noContent("The password is set"), ...problemDefault },
});

const logIn = createRoute({
  method: "post",
  path: "/auth/login",
  tags: ["auth"],
  description:
    "Logs in as a guest, named by `guestId` or by `identifier` (email or username; exactly one), with the password or an emailed login code, and sets the guest cookie. `auth.credentialWrong` (403) for a wrong or expired password or code; `auth.tooManyAttempts` (429) while the password is locked, when a code still works.",
  request: { body: body(loginBodySchema) },
  responses: {
    200: json(identitySchema, "The guest the browser now acts as"),
    ...problemDefault,
  },
});

const signOut = createRoute({
  method: "post",
  path: "/auth/sign-out",
  tags: ["auth"],
  description:
    "Ends this browser's login session and clears the guest cookie; harmless when signed out.",
  responses: { 204: noContent("Signed out"), ...problemDefault },
});

const bootstrap = createRoute({
  method: "post",
  path: "/auth/bootstrap",
  tags: ["auth"],
  description:
    "Spends a bootstrap link: the guest named by `guestId`, or a new one made from `name` and `email`, becomes a site admin with the given username and password, and the browser is signed in as them. `bootstrap.tokenWrong` (403) for a wrong, expired or used link; `guest.emailTaken` and `username.taken` (409).",
  request: { body: body(bootstrapBodySchema) },
  responses: {
    200: json(identitySchema, "The site admin the browser now acts as"),
    ...problemDefault,
  },
});

const join = createRoute({
  method: "post",
  path: "/auth/join",
  tags: ["auth"],
  description:
    "Exchanges a personal join link. While its guest set no password since the link was made, signs the browser in as them (verified), joins the event and sets the guest cookie. Afterwards it joins only a browser already signed in as that guest; otherwise `joined` is false and nothing changes, so the client asks for a sign-in and sends the token again. `join.tokenWrong` (403) for an unknown or replaced link.",
  request: { body: body(joinBodySchema) },
  responses: {
    200: json(joinResultSchema, "The guest and event the link names"),
    ...problemDefault,
  },
});

export function addAuthRoutes(app: App, people: () => PeopleUseCases) {
  app.openapi(requestLoginCode, async (c) => {
    const result = await people().requestLoginCode(
      targetOf(c.req.valid("json"))
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(requestResetLink, async (c) => {
    const result = await people().requestResetLink(
      targetOf(c.req.valid("json"))
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(resetPassword, async (c) => {
    const input = c.req.valid("json");
    const result = await people().resetPassword(input);
    if (!result.ok) return problem(result.error);
    if (c.var.actor.guest?.id === input.guestId)
      setGuestCookie(c, await people().signOut(c.var.actor));
    return c.body(null, 204);
  });

  app.openapi(logIn, async (c) => {
    const result = await people().logIn(c.var.actor, {
      ...c.req.valid("json"),
      device: c.req.header("user-agent")?.slice(0, 200) ?? null,
    });
    if (!result.ok) return problem(result.error);
    setGuestCookie(c, result.value);
    return c.json({ guestId: result.value.guestId }, 200);
  });

  app.openapi(bootstrap, async (c) => {
    const result = await people().bootstrapAdmin(c.var.actor, {
      ...c.req.valid("json"),
      device: c.req.header("user-agent")?.slice(0, 200) ?? null,
    });
    if (!result.ok) return problem(result.error);
    setGuestCookie(c, result.value);
    return c.json({ guestId: result.value.guestId }, 200);
  });

  app.openapi(join, async (c) => {
    const result = await people().joinWithLink(c.var.actor, {
      ...c.req.valid("json"),
      device: c.req.header("user-agent")?.slice(0, 200) ?? null,
    });
    if (!result.ok) return problem(result.error);
    const { session, ...outcome } = result.value;
    if (session) setGuestCookie(c, session);
    return c.json(outcome, 200);
  });

  app.openapi(signOut, async (c) => {
    setGuestCookie(c, await people().signOut(c.var.actor));
    return c.body(null, 204);
  });
}
