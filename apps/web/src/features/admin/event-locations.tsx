import type { AdminEventCalls } from "../../commands/admin-events";
import type { AdminLocation } from "../../queries/admin-locations";
import { AssignmentManager, type ParamUpdates } from "./assignment-manager";

export function EventLocationsManager({
  eventId,
  locations,
  params,
  onParams,
  calls,
  onChanged,
}: {
  eventId: string;
  locations: AdminLocation[];
  params: URLSearchParams;
  onParams: (updates: ParamUpdates, options: { push: boolean }) => void;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  return (
    <AssignmentManager
      key={eventId}
      title="Locations"
      rows={locations}
      isAssigned={(l) => l.eventIds.includes(eventId)}
      searchText={(l) => [l.name]}
      searchPlaceholder="Search name…"
      emptyMessage="No locations match."
      columns={[
        { header: "Name", cell: (l) => l.name },
        {
          header: "Capacity",
          cell: (l) => l.capacity,
          cellClassName: "text-fg-subtle",
        },
      ]}
      detail={(l) => (
        <>
          <p className="font-medium text-fg">{l.name}</p>
          <p className="text-fg-subtle">Capacity: {l.capacity}</p>
        </>
      )}
      params={params}
      onParams={onParams}
      assign={(ids, key) => calls.assignLocations(eventId, ids, key)}
      remove={(ids, key) => calls.removeLocations(eventId, ids, key)}
      onChanged={onChanged}
    />
  );
}
