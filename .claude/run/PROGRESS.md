# Progress

## Decisions

## Problems

- #200: not checked in a browser at 390px (long URL, fixed vote bar); CSS read only.

## Questions

- #691: the script uses the API, not a browser, so identity requests per navigation (#1148) are
  counted as one per page load only.

- tests/unit/stats/correlation.test.ts "spearman property" failed once under fast-check in
  `make test-coverage`, passed on rerun; flaky, unrelated.

- #771: `getCurrentPhase` (earliest running phase, no production callers) and `phaseTimeline`
  (latest running) disagree where phases overlap; delete or align `getCurrentPhase`.

- #861 open questions, defaults assumed by the split (the proposal's, owner liked it): name
  "Shared moments" (owner unsure, no better one); amber `warning` colour; "During Lunch" popup line
  included in step 11; closing #465 is for the maintainer. Phase 1 admin ships before attendees see
  anything, so the changelog entry waits for step 11.

## Next step

Step 8.
