import type { ApiClient } from "@schellingboard/api-client";
import { type ReactNode, useMemo } from "react";

import { PersonCardsProvider } from "../features/people/person-cards";
import { useKioskMode } from "../features/schedule/kiosk";
import { createDirectoryQuery } from "../queries/directory";
import { NoticeProvider } from "../ui/notices";
import { DevToolbar } from "./dev-toolbar";
import { ErrorBoundary } from "./error-boundary";
import { Footer } from "./footer";
import { hardReload } from "./hard-navigate";
import { HeaderLinks } from "./header-links";
import { useHealth } from "./health";
import { IdentityPrompt } from "./identity-prompt";
import { Layout } from "./layout";
import { MapButton } from "./map-button";
import { NavBar, type NavItem } from "./nav-bar";
import { ReloadOffer } from "./reload-offer";
import type { AppServices } from "./services";
import { useSite } from "./site";
import { ThemeProvider } from "./theme";
import { TimeFormatProvider } from "./time-format";
import { UnreadProvider } from "./unread-count";
import { useUpdateStatus } from "./updates";
import { type PickableGuest, UserMenu } from "./user-menu";
import { useViewer, ViewerProvider } from "./viewer";

export function ShellFrame({
  api,
  events,
  guests,
  currentPath,
  search,
  onClockChange,
  children,
}: ShellProps) {
  const health = useHealth(api);
  const update = useUpdateStatus(api);
  const site = useSite(api);
  const viewer = useViewer();
  const kiosk = useKioskMode(new URLSearchParams(search));
  return (
    <IdentityPrompt guests={guests}>
      <Layout
        nav={
          <NavBar items={events} currentPath={currentPath}>
            <HeaderLinks signedIn={!!viewer.guestId} />
            <MapButton url={site?.mapImageUrl} />
            <UserMenu viewer={viewer} guests={guests} />
          </NavBar>
        }
        footer={<Footer api={api} version={health?.version} update={update} />}
      >
        <ReloadOffer api={api} kiosk={kiosk} onReload={hardReload} />
        <ErrorBoundary resetKey={currentPath}>{children}</ErrorBoundary>
        <DevToolbar
          enabled={health?.devTools ?? false}
          search={search}
          onChange={onClockChange}
          sendReminders={async () => {
            const response = await fetch("/api/dev/reminders", {
              method: "POST",
            });
            /* eslint-disable lingui/no-unlocalized-strings -- dev toolbar, English only */
            if (!response.ok) return "dispatch failed";
            const { sent } = (await response.json()) as { sent: number };
            return `sent ${sent} reminders`;
            /* eslint-enable lingui/no-unlocalized-strings */
          }}
        />
      </Layout>
    </IdentityPrompt>
  );
}

export type ShellProps = {
  api: ApiClient;
  events: NavItem[];
  guests: PickableGuest[] | undefined;
  currentPath: string;
  search: string;
  onClockChange: () => void;
  children: ReactNode;
};

/** The theme and the viewer, for a screen that needs the viewer to load its data. */
export function ShellProviders({
  api,
  createSource,
  children,
}: {
  api: ApiClient;
  createSource: AppServices["createSource"];
  children: ReactNode;
}) {
  const people = useMemo(() => createDirectoryQuery({ api }), [api]);
  return (
    <ThemeProvider>
      <TimeFormatProvider>
        <NoticeProvider>
          <ViewerProvider api={api}>
            <ViewerUnread createSource={createSource}>
              <PersonCardsProvider query={people}>
                {children}
              </PersonCardsProvider>
            </ViewerUnread>
          </ViewerProvider>
        </NoticeProvider>
      </TimeFormatProvider>
    </ThemeProvider>
  );
}

function ViewerUnread({
  createSource,
  children,
}: {
  createSource: AppServices["createSource"];
  children: ReactNode;
}) {
  const { guestId } = useViewer();
  return (
    <UnreadProvider guestId={guestId} createSource={createSource}>
      {children}
    </UnreadProvider>
  );
}

/** Everything around a screen. */
export function Shell(
  props: ShellProps & { createSource: AppServices["createSource"] }
) {
  return (
    <ShellProviders api={props.api} createSource={props.createSource}>
      <ShellFrame {...props} />
    </ShellProviders>
  );
}
