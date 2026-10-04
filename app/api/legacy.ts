import { NextRequest } from "next/server";
import { resolveActor, type Actor } from "@/server/kernel/actor";
import { HTTP_STATUS_BY_KIND, type AppError } from "@/server/kernel/result";
import { guestProtectionError } from "@/utils/acting-guest";

// From the headers alone: wrapping the request itself would consume its body.
export function legacyActor(req: Request): Promise<Actor> {
  return resolveActor(
    new NextRequest(req.url, { headers: req.headers }).cookies
  );
}

export function legacyRefusal(error: AppError): Response {
  if (error.code === "guest.protected") return guestProtectionError();
  return Response.json(
    { error: error.detail },
    { status: HTTP_STATUS_BY_KIND[error.kind] }
  );
}

// Blank stays unset; anything else, an invalid date included, goes to the use
// case, which refuses it by the field's name.
export const legacyDate = (value: string | undefined) =>
  value ? new Date(value) : undefined;
