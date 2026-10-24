import type { ReactNode } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { DevToolbar } from "./dev-toolbar";
import { ErrorBoundary } from "./error-boundary";
import { Footer } from "./footer";
import { useHealth } from "./health";
import { Layout } from "./layout";
import { NavBar, type NavItem } from "./nav-bar";
import { ThemeProvider } from "./theme";
import { UserMenu, type PickableGuest } from "./user-menu";
import { useViewer, ViewerProvider } from "./viewer";

function Frame({
  api,
  events,
  guests,
  currentPath,
  search,
  onClockChange,
  children,
}: Props) {
  const health = useHealth(api);
  const viewer = useViewer();
  return (
    <Layout
      nav={
        <NavBar items={events} currentPath={currentPath}>
          <UserMenu viewer={viewer} guests={guests} />
        </NavBar>
      }
      footer={<Footer version={health?.version} />}
    >
      <ErrorBoundary resetKey={currentPath}>{children}</ErrorBoundary>
      <DevToolbar
        enabled={health?.devTools ?? false}
        search={search}
        onChange={onClockChange}
      />
    </Layout>
  );
}

type Props = {
  api: ApiClient;
  events: NavItem[];
  guests: PickableGuest[];
  currentPath: string;
  search: string;
  onClockChange: () => void;
  children: ReactNode;
};

/** Everything around a screen. Not mounted by the router until step 13. */
export function Shell(props: Props) {
  return (
    <ThemeProvider>
      <ViewerProvider api={props.api}>
        <Frame {...props} />
      </ViewerProvider>
    </ThemeProvider>
  );
}
