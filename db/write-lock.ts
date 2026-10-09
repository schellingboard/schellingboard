const g = globalThis as typeof globalThis & { __dbWriteLock?: Promise<void> };

// On globalThis because Next can evaluate this module more than once, and two
// locks would let writes join each other's open transaction.
export async function withWriteLock<T>(fn: () => T | Promise<T>): Promise<T> {
  const previous = g.__dbWriteLock ?? Promise.resolve();
  let release!: () => void;
  g.__dbWriteLock = new Promise((resolve) => (release = resolve));
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}
