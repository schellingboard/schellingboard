# Plan: issue backlog


Each step is one GitHub issue. The issue holds all relevant information: read it first with
`gh issue view <n> --comments`. Follow its acceptance criteria. If the issue and the code disagree,
or the issue leaves a decision open, record it under "Questions" in PROGRESS.md. Add `fixes #<n>`
to the commit footer. Each step is one coherent commit with TDD, tests, `CHANGELOG.md` and
`docs/public/` as AGENTS.md says. If a step is too big for one commit, split it here first. Run only
the E2E specs a step touches; the user runs the full suite at the end.

## Steps

1. **#691** Load test with N attendees.
2. **#200** Quick Voting breaks with long links.
3. **#1070** Multi-line profile prompt answers.
4. **#901** Remove comments left on your profile.
5. **#1337** Configurable proposal help text.
6. **#771** Show current phase at a glance.
7. **#861** Shared moments (meals) on the schedule. Size L: split into several steps first.
8. **#789** Attendee hover card.
9. **#683** Combobox: tap outside on mobile.
10. **#754** Error icon so red is not rose.
11. **#1145** Ctrl+Z after Markdown toolbar.
12. **#969** List and remove push devices.
13. **#684** Admin table pager: numbers, page size.
14. **#380** ESLint 10.
15. **#1169** Property-based tests for domain.

## Next steps

None.
