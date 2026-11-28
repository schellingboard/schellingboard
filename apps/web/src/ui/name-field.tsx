import { t } from "@lingui/core/macro";

import { TextField } from "./form";

type Props = Omit<Parameters<typeof TextField>[0], "label" | "onChange"> & {
  onChange: (name: string) => void;
  /** Names of the other people, to warn of a same-name mix-up. */
  others?: string[];
};

const key = (name: string) => name.trim().toLocaleLowerCase();

export function NameField({ others = [], hint, ...field }: Props) {
  const taken = others.some((n) => key(n) === key(field.value) && key(n));
  const warning = t`Someone is already called ${field.value.trim()}. You can keep it, but people may mix you up.`;
  return (
    <>
      <TextField {...field} label={t`Name`} hint={taken ? warning : hint} />
      <p role="status" className="sr-only">
        {taken ? warning : ""}
      </p>
    </>
  );
}
