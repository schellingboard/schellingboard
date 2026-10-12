import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  type RouterHistory,
} from "@tanstack/react-router";
import { LegacyForward } from "./legacy-forward";

const rootRoute = createRootRoute({ component: Outlet });

const catchAll = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: LegacyForward,
});

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree: rootRoute.addChildren([catchAll]),
    history,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
