import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

/** Source text is English; the dates live in the domain's `releaseNotes`. */
export const releaseHighlights: Record<string, MessageDescriptor[]> = {
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
  "5.1.0": [
    msg`**Hosting on NixOS**: a NixOS module runs SchellingBoard as a system service.`,
    msg`**Create a session from a proposal**: organizers turn a proposal into a session in one click, prefilled with its title, hosts and duration.`,
    msg`**Live notifications**: the bell and the notification list update the moment something is sent, with no reload.`,
  ],
  "5.0.0": [
    msg`**A faster, live schedule**: sessions open at once and changes to sessions, RSVP counts and rooms appear on everyone's screen without a reload. It also opens offline.`,
    msg`**Verified events and personal join links**: organizers choose whether attendees must prove who they are, and send each guest a link that signs them in.`,
    msg`**Site admins**: organizers make people site admins, who replace the shared admin password and sign in with a password or email code.`,
    msg`**An API for scripts and integrations**: organizers can set up events, rooms, guests and sessions from a script, with a reference at \`/api/v1/docs\`.`,
    msg`**Event statistics**: admins see how an event went in explained charts and searchable tables, with CSV download, and can leave out volunteer shifts or other sessions.`,
  ],
  "4.0.0": [
    msg`**Sessions at any minute, with or without a break**: organizers can start a session whenever they like, and skip the break before one such as an opening keynote.`,
    msg`**Location unavailability**: mark when a location can't be used, such as a room only free on Saturday, and attendees simply aren't offered those slots.`,
    msg`**Proposals that want a host**: hosts can ask for a co-host, a Host wanted filter finds those proposals and the ones with no host, and one click makes you a host.`,
    msg`**Search and filter the schedule**: find sessions by anything in their description, or narrow the grid and agenda to the ones you have RSVP'd to or are hosting.`,
    msg`**Longer 1-on-1s**: ask someone for 50 minutes instead of 20, or any length up to the event's longest session, as long as they are free for all of it.`,
  ],
};
