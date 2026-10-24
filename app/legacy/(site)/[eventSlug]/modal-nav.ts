"use client";

import type { MouseEvent } from "react";
import type { useRouter } from "next/navigation";

/*
(anchor: MnpjIo7Y)

The session modal is the SPA's (apps/web/src/schedule/schedule-screen.tsx): a click on the
schedule pushes `?viewSession=`, Back or Close pops it, and an address opened directly is
closed by removing the param. Legacy pages link to it with a plain anchor (`viewSessionLink`).

The proposal and 1-on-1 modals still work as follows. Opening one pushes (or navigates to) a
URL so the browser's Back button dismisses it; one reached from elsewhere has no history entry
of ours to pop, so it is dismissed by removing the param.

* From the owning page (proposals list, Quick Voting, the meeting column), use
  `<Link {...viewFooLinkFromOwner(...)}>`: it sets the dismiss mode to "back".
* From a different page, use `<Link {...viewFooLinkFromElsewhere(...)}>`: "replace".
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

export function viewProposalLinkFromOwner(
  eventSlug: string,
  proposalId: string
) {
  const href = `/legacy/${eventSlug}/proposals?viewProposal=${proposalId}`;
  return {
    href,
    prefetch: false,
    scroll: false,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(e)) return;
      proposalDismissMode = "back";
      // no pushState here — unlike session modal, proposal modal is RSC-rendered, so we want normal navigation
    },
  };
}

export function viewProposalLinkFromElsewhere(
  eventSlug: string,
  proposalId: string
) {
  return {
    href: `/legacy/${eventSlug}/proposals?viewProposal=${proposalId}`,
    onClick: () => {
      proposalDismissMode = "replace";
    },
  };
}

/**
 * Dismiss mode for a modal reached without going through one of the links
 * above: the notification list opens one by submitting a server action that
 * redirects into it, so no opener's onClick runs and a "back" armed by an
 * earlier schedule or proposal click would still be in force — and would pop
 * the reader off the page they just landed on.
 */
export function openingModalFromRedirect() {
  proposalDismissMode = "replace";
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

export function dismissViewProposal(router: ReturnType<typeof useRouter>) {
  if (proposalDismissMode === "back") {
    router.back();
    return;
  }
  const params = new URLSearchParams(window.location.search);
  params.delete("viewProposal");
  const query = params.toString();
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  router.replace(url, { scroll: false });
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

// Using module-level variables rather than useState/useRef,
// because it has to survive across the parent re-render triggered by navigation,
// and it isn't part of any component's render output.
//
// Every opener (viewFooLinkFromOwner / viewFooLinkFromElsewhere /
// openingModalFromRedirect) writes the mode, so the value is never inherited
// from an unrelated earlier modal. The default applies only to direct/deep-link
// opens, where "replace" is intended.
let proposalDismissMode: "back" | "replace" = "replace";
// A meeting modal is opened in place from the schedule column, and by link
// from a notification — where "replace" is what keeps Back on the site.
let meetingDismissMode: "back" | "replace" = "replace";
