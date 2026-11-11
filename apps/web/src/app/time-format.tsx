import { createContext, useContext, useState, type ReactNode } from "react";
import { clockFormat, type ClockStyle } from "@schellingboard/domain/time";
import { clockStyleFor } from "../i18n/format";
import { useFormatLocale } from "../i18n/format-locale";

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

const OPTIONS: { value: Preference; label: string; hint: string }[] = [
  { value: "auto", label: "Automatic", hint: "Follow your browser's language" },
  { value: "12h", label: "12-hour", hint: "Times like 2:00 PM" },
  { value: "24h", label: "24-hour", hint: "Times like 14:00" },
];

export function TimeFormatSelect() {
  const { preference, setPreference } = useContext(TimeFormatContext);
  return (
    <div
      role="group"
      aria-label="Time format"
      className="inline-flex overflow-hidden rounded-md border border-line"
    >
      {OPTIONS.map(({ value, label, hint }) => (
        <button
          key={value}
          type="button"
          title={hint}
          aria-pressed={preference === value}
          onClick={() => setPreference(value)}
          className={`px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-accent ${preference === value ? "bg-surface-inverse text-fg-inverse" : "text-fg-muted hover:bg-surface-hover"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
