# Run plan: fixes from explorative testing (2026-11-08)

Goal: fix nine issues the user found by hand. UX quality comes first: no flashes of wrong state,
full keyboard use, no layout jumps. Every step leaves the app shippable.

Read first: `docs/dev/web-app.md`, `docs/dev/testing.md`, `docs/dev/coding-guidelines.md`; ADR 0014
section 9 for step 1.

## Settled with the user

- Day and location deletes notify hosts **and** RSVPed guests. Event and guest deletes stay silent.
  No per-session mails on event delete (dead links, one mail per session).
- Admin: one frame for header and all pages, left-aligned content (see step 8).
- Account security becomes a section of Settings; the old URL redirects.
- The 1-on-1 request confirmation is a toast (10 s), not a dialog step.
- Dropped: the "could not find" flash on opening the admin. Not reproducible from the code; the user
  reports again if it comes back.

## How to work (every step)

- TDD as AGENTS.md says, except where a step is marked "styling: no new test".
- Checks per step: `make format lint arch typecheck test`, then only the E2E specs the step touches
  (run them by file). No full `make test-e2e`, no `make test-e2e-docker`: the user runs E2E at the
  end.
- Visual steps: take Playwright screenshots before and after (scratchpad, not the repo) at 400 px,
  1280 px and 2560 px wide, light and dark. Look at them.
- `CHANGELOG.md` under `[Unreleased]`, `docs/public/` and `docs/dev/` in the step that changes them.
  No release-notes entry: nothing here is a highlight.
- No pushes, no PRs.

## Steps

- [x] 1. Hosts told of day/location deletes (done: reaction, docs, delete confirmations).
- [x] 2. "Who are you?" keyboard selection (done: combobox in `NamePicker`).
- [ ] 3. **Modal scroll does not move the page.** A shared `useScrollLock` (in `ui/`): while any
      modal is open, `html` gets `overflow: hidden` (ref-counted for nested dialogs, restored on
      close; `scrollbar-gutter: stable` already prevents a width jump). Use it in `ui/dialog.tsx`
      and `features/people/profile-modal.tsx`; find other `fixed inset-0` modals and use it there.
      Add `overscroll-contain` to the modal scroll containers. Red first: a Vitest test of the hook
      (lock, nested lock, restore). Check by hand: proposal modal, profile modal, session modal, on
      a long page, desktop and phone width.
- [ ] 4. **Profile opens without a false error.** `ProfileModal` shows "This person is no longer
      listed" while the directory is still loading. Pass the directory `status` from
      `app/people-pages.tsx`; while loading, show a quiet placeholder (name and avatar skeleton, no
      text); the "no longer listed" text only when loaded and absent. `ui/avatar.tsx`: the wrapper
      is `aria-hidden`, so `alt=""`; render the initials under the image so a loading or broken
      image shows initials, never alt text. Red first: component test for the loading state.
- [ ] 5. **1-on-1 request confirmation as a toast.** Both entry points
      (`features/people/     meeting-request-dialog.tsx`, `features/meetings/book-meeting.tsx`): on
      success close the dialog and
      `notify({ tone: "info", message: "Asked … You'll hear when they answer.",     autoDismissMs: 10_000 })`;
      remove `MeetingRequestSent` if unused. In `ui/notices.tsx`, pause the dismiss timer while the
      pointer is over the toast or focus is in it. Check that the toast is not hidden behind the
      schedule's bottom bar. Red first: component tests; adapt E2E that clicked "Done".
- [ ] 6. **Schedule room headers stay out of the time column.** Reproduce first with screenshots
      (scroll right, then also down). Suspected cause: in `features/schedule/day-grid.tsx` the
      gutter cell of the room-description row (line ~83) is `sticky` with `top` but no `left-0`, so
      that row slides into the gutter. Check every gutter cell is `sticky left-0` with a z-index
      above the room columns, and the corner above both. Styling: no new test.
- [ ] 7. **Account security in Settings.** Move the sections of
      `features/sign-in/account-security.tsx` into `features/settings/settings-screen.tsx` as a
      "Security" section with `id="security"`. It must work in every state the old page handled
      (unprotected name, protected name not logged in, password set; settings `REFUSALS` in
      `app/account-pages.tsx`). `/account-security` redirects (replace) to `/settings#security`;
      remove the old route component and link text. Update `docs/public/attendee-guide.md` (lines
      ~441, 456, 518), `docs/dev/web-app.md` route list, and the 2 E2E specs that use the old URL
      (reach it through the UI). Test the redirect.
- [ ] 8. **Admin: one frame, no jumps, black top overscroll.** One container for the admin header
      and `main` (max ~120rem, centered as a whole, same side padding). Every page left-aligned in
      it: the title, back link and tabs sit at the same place on every page. Forms and prose cap at
      a readable width (~48rem) but stay left; tables, the sessions grid and statistics use the full
      frame. Remove the per-page `mx-auto max-w-*` wrappers (`event-layout.tsx`, `admin-pages.tsx`
      statistics, others). Overscroll: the bounce above the black header shows the body's grey. Fix
      with a root background that is the bar colour at the top and the footer colour at the bottom
      (e.g. `html:has([data-admin-frame])` with a two-stop gradient), in light and dark; check the
      attendee shell has no such mismatch. Check on macOS-style elastic scroll if possible (Safari
      or Chrome on a trackpad); else say so in PROGRESS.md. Styling: no new test; keep existing E2E
      green.
- [ ] 9. **Wrap up.** Read every `[Unreleased]` bullet from this run against AGENTS.md limits; run
      `make precommit` minus E2E; tell the user which E2E specs to run. Delete `.claude/run/` in the
      last commit.
