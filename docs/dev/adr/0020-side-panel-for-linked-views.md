# ADR 0020: A side panel for linked views

- **Status:** Accepted
- **Date:** 2026-11-09

## Context

Session, proposal, profile and 1-on-1 details open as centred modal dialogs, each owned by one page
(`?viewSession=` on the schedule, `?viewProposal=` on the proposals list, `/guests/:id` over the
directory). A link from one to another (session → host → proposal) changes the page. The page behind
unmounts and loses its search text, unfolded days and scroll position. Closing relies on a module
flag (`proposal-nav.ts`) to decide between Back and removing a parameter.

Stacked dialogs and draggable windows were considered and rejected. Stacked dialogs hide each other
and make an unclear state when a middle one is closed. Draggable windows do not work on phones,
where most attendees use the app, and need a non-drag alternative (WCAG 2.5.7).

## Decision

1. **Views open in one side panel; tasks stay dialogs.** Session, proposal, profile and 1-on-1
   details are views. They open in a non-modal panel on the right, with no backdrop, and the page
   behind stays usable. On a narrow screen the panel fills the screen. Confirmations, booking a
   1-on-1 and the meeting request stay modal dialogs, and one can open over the panel. On a wide
   screen the panel lies over the right part of the page; the page does not lay out again. The page
   gets room at its right end the width of the panel, so it can scroll out from under it.
2. **The panel is resizable.** A drag handle on its left edge sets the width, and the content flows
   to it. The handle is a focusable separator that arrow keys also move (WCAG 2.5.7). The width has
   a minimum and a maximum and is remembered per device (`localStorage`).
3. **The panel has a stack.** A click inside the panel adds an entry, with no limit and no removal
   of duplicates. A click on the page behind starts a new stack. The panel's Back arrow (shown from
   the second entry) and browser Back remove one entry. Close returns to the page as it was left.
4. **The address bar shows the top item's own URL.** Every item has one: `/{slug}/sessions/:id`,
   `/{slug}/proposals/:id`, `/guests/:id`, `/{slug}/meetings/:id`. The page behind is kept in
   `history.state` (the "background location" pattern), so Back and a reload restore it. Opened
   without that state (a shared link, a bookmark, an email), the app shows the item's list page with
   the panel open: the schedule for a session, the proposals list, the directory, the schedule for a
   1-on-1.
5. **The page behind never unmounts** while panels open, change or close. Its own state stays in the
   component tree.
6. **Share.** The panel has a Share button: `navigator.share` where it exists (phones, the installed
   app has no address bar), else copy the item's URL. _Reversed 2026-11-11: the button is removed,
   its icon was hard to read and the address bar holds the link. The installed app has no address
   bar, so a text "Copy link" button sits at the end of the panel content, before the comments._
7. **Old addresses keep working.** `?viewSession=`, `?viewProposal=` and `?viewMeeting=` are
   replaced on arrival by the new URL with the page they were on as background. Emails already sent
   contain them.
8. **Page state survives real page changes too.** Search, filter, sort and unfolded days are search
   params, written with `replace`. Scroll position is restored per history entry.

## Spike: route masking

TanStack Router's `mask` keeps the background route mounted through a reload and Back/forward (the
real location is kept in `history.state.__tempLocation`). But building a masked location
re-canonicalises the query string, which breaks repeated keys such as `loc=a&loc=b`. The app
therefore writes those entries itself (`apps/web/src/app/panel-history.ts`), in the same shape, and
keeps the panel's stack depth in `history.state.panel`. Close travels back over the stack's depth.

## Consequences

- The panel host sits above the pages, so a panel needs its data independently of the page behind.
  Event-scoped panels over a page of another scope (a session over `/guests`) open that event's
  replica.
- `proposal-nav.ts` and its flag go; each history entry's state says how far the background is.
- The profile's previous/next through search results works only with the directory behind it.
- The panel keeps the `dialog` role, with `aria-modal="false"`, so E2E specs that find these views
  as `dialog` keep working.
