import { releaseNotes } from "@schellingboard/domain/release-notes";

export interface Release {
  version: string;
  date: string | null;
}

export interface ReleaseCheckDeps {
  /** The newest published release; null when none, or the check is turned off. */
  fetchLatest: () => Promise<Release | null>;
  now: () => Date;
}

export interface UpdateStatus {
  current: Release;
  latest: Release | null;
  updateAvailable: boolean;
}

const DAY_MS = 24 * 3_600_000;
const RETRY_MS = 3_600_000;

const numbers = (version: string) =>
  /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version)?.slice(1).map(Number);

function isNewer(latest: string, current: string) {
  const a = numbers(latest);
  const b = numbers(current);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

export function createReleaseCheck({ fetchLatest, now }: ReleaseCheckDeps) {
  let latest: Release | null = null;
  let validUntil = 0;
  let pending: Promise<void> | undefined;

  const refresh = async () => {
    const at = now().getTime();
    try {
      latest = await fetchLatest();
      validUntil = at + DAY_MS;
    } catch {
      validUntil = at + RETRY_MS;
    }
  };

  return {
    // Stale while revalidating: an admin's page never waits for GitHub, so
    // the first answer after a start or an expiry may still lack the release.
    status(running: string): UpdateStatus {
      if (now().getTime() >= validUntil)
        pending ??= refresh().finally(() => (pending = undefined));
      const note = releaseNotes.find((r) => `v${r.version}` === running);
      return {
        current: { version: running, date: note?.date ?? null },
        latest,
        updateAvailable: !!latest && isNewer(latest.version, running),
      };
    },
  };
}

export type ReleaseCheck = ReturnType<typeof createReleaseCheck>;
