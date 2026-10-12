"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eventUseCases } from "@/server/composition";
import { resolveActor } from "@/server/kernel/actor";
import { serverNow } from "@/utils/dev-clock-server";
import type { Day } from "@schellingboard/domain/event";
import type { Result } from "@/server/kernel/result";
import type { AdminActionResult } from "./admin-guests";

export type DayInput = {
  eventId: string;
  start: string;
  end: string;
  startBookings: string;
  endBookings: string;
};

async function actor() {
  return resolveActor(await cookies());
}

function parseDateTime(value: string): Date | undefined {
  return value ? new Date(value + "Z") : undefined;
}

const window = (input: DayInput) => ({
  start: parseDateTime(input.start),
  end: parseDateTime(input.end),
  startBookings: parseDateTime(input.startBookings),
  endBookings: parseDateTime(input.endBookings),
});

function settled(result: Result<Day>): AdminActionResult {
  if (!result.ok) {
    return { ok: false, error: result.error.detail ?? "Something went wrong" };
  }
  revalidatePath("/legacy/admin");
  revalidatePath("/legacy/admin/events");
  revalidatePath(`/legacy/admin/events/${result.value.eventId}`);
  return { ok: true };
}

export async function createDayAction(
  input: DayInput
): Promise<AdminActionResult> {
  return settled(
    await eventUseCases().createDay(
      await actor(),
      {
        ...window(input),
        eventId: input.eventId,
      },
      await serverNow()
    )
  );
}

export async function updateDayAction(
  input: DayInput & { id: string; expectedVersion: number }
): Promise<AdminActionResult> {
  return settled(
    await eventUseCases().updateDay(
      await actor(),
      {
        ...window(input),
        id: input.id,
        expectedVersion: input.expectedVersion,
      },
      await serverNow()
    )
  );
}

export async function deleteDayAction(input: {
  id: string;
  eventId: string;
}): Promise<AdminActionResult> {
  return settled(
    await eventUseCases().deleteDay(await actor(), input, await serverNow())
  );
}
