import { cookies } from "next/headers";
import { eventSnapshot } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import { EventProviderWrapper } from "./event-provider-wrapper";
import { serverNow } from "@/utils/dev-clock-server";
import { meetingViewsFor } from "@/utils/meeting-views";

export async function EventLayoutContent({
  eventSlug,
  children,
}: {
  eventSlug: string;
  children: React.ReactNode;
}) {
  const snapshot = await eventSnapshot(
    await resolveActor(await cookies()),
    eventSlug
  );
  if (!snapshot.ok) {
    return <div>Event not found</div>;
  }

  const now = await serverNow();
  // Clash lines rest on other guests' RSVPs, which the snapshot never holds
  // (ADR 0014 section 4).
  const me = snapshot.value.me;
  const myMeetings = me
    ? {
        guestId: me.guestId,
        meetings: await meetingViewsFor(
          me.guestId,
          snapshot.value.event.id,
          now
        ),
        availability: me.availability,
      }
    : null;

  // `now` is computed on the server so SSR and hydration agree on which days
  // default to folded (see getDefaultFoldedDayIds). It honours the dev fake
  // clock (docs/dev/adr/0004-dev-fake-clock.md).
  return (
    <EventProviderWrapper
      snapshot={snapshot.value}
      myMeetings={myMeetings}
      now={now}
    >
      {children}
    </EventProviderWrapper>
  );
}
