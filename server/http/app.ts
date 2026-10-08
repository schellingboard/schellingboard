import { getRepositories } from "@/db/container";
import {
  commentUseCases,
  eventUseCases,
  meetingUseCases,
  notificationUseCases,
  peopleUseCases,
  proposalUseCases,
  sessionUseCases,
  settingsUseCases,
  venueUseCases,
} from "@/server/composition";
import { addCommentRoutes } from "@/server/modules/comments/module";
import { addAdminEventRoutes } from "@/server/modules/events/module";
import {
  addAdminMeetingRoutes,
  addMeetingRoutes,
} from "@/server/modules/meetings/module";
import { addNotificationRoutes } from "@/server/modules/notifications/module";
import {
  addAdminGuestRoutes,
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
import { addAdminSettingsRoutes } from "@/server/modules/settings/module";
import { addAdminVenueRoutes } from "@/server/modules/venue/module";
import { actorMiddleware } from "./actor";
import { createApp } from "./create-app";
import { addApiDocsRoutes } from "./docs";
import { addHealthRoute } from "./health";
import { idempotencyMiddleware } from "./idempotency";

export const API_BASE_PATH = "/api/v1";

export const api = createApp(API_BASE_PATH);
api.use("*", actorMiddleware);
api.use(
  "*",
  idempotencyMiddleware({ store: () => getRepositories().idempotency })
);
addHealthRoute(api);
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
addNotificationRoutes(api, notificationUseCases);
addAdminEventRoutes(api, eventUseCases);
addAdminVenueRoutes(api, venueUseCases);
addAdminUnavailabilityRoutes(api, sessionUseCases);
addAdminGuestRoutes(api, peopleUseCases);
addAdminSettingsRoutes(api, settingsUseCases);
