export const dynamic = "force-dynamic";

import SummaryPage from "./summary-page";
import { pageReads } from "@/server/composition";
import { redirect } from "next/navigation";
import { compareEventsByStart } from "@schellingboard/domain/event";

export default async function Home() {
  const reads = pageReads();
  const events = await reads.allEvents();
  const sortedEvents = events.sort(compareEventsByStart);
  if (sortedEvents.length > 1) {
    const { title, description } = await reads.siteSettings();
    return (
      <SummaryPage
        events={sortedEvents}
        title={title}
        description={description}
      />
    );
  } else if (sortedEvents.length === 1) {
    const eventSlug = sortedEvents[0].slug;
    redirect(`/legacy/${eventSlug}`);
  } else {
    return <p>No events found.</p>;
  }
}
