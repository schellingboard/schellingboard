import { createRoute } from "@hono/zod-openapi";
import { emailSettingsSchema } from "@schellingboard/contracts/guest";
import {
  myNotificationsQuerySchema,
  myNotificationsSchema,
  notificationIdsSchema,
  notificationSchema,
} from "@schellingboard/contracts/notification";
import {
  pushEnabledSchema,
  pushEndpointSchema,
  pushSubscriptionSchema,
} from "@schellingboard/contracts/push";
import type { Notification } from "@schellingboard/domain/notification";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { NotificationUseCases } from "../application/use-cases";

const toNotificationView = (n: Notification) => ({
  id: n.id,
  type: n.type,
  text: n.text,
  url: n.url,
  createdAt: n.createdAt.toISOString(),
  readAt: n.readAt?.toISOString() ?? null,
});

const listMyNotifications = createRoute({
  method: "get",
  path: "/me/notifications",
  tags: ["notifications"],
  description: "The acting guest's newest notifications.",
  request: { query: myNotificationsQuerySchema },
  responses: {
    200: json(myNotificationsSchema, "The caller's notifications"),
    ...problemDefault,
  },
});

const markRead = createRoute({
  method: "post",
  path: "/me/notifications/read",
  tags: ["notifications"],
  description:
    "Marks the acting guest's notifications read; ids that are not theirs are skipped.",
  request: { headers: idempotencyHeaders, body: body(notificationIdsSchema) },
  responses: { 204: noContent("Marked read"), ...problemDefault },
});

const deleteMany = createRoute({
  method: "post",
  path: "/me/notifications/delete",
  tags: ["notifications"],
  description:
    "Deletes the acting guest's notifications; ids that are not theirs are skipped.",
  request: { headers: idempotencyHeaders, body: body(notificationIdsSchema) },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

const readOne = createRoute({
  method: "post",
  path: "/me/notifications/{id}/read",
  tags: ["notifications"],
  description: "Marks one of the acting guest's notifications read.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: {
    200: json(notificationSchema, "The notification, read"),
    ...problemDefault,
  },
});

const getEmailSettings = createRoute({
  method: "get",
  path: "/me/email-settings",
  tags: ["notifications"],
  description: "Which emails the acting guest receives.",
  responses: {
    200: json(emailSettingsSchema, "The caller's email settings"),
    ...problemDefault,
  },
});

const updateEmailSettings = createRoute({
  method: "put",
  path: "/me/email-settings",
  tags: ["notifications"],
  description: "Replaces which emails the acting guest receives.",
  request: { headers: idempotencyHeaders, body: body(emailSettingsSchema) },
  responses: { 204: noContent("Saved"), ...problemDefault },
});

const subscribe = createRoute({
  method: "post",
  path: "/me/push-subscriptions",
  tags: ["notifications"],
  description:
    "Remembers a browser's push subscription for the acting guest. Subscriptions are never sent back.",
  request: { headers: idempotencyHeaders, body: body(pushSubscriptionSchema) },
  responses: { 204: noContent("Remembered"), ...problemDefault },
});

const unsubscribe = createRoute({
  method: "post",
  path: "/me/push-subscriptions/remove",
  tags: ["notifications"],
  description:
    "Forgets the acting guest's subscription with this endpoint; anyone else's is left alone, and the answer is the same.",
  request: { headers: idempotencyHeaders, body: body(pushEndpointSchema) },
  responses: { 204: noContent("Forgotten"), ...problemDefault },
});

const checkEnabled = createRoute({
  method: "post",
  path: "/me/push-subscriptions/check",
  tags: ["notifications"],
  description:
    "Whether the subscription with this endpoint is the acting guest's. Changes nothing.",
  request: { headers: idempotencyHeaders, body: body(pushEndpointSchema) },
  responses: {
    200: json(pushEnabledSchema, "Whether this device notifies the caller"),
    ...problemDefault,
  },
});

export function addNotificationRoutes(
  app: App,
  notifications: () => NotificationUseCases
) {
  app.openapi(listMyNotifications, async (c) => {
    const result = await notifications().listMyNotifications(
      c.var.actor,
      c.req.valid("query")
    );
    if (!result.ok) return problem(result.error);
    const { notifications: listed, unreadCount, total } = result.value;
    return c.json(
      { notifications: listed.map(toNotificationView), unreadCount, total },
      200
    );
  });

  app.openapi(markRead, async (c) => {
    const result = await notifications().markNotificationsRead(
      c.var.actor,
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(deleteMany, async (c) => {
    const result = await notifications().deleteNotifications(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(readOne, async (c) => {
    const result = await notifications().readNotification(
      c.var.actor,
      { id: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toNotificationView(result.value), 200);
  });

  app.openapi(getEmailSettings, async (c) => {
    const result = await notifications().getMyEmailSettings(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(updateEmailSettings, async (c) => {
    const result = await notifications().updateMyEmailSettings(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(subscribe, async (c) => {
    const result = await notifications().subscribeToPush(
      c.var.actor,
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(unsubscribe, async (c) => {
    const result = await notifications().unsubscribeFromPush(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(checkEnabled, async (c) => {
    const result = await notifications().isPushEnabledHere(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.json({ enabled: result.value }, 200);
  });
}
