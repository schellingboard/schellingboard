import type { ReactNode } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { DevToolbar } from "./dev-toolbar";
import { ErrorBoundary } from "./error-boundary";
import { useKioskMode } from "../schedule/kiosk";
import { Footer } from "./footer";
import { hardReload } from "./hard-navigate";
import { HeaderLinks } from "./header-links";
import { useHealth } from "./health";
import { Layout } from "./layout";
import { NavBar, type NavItem } from "./nav-bar";
import { ReloadOffer } from "./reload-offer";
import { useUpdateStatus } from "./updates";
import { ThemeProvider } from "./theme";
import { UserMenu, type PickableGuest } from "./user-menu";
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
  const viewer = useViewer();
  const kiosk = useKioskMode(new URLSearchParams(search));
  return (
    <Layout
      nav={
        <NavBar items={events} currentPath={currentPath}>
          <HeaderLinks api={api} signedIn={!!viewer.guestId} />
          <UserMenu viewer={viewer} guests={guests} />
        </NavBar>
      }
      footer={<Footer version={health?.version} update={update} />}
    >
      <ReloadOffer api={api} kiosk={kiosk} onReload={hardReload} />
      <ErrorBoundary resetKey={currentPath}>{children}</ErrorBoundary>
      <DevToolbar
        enabled={health?.devTools ?? false}
        search={search}
        onChange={onClockChange}
      />
    </Layout>
  );
}

export type ShellProps = {
  api: ApiClient;
  events: NavItem[];
  guests: PickableGuest[];
  currentPath: string;
  search: string;
  onClockChange: () => void;
  children: ReactNode;
};

/** The theme and the viewer, for a screen that needs the viewer to load its data. */
export function ShellProviders({
  api,
  children,
}: {
  api: ApiClient;
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <ViewerProvider api={api}>{children}</ViewerProvider>
    </ThemeProvider>
  );
}

/** Everything around a screen. */
export function Shell(props: ShellProps) {
  return (
    <ShellProviders api={props.api}>
      <ShellFrame {...props} />
    </ShellProviders>
  );
}
