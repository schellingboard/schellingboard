import { SESSION_MARK_KINDS } from "@schellingboard/domain/session";
import { z } from "zod";

export const sessionMarkKindSchema = z.enum(SESSION_MARK_KINDS);

export const sessionMarkSchema = z
  .object({
    sessionId: z.string(),
    kind: sessionMarkKindSchema,
  })
  .meta({ id: "SessionMark" });

export const setSessionMarkSchema = z.object({ kind: sessionMarkKindSchema });
