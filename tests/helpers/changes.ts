import type { ChangeContext } from "@schellingboard/domain/change";
import type { Session } from "@schellingboard/domain/session";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { changeSession, removeSession } from "@/server/modules/sessions/module";

/** Who made a change, for tests that are not about who made it. */
export const BY_TEST: ChangeContext = {
  actor: { type: "system" },
  at: new Date("2026-01-01T00:00:00.000Z"),
};

/** Updates a session as a use case does, recording the change. */
export function updateLoggedSession(
  id: string,
  patch: Parameters<typeof changeSession>[2],
  by: ChangeContext = BY_TEST
): Promise<Session | undefined> {
  return unitOfWork.run((tx) => changeSession(tx, id, patch, by));
}

export function deleteLoggedSession(
  id: string,
  by: ChangeContext = BY_TEST
): Promise<void> {
  return unitOfWork.run((tx) => removeSession(tx, id, by));
}
