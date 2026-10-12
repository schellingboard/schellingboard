import { cookies } from "next/headers";
import { pageReads } from "@/server/composition";
import { AttendeeDirectory } from "@/app/legacy/(site)/guests/directory";
import { newSortSeed } from "@/utils/attendee-search";
import { serverNow } from "@/utils/dev-clock-server";
import { verifiedCurrentUser } from "@/utils/acting-guest";
import { meetingsOpen } from "@/utils/meeting-rules";

/**
 * The list is a layout, not a page, so `/legacy/guests` and `/legacy/guests/<id>` share one
 * instance of it: rendering it per page would unmount it every time a profile
 * opened, losing the reader's place in the list. The route group keeps
 * `/legacy/guests/edit` out of it.
 */
export default async function AttendeeDirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The whole directory, unfiltered: search, filters, sorting and paging all
  // happen in the browser (see directory-view.ts). `listAttendees` returns
  // public profile fields only — `Attendee` has no `info`, so no email can
  // reach the client payload this way.
  const now = await serverNow();
  const reads = pageReads();
  const [attendees, events] = await Promise.all([
    reads.attendees(now),
    reads.allEvents(),
  ]);
  const cookieStore = await cookies();
  const currentUser = await verifiedCurrentUser(cookieStore);

  return (
    <>
      <AttendeeDirectory
        attendees={attendees}
        now={now}
        currentUserId={currentUser}
        randomSeed={newSortSeed()}
        meetingsEnabled={events.some((e) => meetingsOpen(e, now))}
      />
      {children}
    </>
  );
}
