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

## For later steps

- Failure notices (step 4): proposal and profile comments say only "your comment"; steps 8
  and 10 add the proposal title or profile name to `createComment`/`Target.describe`. New
  commands must give `describe` (subject by name); 1-on-1 commands name the other person
  and slot.
- No "Try again"/"open the session" action: a blind re-send gets a new idempotency key and
  bypasses the caller's bookkeeping. Revisit only with same-key resend through the caller.

## Questions
