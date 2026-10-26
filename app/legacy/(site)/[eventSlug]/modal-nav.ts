"use client";

import type { MouseEvent } from "react";

/*
(anchor: MnpjIo7Y)

The session modal is the SPA's (apps/web/src/features/schedule/schedule-screen.tsx): a click on the
schedule pushes `?viewSession=`, Back or Close pops it, and an address opened directly is
closed by removing the param. Legacy pages link to it with a plain anchor (`viewSessionLink`).

The proposal modal is the SPA's too (apps/web/src/app/proposals-pages.tsx); legacy pages link to
it with a plain anchor (`viewProposalLink`).

The 1-on-1 modal still works as follows. Opening it pushes (or navigates to) a URL so the
browser's Back button dismisses it; one reached from elsewhere has no history entry of ours to
pop, so it is dismissed by removing the param.

* From the meeting column, use `<Link {...viewMeetingLinkFromOwner(...)}>`: it sets the dismiss
  mode to "back".
* When opened by a server-action redirect (the notification list), call
  `openingModalFromRedirect()` from the click that submits the action.
*/

export function viewSessionLink(
  eventSlug: string,
  sessionId: string,
  currentSearchParams = new URLSearchParams()
) {
  const params = new URLSearchParams(currentSearchParams);
  params.set("viewSession", sessionId);
  return { href: `/${eventSlug}?${params.toString()}` };
}

export function viewProposalLink(eventSlug: string, proposalId: string) {
  return { href: `/${eventSlug}/proposals?viewProposal=${proposalId}` };
}

/**
 * Dismiss mode for a modal reached without going through one of the links
 * above: the notification list opens one by submitting a server action that
 * redirects into it, so no opener's onClick runs and a "back" armed by an
 * earlier schedule or proposal click would still be in force — and would pop
 * the reader off the page they just landed on.
 */
export function openingModalFromRedirect() {
  meetingDismissMode = "replace";
}

export function viewMeetingLinkFromOwner(
  currentSearchParams: URLSearchParams,
  eventSlug: string,
  meetingId: string
) {
  const params = new URLSearchParams(currentSearchParams);
  params.set("viewMeeting", meetingId);
  const href = `/legacy/${eventSlug}?${params.toString()}`;
  return {
    href,
    prefetch: false,
    scroll: false,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(e)) return;
      e.preventDefault();
      // As with the session modal: open it now, without an RSC roundtrip.
      window.history.pushState(null, "", href);
      meetingDismissMode = "back";
    },
  };
}

export function dismissViewMeeting() {
  if (meetingDismissMode === "back") {
    window.history.back();
    return;
  }
  const params = new URLSearchParams(window.location.search);
  params.delete("viewMeeting");
  const query = params.toString();
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState(null, "", url);
}

// Mirror next/link's own modifier-key check so plain clicks are handled in
// place, but Cmd/Ctrl/Shift/middle clicks fall through to the browser's normal
// "open in new tab/window" behavior.
export function isPlainLeftClick(e: MouseEvent<HTMLAnchorElement>) {
  return (
    !e.defaultPrevented &&
    e.button === 0 &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  );
}

// Module-level rather than useState/useRef: it has to survive the parent
// re-render triggered by navigation and is not part of any render output.
// A meeting modal is opened in place from the schedule column, and by link
// from a notification — where "replace" is what keeps Back on the site.
let meetingDismissMode: "back" | "replace" = "replace";
