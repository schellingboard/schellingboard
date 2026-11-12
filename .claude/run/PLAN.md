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
10. DONE **#861c** Shared moments in the agenda (`moments` on `agendaGroups`, `showsMoments`).
11. DONE **#861d** Shared moments: booking notice, popup line, E2E, changelog (`overlappingMoment`).
12. DONE **#789** Attendee hover card (`PersonLink`, `PersonCardsProvider`; sessions, proposals,
    comments, 1-on-1 title).
13. DONE **#683** Combobox closes on an outside tap (document `pointerdown`, click swallowed).
14. DONE **#754** Warning icon on field errors, failure toasts and the form error summary.
15. DONE **#1145** Toolbar edits use `execCommand` on the changed range (undoable).
16. DONE **#969** Settings lists push devices (`/me/push-devices`) with Turn off.
17. DONE **#684** `Pager` (numbers, First/Last, rows per page; `pageSize` URL param).
18. DONE **#380** ESLint 10 (dependabot ignore removed; typescript-eslint packages dropped).
19. DONE **#1169** Property tests (`tests/unit/*.property.test.ts`) for slots, meeting-slots,
    day-window, reminder-schedule, vote stats.
20. DONE **#607** Time format setting (`TimeFormatProvider`, `useTimeFormat`, cookie
    `sb-time-format`).
21. DONE **#993** "My comments" (`GET /me/comments`, `/comments`, `my-comments-screen.tsx`).
22. DONE **#1046** "Ask them to open up" (`meeting_nudges`, migration 0064, `askToOpenUp`,
    `meetingNudge.*` changes, `nudges` on meeting-options). 22a. DONE **#1587** "My schedule" menu
    on the grid (z-index on the sticky filter bar). 22b. DONE Share button removed from the shared
    `SidePanel` (all panels). 22c. DONE #1588 **Bug** Admin, editing an event: icons are shown by
    name only, not drawn. Show the icons (find the picker/list; keep the name as accessible label).
    Issue first (Bug, High, `component: admin`). 22d. DONE #1589 **Bug** Grid schedule: no line
    above the room-name header row between one day and the next. Add it. Issue first (Bug, Medium,
    `component: scheduling`). 22e. DONE #1590 **Bug** Side panel: "<- Profile" back link (opened
    from a session, then a host) has the arrow too low and not aligned with the text. Also: the
    panel title for a person is their name (shortened with an ellipsis when long, full name on
    hover/`title`) instead of "Profile"; the back link label should follow the same rule. Same
    header component as the bug, so one commit; adapt the tests that assert "Profile". Issue first
    (Bug, Low, `component: ui/ux`). 22f. DONE Analysis (no code): findings and open decisions in
    PROGRESS.md ("22f survey"). 22g. DONE #1591 **Phase bar** (`ui/phase-bar.tsx`, `share` on
    `phaseTimeline`). 22h. DONE Proposals and attendee toolbars share `ui/list-toolbar.tsx` (grid
    areas; the Agenda bar is a sticky bar with a menu, a different shape, left as is).
23. **#831** (Medium) Owner decision: every long list is paginated with the shared `Pager` (default
    50, sizes 25/50/100, `page`/`pageSize` URL params). Survey: already on `Pager`: admin
    guests/proposals/sessions/assignments, My comments. Counts and "Clashes" are computed on the
    full set, the result is paged. Search/filter resets to page 1; sort keeps the size. 23a. DONE
    **#831a** `Pager` 50 default; proposals list and directory paged. 23b. DONE **#831b**
    Notifications (client pages over loaded rows, "Older" kept) and event list. "Load more comments"
    stays: it is a thread, not a list. 23c. **#831c** Agenda (`agenda-view.tsx`): page the flat
    items by start time, days and moments kept, counts and Clashes on the full set. Hard parts:
    reveal-session, match stepper, now line, day folds and scroll restoration must reach into the
    right page; decide and record. `issue #831`. 23d. **#831d** Admin rest: `stats-table.tsx` own
    pager (`useState`) to `Pager` with URL params, `events-screen.tsx`, `locations-screen.tsx`,
    `event-meetings.tsx`, event guest and location lists if long. Footer `fixes #831`.
24. DONE **#1328a** (Medium) i18n foundation: Lingui, `apps/web/src/i18n/`, `en` catalog, scripts
    and Makefile targets, `<html lang>`. Issue step 1.
25. **#1328b** Locale storage: `guests.locale`, `PATCH /me`, browser fallback, Settings switcher
    (hidden while one locale exists). Issue step 2.
26. **#1328c** Locale-aware formatting, builds on #607. Issue step 3.
27. **#1328d** Guardrails: lint rule, extract/missing-key check, pseudo-locale. Issue step 4.
28. **#1328e** Externalize strings, one commit per area (a to g of issue step 5); split into PLAN.md
    steps when reached.
29. **#1328f** Server side: emails and notifications per recipient locale. Issue step 6.
30. **#1328g** German translation, glossary, switcher on, E2E, changelog. Issue step 7. Only the
    last commit says `fixes #1328`; earlier ones say `issue #1328`.
31. **#1585** (Low) Hover cue on duration options, toast after session save/delete.
32. **#204** (Low) Searchable Combobox for every select with a long list.
33. **#1108** (Low) Arrival and departure times on attendee profiles.
34. **#629** (Low) Attendee labels (Orga team, Volunteer, Sponsor).

## Next steps

None.
