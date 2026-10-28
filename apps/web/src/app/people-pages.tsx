import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useLocation, useRouter } from "@tanstack/react-router";
import { actingGuestRefusalMessage } from "@schellingboard/domain/acting-guest-message";
import { newSortSeed } from "@schellingboard/domain/attendee-search";
import { failureMessage } from "../commands/failure-message";
import { newKey } from "../commands/keys";
import { meetingRequestCalls } from "../commands/meeting-request";
import { profileFormCalls } from "../commands/profile-form";
import { createCommandRunner } from "../commands/runner";
import { DirectoryScreen } from "../features/people/directory-screen";
import { peopleLinks, profileLinks } from "../features/people/links";
import { ProfileForm } from "../features/people/profile-form";
import { ProfileModal } from "../features/people/profile-modal";
import { meetingsOpen } from "../features/schedule/meeting-rules";
import {
  createDirectoryQuery,
  type DirectoryEntry,
  type DirectoryQuery,
  type DirectoryState,
} from "../queries/directory";
import type { CommentsHandle } from "../features/comments/comments-section";
import { createProfileActivityQuery } from "../queries/profile-activity";
import { blankSnapshot } from "../replica/blank";
import { createReplicaStore } from "../replica/store";
import { toEvent } from "../replica/selectors";
import { useNotify } from "../ui/notices";
import { hardReload } from "./hard-navigate";
import { InAppLinks } from "./in-app-links";
import type { AppServices } from "./services";
import { ShellFrame, ShellProviders } from "./shell";
import { useCommentSource } from "./use-comment-actions";
import { useEventList } from "./use-events";
import { useUrlSearchParams } from "./use-url-search-params";
import { useViewer } from "./viewer";

const LIST = "/guests";

const isPeoplePath = (pathname: string) =>
  pathname === "/guests" || pathname.startsWith("/guests/");

/** The attendee directory, a profile over it, and the edit-profile page. */
export function PeoplePage({ services }: { services: AppServices }) {
  return (
    <ShellProviders api={services.api}>
      <Host api={services.api} />
    </ShellProviders>
  );
}

function Host({ api }: { api: AppServices["api"] }) {
  const viewer = useViewer();
  const notify = useNotify();
  const { search, params } = useUrlSearchParams();
  const pathname = useLocation({ select: (l) => l.pathname });
  const { events, now: serverNow } = useEventList(api);
  const [loadedAt] = useState(() => new Date());
  const now = serverNow ?? loadedAt;

  const directory = useMemo(() => createDirectoryQuery({ api }), [api]);
  useEffect(() => {
    void directory.refresh();
  }, [directory]);
  const { status, entries } = useSyncExternalStore(
    directory.subscribe,
    directory.get
  );

  const runner = useMemo(
    () =>
      createCommandRunner({
        store: createReplicaStore(blankSnapshot(new Date().toISOString())),
        api,
        newKey,
        onFailure: (failure) =>
          notify({ tone: "failure", message: failureMessage(failure) }),
      }),
    [api, notify]
  );

  const viewerId = viewer.guestId ?? null;
  const me = entries.find((e) => e.id === viewerId);
  const liker = useMemo(
    () => me && { id: me.id, name: me.name, avatarUrl: me.avatarUrl },
    [me]
  );
  const openComments = useCommentSource(api, runner, liker ?? null);
  const comments = useCallback(
    (id: string, name: string) => openComments({ kind: "profile", id, name }),
    [openComments]
  );

  const view = {
    api,
    directory,
    entries,
    status,
    now,
    viewerId,
    viewerKnown: viewer.guestId !== undefined,
    meetingsEnabled: events.some((e) => meetingsOpen(toEvent(e), now)),
    comments,
  };
  const editing = pathname.replace(/\/$/, "") === "/guests/edit";
  const profileId = editing
    ? undefined
    : pathname.match(/^\/guests\/([^/]+)\/?$/)?.[1];

  return (
    <ShellFrame
      api={api}
      events={events.map((e) => ({ name: e.name, href: `/${e.slug}` }))}
      guests={
        status === "ready" || entries.length > 0
          ? entries.map((e) => ({
              id: e.id,
              name: e.name,
              authProtected: e.authProtected,
            }))
          : undefined
      }
      currentPath={pathname}
      search={search}
      onClockChange={hardReload}
    >
      <InAppLinks
        owns={(url) => isPeoplePath(url.pathname)}
        onFollow={(url) => {
          // A profile reached by a bare address (a comment's author) keeps the
          // list it is read over, so closing it lands where reading started.
          const query = url.search || (profileId ? `?${params}` : "");
          return `${url.pathname}${query === "?" ? "" : query}${url.hash}`;
        }}
      >
        {editing ? (
          <EditProfile {...view} />
        ) : (
          <Directory {...view} profileId={profileId} />
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
  comments: (id: string, name: string) => CommentsHandle;
};

function Directory({
  api,
  entries,
  status,
  now,
  viewerId,
  meetingsEnabled,
  comments,
  profileId,
}: View & { profileId: string | undefined }) {
  const { history } = useRouter();
  const { params, change, setHash } = useUrlSearchParams();
  const listQuery = params.toString();
  const [randomSeed] = useState(newSortSeed);
  const activity = useCallback(
    (guestId: string) => createProfileActivityQuery({ api, guestId }),
    [api]
  );
  const meetingRequests = useMemo(() => meetingRequestCalls(api), [api]);

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
      profile={({ matches, everyone }) =>
        profileId && (
          <ProfileModal
            guestId={profileId}
            matches={matches}
            everyone={everyone}
            viewerId={viewerId}
            links={profileLinks}
            activity={activity}
            onOpen={(id) => history.push(peopleLinks.guest(id, listQuery))}
            onClose={() => history.push(profileLinks.list(listQuery))}
            meetingRequests={meetingRequests}
            comments={comments}
            setHash={setHash}
          />
        )
      }
    />
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 sm:px-0">
      <a
        href={LIST}
        className="-my-1 inline-block py-1 text-sm text-fg-subtle hover:text-fg-muted"
      >
        ← Attendees
      </a>
      <p className="text-fg-muted">{children}</p>
    </div>
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
      <Notice>
        {actingGuestRefusalMessage(
          awaitingLogin ? "guest.protected" : "guest.unselected",
          "editing your profile"
        )}
      </Notice>
    );
  if (
    !viewerKnown ||
    !viewerId ||
    !fresh ||
    (status !== "ready" && status !== "error" && entries.length === 0)
  )
    return (
      <p role="status" className="px-4 text-fg-muted">
        Loading…
      </p>
    );
  const me = entries.find((e) => e.id === viewerId);
  if (!me || status === "error")
    return (
      <p className="px-4 text-fg-muted">
        Profile not found, please log in again.
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
          .then(() => history.push(peopleLinks.guest(me.id, "")));
      }}
    />
  );
}
