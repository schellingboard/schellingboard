import { getRepositories } from "@/db/container";
import {
  commentUseCases,
  dispatchReminders,
  eventUseCases,
  meetingUseCases,
  notificationUseCases,
  peopleUseCases,
  proposalUseCases,
  sessionUseCases,
  settingsUseCases,
  updateUseCases,
  venueUseCases,
} from "@/server/composition";
import { addFeedRoutes } from "@/server/feed/routes";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { addCommentRoutes } from "@/server/modules/comments/module";
import {
  addAdminEventRoutes,
  addEventReadRoutes,
} from "@/server/modules/events/module";
import {
  addAdminMeetingRoutes,
  addMeetingRoutes,
} from "@/server/modules/meetings/module";
import { addNotificationRoutes } from "@/server/modules/notifications/module";
import {
  addAdminGuestRoutes,
  addAuthRoutes,
  addCredentialRoutes,
  addPeopleRoutes,
} from "@/server/modules/people/module";
import {
  addProposalRoutes,
  addVoteRoutes,
} from "@/server/modules/proposals/module";
import {
  addAdminUnavailabilityRoutes,
  addAttendeeCountRoutes,
  addRsvpRoutes,
  addSessionRoutes,
} from "@/server/modules/sessions/module";
import {
  addAdminSettingsRoutes,
  addSiteRoutes,
} from "@/server/modules/settings/module";
import { addAdminUpdateRoutes } from "@/server/modules/updates/module";
import { addAdminVenueRoutes } from "@/server/modules/venue/module";
import { actorMiddleware } from "./actor";
import { createApp } from "./create-app";
import { addApiDocsRoutes } from "./docs";
import { addDevRoutes } from "./dev";
import { addSiteAuthRoute } from "./site-auth";
import { addHealthRoute } from "./health";
import { idempotencyMiddleware } from "./idempotency";
import { authRateLimitMiddleware, rateLimitMiddleware } from "./rate-limit";

export const API_BASE_PATH = "/api/v1";

export const api = createApp(API_BASE_PATH);
api.use("*", actorMiddleware);
api.use("*", rateLimitMiddleware([`${API_BASE_PATH}/health`]));
api.use("/auth/site", authRateLimitMiddleware);
api.use("/auth/login", authRateLimitMiddleware);
api.use("/auth/login-code", authRateLimitMiddleware);
api.use("/auth/reset-link", authRateLimitMiddleware);
api.use("/auth/reset", authRateLimitMiddleware);
api.use("/auth/join", authRateLimitMiddleware);
api.use(
  "*",
  idempotencyMiddleware({ store: () => getRepositories().idempotency })
);
addHealthRoute(api);
addDevRoutes(api, dispatchReminders);
addApiDocsRoutes(api, API_BASE_PATH);
addSessionRoutes(api, sessionUseCases);
addRsvpRoutes(api, sessionUseCases);
addProposalRoutes(api, proposalUseCases);
addVoteRoutes(api, proposalUseCases);
addCommentRoutes(api, commentUseCases);
addMeetingRoutes(api, meetingUseCases);
addAdminMeetingRoutes(api, meetingUseCases);
addAttendeeCountRoutes(api, sessionUseCases);
addPeopleRoutes(api, peopleUseCases);
addAuthRoutes(api, peopleUseCases);
addSiteAuthRoute(api);
addCredentialRoutes(api, peopleUseCases);
addNotificationRoutes(api, notificationUseCases);
addEventReadRoutes(api, eventUseCases);
addFeedRoutes(api, { uow: unitOfWork });
addAdminEventRoutes(api, eventUseCases);
addAdminVenueRoutes(api, venueUseCases);
addAdminUnavailabilityRoutes(api, sessionUseCases);
addAdminGuestRoutes(api, peopleUseCases);
addSiteRoutes(api, settingsUseCases);
addAdminSettingsRoutes(api, settingsUseCases);
addAdminUpdateRoutes(api, updateUseCases);
