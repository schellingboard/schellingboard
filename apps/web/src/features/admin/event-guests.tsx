import { t } from "@lingui/core/macro";
import { useRef, useState } from "react";

import type { AdminEventCalls } from "../../commands/admin-events";
import type { AdminLabelCalls } from "../../commands/admin-labels";
import { failureMessage } from "../../commands/mutation";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminGuest } from "../../queries/admin-guests";
import type { AdminLabel } from "../../queries/admin-labels";
import type { OnParams } from "../../ui/list-paging";
import { PeoplePicker } from "../../ui/people-picker";
import { AssignmentManager } from "./assignment-manager";
import { MailLinks, NewLink } from "./join-links";

function GuestLabels({
  eventId,
  guest,
  labels,
  calls,
  onChanged,
}: {
  eventId: string;
  guest: AdminGuest;
  labels: AdminLabel[];
  calls: AdminLabelCalls;
  onChanged: () => void;
}) {
  const worn = labels
    .filter((l) => l.guestIds.includes(guest.id))
    .map((l) => l.id);
  const [shown, setShown] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wanted = useRef(worn);
  const mutation = useFormMutation({
    call: (key) => calls.setGuestLabels(eventId, guest.id, wanted.current, key),
    explainRefusals: true,
  });
  const { name } = guest;

  const change = async (ids: string[]) => {
    wanted.current = ids;
    setShown(ids);
    setError(null);
    const answer = await mutation.submit();
    if (!answer) return;
    if (!answer.ok) setError(failureMessage(answer));
    setShown(null);
    onChanged();
  };

  return (
    <div className="min-w-48 space-y-1">
      <PeoplePicker
        people={labels}
        selected={shown ?? worn}
        onChange={(ids) => void change(ids)}
        ariaLabel={t`Labels of ${name}`}
        placeholder={t`Add a label…`}
      />
      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export function EventGuestsManager({
  eventId,
  guests,
  labels,
  params,
  onParams,
  calls,
  onChanged,
}: {
  eventId: string;
  guests: AdminGuest[];
  labels: AdminLabel[];
  params: URLSearchParams;
  onParams: OnParams;
  calls: AdminEventCalls & AdminLabelCalls;
  onChanged: () => void;
}) {
  const labelsOf = (g: AdminGuest) =>
    labels.length > 0 && g.eventIds.includes(eventId) ? (
      <GuestLabels
        eventId={eventId}
        guest={g}
        labels={labels}
        calls={calls}
        onChanged={onChanged}
      />
    ) : null;
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
        ...(labels.length > 0 ? [{ header: t`Labels`, cell: labelsOf }] : []),
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
          {labelsOf(g)}
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
