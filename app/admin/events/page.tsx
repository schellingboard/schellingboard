import { pageReads } from "@/server/composition";
import { requireAdminPage } from "../require-admin";
import { EventsManager } from "./events-manager";

export default async function AdminEventsPage() {
  await requireAdminPage();

  const events = await pageReads().allEvents();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-fg">Events</h1>
      <section aria-label="Events" className="space-y-4">
        <EventsManager events={events} />
      </section>
    </div>
  );
}
