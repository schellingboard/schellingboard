import { createRoute } from "@hono/zod-openapi";
import {
  identitySchema,
  loginBodySchema,
  loginCodeBodySchema,
} from "@schellingboard/contracts/auth";
import { problem, problemDefault } from "@/server/http/problem";
import { body, json, noContent, type App } from "@/server/http/route-parts";
import type { PeopleUseCases } from "../application/use-cases";
import { setGuestCookie } from "./guest-cookie";

const requestLoginCode = createRoute({
  method: "post",
  path: "/auth/login-code",
  tags: ["auth"],
  description:
    "Emails the guest a single-use login code and link. `auth.codeRecentlySent` (409) while a code sent within the last minute is still valid; `auth.codeSpent` (409) when it has no guesses left; `auth.tooManyEmails` (429); `auth.mailUnavailable` (503) when the server cannot send email; `auth.mailFailed` (503) when sending failed.",
  request: { body: body(loginCodeBodySchema) },
  responses: { 204: noContent("The code was emailed"), ...problemDefault },
});

const logIn = createRoute({
  method: "post",
  path: "/auth/login",
  tags: ["auth"],
  description:
    "Logs in as a guest with the password or an emailed login code, and sets the guest cookie. `auth.credentialWrong` (403) for a wrong or expired password or code; `auth.tooManyAttempts` (429) while the password is locked, when a code still works.",
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

export function addAuthRoutes(app: App, people: () => PeopleUseCases) {
  app.openapi(requestLoginCode, async (c) => {
    const result = await people().requestLoginCode(c.req.valid("json").guestId);
    if (!result.ok) return problem(result.error);
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

  app.openapi(signOut, async (c) => {
    setGuestCookie(c, await people().signOut(c.var.actor));
    return c.body(null, 204);
  });
}
