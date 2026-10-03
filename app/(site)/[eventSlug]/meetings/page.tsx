import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PageNotice } from "@/app/components/page-notice";
import { EventPhase, getCurrentPhase } from "@schellingboard/domain/phase";
import { getRepositories } from "@/db/container";
import {
  unverifiedUserMessage,
  verifiedCurrentUser,
} from "@/utils/acting-guest";
import { serverNow } from "@/utils/dev-clock-server";
import { MeetingModalFromUrl } from "../meeting-modal";
import { MeetingsProvider } from "../use-meetings";

export const dynamic = "force-dynamic";

/**
 * Where a meeting notification lands. During scheduling it hands the meeting
 * to the schedule, where it sits in its slot next to whatever it clashes with.
 * Outside it the schedule redirects to the proposals and would lose the
 * meeting on the way, so it opens here, read-only (#952).
 */
export default async function MeetingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ viewMeeting?: string | string[] }>;
}) {
  const { eventSlug } = await params;
  const event = await getRepositories().events.findBySlug(eventSlug);
  if (!event) notFound();

  const { viewMeeting } = await searchParams;
  const meetingId = Array.isArray(viewMeeting) ? viewMeeting[0] : viewMeeting;
  if (!meetingId) redirect(`/${eventSlug}`);

  // Before the redirect below: the schedule has no notice for a visitor who
  // hasn't said who they are, so its modal could only call the meeting "not
  // found".
  const cookieStore = await cookies();
  if (!(await verifiedCurrentUser(cookieStore))) {
    return (
      <PageNotice backHref={`/${eventSlug}`} backLabel={event.name}>
        {await unverifiedUserMessage(cookieStore, "opening your 1-on-1s")}
      </PageNotice>
    );
  }

  if (getCurrentPhase(event, await serverNow()) === EventPhase.SCHEDULING) {
    redirect(`/${eventSlug}?viewMeeting=${encodeURIComponent(meetingId)}`);
  }

  return (
    <>
      <PageNotice backHref={`/${eventSlug}`} backLabel={event.name}>
        1-on-1s at {event.name} can only be answered or canceled during its
        scheduling phase.
      </PageNotice>
      <MeetingsProvider>
        <MeetingModalFromUrl readOnly />
      </MeetingsProvider>
    </>
  );
}
