import type { AdminEventCalls } from "../../commands/admin-events";
import type { AdminGuest } from "../../queries/admin-guests";
import { AssignmentManager } from "./assignment-manager";
import type { OnParams } from "./list-paging";

export function EventGuestsManager({
  eventId,
  guests,
  params,
  onParams,
  calls,
  onChanged,
}: {
  eventId: string;
  guests: AdminGuest[];
  params: URLSearchParams;
  onParams: OnParams;
  calls: AdminEventCalls;
  onChanged: () => void;
}) {
  return (
    <AssignmentManager
      key={eventId}
      title="Guests"
      rows={guests}
      isAssigned={(g) => g.eventIds.includes(eventId)}
      searchText={(g) => [g.name, g.email]}
      searchPlaceholder="Search name or email…"
      emptyMessage="No users match."
      columns={[
        { header: "Name", cell: (g) => g.name },
        {
          header: "Email",
          cell: (g) => g.email,
          cellClassName: "text-fg-subtle",
        },
      ]}
      detail={(g) => (
        <>
          <p className="font-medium text-fg">{g.name}</p>
          <p className="truncate text-fg-subtle">{g.email}</p>
        </>
      )}
      params={params}
      onParams={onParams}
      assign={(ids, key) => calls.assignGuests(eventId, ids, key)}
      remove={(ids, key) => calls.removeGuests(eventId, ids, key)}
      onChanged={onChanged}
    />
  );
}
