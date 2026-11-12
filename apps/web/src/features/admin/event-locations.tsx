import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import type { AdminEventCalls } from "../../commands/admin-events";
import type { AdminLocation } from "../../queries/admin-locations";
import type { OnParams } from "../../ui/list-paging";
import { AssignmentManager } from "./assignment-manager";

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
  onParams: OnParams;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  return (
    <AssignmentManager
      key={eventId}
      title={t`Locations`}
      rows={locations}
      isAssigned={(l) => l.eventIds.includes(eventId)}
      searchText={(l) => [l.name]}
      searchPlaceholder={t`Search name…`}
      emptyMessage={t`No locations match.`}
      columns={[
        { header: t`Name`, cell: (l) => l.name },
        {
          header: t`Capacity`,
          cell: (l) => l.capacity,
          cellClassName: "text-fg-subtle",
        },
      ]}
      detail={(l) => {
        const capacity = l.capacity;
        return (
          <>
            <p className="font-medium text-fg">{l.name}</p>
            <p className="text-fg-subtle">
              <Trans>Capacity: {capacity}</Trans>
            </p>
          </>
        );
      }}
      params={params}
      onParams={onParams}
      assign={(ids, key) => calls.assignLocations(eventId, ids, key)}
      remove={(ids, key) => calls.removeLocations(eventId, ids, key)}
      onChanged={onChanged}
    />
  );
}
