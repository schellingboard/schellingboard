import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useRouter,
  type RouterHistory,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { scheduleStaysInLegacy } from "./forwards-to-legacy";
import { hardNavigate } from "./hard-navigate";
import { LegacyForward } from "./legacy-forward";
import { legacyHref } from "./legacy-href";
import { LEGACY_ROOT_PAGES } from "./legacy-pages";
import { SchedulePage } from "./schedule-page";
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
    component: function EventRoute() {
      const { slug } = event.useParams();
      const { search, hash } = useRouter().history.location;
      return scheduleStaysInLegacy(search, document.cookie) ? (
        <LegacySchedule where={{ pathname: `/${slug}`, search, hash }} />
      ) : (
        <SchedulePage services={services} slug={slug} />
      );
    },
  });
  return createRouter({
    routeTree: rootRoute.addChildren([...legacyPages, event, catchAll]),
    history,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
