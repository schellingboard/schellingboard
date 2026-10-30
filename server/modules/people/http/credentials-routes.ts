import { createRoute, z } from "@hono/zod-openapi";
import {
  changePasswordBodySchema,
  credentialsSchema,
  identitySchema,
  loginSessionSchema,
  unprotectBodySchema,
  usernameBodySchema,
  usernameResultSchema,
} from "@schellingboard/contracts/auth";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { PeopleUseCases } from "../application/use-cases";
import { setGuestCookie } from "./guest-cookie";

const getCredentials = createRoute({
  method: "get",
  path: "/me/credentials",
  tags: ["auth"],
  description:
    "Whether the name this browser acts as is protected, and its username.",
  responses: {
    200: json(credentialsSchema, "The sign-in settings"),
    ...problemDefault,
  },
});

const changePassword = createRoute({
  method: "put",
  path: "/me/credentials/password",
  tags: ["auth"],
  description:
    "Changes the password of the protected name this browser is logged in to; this session stays, the others end. `auth.credentialWrong` (403) for a wrong current password; `auth.notProtected` (409); `auth.tooManyAttempts` (429).",
  request: {
    headers: idempotencyHeaders,
    body: body(changePasswordBodySchema),
  },
  responses: { 204: noContent("The password changed"), ...problemDefault },
});

const unprotect = createRoute({
  method: "post",
  path: "/me/credentials/unprotect",
  tags: ["auth"],
  description:
    "Removes the password protection. This browser keeps the name through a new claimed session (sets the guest cookie). Errors as for the password change.",
  request: { body: body(unprotectBodySchema) },
  responses: {
    200: json(identitySchema, "The guest the browser still acts as"),
    ...problemDefault,
  },
});

const setUsername = createRoute({
  method: "put",
  path: "/me/credentials/username",
  tags: ["auth"],
  description:
    "Sets or, with null, removes the username that password sign-in accepts besides the email. Usernames are lowercase. `username.taken` (409); `username.invalid` (400).",
  request: { headers: idempotencyHeaders, body: body(usernameBodySchema) },
  responses: {
    200: json(usernameResultSchema, "The username now stored"),
    ...problemDefault,
  },
});

const listLoginSessions = createRoute({
  method: "get",
  path: "/me/login-sessions",
  tags: ["auth"],
  description: "The signed-in browsers of the guest this browser acts as.",
  responses: {
    200: json(z.array(loginSessionSchema), "The live login sessions"),
    ...problemDefault,
  },
});

const revokeLoginSession = createRoute({
  method: "delete",
  path: "/me/login-sessions/{id}",
  tags: ["auth"],
  description:
    "Signs one browser of the guest out. Revoking this browser's own session also clears its cookie. `loginSession.notFound` (404) for an id that is not the guest's.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("The session ended"), ...problemDefault },
});

export function addCredentialRoutes(app: App, people: () => PeopleUseCases) {
  app.openapi(getCredentials, async (c) => {
    const result = await people().getCredentials(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(changePassword, async (c) => {
    const result = await people().changePassword(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(unprotect, async (c) => {
    const result = await people().unprotect(c.var.actor, {
      ...c.req.valid("json"),
      device: c.req.header("user-agent")?.slice(0, 200) ?? null,
    });
    if (!result.ok) return problem(result.error);
    setGuestCookie(c, result.value);
    return c.json({ guestId: result.value.guestId }, 200);
  });

  app.openapi(setUsername, async (c) => {
    const result = await people().setUsername(c.var.actor, c.req.valid("json"));
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(listLoginSessions, async (c) => {
    const result = await people().listLoginSessions(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json(
      result.value.map((s) => ({
        id: s.id,
        current: s.current,
        assurance: s.assurance,
        device: s.device,
        createdAt: s.createdAt.toISOString(),
        lastSeenAt: s.lastSeenAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
      })),
      200
    );
  });

  app.openapi(revokeLoginSession, async (c) => {
    const result = await people().revokeLoginSession(
      c.var.actor,
      c.req.valid("param")
    );
    if (!result.ok) return problem(result.error);
    if (result.value.current) setGuestCookie(c, { guestId: null });
    return c.body(null, 204);
  });
}
