import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  type RouterHistory,
} from "@tanstack/react-router";
import type { ReactElement } from "react";
import { LegacyForward } from "./legacy-forward";
import { LEGACY_ROOT_PAGES } from "./legacy-pages";
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
  component: LegacyForward,
});

// A static route wins over `/$slug`, so no event can shadow a legacy page.
const legacyPages = LEGACY_ROOT_PAGES.map((name) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: `/${name}`,
    component: LegacyForward,
  })
);

export function createAppRouter(
  history?: RouterHistory,
  services: AppServices = defaultServices()
) {
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
  return createRouter({
    routeTree: rootRoute.addChildren([
      ...legacyPages,
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
