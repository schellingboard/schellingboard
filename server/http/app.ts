import { actorMiddleware } from "./actor";
import { createApp } from "./create-app";
import { addHealthRoute } from "./health";

export const API_BASE_PATH = "/api/v1";

export const api = createApp(API_BASE_PATH);
api.use("*", actorMiddleware);
addHealthRoute(api);
