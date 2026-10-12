import { adminReads } from "@/server/admin-reads";
import { pageReads } from "@/server/composition";
import { requireAdminPage } from "../require-admin";
import { LocationsManager, type AdminLocation } from "../locations-manager";

export default async function AdminLocationsPage() {
  await requireAdminPage();

  const admin = adminReads();
  const events = await pageReads().allEvents();
  const allLocations = await admin.allLocations();
  const locationIds = allLocations.map((l) => l.id);
  const eventIdsByLocation = await admin.eventIdsOfLocations(locationIds);
  const sessionLinkCounts = await admin.sessionLinkCounts(locationIds);
  const locations: AdminLocation[] = allLocations.map((location) => ({
    location,
    eventIds: eventIdsByLocation.get(location.id) ?? [],
    sessionLinkCount: sessionLinkCounts.get(location.id) ?? 0,
  }));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-fg">Locations</h1>
      <section aria-label="Locations" className="space-y-4">
        <LocationsManager
          locations={locations}
          events={events.map((e) => ({ id: e.id, name: e.name }))}
        />
      </section>
    </div>
  );
}
