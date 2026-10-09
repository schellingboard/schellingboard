export type Lock = <T>(fn: () => T | Promise<T>) => Promise<T>;

/** Runs each `fn` only after every earlier one has settled. */
export function createLock(): Lock {
  let tail: Promise<void> = Promise.resolve();
  return async (fn) => {
    const previous = tail;
    let release!: () => void;
    tail = new Promise((resolve) => (release = resolve));
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  };
}

const g = globalThis as typeof globalThis & { __dbWriteQueue?: Lock };

// On globalThis because Next can evaluate this module more than once, and two
// locks would let writes join each other's open transaction.
export const withWriteLock: Lock = (fn) => {
  g.__dbWriteQueue ??= createLock();
  return g.__dbWriteQueue(fn);
};
