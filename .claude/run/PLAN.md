# Run plan: leftovers of steps 3 and 4, then the SPA schedule (path step 5)

Goal: close what the feed run left open, then move the schedule and the session
modal to the SPA as [ADR 0015](../../docs/dev/adr/0015-spa-alongside-next.md)
says. Every step leaves the app shippable.

Read first: ADR 0015, ADR 0014, `docs/dev/target-architecture/04-client.md`,
`docs/dev/server.md`, `docs/dev/testing.md`.

## Settled before the run (the user, 2026-10-08)

- ADR 0015 is accepted as written. Do not reopen its decisions.
- `GET /guests?eventId=` stays limited to admins and the event's guests.
- The session modal's attendee list does not update live; it refetches on open.
- RSVPed guests are notified when a day or location delete removes or changes
  their sessions (answers ADR 0014 open question 1).
- #788 (upstream release check) is in this run, separate from the SPA's
  build-id reload offer.
- No pushes, no PRs. Commits stay local, stacked.
- Checks per step: `make format lint arch openapi-check typecheck test`. UI
  steps also run their E2E specs. Full `make test-e2e` where a step says so;
  `make test-e2e-docker` where a step says so.

## Steps

### Baseline

- [x] 1. **Full test run** on the current stack: `make test-e2e` and
      `make test-e2e-docker` (check mailpit first). Record results in PROGRESS.md.
      A failure caused by the last run's commits gets its own fix step, inserted
      here, before anything else.

### Leftovers

- [x] 2. **No "Reconnecting…" flicker** when the feed ends its 10-minute stream:
      a planned end and an immediate successful reconnect stay `live`; only a
      reconnect that takes longer than a short grace shows `reconnecting`. Unit
      test in the sync-state tests.
- [x] 3. **`utils/` helpers behind module queries**: `acting-guest`,
      `meeting-views`, `meeting-options`, `meeting-availability-form`,
      `guest-clashes`, `reminder-dispatch` stop calling `getRepositories()`; then
      extend the 16c dependency-cruiser rule to `utils/` (jobs, deliveries,
      notifications and push infrastructure allow-listed with a reason). Split
      per helper group if one commit gets too big.
- [x] 4. **Inline notifications onto reactions**: the `after()` notifications
      in `server/composition.ts` (proposal joined, commented, co-hosts added,
      meeting requested and outcome) become jobs-loop reactions to recorded
      changes. Record the change types they need. Reactions are idempotent.
      One commit per family (4a proposals and comments, 4b sessions, 4c
      meetings). Test each: the use case records the change; the reaction
      notifies once, also when run twice.
- [x] 5. **Tell attendees about cascades**: a day or location delete that removes
      or changes a session notifies its RSVPed guests (in-app, plus email and
      push as their settings allow). Event and guest deletes stay silent. Mark
      ADR 0014 open question 1 answered and document it in `docs/dev/server.md`.
      CHANGELOG, `docs/public/`.

### SPA preparation, inside Next

- [x] 6. **RSVP rule in `packages/domain`**: the policy the RSVP use case runs
      (phase, capacity, guest state) moves to domain as a pure function returning
      a reason code; the server calls it. Unit tests in domain.
- [x] 7. **API for the shell**:
  - [x] 7a. Choosing an open guest name and signing out under `/api/v1` (a
        protected name answers with a problem that tells the SPA to send the
        user to the legacy login). The server actions call the same use case.
  - [x] 7b. Server time and build id: the snapshot and the feed heartbeat carry
        the server's `now` (the fake clock included); `GET /api/v1/health`
        returns the build id and version. Release notes data moves out of
        `app/` to where both Next and the SPA can import it.
- [x] 8. **Next under `/legacy`** (decided by the user, 2026-10-08: not
      `basePath`, which this Next cannot combine with root API rewrites and
      whose proxy matchers it prefixes): the pages in `(login)`, `(site)` and
      `admin` move into `app/legacy/`; `/api`, `/media`, `/sw.js`, the icons,
      the manifest and `/locations/` stay at the root. Until the SPA exists,
      every other root page path redirects to `/legacy` + path (query kept).
      Fix hard-coded page paths (`<a href>`, `window.location`, `router.push`,
      `redirect()`, `revalidatePath()`, cookie paths, `modal-nav.ts`; email and
      push links stay at the root). `proxy.ts` gates both. Full
      `make test-e2e` and `make test-e2e-docker`. CHANGELOG (address bar shows
      `/legacy/`), self-hosting docs if a proxy rule changes.

### SPA

