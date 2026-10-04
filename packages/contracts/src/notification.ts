import { z } from "zod";
import { emailSettingsSchema } from "./guest";

export const notificationSchema = z.object({
  id: z.string(),
  type: emailSettingsSchema.keyof(),
  text: z.string(),
  url: z.string().describe("Site-relative path to what happened"),
  createdAt: z.iso.datetime({ offset: true }),
  readAt: z.iso.datetime({ offset: true }).nullable(),
});

export const myNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const myNotificationsSchema = z.object({
  notifications: z.array(notificationSchema).describe("Newest first"),
  unreadCount: z.number().int(),
  total: z.number().int(),
});

export const notificationIdsSchema = z.object({
  ids: z.array(z.string().min(1)).max(1000),
});
