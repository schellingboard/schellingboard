import { createContext, useContext, useState, type ReactNode } from "react";
import { DateTime } from "luxon";
import { clockFormat, type ClockStyle } from "@schellingboard/domain/time";
import { clockStyleFor } from "../i18n/format";
import { useFormatLocale } from "../i18n/format-locale";
import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";

const COOKIE = "sb-time-format";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const PREFERENCES = ["auto", "12h", "24h"] as const;
type Preference = (typeof PREFERENCES)[number];

export function readTimeFormatCookie(): Preference {
  const value = new RegExp(`(?:^|; )${COOKIE}=([^;]*)`).exec(
    document.cookie
  )?.[1];
  return PREFERENCES.find((p) => p === value) ?? "auto";
}

// Without a provider (admin screens) times stay 24-hour.
const TimeFormatContext = createContext<{
  preference: Preference;
  style: ClockStyle;
  setPreference: (preference: Preference) => void;
}>({ preference: "24h", style: "24h", setPreference: () => {} });

export function TimeFormatProvider({ children }: { children: ReactNode }) {
  const [preference, setStored] = useState<Preference>(readTimeFormatCookie);

  const locale = useFormatLocale();
  const style = preference === "auto" ? clockStyleFor(locale) : preference;

  const setPreference = (next: Preference) => {
    setStored(next);
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  };

  return (
    <TimeFormatContext.Provider value={{ preference, style, setPreference }}>
      {children}
    </TimeFormatContext.Provider>
  );
}

export function useClockStyle(): ClockStyle {
  return useContext(TimeFormatContext).style;
}

/** The Luxon format for a clock time, as the device prefers it. */
export function useTimeFormat(): string {
  return clockFormat(useClockStyle());
}

const OPTIONS: {
  value: Preference;
  label: MessageDescriptor;
}[] = [
  { value: "auto", label: msg`Automatic` },
  { value: "12h", label: msg`12-hour` },
  { value: "24h", label: msg`24-hour` },
];

function useHint(value: Preference): string {
  const locale = useFormatLocale();
  if (value === "auto") return t`Follow your browser's language`;
  const example = DateTime.fromObject({ hour: 14 }, { locale }).toFormat(
    clockFormat(value)
  );
  return t`Times like ${example}`;
}

function TimeFormatOption({
  value,
  label,
}: {
  value: Preference;
  label: MessageDescriptor;
}) {
  const { preference, setPreference } = useContext(TimeFormatContext);
  return (
    <button
      type="button"
      title={useHint(value)}
      aria-pressed={preference === value}
      onClick={() => setPreference(value)}
      className={`px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-accent ${preference === value ? "bg-surface-inverse text-fg-inverse" : "text-fg-muted hover:bg-surface-hover"}`}
    >
      {i18n._(label)}
    </button>
  );
}

export function TimeFormatSelect() {
  return (
    <div
      role="group"
      aria-label={t`Time format`}
      className="inline-flex overflow-hidden rounded-md border border-line"
    >
      {OPTIONS.map(({ value, label }) => (
        <TimeFormatOption key={value} value={value} label={label} />
      ))}
    </div>
  );
}
