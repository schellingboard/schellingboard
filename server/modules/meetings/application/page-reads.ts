import { loadGuestSchedules } from "@/utils/guest-clashes";
import { meetingViewsFor } from "@/utils/meeting-views";
import { meetingOptionsFor } from "@/utils/meeting-options";

export const guestSchedules = (
  q: Parameters<typeof loadGuestSchedules>[2],
  eventId: string,
  guestIds: string[]
) => loadGuestSchedules(eventId, guestIds, q);

export const meetingViews = (
  q: Parameters<typeof meetingViewsFor>[3],
  viewerId: string,
  eventId: string,
  now: Date
) => meetingViewsFor(viewerId, eventId, now, q);

export const meetingOptions = (
  q: Parameters<typeof meetingOptionsFor>[3],
  viewerId: string | null,
  recipientId: string,
  events: Parameters<typeof meetingOptionsFor>[2]
) => meetingOptionsFor(viewerId, recipientId, events, q);
