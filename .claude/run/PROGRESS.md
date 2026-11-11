# Progress

## Decisions

- #789: card for host/attendee names, proposal hosts, comment authors, the 1-on-1 title and the
  booking rows; not the Liked-by list (a whole-row link that already shows the avatar). The
  directory loads on first hover (retry after an error at most every 30s); the hover card has its
  own directory query besides the directory screens' (sharing needs a refactor). `Tooltip` gained
  `interactive`, `as`, a describedby render prop, opens late content, and stacks at z-70.

- #861d: `schedule-grid.webp` and `og-image.jpg` recaptured (Gamma, so the keynote band shows).
  Release note: shared moments replaced the API highlight (organizers-only). No E2E has an attendee
  see a moment an admin made: the new event has no rooms.

- #861c: the agenda lists moments except under a search, Hidden or Clashes (`showsMoments`); My
  schedule keeps them. The text view is the Agenda view.

- #861b: day bands are absolutely positioned in the day grid (`MomentBands`), so cells keep their
  auto-placement; `DayWithSessions.moments` feeds the agenda too. The attendee guide screenshot
  `schedule-grid.webp` was not recaptured (`make screenshots`); do it at the end.

- #861a: moments have no `version`; of two admin edits at once the last wins (accepted).

## Problems

- #200: not checked in a browser at 390px (long URL, fixed vote bar); CSS read only.

## Questions

- #691: the script uses the API, not a browser, so identity requests per navigation (#1148) are
  counted as one per page load only.

- tests/unit/stats/correlation.test.ts "spearman property" failed once under fast-check in
  `make test-coverage`, passed on rerun; flaky, unrelated.

- #771: `getCurrentPhase` (earliest running phase, no production callers) and `phaseTimeline`
  (latest running) disagree where phases overlap; delete or align `getCurrentPhase`.

- #861 open questions, defaults assumed by the split (the proposal's, owner liked it): name "Shared
  moments" (owner unsure, no better one); amber `warning` colour; "During Lunch" popup line included
  in step 11; closing #465 is for the maintainer. Phase 1 admin ships before attendees see anything,
  so the changelog entry waits for step 11.

## Next step

Step 14.
