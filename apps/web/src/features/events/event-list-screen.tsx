import { compareEventsByStart } from "@schellingboard/domain/event";
import { formatEventDates } from "@schellingboard/domain/time";
import type { EventSummary } from "../../app/use-events";
import { toEvent } from "../../replica/selectors";
import { CalendarIcon, ChevronRightIcon, LinkIcon } from "../../ui/icons";
import { Markdown } from "../../ui/markdown";

export interface SiteInfo {
  title: string;
  description: string;
}

export function EventListScreen({
  site,
  events,
}: {
  site: SiteInfo;
  events: EventSummary[];
}) {
  const sorted = events
    .map((summary) => ({ summary, event: toEvent(summary) }))
    .sort((a, b) => compareEventsByStart(a.event, b.event));
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-bold mt-5">{site.title}</h1>
      <div className="mt-3">
        <Markdown>{site.description}</Markdown>
      </div>
      <div className="flex flex-col gap-8 sm:pl-5 mt-10">
        {sorted.map(({ summary: event, event: domain }) => (
          <div key={event.id}>
            <h2 className="sm:text-2xl text-xl font-bold">{event.name}</h2>
            <div className="flex text-fg-subtle text-xs mt-1 gap-5 font-medium">
              {formatEventDates(domain) && (
                <span className="flex gap-1 items-center">
                  <CalendarIcon className="h-3 w-3 stroke-2" />
                  <span>{formatEventDates(domain)}</span>
                </span>
              )}
              {event.website && (
                <a
                  className="flex gap-1 items-center hover:underline"
                  href={event.website}
                >
                  <LinkIcon className="h-3 w-3 stroke-2" />
                  <span>{event.website}</span>
                </a>
              )}
            </div>
            <div className="text-fg mt-2">
              <Markdown>{event.description}</Markdown>
            </div>
            <a
              href={`/${event.slug}`}
              className="font-semibold text-brand-fg hover:text-brand-fg-hover flex gap-1 items-center text-sm justify-end mt-2"
            >
              View event
              <ChevronRightIcon className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
