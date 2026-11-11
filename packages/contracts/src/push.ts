import { z } from "zod";

// What PushSubscription.toJSON() gives the browser, flattened. The caps are
// sanity limits: an endpoint is a URL the server later makes requests to, and
// the keys are fixed-length base64.
export const pushSubscriptionSchema = z.object({
  endpoint: z
    .url({ message: "Not a push endpoint" })
    .max(2000)
    // The server sends the notification to this address, so the one scheme
    // every push service speaks is the only one worth storing. Deliberately
    // not an allowlist of push services — see ADR 0006.
    .refine((url) => url.startsWith("https://"), {
      message: "Push endpoints must be https",
    }),
  p256dh: z.string().min(1).max(200),
  auth: z.string().min(1).max(200),
});

export const pushEndpointSchema = z.object({
  endpoint: z.string().min(1).max(2000),
});

export const pushEnabledSchema = z.object({ enabled: z.boolean() });

export const pushKeySchema = z.object({
  publicKey: z
    .string()
    .describe("The VAPID key a browser passes to pushManager.subscribe"),
});

export const pushDeviceQuerySchema = z.object({
  endpoint: z
    .string()
    .max(2000)
    .optional()
    .describe("This browser's endpoint, so the answer can mark its row"),
});

export const pushDeviceSchema = z.object({
  id: z.string().describe("Opaque; the endpoint itself is never sent back"),
  host: z.string().describe("The push service, the only hint about the device"),
  createdAt: z.iso.datetime({ offset: true }),
  current: z.boolean().describe("Whether this is the browser that asked"),
});

export const pushDevicesSchema = z.object({
  items: z.array(pushDeviceSchema),
});
