import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  lazyRouteComponent,
  Outlet,
  useRouter,
  type RouterHistory,
} from "@tanstack/react-router";
import { Suspense, type ReactElement } from "react";
import {
  LoginPage,
  NotificationsPage,
  ResetPage,
  BootstrapPage,
  JoinPage,
  SettingsPage,
  SiteLoginPage,
} from "./account-pages";
import { HomePage } from "./home-page";
import { NotFound } from "./not-found";
import { MeetingsPage } from "./meetings-page";
import { PeoplePage } from "./people-pages";
import {
  ProposalFormPage,
  ProposalsPage,
  QuickVotingPage,
} from "./proposals-pages";
import { EventLanding } from "./event-landing";
import { EventLayout } from "./event-page";
import { SchedulePage } from "./schedule-page";
import { PanelLanding } from "./panel-landing";
import { PanelHost } from "./panel-host";
import { SessionFormPage } from "./sessions-pages";
import { SpaLinks } from "./spa-links";
import { defaultServices, type AppServices } from "./services";

const AdminEventPage = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminEventPage"
);
const AdminEventsPage = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminEventsPage"
);
const AdminHome = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminHome"
);
const AdminLocationsPage = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminLocationsPage"
);
const AdminSection = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminSection"
);
const AdminSettingsPage = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminSettingsPage"
);
const AdminStatisticsHome = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminStatisticsHome"
);
const AdminStatisticsPage = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminStatisticsPage"
);
const AdminUserImportPage = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminUserImportPage"
);
const AdminUsersPage = lazyRouteComponent(
  () => import("./admin-pages"),
  "AdminUsersPage"
);

const adminPages = [
  AdminEventPage,
  AdminEventsPage,
  AdminHome,
  AdminLocationsPage,
  AdminSection,
  AdminSettingsPage,
  AdminStatisticsHome,
  AdminStatisticsPage,
  AdminUserImportPage,
  AdminUsersPage,
];

const rootRoute = createRootRoute({ component: Outlet });

const catchAll = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: NotFound,
});

