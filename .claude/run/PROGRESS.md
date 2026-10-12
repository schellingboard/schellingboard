# Progress

## Decisions

- Session branch: `claude/spa-schedule`. No pushes (the user's rule).
- ADR 0015 accepted on 2026-10-08.

## Step 1: baseline (2026-10-08)

- `make test-e2e`: 207 passed, 1 flaky (`profile-comments.spec.ts:95`, the known
  load-only flake; passes on retry and alone). The run exits red only because
  `failOnFlakyTests` is on locally.
- `make test-e2e-docker`: 208 passed.
- No failure comes from the last run's commits; no fix step needed.

## Step 2 (2026-10-08)

- A 2 s grace (`RECONNECT_GRACE_MS`) after any drop keeps the state `live`; the
  store cannot tell a planned stream end from a failure, so the grace covers both.
  The feed sends `retry: 1000` with its first message so browsers reconnect inside
  the grace (an integration test ties the two).
- No CHANGELOG entry: the sync indicator is itself unreleased (#1111's entry).

## Step 3a (2026-10-08)

- `acting-guest` reads the auth credentials through a new `pageReads()` query.
  The dependency-cruiser rule now covers `utils/`; the helpers still to convert
  (3b, 3c) sit on its allow-list until then.

## Step 3b (2026-10-08)

- The meeting helpers and `guest-clashes` take their repositories from the caller;
  the meetings module's page reads (`pageReads().meetingViews` and the like) bind
  them for `app/`. Their integration tests call those. Server modules keep passing their own repos.

## Step 3c (2026-10-08)

- `dispatchDueReminders` takes its repositories; `dispatchReminders()` in
  `composition.ts` serves the dev action and tests, the job loop passes the
  container itself (it is allow-listed with the other job plumbing).
- Step 3 done: the rule covers `utils/` with only jobs, notifications and push allowed.

## Step 4a (2026-10-08)

- New change types `proposal.joined` and `comment.created` (all three subject
  kinds), audience `none`: logged for the reaction, projected to no one. The
  comment entry keeps only the comment's id, author and time, not its body. The
  reaction (renamed `changeNotifications`, stored name `session-notifications`
  kept so its cursor stays) handles them. Use cases no longer take
  `notifyProposalJoined` / `notifyCommented`.
- Co-hosts added belongs to the sessions family, so it moves to 4b.
- Tests that waited for `after()` tasks now call `runJobs()`.

## Step 4b (2026-10-08)

- New change type `session.cohostsAdded` (ids of the added hosts, audience `none`),
  recorded by the four paths that created or edited a session with new hosts.
  The seed path records none, so it stays silent as before. The existing reaction
  loads the session when it runs. `notifyCohostsAdded` is no longer a use-case
  dependency.

## Step 4c (2026-10-08)

- New change types `meeting.requested` and `meeting.answered` (meeting id, plus
  the outcome for the latter; audience `none`), recorded beside `meeting.changed`
  in the request, respond and cancel use cases. The existing reaction loads the
  meeting and notifies; a meeting that is gone is skipped. No use case takes a
  notify dependency any more, so step 4 is done and `composition.ts` has no `after()`.
- Tests that waited for the inline notice now call `runJobs()`.

## Step 5 (2026-10-08)

- `recordingSessionCascade` takes `{ tellAttendees }`; the day and location
  deletes set it, event and guest deletes do not. The flag rides on the
  `session.changed` / `session.deleted` payload next to `cascade`, and the
  reaction then notifies only the RSVPed guests (hosts get nothing, as settled).
  RSVP ids were already in the `session.deleted` payload. ADR 0014 open question 1
  marked answered.

## Step 6 (2026-10-08)

- `rsvpRefusal` in `packages/domain/src/rsvp-rule.ts` returns the reason code
  (guest not in event, not the scheduling phase, own session, full). The RSVP and
  withdraw use cases call it; the repository's atomic capacity insert stays as the
  guard against a race, mapping to the same `session.full`. The admin seeding path
  (no phase gate) does not use it.

## Step 7a (2026-10-08)

- `PUT /api/v1/me/identity` (choose) and `DELETE` (sign out) return `{ guestId }`
  and set the `guest` cookie. The use case returns an `Identity` and the adapters
  (route, `selectUserAction`) build the cookie. Protected names answer
  `403 guest.protected`; logging in stays on the legacy flow. The guest cookie
  builders moved to `utils/auth-cookies.ts` (Next-free) so `server/http` can use them.

## Step 7b (2026-10-08)

- Snapshot has `now` (from the request's clock, fake clock included); the feed's
  `ping` data is `{"now"}` using the cookie's offset read at connect. Health stays
  behind the site password and returns `version` plus `buildId`, read from
  `.next/BUILD_ID` (version outside a production build; untested in Docker).
- Release notes moved to `packages/domain/src/release-notes.ts`.

## Step 8 (2026-10-08)

- `basePath` was refused by this Next (root rewrites to internal paths), so the user
  chose `app/legacy/` (ADR 0015 amended in its own commit). `(login)`, `(site)` and
  `admin` pages moved there; `proxy.ts` redirects any root path other than `/api`
  and `/media` to `/legacy` + path (query kept) and runs its gates on the path
  without the prefix. Static public files and `sw.js` are excluded by the matcher.
- Notification links stay root-relative for email and push; the in-app open action
  redirects to `/legacy` + url directly (a root hop dropped the profile modal).
- Review: the proxy matcher also skips `one-on-one.webp` (root `<img>` path); unused
  `next.svg`/`vercel.svg` removed; `legacy` is a reserved event slug; the manifest keeps
  `start_url: "/"` (redirects, and the SPA will own it) and the pinned `id`. No E2E for
  the picture: it only shows when rooms have images, which no spec sets up.
- E2E fixes were URL assertions only (`/login`, `/guests`, a slug prefix).

## Step 9a (2026-10-09)

- `apps/web` (workspace `apps/*`): Vite 8.3.0, plugin-react 6.1.1, TanStack Router
  1.170.38 (code-based routes, no router plugin), `@tailwindcss/vite` 4.3.3, happy-dom
  20.14.4, all pinned exact and at least two weeks old. Built to `apps/web/dist` with
  base `/_spa/`.
- The colour tokens, `loc-*` classes and utilities moved from `app/globals.css` to
  `styles/tokens.css`, imported by both CSS entries; the contrast tests read the new file.
- Vitest uses `projects` (`server`, and `apps/web/vitest.config.ts` with happy-dom).
- `tsc -b apps/web` joins `make typecheck`; depcruise covers `apps` with four rules.
- The catch-all route replaces the location with `/legacy` + path + query + hash
  (`window.location.replace`); a path already under `/legacy` is left alone.

## Step 9b (2026-10-09)

- The proxy no longer redirects root pages: after the site gate (admin paths skip it: the forwarded `/legacy/admin` request meets the admin gate)
  it rewrites them to `/api/spa/shell`, a route handler reading `apps/web/dist/index.html`
  from `process.cwd()` on each request (`no-store`; 503 when not built). `/_spa/**` skips
  the proxy (matcher) and `next.config.js` rewrites it to `/api/spa/assets/**` (hashed,
  immutable; 404 for anything missing, `..` or the shell file, never the shell).
- The login redirect for a root path now returns to the root path; the SPA forwards it.
- The Playwright web server runs `vite build` before `next build`.

## Step 9c (2026-10-09)

- `make dev` runs `scripts/dev.ts`: Next on `PORT + 1`, Vite on `PORT` proxying `/legacy`,
  `/api`, `/media` and the other Next paths (websockets included). Not exercised here
  beyond the config; the tiers below run against the built app.
- Dockerfile builds the SPA before Next and copies `apps/web/dist` to `/app/apps/web/dist`;
  `make test-e2e-docker` shows the standalone image serves the shell and assets from disk.
- E2E: the `page.goto` fixture sends root paths to `/legacy/...` directly (through the
  shell a click could land before hydration: the profile:577 and settings map-modal
  flakes); `pwa.spec.ts` "an old root link reaches its page" (@014-US4) covers the
  shell's forward. `--repeat-each` makes user-auth:270 fail by itself (it leaves
  Ahmad protected), so it is not a measure.
- Review fixes: `<noscript>` link to `/legacy` and an inline script copying the `sb-theme`
  cookie to `<html>` (no light flash) in `index.html`; the screenshots script uses
  `/legacy/...`; ADR 0015 now says root `/admin*` skips the site gate; spa-files test uses
  a nested temp dir. Not changed: React/tailwind/@types carets (they mirror the root
  package.json, so one copy is installed); the vacuous depcruise rules (they bite once
  `apps/web` imports packages); dev-proxy prefix matching and POST 405 (harmless).
- Final E2E after the review fixes: `make test-e2e` 209 passed at low load. At high load
  (25+) schedule-layout:252 ("grid keeps its place") failed in the full run and in
  `make test-e2e-docker` (scroll 432 vs 400, same value both times; 206 passed otherwise),
  yet passed alone 9 of 9 times, with `rsvp`+`schedule-layout` together, and in the clean
  full run. Not repeatable with `--repeat-each` (it books a fixed slot, so later repeats
  fail on the taken 18:10). Judged a load flake in the legacy grid's scroll restore, not
  the shell: the spec now goes to `/legacy` directly, as before step 9.
- `app/api/spa/**` is out of scope of the mutating-surface guard (read-only static files).
- Docs: `docs/dev/web-app.md` (new), getting-started, architecture-rules, README, nav.

## Questions

- A session that loses its only room reads `"X" moved to No location (was Room A)`
  in notices; common now with location deletes. Reword if wanted.

- `utils/guest-clashes.ts` imports `@/app/(site)/session_utils`, so `server/modules/`
  reaches `app/` transitively, which `server-does-not-reach-into-app` does not catch.
  Move the two helpers it uses to `packages/domain` or `utils/`.

## Next step

10.
