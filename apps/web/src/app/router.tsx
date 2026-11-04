import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  type RouterHistory,
} from "@tanstack/react-router";
import type { ReactElement } from "react";
import {
  AdminEventPage,
  AdminEventsPage,
  AdminHome,
  AdminLocationsPage,
  AdminSection,
  AdminSettingsPage,
  AdminUserImportPage,
  AdminUsersPage,
} from "./admin-pages";
import {
  AccountSecurityPage,
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
import { EventLayout } from "./event-page";
import { SchedulePage } from "./schedule-page";
import { SessionFormPage } from "./sessions-pages";
import { SpaLinks } from "./spa-links";
import { defaultServices, type AppServices } from "./services";

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
          </SpaLinks>
        </EventLayout>
      );
    },
  });
  const schedule = createRoute({
    getParentRoute: () => event,
    path: "/",
    component: SchedulePage,
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
    component: function AccountSecurityRoute(): ReactElement {
      return <AccountSecurityPage services={services} />;
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
    component: function AdminSectionRoute(): ReactElement {
      return <AdminSection services={services} />;
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
        schedule,
        meetings,
        proposals,
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
