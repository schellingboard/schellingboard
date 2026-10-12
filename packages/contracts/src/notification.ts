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
