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
3. **#200** Quick Voting breaks with long links.
4. **#1070** Multi-line profile prompt answers.
5. **#901** Remove comments left on your profile.
6. **#1337** Configurable proposal help text.
7. **#771** Show current phase at a glance.
8. **#861** Shared moments (meals) on the schedule. Size L: split into several steps first.
9. **#789** Attendee hover card.
10. **#683** Combobox: tap outside on mobile.
11. **#754** Error icon so red is not rose.
12. **#1145** Ctrl+Z after Markdown toolbar.
13. **#969** List and remove push devices.
14. **#684** Admin table pager: numbers, page size.
15. **#380** ESLint 10.
16. **#1169** Property-based tests for domain.

## Next steps

None.
