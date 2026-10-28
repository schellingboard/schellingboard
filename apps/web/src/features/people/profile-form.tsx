import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { profileBodySchema } from "@schellingboard/contracts/guest";
import { AVATAR_MAX_SIZE } from "@schellingboard/domain/avatar-image";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
  MAX_CONTACTS,
  MAX_LANGUAGES,
  type ContactType,
} from "@schellingboard/domain/guest";
import { languageSuggestions } from "@schellingboard/domain/language-suggestions";
import { CORE_PROMPTS, PROMPT_POOL } from "@schellingboard/domain/prompt-pool";
import { containsIgnoringAccents } from "@schellingboard/domain/search-text";
import {
  FIX_FIELDS_MESSAGE,
  validateFields,
  type FieldErrors,
} from "../../commands/mutation";
import type {
  ProfileBody,
  ProfileFormCalls,
} from "../../commands/profile-form";
import { useFormMutation } from "../../commands/use-form-mutation";
import type { DirectoryEntry } from "../../queries/directory";
import { Avatar } from "../../ui/avatar";
import { ArrowPathIcon } from "../../ui/icons";
import { Button } from "../../ui/button";
import {
  ComboboxField,
  MarkdownField,
  SelectField,
  TextField,
} from "../../ui/form";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { resizeImage } from "../../ui/resize-image";

export type ProfileDraft = Pick<
  DirectoryEntry,
  | "id"
  | "name"
  | "aboutMe"
  | "avatarUrl"
  | "pronouns"
  | "basedIn"
  | "prompts"
  | "languages"
  | "contacts"
  | "version"
>;

export type ProfileFormProps = {
  profile: ProfileDraft;
  links: { people: string; settings: string };
  actions: ProfileFormCalls;
  /** Cuts the chosen picture down before it is sent; the server has the final say. */
  prepareImage?: (file: Blob) => Promise<{ blob: Blob } | { error: string }>;
  /** Saved: the caller leaves the form. */
  onDone: () => void;
};

const PRONOUNS = [
  "He/Him",
  "She/Her",
  "They/Them",
  "He/They",
  "She/They",
  "Any pronouns",
  "Ask me",
];

const LINK = "text-brand-fg underline hover:text-brand-fg-hover";
const TEXT_BUTTON = "text-sm text-brand-fg hover:text-brand-fg-hover";

type Row<T> = T & { key: number };
type ContactRow = { type: ContactType; label: string; value: string };
type Photo =
  { kind: "keep" } | { kind: "file"; file: File } | { kind: "reset" };

let keySeed = 0;
const rows = <T,>(items: T[]): Row<T>[] =>
  items.map((item) => ({ ...item, key: keySeed++ }));

function pickUnusedPrompt(used: string[]): string | undefined {
  const available = PROMPT_POOL.filter((p) => !used.includes(p));
  return available[Math.floor(Math.random() * available.length)];
}

/** Core prompts first, empty when unanswered, then the rest. */
function seedPrompts(saved: ProfileDraft["prompts"]) {
  const answers = new Map((saved ?? []).map((p) => [p.prompt, p.answer]));
  return [
    ...CORE_PROMPTS.map((prompt) => ({
      prompt,
      answer: answers.get(prompt) ?? "",
    })),
    ...(saved ?? []).filter((p) => !CORE_PROMPTS.includes(p.prompt)),
  ];
}

function prepareWithCanvas(file: Blob) {
  return resizeImage(document.createElement("canvas"), file, AVATAR_MAX_SIZE);
}

