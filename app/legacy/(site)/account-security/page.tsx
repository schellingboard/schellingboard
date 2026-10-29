import { cookies } from "next/headers";
import { PageNotice } from "@/app/components/page-notice";
import { pageReads } from "@/server/composition";
import {
  unverifiedUserMessage,
  verifiedCurrentUser,
} from "@/utils/acting-guest";
import { AccountSecurity } from "./account-security";

export default async function AccountSecurityPage() {
  const cookieStore = await cookies();
  const currentUser = await verifiedCurrentUser(cookieStore);
  if (!currentUser) {
    return (
      <PageNotice backHref="/guests" backLabel="Attendees">
        {await unverifiedUserMessage(cookieStore, "changing your settings")}
      </PageNotice>
    );
  }

  const guest = await pageReads().guestById(currentUser);
  if (!guest) {
    return (
      <p className="text-fg-muted">Profile not found, please log in again.</p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-0 flex flex-col gap-4">
      <a
        href="/settings"
        className="text-sm text-fg-subtle hover:text-fg-muted"
      >
        ← Settings
      </a>
      <AccountSecurity
        guestId={guest.id}
        guestName={guest.name}
        authProtected={guest.authProtected ?? false}
      />
    </div>
  );
}
