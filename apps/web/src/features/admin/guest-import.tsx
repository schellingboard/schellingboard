import { plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type FormEvent, useState } from "react";

import type { AdminGuestCalls } from "../../commands/admin-guests";
import { useFormMutation } from "../../commands/use-form-mutation";
import { BackLink } from "../../ui/back-link";
import { Button } from "../../ui/button";
import { FileField, PeopleField } from "../../ui/form";

type Problem = { detail?: string; errors?: { message: string }[] };
type Summary = { created: number; existing: number };

export function UserImportScreen({
  events,
  calls,
}: {
  events: { id: string; name: string }[];
  calls: AdminGuestCalls;
}) {
  const [file, setFile] = useState<File>();
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [summary, setSummary] = useState<Summary>();
  const [problem, setProblem] = useState<Problem>();
  const mutation = useFormMutation({
    call: async (key) => calls.importCsv(await file!.text(), eventIds, key),
    explainRefusals: true,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSummary(undefined);
    setProblem(undefined);
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) setSummary(result.data);
    else if (result.kind === "fields")
      setProblem(result.problem as Problem | undefined);
  };

  const { created, existing } = summary ?? { created: 0, existing: 0 };
  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/admin/users">
        <Trans>Users</Trans>
      </BackLink>
      <h1 className="text-2xl font-bold text-fg">
        <Trans>Import users</Trans>
      </h1>
      <p className="text-sm text-fg-muted">
        <Trans>
          Upload a CSV file with a header row containing <code>name</code> and{" "}
          <code>email</code> columns (extra columns are ignored). The email may
          be left blank for a user without one. Users are matched by email, or
          by exact name when the email is blank: existing users are left
          unchanged, new ones are created. Both are assigned to the selected
          events, so re-running an import is safe.
        </Trans>
      </p>
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <FileField
          label={t`CSV file`}
          accept=".csv,text/csv"
          onChange={(chosen) => {
            setFile(chosen);
            setSummary(undefined);
            setProblem(undefined);
          }}
        />
        <PeopleField
          label={t`Assign to events`}
          people={events}
          selected={eventIds}
          onChange={setEventIds}
        />
        {(problem ?? mutation.error) && (
          <div role="alert" className="space-y-1 text-sm text-danger-fg">
            <p>{problem?.detail ?? mutation.error}</p>
            {problem?.errors && (
              <ul className="list-disc pl-5">
                {problem.errors.map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {summary && (
          <p role="status" className="text-sm text-success-fg">
            {t`${plural(created, {
              one: "# user",
              other: "# users",
            })} created, ${plural(existing, {
              one: "# user",
              other: "# users",
            })} already existed (skipped, but still assigned to the selected events).`}
          </p>
        )}
        <Button type="submit" disabled={mutation.pending || !file}>
          {mutation.pending ? t`Importing...` : t`Import`}
        </Button>
      </form>
    </div>
  );
}
