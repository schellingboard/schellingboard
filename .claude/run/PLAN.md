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
- [x] 3. Modal scroll lock (done: `useScrollLock` in `Dialog` and `ProfileModal`; no other
      `fixed inset-0` modals).
- [x] 4. Profile loading state (done: `status` prop, placeholder, `Avatar` initials under the
      image).
- [x] 5. 1-on-1 request toast (done: both entry points notify; toasts pause on hover/focus).
- [x] 6. Schedule gutter fix (done: description-row gutter cell is `sticky left-0`).
- [x] 7. Account security in Settings (done: `AccountSecuritySection`; `/account-security`
      redirects).
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
