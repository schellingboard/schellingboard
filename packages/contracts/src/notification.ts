import { z } from "zod";
import { pageSchema } from "./cursor-page";
import { emailSettingsSchema } from "./guest";

export const notificationSchema = z
  .object({
    id: z.string(),
    type: emailSettingsSchema.keyof(),
    text: z.string(),
    url: z.string().describe("Site-relative path to what happened"),
    createdAt: z.iso.datetime({ offset: true }),
    readAt: z.iso.datetime({ offset: true }).nullable(),
  })
  .meta({ id: "Notification" });

export const myNotificationsSchema = pageSchema(notificationSchema).extend({
  unreadCount: z.number().int().describe("Unread across every page"),
});

export const notificationIdsSchema = z.object({
  ids: z.array(z.string().min(1)).max(1000),
});

// Ids travel in the URL, and Node refuses request lines past about 16 KiB.
export const NOTIFICATION_IDS_MAX = 100;

export const notificationIdsQuerySchema = z.object({
  ids: z
    .string()
    .min(1)
    .describe("Comma-separated notification ids, at most 100")
    .transform((ids) => ids.split(",").filter(Boolean))
    .pipe(z.array(z.string().min(1)).max(NOTIFICATION_IDS_MAX)),
});