export function createAppRouter(
  history?: RouterHistory,
  services: AppServices = defaultServices()
) {
  const home = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: function HomeRoute(): ReactElement {
      return <HomePage services={services} />;
    },
  });
  const event = createRoute({
    getParentRoute: () => rootRoute,
    path: "/$slug",
    // Inferring this return type would read the registered router while it
    // is still being inferred, turning useRouter() into `any` in some files.
    component: function EventRoute(): ReactElement {
      const { slug } = event.useParams();
      return (
        <EventLayout services={services} slug={slug}>
          <SpaLinks slug={slug}>
            <Outlet />
            <PanelHost />
          </SpaLinks>
        </EventLayout>
      );
    },
  });
  const landing = createRoute({
    getParentRoute: () => event,
    path: "/",
    component: EventLanding,
  });
  const schedule = createRoute({
    getParentRoute: () => event,
    path: "schedule",
    component: SchedulePage,
  });
  const session = createRoute({
    getParentRoute: () => event,
    path: "sessions/$sessionId",
    component: function SessionRoute(): ReactElement {
      const { slug, sessionId } = session.useParams();
      const { search } = useRouter().history.location;
      return (
        <PanelLanding
          item={{
            kind: "session",
            slug,
            id: sessionId,
            record: new URLSearchParams(search).get("record") === "count",
          }}
          background={`/${slug}/schedule`}
        />
      );
    },
  });
  const meetings = createRoute({
    getParentRoute: () => event,
    path: "meetings",
    component: MeetingsPage,
  });
  const proposals = createRoute({
    getParentRoute: () => event,
    path: "proposals",
    component: ProposalsPage,
  });
  const proposal = createRoute({
    getParentRoute: () => event,
    path: "proposals/$proposalId",
    component: function ProposalRoute(): ReactElement {
      const { slug, proposalId } = proposal.useParams();
      return (
        <PanelLanding
          item={{ kind: "proposal", slug, id: proposalId }}
          background={`/${slug}/proposals`}
        />
      );
    },
  });
  const quickVoting = createRoute({
    getParentRoute: () => event,
    path: "proposals/quick-voting",
    component: QuickVotingPage,
  });
  const newProposal = createRoute({
    getParentRoute: () => event,
    path: "proposals/new",
    component: ProposalFormPage,
  });
  const editProposal = createRoute({
    getParentRoute: () => event,
    path: "proposals/$proposalId/edit",
    component: function EditProposalRoute(): ReactElement {
      const { proposalId } = editProposal.useParams();
      return <ProposalFormPage proposalId={proposalId} />;
    },
  });
  const addSession = createRoute({
    getParentRoute: () => event,
    path: "add-session",
    component: SessionFormPage,
  });
  const editSession = createRoute({
    getParentRoute: () => event,
    path: "edit-session",
    component: SessionFormPage,
  });
  // One component for the directory, a profile over it and the edit page, so
  // moving between them keeps the list mounted.
  const guests = createRoute({
    getParentRoute: () => rootRoute,
    path: "guests",
    component: function GuestsRoute(): ReactElement {
      return <PeoplePage services={services} />;
    },
  });
  const guestsList = createRoute({
    getParentRoute: () => guests,
    path: "/",
  });
  const guestsPage = createRoute({
    getParentRoute: () => guests,
    path: "$",
  });
  const settings = createRoute({
    getParentRoute: () => rootRoute,
    path: "settings",
    component: function SettingsRoute(): ReactElement {
      return <SettingsPage services={services} />;
    },
  });
  const notifications = createRoute({
    getParentRoute: () => rootRoute,
    path: "notifications",
    component: function NotificationsRoute(): ReactElement {
      return <NotificationsPage services={services} />;
    },
  });
  const siteLogin = createRoute({
    getParentRoute: () => rootRoute,
    path: "login",
    component: function SiteLoginRoute(): ReactElement {
      return <SiteLoginPage services={services} />;
    },
  });
  const accountSecurity = createRoute({
    getParentRoute: () => rootRoute,
    path: "account-security",
    beforeLoad: () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- how TanStack Router redirects
      throw redirect({ to: "/settings", hash: "security", replace: true });
    },
  });
  const authLogin = createRoute({
    getParentRoute: () => rootRoute,
    path: "auth/login",
    component: function AuthLoginRoute(): ReactElement {
      return <LoginPage services={services} />;
    },
  });
  const authBootstrap = createRoute({
    getParentRoute: () => rootRoute,
    path: "auth/bootstrap",
    component: function AuthBootstrapRoute(): ReactElement {
      return <BootstrapPage services={services} />;
    },
  });
  const join = createRoute({
    getParentRoute: () => rootRoute,
    path: "join/$token",
    component: function JoinRoute(): ReactElement {
      const { token } = join.useParams();
      return <JoinPage services={services} token={token} />;
    },
  });
  const authReset = createRoute({
    getParentRoute: () => rootRoute,
    path: "auth/reset",
    component: function AuthResetRoute(): ReactElement {
      return <ResetPage services={services} />;
    },
  });
  const adminSection = createRoute({
    getParentRoute: () => rootRoute,
    id: "admin-section",
    loader: async () => {
      await Promise.all(adminPages.map(async (page) => page.preload?.()));
      return null;
    },
    component: function AdminSectionRoute(): ReactElement {
      return (
        <Suspense fallback={null}>
          <AdminSection services={services} />
        </Suspense>
      );
    },
  });
  const adminChild = (path: string, component: () => ReactElement) =>
    createRoute({ getParentRoute: () => adminSection, path, component });
  const api = services.api;
  const adminEvents = adminChild("admin/events", () => (
    <AdminEventsPage api={api} />
  ));
  const adminUsers = adminChild("admin/users", () => (
    <AdminUsersPage api={api} />
  ));
  const adminUserImport = adminChild("admin/users/import", () => (
    <AdminUserImportPage api={api} />
  ));
  const adminLocations = adminChild("admin/locations", () => (
    <AdminLocationsPage api={api} />
  ));
  const adminSettings = adminChild("admin/settings", () => (
    <AdminSettingsPage api={api} />
  ));
  const adminStatisticsHome = adminChild("admin/statistics", () => (
    <AdminStatisticsHome api={api} />
  ));
  const adminStatistics = createRoute({
    getParentRoute: () => adminSection,
    path: "admin/statistics/$id",
    component: function AdminStatisticsRoute(): ReactElement {
      const { id } = adminStatistics.useParams();
      return <AdminStatisticsPage api={services.api} id={id} />;
    },
  });
  const adminHome = createRoute({
    getParentRoute: () => adminSection,
    path: "admin",
    component: AdminHome,
  });
  const adminEvent = createRoute({
    getParentRoute: () => adminSection,
    path: "admin/events/$id",
    component: function AdminEventRoute(): ReactElement {
      const { id } = adminEvent.useParams();
      return <AdminEventPage key={id} api={services.api} id={id} />;
    },
  });
  const adminEventConfig = createRoute({
    getParentRoute: () => adminEvent,
    path: "/",
  });
  const adminEventTab = createRoute({
    getParentRoute: () => adminEvent,
    path: "$",
  });
  return createRouter({
    routeTree: rootRoute.addChildren([
      home,
      siteLogin,
      adminSection.addChildren([
        adminHome,
        adminEvents,
        adminEvent.addChildren([adminEventConfig, adminEventTab]),
        adminUsers,
        adminUserImport,
        adminLocations,
        adminSettings,
        adminStatisticsHome,
        adminStatistics,
      ]),
      settings,
      notifications,
      accountSecurity,
      authLogin,
      authReset,
      authBootstrap,
      join,
      guests.addChildren([guestsList, guestsPage]),
      event.addChildren([
        landing,
        schedule,
        session,
        meetings,
        proposals,
        proposal,
        quickVoting,
        newProposal,
        editProposal,
        addSession,
        editSession,
      ]),
      catchAll,
    ]),
    history,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
