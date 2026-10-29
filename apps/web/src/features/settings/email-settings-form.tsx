import { useState, type FormEvent } from "react";
import { settingsCalls, type EmailSettingsBody } from "../../commands/settings";
import { useFormMutation } from "../../commands/use-form-mutation";
import { Button } from "../../ui/button";
import { CheckboxField } from "../../ui/form";

const OPTIONS: { name: keyof EmailSettingsBody; label: string }[] = [
  {
    name: "rsvpChange",
    label: "a session I’ve RSVP’d to changes time or location, or is deleted",
  },
  {
    name: "hostChange",
    label: "a session I’m hosting changes time or location, or is deleted",
  },
  { name: "cohostAdd", label: "someone adds me as a session co-host" },
  {
    name: "proposalJoin",
    label: "someone joins a proposal I’m hosting as a co-host",
  },
  {
    name: "proposalComment",
    label: "someone comments on a proposal I’m hosting",
  },
  {
    name: "sessionComment",
    label: "someone comments on a session I’m hosting",
  },
  { name: "profileComment", label: "someone comments on my profile" },
  {
    name: "commentThread",
    label:
      "someone comments on a proposal, session or profile I’ve commented on",
  },
  { name: "meetingRequest", label: "someone asks me for a 1-on-1" },
  {
    name: "meetingResponse",
    label: "a 1-on-1 of mine is accepted, declined or canceled",
  },
  {
    name: "sessionHeadsUp",
    label: "a session I’m hosting starts in an hour",
  },
  {
    name: "attendeeCountReminder",
    label:
      "a session I’m hosting has ended, so I can record how many people attended",
  },
];

export function EmailSettingsForm({
  initial,
  calls,
}: {
  initial: EmailSettingsBody;
  calls: Pick<ReturnType<typeof settingsCalls>, "saveEmailSettings">;
}) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState<EmailSettingsBody>();
  const mutation = useFormMutation({
    call: (key) => calls.saveEmailSettings(values, key),
  });

  const confirmed =
    saved && OPTIONS.every(({ name }) => saved[name] === values[name]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const sent = values;
    setSaved(undefined);
    const result = await mutation.submit();
    if (result?.ok) setSaved(sent);
  };

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="flex flex-col gap-4"
      aria-label="Email settings"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-lg font-semibold">
          Email me when&hellip;
        </legend>
        <p className="mb-1 text-sm text-fg-subtle">
          Notifications go to the email address the organizers have for you.
          Contact an organizer to change it.
        </p>
        {OPTIONS.map(({ name, label }) => (
          <CheckboxField
            key={name}
            name={name}
            label={label}
            checked={values[name]}
            onChange={(checked) => setValues({ ...values, [name]: checked })}
          />
        ))}
      </fieldset>

      {mutation.error && (
        <p role="alert" className="text-sm text-danger-fg">
          Error: {mutation.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={mutation.pending} className="px-12">
          {mutation.pending ? "Saving..." : "Save"}
        </Button>
        {confirmed && (
          <span role="status" className="text-sm text-success-fg">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
