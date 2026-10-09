import type { ChangeContext } from "@schellingboard/domain/change";
import type { Session } from "@schellingboard/domain/session";
import type { Repositories } from "@/db/container";
import { unitOfWork, type UnitOfWork } from "@/server/kernel/unit-of-work";
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

/** A unit of work whose `tx[repo][method]` fails, to test that it rolls back. */
export function uowFailingAt<R extends keyof Repositories>(
  repo: R,
  method: keyof Repositories[R] & string
): UnitOfWork {
  return {
    ...unitOfWork,
    run: (work) =>
      unitOfWork.run((tx) =>
        work({
          ...tx,
          [repo]: new Proxy(tx[repo], {
            get: (target, key, receiver) =>
              key === method
                ? () => Promise.reject(new Error(`${repo}.${method} failed`))
                : Reflect.get(target, key, receiver),
          }),
        })
      ),
  };
}
