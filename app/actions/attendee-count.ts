"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { attendeeCountFormSchema } from "@schellingboard/contracts/attendee-count";
import { sessionUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import { requireSiteAuth } from "@/utils/action-auth";
import { serverNow } from "@/utils/dev-clock-server";

export type AttendeeCountResult =
  | { ok: true; count: number | null }
  | { ok: false; error: string | z.core.$ZodIssue[] };

function toActionResult(
  result: Result<number | null>,
  value?: unknown
): AttendeeCountResult {
  if (result.ok) return { ok: true, count: result.value };
  const { code, detail } = result.error;
  if (code.startsWith("guest."))
    return { ok: false, error: "No user is logged in" };
  // Field-level issues, so the message lands on the input (ADR 0003).
  if (code === "attendeeCount.invalid") {
    const parsed = attendeeCountFormSchema.safeParse({ count: value });
    if (!parsed.success) return { ok: false, error: parsed.error.issues };
  }
  return { ok: false, error: detail ?? "Something went wrong" };
}

export async function getAttendeeCountAction(
  sessionId: string
): Promise<AttendeeCountResult> {
  await requireSiteAuth();
  return toActionResult(
    await sessionUseCases().getAttendeeCount(
      await resolveActor(await cookies()),
      { sessionId },
      await serverNow()
    )
  );
}

export async function setAttendeeCountAction(
  sessionId: string,
  value: unknown
): Promise<AttendeeCountResult> {
  await requireSiteAuth();
  return toActionResult(
    await sessionUseCases().recordAttendeeCount(
      await resolveActor(await cookies()),
      { sessionId, count: value },
      await serverNow()
    ),
    value
  );
}
