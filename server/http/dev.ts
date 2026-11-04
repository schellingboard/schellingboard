import type { Hono } from "hono";
import {
  isDevToolsEnabled,
  nowWithOffset,
  parseTimeOffset,
  readTimeOffsetCookie,
} from "@/utils/dev-clock";
import { isTrustedOrigin, siteApiRefusal } from "./gates";
import { problemResponse } from "./problem";

export function addDevRoutes(
  web: Hono,
  dispatch: (now: Date) => Promise<{ sent: number }>
) {
  web.post("/api/dev/reminders", async (c) => {
    if (!isDevToolsEnabled())
      return problemResponse({ status: 404, code: "route.notFound" });
    const refusal = isTrustedOrigin(c.req.raw)
      ? await siteApiRefusal(c.req.raw)
      : { status: 403, code: "request.crossSite" };
    if (refusal) return problemResponse(refusal);
    const now = nowWithOffset(parseTimeOffset(readTimeOffsetCookie(c.req.raw)));
    return c.json({ sent: (await dispatch(now)).sent });
  });
}
