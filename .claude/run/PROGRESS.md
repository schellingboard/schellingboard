# Progress

Step 1 done: side panel, session at `/{slug}/sessions/:id`, `?viewSession=` redirects.

- Masking spike: TanStack `mask` survives reload/Back but mangles repeated query keys, so
  `app/panel-history.ts` writes the masked entries itself (recorded in ADR 0020).
- The panel is `role="dialog" aria-modal="false"`, so E2E `dialog` locators still work.
- Landing on an address replaces the entry with the page, then pushes the panel: Close/Back never
  leave the app.
- Next: step 2. Add the proposal item to `PanelItem`; `PanelHost` is session-only today.

## Questions

None.
