# Progress

Steps 1 (c344e56d) and 2 done.

- Panel: `ui/side-panel.tsx`; history: `app/panel-history.ts` (`PanelItem` union: session,
  proposal); host: `app/panel-host.tsx`; links opened in the panel via the `SpaLinks` intercept;
  spike result in ADR 0020.
- Landing routes (`session-landing.tsx`, `proposal-landing.tsx`) replace the entry with the list
  page and push the panel; old `?view...=` params do the same from the page components.
- The panel is `role="dialog" aria-modal="false"`, so E2E `dialog` locators still work.
- Next: step 3. Add a `profile` item (`/guests/:id`); the host must render outside `EventLayout`
  (the profile panel opens over any page, including `/guests`).

## Questions

None.
