import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";
import { parseUserImportCsv } from "@/utils/user-import";
import type { PeopleDeps } from "../ports";
import { adminRequired, eventNotFound } from "./admin-guests";

// Guests are matched by email, case-insensitively: existing ones are left
// unchanged but still assigned, so re-running an import changes nothing.
export const importGuests =
  ({ repos }: PeopleDeps) =>
  async (
    actor: Actor,
    input: { csv: string; eventIds: string[] }
  ): Promise<Result<{ created: number; existing: number }>> => {
    if (!actor.admin) return adminRequired();
    const eventIds = [...new Set(input.eventIds)];
    for (const eventId of eventIds) {
      if (!(await repos.events.findById(eventId))) return eventNotFound();
    }

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

    const { created } = await repos.guests.importAndAssign(
      parsed.rows,
      eventIds
    );
    return ok({ created, existing: parsed.rows.length - created });
  };
