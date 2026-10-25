# Progress

## Decisions

- Session branch: `claude/spa-families`. No pushes (the user's rule).
- Planned 2026-10-24; the decisions in PLAN.md are the user's.

## Carried over from the SPA schedule run

- Known load-only E2E flakes: `settings.spec.ts:67` (`goto('/legacy/admin')` aborts),
  `scheduling.spec` edit, delete and cancel (about one run in four at 8 workers),
  `profile-comments.spec.ts:95`, `profile.spec:577`, `schedule-layout.spec:252`.
  Rerun alone before blaming a change.
- Open questions 1 to 8 in `docs/dev/target-architecture/open-questions.md`; this run
  answers 3 (step 14) and maybe 7 (step 15).

## Baseline (step 1)

- `make test-e2e`: 213 passed, 1 failed (`settings.spec.ts:67`, `goto('/legacy/admin')` abort). Rerun alone: passed. No regression from the last run.

## Questions
