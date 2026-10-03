import { Suspense } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  LinkIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { type Event, compareEventsByStart } from "@schellingboard/domain/event";
import { Markdown } from "@/app/(site)/markdown";
import { formatEventDates } from "@schellingboard/domain/time";

export default function SummaryPage(props: {
  events: Event[];
  title: string;
  description: string;
}) {
  const { events, title, description } = props;
  const sortedEvents = events.sort(compareEventsByStart);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mt-5">{title}</h1>
        <div className="mt-3">
          <Markdown>{description}</Markdown>
        </div>
        <div className="flex flex-col gap-8 sm:pl-5 mt-10">
          {sortedEvents.map((event) => (
            <div key={event.name}>
              <h1 className="sm:text-2xl text-xl font-bold">{event.name}</h1>
              <div className="flex text-fg-subtle text-xs mt-1 gap-5 font-medium">
                {formatEventDates(event) && (
                  <span className="flex gap-1 items-center">
                    <CalendarIcon className="3 w-3 stroke-2" />
                    <span>{formatEventDates(event)}</span>
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
              <Link
                href={`/${event.slug}`}
                className="font-semibold text-brand-fg hover:text-brand-fg-hover flex gap-1 items-center text-sm justify-end mt-2"
              >
                View event
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Suspense>
  );
}
