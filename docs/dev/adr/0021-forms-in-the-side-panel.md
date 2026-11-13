# ADR 0021: Create and edit forms open in the side panel

- **Status:** Accepted
- **Date:** 2026-11-12
- **Amends:** [ADR 0020](0020-side-panel-for-linked-views.md), decision 1 ("tasks stay dialogs")

## Context

ADR 0020 put views in the side panel and left tasks as dialogs or pages. The forms that create or
edit a proposal, a session or a profile are long, and a page for each hides what the user came from:
the schedule grid, the proposal being discussed, the directory. Writing a session while seeing the
grid (clashes, free rooms), or a proposal while reading the one beside it, is the point of the
panel.

## Decision

1. **Create and edit forms of proposals, sessions and the profile are panel kinds.** They open in
   the same panel as the views, with a URL, over the page the user came from, and are full screen on
   phones. The event details dialog is a view, so it becomes a panel too.
2. **Short tasks stay dialogs.** Confirmations, booking a 1-on-1, the meeting request, What's new,
   the map and "Liked by" do not change. Quick Voting stays a page. Settings, sign-in,
   notifications, "My comments" and the admin area keep their pages and frames.
3. **Saving closes the form, one step; deleting closes the panel.** A save returns to the entry
   under the form in the panel's stack (a proposal's view, when the form was opened from it) or to
   the page when it is the first. A delete leaves the panel, as that entry would show what is gone.
   Cancel and Close leave the panel, as for a view.
4. **Leaving a form asks first when something was entered.** The guard covers text, selects,
   checkboxes, radios and dates, and fires on Close, Cancel, Escape, the panel's Back arrow, browser
   Back and leaving the page. A control that only changes the view (a page size, a sort) opts out
   with `data-discard-ignore`; comboboxes, search boxes, number fields and file inputs are never
   counted by the DOM check. A form whose state the DOM cannot show (a photo, a combobox, a removed
   row) registers its own check with `usePanelGuard().track`.
5. **Old addresses keep working.** The routes of the former pages redirect to the panel over the
   list they belong to, as ADR 0020 does for `?viewSession=`.

## Consequences

- A form panel needs the page behind to stay mounted, which ADR 0020 already guarantees.
- Dialogs inside a form (clash confirmations, pickers) open over the panel, as they do over views.
- The 780-line session form has to work at 320 to 800 px; its inner layout may need to stack.
- E2E specs that open these forms by route change to click through the UI, and gain a cancel and
  discard case per form.
