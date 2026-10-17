import Link from "next/link";
import { redirect } from "next/navigation";
import { adminReads } from "@/server/composition";
import { SECONDARY_BUTTON } from "../buttons";
import { outOfRangePageRedirect, parsePage } from "@/utils/pagination";
import { requireAdminPage } from "../require-admin";
import { GuestsManager, type AdminUser } from "../guests-manager";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminPage();

  const { q, page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const query = q?.trim() ?? "";

  const admin = adminReads();
  const { rows, total } = await admin.searchGuests({
    query: query || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const redirectTarget = outOfRangePageRedirect({
    basePath: "/admin/users",
    page,
    total,
    pageSize: PAGE_SIZE,
    params: { q: query },
  });
  if (redirectTarget) redirect(redirectTarget);

  const eventsByGuest = await admin.eventsOfGuests(rows.map((g) => g.id));
  const users: AdminUser[] = rows.map((guest) => ({
    guest,
    events: eventsByGuest.get(guest.id) ?? [],
  }));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-fg">Users</h1>
        <Link href="/admin/users/import" className={SECONDARY_BUTTON}>
          Import CSV
        </Link>
      </div>
      <section aria-label="Users" className="space-y-4">
        <GuestsManager
          users={users}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          query={query}
        />
      </section>
    </div>
  );
}
