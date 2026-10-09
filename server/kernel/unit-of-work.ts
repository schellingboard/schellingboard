import {
  readTransaction,
  writeTransaction,
  type Repositories,
} from "@/db/container";
import type { Change, RecordedChange } from "@schellingboard/domain/change";
import { publish } from "./change-subscribers";

/** The repositories bound to one use case's transaction. */
export type Tx = Repositories & { record(change: Change): void };

export interface UnitOfWork {
  /**
   * Runs `work` in one transaction, which a throw or a failure `Result` rolls
   * back. Recorded changes are published after commit, in `seq` order.
   */
  run<T>(work: (tx: Tx) => Promise<T>): Promise<T>;
  /** Runs `work` on one consistent view of the committed state. */
  read<T>(work: (q: Repositories) => Promise<T>): Promise<T>;
}

// Thrown to roll back a use case that refused; run() returns its result.
class Refused extends Error {
  constructor(readonly result: unknown) {
    super("refused");
  }
}

function isFailure(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === false
  );
}

export const unitOfWork: UnitOfWork = {
  async run<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
    const recorded: RecordedChange[] = [];
    try {
      return await writeTransaction(
        async (repositories) => {
          const pending: Change[] = [];
          const result = await work({
            ...repositories,
            record: (change) => void pending.push(change),
          });
          if (isFailure(result)) throw new Refused(result);
          for (const change of pending) {
            recorded.push(await repositories.changes.append(change));
          }
          return result;
        },
        () => publish(recorded)
      );
    } catch (e) {
      if (e instanceof Refused) return e.result as T;
      throw e;
    }
  },
  read: readTransaction,
};
