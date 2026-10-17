# ADR 0015: The SPA alongside Next

- **Status:** Accepted
- **Date:** 2026-10-08

## Context

[Step 5 of the path](../target-architecture/10-path-from-here.md) moves the
screens from Next to a single-page app, one family at a time, starting with the
schedule. [D1](../target-architecture/08-decisions.md#d1) and
[D9](../target-architecture/08-decisions.md#d9) already chose the stack: a
static React SPA built with Vite, TanStack Router, a small reactive store,
Tailwind with the existing tokens, no server-side rendering.
[04](../target-architecture/04-client.md) describes the end state.

What exists: the schedule (grid, agenda, kiosk, session modal) reads from a
replica seeded by SSR and kept current by the feed (ADR 0014), in
`app/(site)/[eventSlug]/replica/`. RSVPs reconcile by `command_key`. The API
under `/api/v1` covers what the schedule does (ADR 0012). The site password is
enforced in `proxy.ts`. `public/sw.js` handles push only and caches nothing.

This ADR settles how the SPA and Next live in one deployment while the screens
move, and what the first slice contains.

## Decision

### 1. The SPA owns every URL; Next moves under `/legacy`

- The legacy pages move into a real `app/legacy/` segment, so their URLs are
  `/legacy/…` and `next/link`, `redirect()` and `revalidatePath()` take the
  full path. Not `basePath: "/legacy"`: this Next refuses `basePath: false`
  rewrites to internal paths, and `proxy.ts` matchers are always prefixed with
  the base path, so the root `/api` would skip the site password. Decided by
  the user, 2026-10-08.
- Everything that is not a page stays natively at the root: `/api/**` (the API,
  the feed, bots and the legacy routes keep their URLs), `/media`, `/sw.js`,
  the icons, the manifest and `/locations/`.
- Every other path gets the SPA shell (`index.html`, `no-store`), served by
  Next. Hashed SPA assets are under `/_spa/`.
- The SPA router has a catch-all: a path it does not own is replaced by
  `/legacy` + path + query. SPA links to legacy screens point to `/legacy/…`
  directly. Legacy links to moved screens are plain `<a>` without the base
  path. Emails, push, QR codes and bookmarks keep root URLs and get to the
  right screen through the SPA.
- `proxy.ts` keeps the site password on every path, root and `/legacy` alike.
- The SPA calls only `/api/v1`, never a legacy route or server action.

When Next retires (step 7), `/legacy` goes with it and the server serves the
shell and `/_spa/` itself.

### 2. Code layout

`apps/web` is a new workspace package: `app/`, `replica/`, `commands/`,
`queries/` (paged or restricted reads such as comments and attendee lists),
`features/`, `ui/`, `pwa/`, as in [04](../target-architecture/04-client.md#layout).
It imports `packages/domain`, `packages/contracts` and `packages/api-client`
only: never `app/`, `server/`, `utils/` or `next/*`. Nothing imports
`apps/web`. `features/` never imports `api-client`. dependency-cruiser enforces
these rules.

The SPA writes its own `ui/` (nav bar, user picker, modal, toast, markdown,
form fields). Legacy pages keep theirs until they move. A moved screen's Next
code (page, components, server actions, `replica/`) is deleted in the slice
that moves it. Legacy pages that open a moved modal link to its SPA URL.

### 3. The first slice: the schedule and the session modal

- The shell: nav, user picker, theme, footer with release notes, sync
  indicator.
- Grid, agenda, kiosk, filters, and the meetings column read-only from the
  replica.
- The session modal: details, RSVP, attendee list, comments.

Add and edit session, 1-on-1 booking, the meeting modal and the password
logins stay legacy and open as full page loads.

### 4. Commands

One mechanism in `commands/` for every mutation, as in
[04](../target-architecture/04-client.md#commands-and-optimistic-updates):
predict with the domain policy, apply a pending change keyed by a new
`Idempotency-Key`, call the API, and reconcile when the feed or the response
brings the `command_key`. A network error retries with the same key; a `4xx`
removes the prediction and shows the problem code. The first commands are RSVP
add and remove and comment create. The RSVP rule moves into `packages/domain`
so that the server and the client run the same policy. Today's `rsvp-overlay`
is deleted with the Next schedule.

### 5. Persistence and offline

- The replica is written to IndexedDB, debounced, keyed by (event, guest or
  anonymous), and cleared on a user switch.
- On open, a persisted replica is shown at once as `stale`, then the feed
  resumes from its `seq`. The snapshot is refetched only on `410` or when
  nothing is persisted.
- The service worker precaches the shell and the `/_spa/` assets and serves
  the shell for SPA navigations when offline. It never caches `/api/**` or
  `/legacy/**`: the replica is the cache and knows its own staleness, which
  answers the reservation in ADR 0006.
- The server reports its build id. When it differs from the running shell's,
  the SPA offers a reload, so a precached shell never stays old.

### 6. Build and development

- `vite build` runs before `next build`. The standalone output and the Docker
  image contain the SPA files.
- `make dev` starts Next and Vite. Developers open the Vite port: Vite serves
  the SPA with HMR and proxies `/legacy` and `/api` to Next.
- E2E and `make test-e2e-docker` run against the built app, as in
  production. E2E URLs stay at the root.

### 7. Tests

Store, `apply`, commands (predict, reconcile, roll back against a fake API)
and persistence (`fake-indexeddb`) are unit tests in the existing Vitest run
with happy-dom. Screens are covered by the existing E2E suite. No component
tests in a browser runner.

## Consequences

- A cold first visit is slower than SSR: the bundle and the snapshot load
  before the schedule shows. A repeat open is faster than today and works
  offline.
- No hydration class of bugs (#734) on moved screens.
- Two UI code bases until Next retires. The SPA and legacy chrome can drift;
  accepted.
- Unmoved screens show `/legacy/…` in the address bar, and a root URL to one
  of them costs a second page load.
- Every hard-coded page path in Next code (`<a href>`, `window.location`,
  `router.push`, `redirect()`, `revalidatePath()`) must say `/legacy/…`. Client
  `fetch("/api/…")` is unaffected: the API stays at the root.
- `sw.js` changes from push-only to precaching. A broken worker can serve an
  old shell; the reload offer in section 5 is necessary, not optional.

## Alternatives

- **Same URLs, Next serves the shell per moved route.** No URL change for
  legacy screens, but every moved route needs a Next handler, and the SPA would
  not own routing until the end.
- **SPA under `/app/`, Next redirects.** Root URLs change for moved screens
  and the redirects stay forever.
- **Hono as the process with Next mounted.** Reaches the target process now,
  at the cost of a custom server, the standalone build and the jobs loop start
  moving in the same step.
- **Shared `packages/ui` with a router adapter.** One copy of the chrome, but
  it constrains the SPA's UI to what legacy pages can also render.
- **Component tests in Vitest browser mode.** Closer to a real browser; a
  second browser runner and a slower `make test`.
