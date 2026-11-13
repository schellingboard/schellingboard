import { newSortSeed } from "@schellingboard/domain/attendee-search";
import { useEffect, useRef, useState } from "react";

import { DirectoryScreen } from "../features/people/directory-screen";
import { peopleLinks } from "../features/people/links";
import { meetingsOpen } from "../features/schedule/meeting-rules";
import {
  type DirectoryEntry,
  type DirectoryQuery,
  type DirectoryState,
} from "../queries/directory";
import { toEvent } from "../replica/selectors";
import { useScrollRestoration } from "../ui/use-scroll-restoration";
import { InAppLinks } from "./in-app-links";
import { PanelLanding } from "./panel-landing";
import { profileIdOf } from "./panel-links";
import { useProfileWalk } from "./profile-walk";
import type { AppServices } from "./services";
import { ShellFrame } from "./shell";
import { useDirectoryShell } from "./use-directory-shell";
import { useHistoryEntry } from "./use-history-entry";
import { usePanel } from "./use-panel";
import { useUrlSearchParams } from "./use-url-search-params";
import { useViewer } from "./viewer";

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
  const { panel } = usePanel();
  const formOpen = panel?.item.kind === "profile-form";
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !formOpen) void directory.refresh();
    wasOpen.current = formOpen;
  }, [formOpen, directory]);
  const profileId = editing ? null : profileIdOf(pathname);

  return (
    <ShellFrame api={api} {...frame}>
      <InAppLinks owns={(url) => isPeoplePath(url.pathname)}>
        <Directory {...view} />
        {editing && (
          <PanelLanding item={{ kind: "profile-form" }} background="/guests" />
        )}
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