/** The edit-profile screen: the details, and the photo through its own endpoints. */
export function ProfileForm({
  profile,
  links,
  actions,
  prepareImage = prepareWithCanvas,
  onDone,
}: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "");
  const [basedIn, setBasedIn] = useState(profile.basedIn ?? "");
  const [aboutMe, setAboutMe] = useState(profile.aboutMe ?? "");
  const [prompts, setPrompts] = useState(() =>
    rows(seedPrompts(profile.prompts))
  );
  const [languages, setLanguages] = useState(() =>
    rows((profile.languages ?? []).map((value) => ({ value })))
  );
  const [contacts, setContacts] = useState(() =>
    rows(
      (profile.contacts ?? []).map((c) => ({
        type: c.type,
        label: c.label ?? "",
        value: c.value,
      }))
    )
  );
  const [photo, setPhoto] = useState<Photo>({ kind: "keep" });
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState({
    prompts: (profile.prompts ?? []).length > 0,
    languages: (profile.languages ?? []).length > 0,
    contacts: (profile.contacts ?? []).length > 0,
  });
  const [checking, setChecking] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const focusing = useRef<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const picker = useRef<HTMLButtonElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useRef<Blob | null>(null);
  const version = useRef(profile.version);
  const photoDone = useRef(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const body = useRef<ProfileBody | null>(null);

  const languageOptions = useMemo(() => languageSuggestions(), []);
  const preview = useMemo(
    () =>
      photo.kind === "file" && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(photo.file)
        : null,
    [photo]
  );
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const next: ProfileBody = {
    name,
    aboutMe,
    pronouns,
    basedIn,
    prompts: prompts.map(({ prompt, answer }) => ({ prompt, answer })),
    languages: languages.map((l) => l.value),
    contacts: contacts.map(({ type, label, value }) => ({
      type,
      label,
      value,
    })),
    expectedVersion: profile.version,
  };
  const invalid = validateFields(profileBodySchema, next);
  const clientErrors: FieldErrors = checking ? (invalid ?? {}) : {};
  const hasClientErrors = Object.keys(clientErrors).length > 0;

  const mutation = useFormMutation({
    call: async (key) => {
      if (!photoDone.current && photo.kind !== "keep") {
        const answer =
          photo.kind === "file"
            ? await actions.replaceAvatar(
                upload.current!,
                version.current,
                `${key}-photo`
              )
            : await actions.removeAvatar(version.current, `${key}-photo`);
        if (!answer.response.ok) return answer;
        version.current = answer.data?.version ?? version.current;
        photoDone.current = true;
        setPhotoSaved(true);
      }
      return actions.save(
        { ...body.current!, expectedVersion: version.current },
        key
      );
    },
  });
  const fields: FieldErrors = hasClientErrors
    ? clientErrors
    : { ...mutation.fields, ...(photoError ? { avatar: photoError } : {}) };
  const failure = hasClientErrors ? null : mutation.error;

  const sectionOf = (field: string) =>
    (["prompts", "languages", "contacts"] as const).find((s) =>
      field.startsWith(s)
    );

  const jump = (field: string) => {
    if (field === "avatar") return picker.current?.focus();
    const section = sectionOf(field);
    focusing.current = field;
    setOpen((o) => ({ ...o, ...(section ? { [section]: true } : {}) }));
  };
  useEffect(() => {
    if (!focusing.current) return;
    formRef.current
      ?.querySelector<HTMLElement>(`[name="${focusing.current}"]`)
      ?.focus();
    focusing.current = null;
  }, [open]);

  const choose = (file: File | undefined) => {
    if (file) setPhoto({ kind: "file", file });
    setPhotoError(null);
    photoDone.current = false;
    setPhotoSaved(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    choose(e.dataTransfer.files[0]);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mutation.pending) return;
    setChecking(!!invalid);
    if (invalid) return;
    setPhotoError(null);
    if (photo.kind === "file" && !photoDone.current) {
      try {
        const prepared = await prepareImage(photo.file);
        if ("error" in prepared) return setPhotoError(prepared.error);
        upload.current = prepared.blob;
      } catch {
        upload.current = photo.file;
      }
    }
    body.current = next;
    if ((await mutation.submit())?.ok) onDone();
  };

  const shownPhoto =
    photo.kind === "reset" ? null : (preview ?? profile.avatarUrl);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-24">
      <a
        href={links.people}
        className="inline-block py-1 -my-1 text-sm text-fg-subtle hover:text-fg-muted"
      >
        ← Attendees
      </a>
      <h1 className="text-2xl font-bold">Edit profile</h1>
      <p className="text-sm text-fg-subtle">
        Everything here is shown on your public profile. Email notifications and
        other private preferences live in{" "}
        <a href={links.settings} className={LINK}>
          Settings
        </a>
        .
      </p>

      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => void onSubmit(e)}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            ref={picker}
            onClick={() => fileInput.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            className={`flex cursor-pointer items-center gap-4 rounded-full pe-4 hover:text-brand-fg ${dragging ? "outline-4 outline-dashed outline-line" : ""}`}
          >
            <Avatar name={name} size="sm" image={shownPhoto} />
            <span>Change profile picture</span>
          </button>
          <button
            type="button"
            className={TEXT_BUTTON}
            onClick={() => {
              setPhoto(
                profile.avatarUrl ? { kind: "reset" } : { kind: "keep" }
              );
              setPhotoError(null);
              photoDone.current = false;
              setPhotoSaved(false);
            }}
          >
            Reset
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </div>
        {fields.avatar && (
          <p className="text-sm text-danger-fg">{fields.avatar}</p>
        )}

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <TextField
              label="Name"
              name="name"
              required
              value={name}
              onChange={setName}
              placeholder="Your name"
              error={fields.name}
            />
          </div>
          <ComboboxField
            label="Pronouns"
            name="pronouns"
            value={pronouns}
            onChange={setPronouns}
            options={PRONOUNS}
            placeholder="He/Him/His/They/etc."
            error={fields.pronouns}
          />
        </div>
        <TextField
          label="Based in"
          name="basedIn"
          value={basedIn}
          onChange={setBasedIn}
          placeholder="City, region, or country"
          error={fields.basedIn}
        />
        <MarkdownField
          label="About me"
          name="aboutMe"
          value={aboutMe}
          onChange={setAboutMe}
          placeholder="Tell others about yourself"
          error={fields.aboutMe}
        />

        <Section
          title="Conversation starters"
          hint="Optional prompts that give people something to ask you about"
          open={open.prompts}
          onToggle={() => setOpen((o) => ({ ...o, prompts: !o.prompts }))}
        >
          {prompts.map((row, i) => {
            const core = CORE_PROMPTS.includes(row.prompt);
            const change = (patch: Partial<Row<(typeof prompts)[number]>>) =>
              setPrompts(
                prompts.map((r) => (r === row ? { ...r, ...patch } : r))
              );
            return (
              <div key={row.key} className="flex flex-col gap-1">
                {!core && (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className={TEXT_BUTTON}
                      aria-label="Suggest a different prompt"
                      title="Suggest a different prompt"
                      onClick={() => {
                        const pick = pickUnusedPrompt(
                          prompts.map((p) => p.prompt)
                        );
                        if (pick) change({ prompt: pick, answer: "" });
                      }}
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={TEXT_BUTTON}
                      onClick={() =>
                        setPrompts(prompts.filter((r) => r !== row))
                      }
                    >
                      Remove
                    </button>
                  </div>
                )}
                <TextField
                  label={row.prompt}
                  name={`prompts.${i}.answer`}
                  value={row.answer}
                  onChange={(answer) => change({ answer })}
                  placeholder="A sentence or two"
                  error={fields[`prompts.${i}.answer`]}
                />
              </div>
            );
          })}
          <button
            type="button"
            className={`${TEXT_BUTTON} w-fit font-semibold`}
            onClick={() => {
              const pick = pickUnusedPrompt(prompts.map((p) => p.prompt));
              if (pick)
                setPrompts([
                  ...prompts,
                  ...rows([{ prompt: pick, answer: "" }]),
                ]);
            }}
          >
            Suggest a prompt
          </button>
          <p className="text-sm text-fg-subtle">Markdown supported</p>
        </Section>

        <Section
          title="Languages"
          hint="Languages you're happy to talk in"
          open={open.languages}
          onToggle={() => setOpen((o) => ({ ...o, languages: !o.languages }))}
        >
          {languages.map((row, i) => (
            <div key={row.key} className="flex items-start gap-2">
              <div className="flex-1">
                <ComboboxField
                  label="Language"
                  hideLabel
                  name={`languages.${i}`}
                  value={row.value}
                  onChange={(value) =>
                    setLanguages(
                      languages.map((r) => (r === row ? { ...r, value } : r))
                    )
                  }
                  options={
                    row.value.trim()
                      ? languageOptions.filter((o) =>
                          containsIgnoringAccents(o, row.value.trim())
                        )
                      : languageOptions
                  }
                  placeholder="Language"
                  error={fields[`languages.${i}`]}
                />
              </div>
              <button
                type="button"
                className={`${TEXT_BUTTON} mt-2`}
                onClick={() => setLanguages(languages.filter((r) => r !== row))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className={`${TEXT_BUTTON} w-fit font-semibold disabled:text-fg-subtle`}
            disabled={languages.length >= MAX_LANGUAGES}
            onClick={() =>
              setLanguages([...languages, ...rows([{ value: "" }])])
            }
          >
            Add language
          </button>
          {fields.languages && (
            <p role="alert" className="text-sm text-danger-fg">
              {fields.languages}
            </p>
          )}
        </Section>

        <Section
          title="Contact details"
          hint="Shown publicly on your profile — only add what you want visible"
          open={open.contacts}
          onToggle={() => setOpen((o) => ({ ...o, contacts: !o.contacts }))}
        >
          {contacts.map((row, i) => {
            const change = (patch: Partial<typeof row>) =>
              setContacts(
                contacts.map((r) => (r === row ? { ...r, ...patch } : r))
              );
            return (
              <div
                key={row.key}
                className="flex flex-col gap-2 sm:flex-row sm:items-start"
              >
                <SelectField
                  label="Contact type"
                  hideLabel
                  name={`contacts.${i}.type`}
                  value={row.type}
                  onChange={(type) => change({ type: type as ContactType })}
                  options={CONTACT_TYPES.map((type) => ({
                    value: type,
                    label: CONTACT_TYPE_LABELS[type],
                  }))}
                />
                {row.type === "other" && (
                  <TextField
                    label="Contact label"
                    hideLabel
                    name={`contacts.${i}.label`}
                    value={row.label}
                    onChange={(label) => change({ label })}
                    placeholder="Label"
                    error={fields[`contacts.${i}.label`]}
                  />
                )}
                <div className="flex-1">
                  <TextField
                    label="Contact value"
                    hideLabel
                    name={`contacts.${i}.value`}
                    value={row.value}
                    onChange={(value) => change({ value })}
                    placeholder="@handle, address, or URL"
                    error={fields[`contacts.${i}.value`]}
                  />
                </div>
                <button
                  type="button"
                  className={`${TEXT_BUTTON} sm:mt-2`}
                  onClick={() => setContacts(contacts.filter((r) => r !== row))}
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className={`${TEXT_BUTTON} w-fit font-semibold disabled:text-fg-subtle`}
            disabled={contacts.length >= MAX_CONTACTS}
            onClick={() =>
              setContacts([
                ...contacts,
                ...rows<ContactRow>([{ type: "email", label: "", value: "" }]),
              ])
            }
          >
            Add contact
          </button>
          <p className="text-sm text-fg-subtle">Markdown supported</p>
          {fields.contacts && (
            <p role="alert" className="text-sm text-danger-fg">
              {fields.contacts}
            </p>
          )}
        </Section>

        <FormErrorSummary
          fields={fields}
          error={failure === FIX_FIELDS_MESSAGE ? null : failure}
          onJump={jump}
        />
        {photoSaved && failure && (
          <p role="status" className="text-sm text-fg-muted">
            Your photo was saved; the details were not.
          </p>
        )}
        <Button
          type="submit"
          disabled={mutation.pending}
          className="mx-auto px-12"
        >
          {mutation.pending ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}

function Section({
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  title: string;
  hint: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-line-subtle bg-surface-raised shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="w-full cursor-pointer select-none px-4 py-3 text-start"
      >
        <span className="font-medium">{title}</span>
        <span className="block text-sm text-fg-subtle">{hint}</span>
      </button>
      {open && <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>}
    </section>
  );
}
