"use client";

import type { MouseEvent } from "react";
import { isPlainLeftClick } from "@/app/legacy/(site)/[eventSlug]/modal-nav";

/**
 * A profile's canonical URL. It carries the list's search/filter/sort so that
 * closing the profile, reloading it or sharing the link all come back to the
 * view it was opened from — the modal reads the same params the list does.
 */
export function profileHref(guestId: string, listQuery: string): string {
  return listQuery
    ? `/legacy/guests/${guestId}?${listQuery}`
    : `/legacy/guests/${guestId}`;
}

/**
 * The profile a path opens, or undefined for the list itself. `/legacy/guests/edit`
 * has its own layout outside the directory's, so anything left here is an id.
 */
export function guestIdFromPath(pathname: string): string | undefined {
  const id = /^\/legacy\/guests\/([^/]+)\/?$/.exec(pathname)?.[1];
  return id === undefined ? undefined : decodeURIComponent(id);
}

export function listHref(listQuery: string): string {
  return listQuery ? `/legacy/guests?${listQuery}` : "/legacy/guests";
}

/**
 * Opens a profile in place: the list stays mounted behind the modal, so a
 * router navigation would only re-fetch what is already on screen and cost the
 * reader their place in the list. The URL is still a real one — a middle click
 * or Cmd-click falls through to the browser and loads the page properly.
 *
 * `pushState`, not `replaceState`: Back retraces the profiles actually read.
 */
export function openProfileLink(guestId: string, listQuery: string) {
  const href = profileHref(guestId, listQuery);
  return {
    href,
    prefetch: false,
    scroll: false,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(e)) return;
      e.preventDefault();
      window.history.pushState(null, "", href);
    },
  };
}
