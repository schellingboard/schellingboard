import { getRepositories } from "@/db/container";
import { actorMiddleware } from "./actor";
import { createApp } from "./create-app";
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
