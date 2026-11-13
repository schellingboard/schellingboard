import { t } from "@lingui/core/macro";
import type { Event } from "@schellingboard/domain/event";
import { formatEventDates } from "@schellingboard/domain/time";

import { CalendarIcon } from "../../ui/icons";
import { Markdown } from "../../ui/markdown";
import { SidePanel } from "../../ui/side-panel";

export function EventDetailsPanel({
  event,
  onClose,
  onBack,
}: {
  event: Event;
  onClose: () => void;
  onBack?: () => void;
}) {
  const dates = formatEventDates(event);
  return (
    <SidePanel
      label={t`Event details`}
      title={event.name}
      onClose={onClose}
      onBack={onBack}
    >
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-fg-subtle">
        <span className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4 stroke-2" />
          <span>
            {dates && `${dates} · `}
            {event.timezone}
          </span>
        </span>
        {event.website && (
          <a className="hover:underline" href={event.website}>
            {event.website}
          </a>
        )}
      </div>
      <div className="mt-3 text-fg">
        <Markdown>{event.description}</Markdown>
      </div>
    </SidePanel>
  );
}
