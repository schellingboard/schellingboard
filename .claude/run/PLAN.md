# Plan: side panel for linked views

To start the run, move this file to `.claude/run/PLAN.md` and `side-panel-progress.md` to
`.claude/run/PROGRESS.md`.

Design: [ADR 0020](../../docs/dev/adr/0020-side-panel-for-linked-views.md). Read it first. Each step
is one vertical slice with TDD, its E2E specs updated, `CHANGELOG.md` and `docs/public/` in the same
commit. Run the E2E specs a step touches individually; the user runs the full suite at the end.

## Steps

1. Done: side panel and navigation, with the session.
2. Done: proposal panel, `?viewProposal=` redirects, `proposal-nav.ts` removed.
3. Done: profile panel at `/guests/:id`, hosted at the root.
4. Done: 1-on-1 panel at `/{slug}/meetings/:id`; `?viewMeeting=` redirects; booking stays a dialog.
5. Done: panels over pages of another scope; `PanelLinks` at the root, `ForeignPanelHost` opens the
   replica.
6. Done: emails and notifications link to `/{slug}/sessions|proposals|meetings/:id`; old URLs still
   redirect.
7. Done: schedule search (`q`) and unfolded days (`unfold`) in search params.
8. **Proposals list page state.** Query, filter and sort in search params (`replace`), with their
   own parse and serialize logic.
9. **Scroll per history entry.** Replace `use-scroll-restoration.ts`' one position per `event:view`
   (`sessionStorage`) with one per history entry, for the schedule, the proposals list and the
   directory.
10. **Docs and release.** Rewrite `docs/dev/web-app.md` "Opening a modal and closing it" (anchor
    MnpjIo7Y stays) and the AGENTS.md "Misc" note; one release-notes highlight; ADR status Accepted.

## Next steps

None.
