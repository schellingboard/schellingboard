import { notFound, redirect } from "next/navigation";
import { adminReads } from "@/server/admin-reads";
import { pageReads } from "@/server/composition";
import { outOfRangePageRedirect, parsePage } from "@/utils/pagination";
import { requireAdminPage } from "../../../require-admin";
import {
  EventProposalsManager,
  type ProposalRow,
  type EventGuest,
} from "../event-proposals-manager";

const PAGE_SIZE = 25;

export default async function AdminEventProposalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;
  const { q, page: pageParam } = await searchParams;
  const admin = adminReads();
  const event = await pageReads().eventById(id);
  if (!event) notFound();

  const page = parsePage(pageParam);
  const query = q?.trim() ?? "";

  const eventGuests: EventGuest[] = (await admin.guestsOfEvent(id)).map(
    (g) => ({ id: g.id, name: g.name })
  );

  const { rows, total } = await admin.searchProposals(id, {
    query: query || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const redirectTarget = outOfRangePageRedirect({
    basePath: `/admin/events/${id}/proposals`,
    page,
    total,
    pageSize: PAGE_SIZE,
    params: { q: query },
  });
  if (redirectTarget) redirect(redirectTarget);

  const proposalRows: ProposalRow[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    durationMinutes: p.durationMinutes ?? null,
    hosts: p.hosts.map((h) => ({ id: h.id, name: h.name })),
    votesCount: p.votesCount,
    sessionCount: p.sessionIds.length,
    version: p.version,
  }));

  return (
    <EventProposalsManager
      proposals={proposalRows}
      eventGuests={eventGuests}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      query={query}
    />
  );
}
