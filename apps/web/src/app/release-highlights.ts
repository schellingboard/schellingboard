import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

/** Source text is English; the dates live in the domain's `releaseNotes`. */
export const releaseHighlights: Record<string, MessageDescriptor[]> = {
  Unreleased: [],
  "5.3.0": [
    msg`**SchellingBoard in German, Spanish and Portuguese**: choose Deutsch, Español or Português in Settings or the footer, and the app, emails and notifications follow, on every device you use.`,
    msg`**Shared moments**: organizers mark lunch or a keynote as a striped band across every room, so hosts see when most people are away, and can still book there.`,
    msg`**A side panel for details**: sessions, proposals, 1-on-1s and profiles open beside the page, which keeps its search, filters and scroll position.`,
  ],
  "5.2.0": [
    msg`**See the schedule early**: attendees can browse, bookmark and hide sessions before scheduling opens, with RSVPs and booking switched on when it does.`,
    msg`**Spot clashes**: a Clashes filter lists your overlapping sessions and 1-on-1s, and clashing blocks get a warning icon.`,
    msg`**Know the phase**: a thin bar under the menu shows whether the event is in proposals, voting or scheduling.`,
  ],
};
