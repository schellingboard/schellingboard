export type { NotificationDeps } from "./ports";
export {
  createNotificationUseCases,
  type NotificationUseCases,
} from "./application/use-cases";
export { addNotificationRoutes } from "./http/routes";
export { unreadNotificationCount } from "./application/page-reads";
