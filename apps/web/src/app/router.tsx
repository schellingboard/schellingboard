import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useLocation,
  useRouter,
  type RouterHistory,
} from "@tanstack/react-router";
import { useEffect, type ReactElement } from "react";
import { scheduleStaysInLegacy } from "./forwards-to-legacy";
import { hardNavigate } from "./hard-navigate";
import { LegacyForward } from "./legacy-forward";
import { legacyHref } from "./legacy-href";
import { LEGACY_ROOT_PAGES } from "./legacy-pages";
import {
  ProposalFormPage,
  ProposalsPage,
  QuickVotingPage,
} from "./proposals-pages";
import { EventLayout } from "./event-page";
import { SchedulePage } from "./schedule-page";
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

function LegacySchedule({
  where,
}: {
  where: Parameters<typeof legacyHref>[0];
}) {
  const href = legacyHref(where);
  useEffect(() => hardNavigate(href), [href]);
  return null;
}

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
      const pathname = useLocation({ select: (l) => l.pathname });
      const { search, hash } = useRouter().history.location;
      return pathname.replace(/\/$/, "") === `/${slug}` &&
        scheduleStaysInLegacy(search) ? (
        <LegacySchedule where={{ pathname: `/${slug}`, search, hash }} />
      ) : (
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
  return createRouter({
    routeTree: rootRoute.addChildren([
      ...legacyPages,
      event.addChildren([
        schedule,
        proposals,
        quickVoting,
        newProposal,
        editProposal,
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
