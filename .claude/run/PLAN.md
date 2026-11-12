# Plan: issue backlog

Each step is one GitHub issue. The issue holds all relevant information: read it first with
`gh issue view <n> --comments`. Follow its acceptance criteria. If the issue and the code disagree,
or the issue leaves a decision open, record it under "Questions" in PROGRESS.md. Add `fixes #<n>` to
the commit footer. Each step is one coherent commit with TDD, tests, `CHANGELOG.md` and
`docs/public/` as AGENTS.md says. If a step is too big for one commit, split it here first. Run only
the E2E specs a step touches; the user runs the full suite at the end.

## Steps

1. DONE **#691** Load test: `scripts/load/`, `make load`, `make load-test`, docs in testing.md.
2. DONE Fixed the 1000-attendee failure: snapshot no longer sums votes, two vote indexes (migration
   0061).
3. DONE **#200** Quick Voting wraps long links.
4. DONE **#1070** Multi-line profile prompt answers.
5. DONE **#901** Owners, hosts and admins delete comments (`canDelete` in the comment view).
6. DONE **#1337** "Need ideas?" dialog with a default text, editable per event (`proposal_help`,
   migration 0062).
7. DONE **#771** Phase strip on the proposals page (`phaseTimeline` in domain).
8. DONE **#861a** Shared moments data and admin (`shared_moments`, migration 0063, admin Config
   section, `moments` on the event detail).
9. DONE **#861b** Shared moments live (`moment.changed`/`moment.deleted`, snapshot `moments`) and
   the grid band with its pill; Gamma seed moments; E2E; attendee guide text.
10. **#861c** Shared moments: text and RSVP'd views. Issue section 1.3 (DayText `MomentRow`, merged
    in time order, no link, no RSVP, blockers still hidden). Test the merge in a pure util; E2E in
    the existing schedule spec. Footer `issue #861`.
11. **#861d** Shared moments: booking notice, session popup line, wrap-up. Issue sections 1.4, 1.5,
    2.3. Pure `overlappingMoment` (unit test), notice above submit in the attendee booking and edit
    forms (not admin, never disables), "During Lunch" popup line (the issue's open question 2:
    include, see PROGRESS.md). One E2E spec: admin adds Lunch on every day, attendee sees pill and
    text row, books inside the band, sees the notice. One `CHANGELOG.md` Added entry, release notes
    line. Footer `fixes #861`.
12. **#789** Attendee hover card.
13. **#683** Combobox: tap outside on mobile.
14. **#754** Error icon so red is not rose.
15. **#1145** Ctrl+Z after Markdown toolbar.
16. **#969** List and remove push devices.
17. **#684** Admin table pager: numbers, page size.
18. **#380** ESLint 10.
19. **#1169** Property-based tests for domain.

## Next steps

None.
