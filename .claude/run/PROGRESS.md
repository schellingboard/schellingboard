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

- Step 1: choose the unit-of-work option in ADR 0013 (a/b/c); steps 2–3 wait for it.

## Next step

4a2 (steps 2–3 blocked).
