import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";
import type { ReleaseCheck, UpdateStatus } from "./release-check";

export function createUpdateUseCases(deps: {
  check: ReleaseCheck;
  version: () => string;
}) {
  return {
    getUpdateStatus(actor: Actor): Result<UpdateStatus | null> {
      if (!actor.admin) return ok(null);
      return ok(deps.check.status(deps.version()));
    },
  };
}

export type UpdateUseCases = ReturnType<typeof createUpdateUseCases>;
