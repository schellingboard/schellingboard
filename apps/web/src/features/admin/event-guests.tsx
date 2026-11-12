import { t } from "@lingui/core/macro";

import type { AdminEventCalls } from "../../commands/admin-events";
import type { AdminGuest } from "../../queries/admin-guests";
import type { OnParams } from "../../ui/list-paging";
import { AssignmentManager } from "./assignment-manager";
import { MailLinks, NewLink } from "./join-links";

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
      title={t`Guests`}
      rows={guests}
      isAssigned={(g) => g.eventIds.includes(eventId)}
      searchText={(g) => [g.name, g.email]}
      searchPlaceholder={t`Search name or email…`}
      emptyMessage={t`No users match.`}
      columns={[
        { header: t`Name`, cell: (g) => g.name },
        {
          header: t`Email`,
          cell: (g) => g.email,
          cellClassName: "text-fg-subtle",
        },
        {
          header: t`Join link`,
          cell: (g) => <NewLink eventId={eventId} guest={g} calls={calls} />,
        },
      ]}
      extra={(selectedIds) => (
        <MailLinks eventId={eventId} selectedIds={selectedIds} calls={calls} />
      )}
      detail={(g) => (
        <>
          <p className="font-medium text-fg">{g.name}</p>
          <p className="truncate text-fg-subtle">{g.email}</p>
          <NewLink eventId={eventId} guest={g} calls={calls} />
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
