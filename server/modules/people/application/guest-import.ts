import type { Actor } from "@/server/kernel/actor";
import { byAdmin } from "@/server/kernel/change-context";
import { recordingShownGuests } from "@/server/kernel/shown-guests";
import { ok, type Result } from "@/server/kernel/result";
import { parseUserImportCsv } from "@/utils/user-import";
import type { PeopleDeps } from "../ports";
import { adminRequired, eventNotFound } from "./admin-guests";

// Guests are matched by email, case-insensitively: existing ones are left
// unchanged but still assigned, so re-running an import changes nothing.
export const importGuests =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: { csv: string; eventIds: string[] },
    now: Date
  ): Promise<Result<{ created: number; existing: number }>> => {
    if (!actor.admin) return adminRequired();
    const eventIds = [...new Set(input.eventIds)];
    const parsed = parseUserImportCsv(input.csv);
    if (!parsed.ok) {
      return {
        ok: false,
        error: {
          kind: "invalid",
          code: "guestImport.invalid",
          detail: "Invalid CSV file",
          errors: parsed.errors.map((message) => ({ path: "csv", message })),
        },
      };
    }

    const rows = parsed.rows;
    return uow.run(async (tx) => {
      for (const eventId of eventIds) {
        if (!(await tx.events.findById(eventId))) return eventNotFound();
      }
      const { created } = await recordingShownGuests(
        tx,
        eventIds,
        () => tx.guests.importAndAssign(rows, eventIds),
        byAdmin(actor, now)
      );
      return ok({ created, existing: rows.length - created });
    });
  };
