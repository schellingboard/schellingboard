import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import { newSortSeed } from "@schellingboard/domain/attendee-search";
import { profileFormCalls } from "../commands/profile-form";
import { DirectoryScreen } from "../features/people/directory-screen";
import { peopleLinks } from "../features/people/links";
import { ProfileForm } from "../features/people/profile-form";
import { meetingsOpen } from "../features/schedule/meeting-rules";
import {
  type DirectoryEntry,
  type DirectoryQuery,
  type DirectoryState,
} from "../queries/directory";
import { toEvent } from "../replica/selectors";
import { useScrollRestoration } from "../ui/use-scroll-restoration";
import { useHistoryEntry } from "./use-history-entry";
import { InAppLinks } from "./in-app-links";
import { PageNotice } from "./page-notice";
import { PanelLanding } from "./panel-landing";
import { profileIdOf } from "./panel-links";
import { useProfileWalk } from "./profile-walk";
import type { AppServices } from "./services";
import { ShellFrame } from "./shell";
import { useDirectoryShell } from "./use-directory-shell";
import { useUrlSearchParams } from "./use-url-search-params";
import { useViewer } from "./viewer";
import { t } from "@lingui/core/macro";

const LIST = "/guests";

const isPeoplePath = (pathname: string) =>
  pathname === "/guests" || pathname === "/guests/edit";

/** The attendee directory, a profile over it, and the edit-profile page. */
export function PeoplePage({ services }: { services: AppServices }) {
  return <Host api={services.api} />;
}

function Host({ api }: { api: AppServices["api"] }) {
  const viewer = useViewer();
  const { search } = useUrlSearchParams();
  const { events, now, directory, status, entries, pathname, frame } =
    useDirectoryShell(api);

  const view = {
    directory,
    entries,
    status,
    now,
    viewerId: viewer.guestId ?? null,
    viewerKnown: viewer.guestId !== undefined,
    meetingsEnabled: events.some((e) => meetingsOpen(toEvent(e), now)),
    api,
  };
  const editing = pathname.replace(/\/$/, "") === "/guests/edit";
  const profileId = editing ? null : profileIdOf(pathname);

  return (
    <ShellFrame api={api} {...frame}>
      <InAppLinks owns={(url) => isPeoplePath(url.pathname)}>
        {editing ? <EditProfile {...view} /> : <Directory {...view} />}
        {profileId && (
          <PanelLanding
            item={{ kind: "profile", id: profileId }}
            background={`/guests${search}`}
          />
        )}
      </InAppLinks>
    </ShellFrame>
  );
}

type View = {
  api: AppServices["api"];
  directory: DirectoryQuery;
  entries: DirectoryEntry[];
  status: DirectoryState["status"];
  now: Date;
  viewerId: string | null;
  viewerKnown: boolean;
  meetingsEnabled: boolean;
};

function Directory({ entries, status, now, viewerId, meetingsEnabled }: View) {
  const { params, change } = useUrlSearchParams();
  const { setRows } = useProfileWalk();
  const [randomSeed] = useState(newSortSeed);
  useScrollRestoration(
    null,
    useHistoryEntry(),
    entries.length > 0 || (status !== "loading" && status !== "idle")
  );

  return (
    <DirectoryScreen
      entries={entries}
      status={status}
      now={now}
      viewerId={viewerId}
      meetingsEnabled={meetingsEnabled}
      randomSeed={randomSeed}
      links={peopleLinks}
      params={params}
      onParams={change}
      onRows={setRows}
    />
  );
}

function EditProfile({
  api,
  directory,
  entries,
  status,
  viewerId,
  viewerKnown,
}: View) {
  const { history } = useRouter();
  const actions = useMemo(() => profileFormCalls(api), [api]);
  const [fresh, setFresh] = useState(false);
  const [awaitingLogin, setAwaitingLogin] = useState<boolean>();
  const missing = viewerKnown && !viewerId;
  useEffect(() => {
    if (!missing) return;
    let stale = false;
    void api.GET("/api/v1/me/identity").then(({ data }) => {
      if (!stale) setAwaitingLogin(data?.awaitingLogin === true);
    });
    return () => {
      stale = true;
    };
  }, [api, missing]);
  useEffect(() => {
    let stale = false;
    void directory.refresh().then(() => {
      if (!stale) setFresh(true);
    });
    return () => {
      stale = true;
    };
  }, [directory]);

  if (viewerKnown && !viewerId && awaitingLogin !== undefined)
    return (
      <PageNotice>
        {actingGuestRefusalMessage(
          awaitingLogin ? "guest.protected" : "guest.unselected",
          "editing your profile"
        )}
      </PageNotice>
    );
  if (
    !viewerKnown ||
    !viewerId ||
    !fresh ||
    (status !== "ready" && status !== "error" && entries.length === 0)
  )
    return (
      <p role="status" className="px-4 text-fg-muted">
        {t`Loading…`}
      </p>
    );
  const me = entries.find((e) => e.id === viewerId);
  if (!me || status === "error")
    return (
      <p className="px-4 text-fg-muted">
        {t`Profile not found, please log in again.`}
      </p>
    );
  return (
    <ProfileForm
      key={me.id}
      profile={me}
      links={{ people: LIST, settings: "/settings" }}
      actions={actions}
      onDone={() => {
        void directory
          .refresh()
          .then(() => history.push(peopleLinks.guest(me.id)));
      }}
    />
  );
}