- [x] 9. **`apps/web` scaffold**: workspace package (Vite, React, TanStack Router,
      Tailwind with the existing tokens, TS project references); build output
      served by Next as the shell (`no-store`) for every non-rewritten root path,
      assets under `/_spa/`; a catch-all route forwarding to `/legacy` (so the
      app behaves as after step 8); dependency-cruiser rules from ADR 0015 §2;
      Vitest with happy-dom for `apps/web`; `make dev` starts Vite in front of
      Next (proxy `/legacy`, `/api`); `vite build` before `next build`;
      Dockerfile and standalone output carry the files. Docs: getting-started,
      `docs/dev/` on the new package. Full `make test-e2e` and
      `make test-e2e-docker`.
  - [x] 9a. Package, tokens shared in `styles/tokens.css`, build, arch rules,
        Vitest project, catch-all forwarding (unit tests).
  - [x] 9b. Next serves the shell and `/_spa/` assets; the proxy redirect goes.
  - [x] 9c. `make dev` with Vite in front, Dockerfile, docs, full E2E tiers.
- [x] 10. **Replica in the SPA**: `apps/web/src/replica/` from today's
      `app/(site)/[eventSlug]/replica/` (store, `apply`, feed client, sync state
      with step 2's fix, selectors), plus a clock offset from step 7b's server
      time, and IndexedDB persistence keyed by (event, guest or anonymous),
      cleared on a user switch; a persisted replica opens as `stale` and resumes
      the feed from its `seq`. The legacy copy stays until step 16. Unit tests
      (`fake-indexeddb`).
  - [x] 10a. Copy store, `apply`, sync state, feed client, live replica and
        selectors into `apps/web/src/replica/` with their tests.
  - [x] 10b. Clock offset from the snapshot's `now` and the feed ping.
  - [x] 10c. IndexedDB persistence; a persisted replica opens `stale`.
- [x] 11. **Commands and queries**: the command mechanism (predict with the
      domain policy, pending change keyed by `Idempotency-Key`, call, reconcile by
      `command_key` from the feed or the response, retry with the same key on a
      network error, roll back on `4xx`); RSVP add and remove and comment create.
      `queries/` for the attendee list and paged comments. Unit tests against a
      fake API.
  - [x] 11a. Command core (`commands/runner.ts`) and RSVP add and remove.
  - [x] 11b. Comment create.
  - [x] 11c. `queries/`: attendee list and paged comments.
- [ ] 12. **The shell**: `ui/` primitives, layout, nav, user picker (step 7a),
      theme (ADR 0005 cookie), footer with version and release notes, sync
      indicator, error boundary, the dev toolbar's time travel when dev tools are
      on. Links to unmoved screens go to `/legacy/…` directly.
- [ ] 13. **Schedule screens**: grid, agenda, filters, now line, day fold, drag
      to pan, scroll restoration, and the meetings column read-only from the
      replica (booking and the meeting modal link to legacy). Not routed yet:
      the catch-all still forwards `/{slug}`.
- [ ] 14. **Kiosk** on the SPA schedule, same behavior as today.
- [ ] 15. **Session modal** as a search param over the schedule: details, RSVP,
      attendee list, comments; edit and delete link to legacy.
- [ ] 16. **The SPA takes the schedule**: the router owns `/{slug}` and the
      session modal; delete the Next schedule page, its components, server
      actions, `replica/` and the overlay; legacy pages link to the SPA schedule
      and modal with plain `<a>` (`modal-nav.ts`). Adapt the E2E specs that break.
      Full `make test-e2e`. CHANGELOG, `docs/public/`, release-notes highlight.
- [ ] 17. **Offline and reload offer**: `sw.js` precaches the shell and `/_spa/`
      assets and serves the shell for SPA navigations offline; never caches
      `/api/**` or `/legacy/**`; push unchanged. The SPA compares the running
      build id with `/api/v1/health` and offers a reload. E2E: open the schedule,
      go offline, reopen it, see it marked as not current. Full `make test-e2e`
      and `make test-e2e-docker`. CHANGELOG, `docs/public/`.
- [ ] 18. **Upstream release check (#788)**: the server checks the GitHub
      releases feed at most daily and caches the result (browsers never contact
      GitHub); an endpoint returns current and latest version and date; the SPA
      and legacy footers show a red dot with both versions and a link to the
      update docs. Visible to admins only. Works with no network (no dot).
      `fixes #788`.

### Close

- [ ] 19. **Docs**: `04-client.md`, `07-repo-and-rules.md` and `10-path-from-here.md`
      against the code (step 5 started, schedule moved); `docs/dev/server.md`;
      public docs and CHANGELOG checked; release-notes highlights. Final
      `make test-e2e-docker`.
- [ ] 20. **Finish**: summary in PROGRESS.md, then delete `.claude/run/`.

## Next to plan

- Move the next screen families: proposals and voting, people and meetings,
  settings, admin (path step 5).
- Steps 6 (identity and roles) and 7 (retire Next).
