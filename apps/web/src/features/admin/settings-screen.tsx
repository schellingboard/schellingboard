import { useState, type FormEvent } from "react";
import {
  MAP_REQUIREMENTS_HINT,
  MAX_MAP_BYTES,
} from "@schellingboard/domain/map-image-constraints";
import type { AdminSettingsCalls } from "../../commands/admin-settings";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { AdminSettings } from "../../queries/admin-settings";
import { Button } from "../../ui/button";
import {
  CheckboxField,
  FileField,
  MarkdownField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { jumpTo, shown } from "./use-section-save";

function SettingsForm({
  settings,
  calls,
  onSaved,
}: {
  settings: AdminSettings;
  calls: AdminSettingsCalls;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(settings.title);
  const [description, setDescription] = useState(settings.description);
  const [image, setImage] = useState<File>();
  const [removeMap, setRemoveMap] = useState(false);
  const [saved, setSaved] = useState(false);
  const [refused, setRefused] = useState<Record<string, string>>({});
  const [fileKey, setFileKey] = useState(0);
  const mutation = useFormMutation({
    call: (key) =>
      calls.save(
        { title, description, image: removeMap ? undefined : image, removeMap },
        key
      ),
    fieldNames: ["title", "description"],
    explainRefusals: true,
  });
  const tooBig = image && image.size > MAX_MAP_BYTES;
  const fields = { ...mutation.fields, ...refused };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setRefused({});
    if (tooBig) return;
    const result = await mutation.submit();
    if (!result) return;
    if (result.ok) {
      setSaved(true);
      setRemoveMap(false);
      setImage(undefined);
      setFileKey((k) => k + 1);
      onSaved();
    } else if (result.kind === "refused") {
      if (result.code === "settings.mapInvalid")
        setRefused({ image: result.message });
      else if (result.code === "settings.titleRequired")
        setRefused({ title: result.message });
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => void submit(e)}
      className="max-w-2xl space-y-4"
    >
      <TextField
        label="Title"
        name="title"
        required
        value={title}
        onChange={setTitle}
        error={fields.title}
      />
      <MarkdownField
        label="Description"
        name="description"
        value={description}
        onChange={setDescription}
        error={fields.description}
      />
      <div className="space-y-1">
        {settings.mapImageUrl && !removeMap && (
          <img
            src={settings.mapImageUrl}
            alt="Current map"
            width={240}
            height={180}
            className="rounded border border-line-subtle"
          />
        )}
        <FileField
          key={fileKey}
          label="Map"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          hint={MAP_REQUIREMENTS_HINT}
          disabled={removeMap}
          onChange={setImage}
          error={
            fields.image ??
            (tooBig
              ? `Map exceeds ${MAX_MAP_BYTES / 1024 / 1024} MB.`
              : undefined)
          }
        />
        {settings.mapImageUrl && (
          <CheckboxField
            label="Remove current map"
            checked={removeMap}
            onChange={setRemoveMap}
          />
        )}
      </div>
      <FormErrorSummary
        fields={fields}
        error={Object.keys(refused).length > 0 ? null : shown(mutation.error)}
        onJump={jumpTo}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={mutation.pending}>
          {mutation.pending ? "Saving..." : "Save settings"}
        </Button>
        {saved && <p className="text-sm text-success-fg">Settings saved.</p>}
      </div>
    </form>
  );
}

export function SettingsScreen({
  status,
  settings,
  calls,
  onSaved,
}: {
  status: "loading" | "ready" | "error";
  settings: AdminSettings;
  calls: AdminSettingsCalls;
  /** The settings are out of date: load them again, and the title in the admin header. */
  onSaved: () => void;
}) {
  if (status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        Could not load the settings.
      </p>
    );
  if (status === "loading") return <p className="text-sm">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-fg">Settings</h1>
      <section aria-label="Site settings" className="space-y-4">
        <SettingsForm settings={settings} calls={calls} onSaved={onSaved} />
      </section>
    </div>
  );
}
