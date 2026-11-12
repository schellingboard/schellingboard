import { useState, type FormEvent } from "react";
import { settingsCalls, type EmailSettingsBody } from "../../commands/settings";
import { useFormMutation } from "../../commands/use-form-mutation";
import { Button } from "../../ui/button";
import { CheckboxField } from "../../ui/form";
import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

const OPTIONS: { name: keyof EmailSettingsBody; label: MessageDescriptor }[] = [
  {
    name: "rsvpChange",
    label: msg`a session I’ve RSVP’d to changes time or location, loses its host, or is deleted`,
  },
  {
    name: "hostChange",
    label: msg`a session I’m hosting changes time or location, or is deleted`,
  },
  {
    name: "cohostAdd",
    label: msg`someone adds me as a session host or co-host`,
  },
  {
    name: "proposalJoin",
    label: msg`someone joins a proposal I’m hosting as a co-host`,
  },
  {
    name: "proposalComment",
    label: msg`someone comments on a proposal I’m hosting`,
  },
  {
    name: "sessionComment",
    label: msg`someone comments on a session I’m hosting`,
  },
  { name: "profileComment", label: msg`someone comments on my profile` },
  {
    name: "commentThread",
    label: msg`someone comments on a proposal, session or profile I’ve commented on`,
  },
  { name: "meetingRequest", label: msg`someone asks me for a 1-on-1` },
  {
    name: "meetingResponse",
    label: msg`a 1-on-1 of mine is accepted, declined or canceled`,
  },
  {
    name: "sessionHeadsUp",
    label: msg`a session I’m hosting starts in an hour`,
  },
  {
    name: "attendeeCountReminder",
    label: msg`a session I’m hosting has ended, so I can record how many people attended`,
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

  const error = mutation.error;
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
      aria-label={t`Email settings`}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-lg font-semibold">
          <Trans>Email me when…</Trans>
        </legend>
        <p className="mb-1 text-sm text-fg-subtle">
          <Trans>
            Notifications go to the email address the organizers have for you.
            Contact an organizer to change it.
          </Trans>
        </p>
        {OPTIONS.map(({ name, label }) => (
          <CheckboxField
            key={name}
            name={name}
            label={i18n._(label)}
            checked={values[name]}
            onChange={(checked) => setValues({ ...values, [name]: checked })}
          />
        ))}
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          <Trans>Error: {error}</Trans>
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={mutation.pending} className="px-12">
          {mutation.pending ? t`Saving...` : t`Save`}
        </Button>
        {confirmed && (
          <span role="status" className="text-sm text-success-fg">
            {t`Saved`}
          </span>
        )}
      </div>
    </form>
  );
}
