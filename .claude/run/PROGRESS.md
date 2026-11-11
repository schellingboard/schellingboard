# Progress

Steps 1 (c344e56d), 2, 3, 4, 5, 6, 7 and 8 done.

- Panel: `ui/side-panel.tsx`; history: `app/panel-history.ts` (`PanelItem` union: session, proposal,
  profile, meeting); host: `app/panel-host.tsx`; links opened in the panel via the `SpaLinks`
  intercept; spike result in ADR 0020.
- Landing routes (`session-landing.tsx`, `proposal-landing.tsx`) replace the entry with the list
  page and push the panel; old `?view...=` params do the same from the page components.
- The panel is `role="dialog" aria-modal="false"`, so E2E `dialog` locators still work.
- Step 3 done: `ProfilePanelHost` (`app/profile-host.tsx`) sits in the root route, which now holds
  `ShellProviders` for every page; `ProfileLinks` opens `/guests/:id` links from any page; the
  directory publishes its rows through `ProfileWalkProvider` (no rows behind = no Prev/Next).
- `landOnPanel` flushes history after its replace: a browser history merges replace + push of one
  tick into one push, which left the landed address under the panel.
- Step 4 done: `MeetingPanel` (`features/meetings/meeting-panel.tsx`) replaces the modal; the
  schedule page and `/{slug}/meetings?viewMeeting=` land on it; always over the schedule, read-only
  note in the panel outside scheduling. `BookingDialog` keeps `?bookMeeting=`. Notification links
  still emit the old URL until step 6.
- Step 5 done: `app/panel-links.tsx` (was profile-links) intercepts profile and any-event item links
  at the root; `ForeignPanelHost` (panel-host.tsx) opens the event replica when the page behind is
  not that event. Nothing renders while it loads.
- Step 6 done: link builders in `utils/notifications.ts` and `reminder-dispatch.ts` emit panel
  addresses (`?record=count` on reminders); fixtures with old URLs left as data.
- Step 7 done: the search box stays local while typing; the debounced text is written to `q` with
  `replace`. Reveal-seeded days stay local state, merged with `unfold`.
- Step 8 done: `filterFrom`/`sortFrom`/`withFilter`/`withSort` in `list-model.ts`; `openapi-check`
  cannot run here (needs a server on :3000).
- Next: step 9.

## Questions

None.
