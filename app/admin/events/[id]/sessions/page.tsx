import { notFound, redirect } from "next/navigation";
import { getRepositories } from "@/db/container";
import { outOfRangePageRedirect, parsePage } from "@/utils/pagination";
import { formatDayLabel } from "@/utils/utils";
import { requireAdminPage } from "../../../require-admin";
import {
  EventSessionsManager,
  type SessionRow,
  type EventGuest,
  type EventLocation,
  type DayOption,
} from "../event-sessions-manager";

const PAGE_SIZE = 25;

export default async function AdminEventSessionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;
  const { q, page: pageParam } = await searchParams;
  const repos = getRepositories();
  const event = await repos.events.findById(id);
  if (!event) notFound();

  const page = parsePage(pageParam);
  const query = q?.trim() ?? "";

  const eventGuests: EventGuest[] = (await repos.guests.listByEvent(id)).map(
    (g) => ({ id: g.id, name: g.name })
  );
  // RSVP names resolve against all guests, not just currently-assigned ones.
  const guestNameById = new Map(
    (await repos.guests.list()).map((g) => [g.id, g.name])
  );

  const allLocations = await repos.locations.list();
  const assignedLocationIds = new Set(
    await repos.locations.listLocationIdsByEvent(id)
  );
  const capacityById = new Map(allLocations.map((l) => [l.id, l.capacity]));
  const eventLocations: EventLocation[] = allLocations
    .filter((l) => assignedLocationIds.has(l.id))
    .map((l) => ({ id: l.id, name: l.name, capacity: l.capacity }));

  const days: DayOption[] = (await repos.days.listByEvent(id)).map((d) => ({
    key: d.id,
    label: formatDayLabel(d, event.timezone),
    start: d.start.toISOString(),
    end: d.end.toISOString(),
  }));

  const { rows, total } = await repos.sessions.searchByEvent(id, {
    query: query || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const redirectTarget = outOfRangePageRedirect({
    basePath: `/admin/events/${id}/sessions`,
    page,
    total,
    pageSize: PAGE_SIZE,
    params: { q: query },
  });
  if (redirectTarget) redirect(redirectTarget);

  const rsvpsBySession = await repos.rsvps.listBySessions(
    rows.map((s) => s.id)
  );
  const sessionRows: SessionRow[] = rows.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    startTime: s.startTime ? s.startTime.toISOString() : null,
    endTime: s.endTime ? s.endTime.toISOString() : null,
    capacity: s.capacity,
    adminManaged: s.adminManaged,
    blocker: s.blocker,
    closed: s.closed,
    hosts: s.hosts.map((h) => ({ id: h.id, name: h.name })),
    locations: s.locations.map((l) => ({
      id: l.id,
      name: l.name,
      capacity: capacityById.get(l.id) ?? 0,
    })),
    numRsvps: s.numRsvps,
    rsvps: (rsvpsBySession.get(s.id) ?? []).map((r) => ({
      guestId: r.guestId,
      name: guestNameById.get(r.guestId) ?? "Unknown guest",
    })),
  }));

  return (
    <EventSessionsManager
      eventId={id}
      sessions={sessionRows}
      eventGuests={eventGuests}
      eventLocations={eventLocations}
      timezone={event.timezone}
      days={days}
      breakMinutes={event.breakMinutes}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      query={query}
    />
  );
}
