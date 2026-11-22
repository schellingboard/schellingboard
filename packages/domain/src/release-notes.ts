// The releases the footer's version button lists, with their dates. Their
// highlights are in apps/web/src/app/release-highlights.ts, keyed by version.
//
// Newest first, and one entry per release: the dates are what tells a reader
// how old the deployment in front of them is, so a release left out makes the
// newest one look older than it is. tests/unit/release-notes.test.ts fails
// until the newest release named in CHANGELOG.md has an entry here.
//
// The first entry may be the release being prepared — "Unreleased", with no
// date, written as the changes land. A deployment built from `main` is running
// exactly those changes, so it is shown like any other entry; cutting the
// release turns it into one by giving it its version and date.
//
// The highlight rules (at most five, not append-only) are in AGENTS.md.

export type ReleaseNote = {
  /**
   * Without the `v`, as CHANGELOG.md's heading writes it — or "Unreleased"
   * while the release it belongs to is still being prepared.
   */
  version: string;
  /**
   * The release date, `YYYY-MM-DD`, as CHANGELOG.md's heading writes it. Unset
   * on the unreleased entry, and the one thing that marks it as unreleased.
   */
  date?: string;
};

/** Where the footer sends an admin whose site is behind. */
export const UPDATE_DOCS_URL =
  "https://docs.schellingboard.org/self-hosting/deployment/#updating";

/** How many of the entries below the modal shows. */
export const SHOWN_RELEASES = 3;

export const releaseNotes: ReleaseNote[] = [
  {
    version: "5.3.0",
    date: "2026-11-22",
  },
  {
    version: "5.2.0",
    date: "2026-11-20",
  },
  {
    version: "5.1.0",
    date: "2026-11-18",
  },
  {
    version: "5.0.0",
    date: "2026-11-11",
  },
  {
    version: "4.0.0",
    date: "2026-10-04",
  },
  {
    version: "3.8.1",
    date: "2026-09-24",
  },
  {
    version: "3.8.0",
    date: "2026-09-12",
  },
  {
    version: "3.7.0",
    date: "2026-09-11",
  },
  {
    version: "3.6.0",
    date: "2026-09-08",
  },
  {
    version: "3.5.0",
    date: "2026-08-30",
  },
  {
    version: "3.4.2",
    date: "2026-08-24",
  },
  {
    version: "3.4.1",
    date: "2026-08-21",
  },
  {
    version: "3.4.0",
    date: "2026-08-21",
  },
];
