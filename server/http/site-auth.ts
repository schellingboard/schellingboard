import { createRoute } from "@hono/zod-openapi";
import { siteLoginBodySchema } from "@schellingboard/contracts/auth";
import { setCookie } from "hono/cookie";

import { peopleUseCases } from "@/server/composition";
import {
  clientIp,
  loginRetryAfter,
  recordLoginFailure,
  TOO_MANY_ATTEMPTS_ERROR,
} from "@/server/kernel/rate-limit";
import { forbidden, limited } from "@/server/kernel/result";
import {
  createAuthCookie,
  createGuestLogoutCookie,
  createLogoutCookie,
  isPasswordProtectionEnabled,
  verifyPassword,
} from "@/utils/auth";

import { problem, problemDefault } from "./problem";
import { type App, body, noContent } from "./route-parts";

const route = createRoute({
  method: "post",
  path: "/auth/site",
  tags: ["auth"],
  description:
    "Enters the site with the shared site password and sets the site cookie. Open to visitors who have not entered yet. `site.passwordWrong` (403); `auth.tooManyAttempts` (429) after repeated failures from one address.",
  request: { body: body(siteLoginBodySchema) },
  responses: { 204: noContent("The site cookie is set"), ...problemDefault },
});

const leaveRoute = createRoute({
  method: "delete",
  path: "/auth/site",
  tags: ["auth"],
  description:
    "Leaves the site: clears the site cookie and ends this browser's login session; harmless when signed out. `POST /auth/site` enters it.",
  responses: { 204: noContent("Signed out of the site"), ...problemDefault },
});

export function addSiteAuthRoute(app: App) {
  app.openapi(route, async (c) => {
    if (!isPasswordProtectionEnabled()) return c.body(null, 204);
    const key = clientIp(c.req.raw.headers);
    const wait = loginRetryAfter("site", key);
    if (wait > 0)
      return problem(
        limited("auth.tooManyAttempts", TOO_MANY_ATTEMPTS_ERROR, wait).error
      );
    if (!verifyPassword(c.req.valid("json").password)) {
      recordLoginFailure("site", key);
      return problem(forbidden("site.passwordWrong", "Invalid password").error);
    }
    const { name, value, ...options } = await createAuthCookie();
    setCookie(c, name, value, options);
    return c.body(null, 204);
  });

  app.openapi(leaveRoute, async (c) => {
    await peopleUseCases().signOut(c.var.actor);
    for (const cookie of [createLogoutCookie(), createGuestLogoutCookie()]) {
      const { name, value, ...options } = cookie;
      setCookie(c, name, value, options);
    }
    return c.body(null, 204);
  });
}
