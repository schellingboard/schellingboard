import { useState, type FormEvent } from "react";
import type { AdminGuestCalls } from "../../commands/admin-guests";
import { useFormMutation } from "../../commands/use-form-mutation";
import { BackLink } from "../../ui/back-link";
import { Button } from "../../ui/button";
import { FileField, PeopleField } from "../../ui/form";
import { plural } from "./list-paging";

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

  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/admin/users">Users</BackLink>
      <h1 className="text-2xl font-bold text-fg">Import users</h1>
      <p className="text-sm text-fg-muted">
        Upload a CSV file with a header row containing <code>name</code> and{" "}
        <code>email</code> columns (extra columns are ignored). Users are
        matched by email: existing users are left unchanged, new ones are
        created. Both are assigned to the selected events, so re-running an
        import is safe.
      </p>
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <FileField
          label="CSV file"
          accept=".csv,text/csv"
          onChange={(chosen) => {
            setFile(chosen);
            setSummary(undefined);
            setProblem(undefined);
          }}
        />
        <PeopleField
          label="Assign to events"
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
            {plural(summary.created, "user", "users")} created,{" "}
            {plural(summary.existing, "user", "users")} already existed
            (skipped, but still assigned to the selected events).
          </p>
        )}
        <Button type="submit" disabled={mutation.pending || !file}>
          {mutation.pending ? "Importing..." : "Import"}
        </Button>
      </form>
    </div>
  );
}
