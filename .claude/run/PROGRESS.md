# Progress

## Decisions

- Session branch: `claude/uow-feed`.
- Checks per step, by the user's standing instruction: `make format lint arch
openapi-check typecheck test-coverage` (or `make test`), without E2E. E2E runs
  only for UI steps; the user runs the full E2E suite at the end.
- Step 1: ADR 0013 written with options (a), (b), (c); it recommends (c). Docs
  only, so its checks were `make format` and `make docs-dev-validate`.
- User, 2026-10-06: push no further PRs; later steps stay local jj commits
  stacked on each other. (PR #1208 holds step 1.)

- Step 1 decided: the user chose ADR 0013 option (a) on 2026-10-06 (recorded
  in its Decision; Status stays Proposed until step 18).
- 2a: WAL (`synchronous=NORMAL`), a write and a read-only connection in
  `db/container.ts`. Repository methods named `find|list|search|count|get…`
  (not `findOrCreate…`) run on the reader; every other method takes the write
  lock (`db/write-lock.ts`, on `globalThis`). `withWriter(fn)` holds the lock
  and hands over the write connection: 2b's `uow.run` wraps it. Inside
  `uow.run`, writes must go through `tx`; `getRepositories()` writes would wait
  for the held lock (deadlock).
- 2a: test databases are files in a per-run temp dir (vitest `globalSetup`,
  `inject("testDbDir")`), one per worker; a migrated template is copied before
  each test, reopened with `synchronous=OFF`. `make test`: 19.4 s before,
  21.1 s after.
- 2a: `make test-e2e-docker` must run before release (step 18): WAL adds
  `-wal`/`-shm` next to the database, and E2E seeding shares the file with
  the container through a bind mount. The public backup docs already handle
  the WAL files, so no public-doc or CHANGELOG change.

- 2b: `server/kernel/unit-of-work.ts` exports `unitOfWork` (`run`, `read`)
  and the `Tx` type; `db/container.ts` holds the SQL (`writeTransaction`,
  `readTransaction`). `run` keeps a manual `BEGIN IMMEDIATE` open across awaits
  under the write lock; a repository's own transaction inside it is a
  savepoint. A throw or a failure `Result` (`ok: false`) rolls back.
  `tx.record()` collects changes; they are appended (`changes.append`) before
  `COMMIT` and published after it, under the lock.
- 2b: `uow.read` uses a third, read-only connection behind its own lock, so
  plain reads never join its older view.
- 2b: subscribers live in `server/kernel/change-subscribers.ts`, which imports
  nothing at run time (the jobs loop is bundled for Edge too). The jobs loop
  subscribes in `startJobsLoop`; `SessionDeps.nudgeJobs` is gone, replaced by
  `uow`.
- 2b: `sessions.update`/`delete` no longer take `by` or log. The sessions
  module's `changeSession`/`removeSession(tx, …)` read the state before,
  write, and record (a change only when the version went up). Tests use
  `updateLoggedSession`/`deleteLoggedSession` from `tests/helpers/changes.ts`.
  Validation reads in the session use cases still run outside `uow.run`
  (step 3a moves them in).

- Step 4 split into 4a1–4a4 (one commit and migration per subject family),
  then 4b.
- 4a1: `versionConflict(subject, current, detail)` in `server/kernel/result.ts`
  gives `409 <subject>.versionConflict`; `AppError.current` holds the subject as
  it is now, and a route passes its view function to `problem()` to send it as
  the problem member `current` (left out without one). `versionConflictResponse`
  declares the `409` with `current` in OpenAPI. Recorded in ADR 0012 section 4.
- 4a1: the version goes up only when the row really changes (sessions: when the
  change log records a change; proposals: when `updatedTime` moves, joins
  included). The check runs in the repository's immediate transaction, so it
  is a compare-and-set. A refused update returns undefined; the use case then
  reads the current state for the conflict.
- 4a1: proposals already had `expectedUpdatedTime`. `/api/v1` replaces it with
  `expectedVersion`; the web forms keep sending `expectedUpdatedTime` until 4b,
  which drops it. Both refusals are `proposal.versionConflict` (was
  `proposal.stale`).
- 4a1: `/api/v1` is unreleased (it is under `[Unreleased]` "Added"), so there is
  no break to mark: the existing API bullet is extended instead. 4a2–4a4 add
  their subjects to its last sentence.

## Problems

None.

## Questions

None.

## Next step

3a.
