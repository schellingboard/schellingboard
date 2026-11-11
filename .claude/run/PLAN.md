# Plan: side panel for linked views

To start the run, move this file to `.claude/run/PLAN.md` and `side-panel-progress.md` to
`.claude/run/PROGRESS.md`.

Design: [ADR 0020](../../docs/dev/adr/0020-side-panel-for-linked-views.md). Read it first. Each step
is one vertical slice with TDD, its E2E specs updated, `CHANGELOG.md` and `docs/public/` in the same
commit. Run the E2E specs a step touches individually; the user runs the full suite at the end.

## Steps

1. **Panel and navigation, with the session.** Spike first: does TanStack Router's route masking
   keep the background through a reload and back/forward? If not, write the masking with
   `history.state` directly. Record the result in PROGRESS.md and the ADR. Build `ui/side-panel.tsx`
   (non-modal, over the right side, full screen when narrow, resizable by drag and arrow keys with
   the width kept per device, Back arrow, Close, Share, focus moves in and returns to the opener,
   Escape closes) and the navigation (open from page = new stack, open from panel = add, back,
   close; depth and background in `history.state`). Mount the panel host above the routes. Session
   details move to it at `/{slug}/sessions/:id`; direct open shows the schedule behind.
   `?viewSession=` redirects. Remove the module flag for sessions.
2. **Proposal panel.** `/{slug}/proposals/:id` over any event page; direct open shows the proposals
   list. `?viewProposal=` redirects. Remove `proposal-nav.ts`.
3. **Profile panel.** `/guests/:id` opens over any page; direct open shows the directory.
   Previous/next only with the directory behind.
4. **1-on-1 panel.** `/{slug}/meetings/:id`; direct open shows the schedule (read-only outside
   scheduling, as `/{slug}/meetings` does now). `?viewMeeting=` redirects. Booking stays a dialog.
5. **Panels over pages of another scope.** A session, proposal or 1-on-1 over `/guests`,
   `/notifications`, `/settings`: the host opens that event's replica, or reuses the open one.
6. **New links in emails and notifications.** `utils/notifications.ts` and the server's link
   builders emit the new URLs. Old URLs still redirect (keep their tests).
7. **Page state outside panels.** Schedule search and unfolded days, directory and proposals list
   search, filters and page in search params (`replace`); scroll restored per history entry.
8. **Docs and release.** Rewrite `docs/dev/web-app.md` "Opening a modal and closing it" (anchor
   MnpjIo7Y stays) and the AGENTS.md "Misc" note; one release-notes highlight; ADR status Accepted.

## Next steps

None.
