import { createContext, useContext, useState, type ReactNode } from "react";

// The same cookie, values and colours as the Next pages (utils/theme.ts there);
// index.html's inline script applies the class before first paint.
const THEME_COOKIE = "sb-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const THEMES = ["system", "light", "dark"] as const;
type Theme = (typeof THEMES)[number];

const LIGHT_SURFACE = "#ffffff";
const DARK_SURFACE = "#16181d";

export function readThemeCookie(): Theme {
  const value = new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`).exec(
    document.cookie
  )?.[1];
  return THEMES.find((t) => t === value) ?? "system";
}

function themeColors(theme: Theme): { media?: string; color: string }[] {
  if (theme === "light") return [{ color: LIGHT_SURFACE }];
  if (theme === "dark") return [{ color: DARK_SURFACE }];
  return [
    { media: "(prefers-color-scheme: light)", color: LIGHT_SURFACE },
    { media: "(prefers-color-scheme: dark)", color: DARK_SURFACE },
  ];
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "system", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setStored] = useState<Theme>(readThemeCookie);

  const setTheme = (next: Theme) => {
    setStored(next);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (next !== "system") root.classList.add(next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {themeColors(theme).map(({ media, color }) => (
        <meta
          key={media ?? color}
          name="theme-color"
          media={media}
          content={color}
        />
      ))}
      {children}
    </ThemeContext.Provider>
  );
}

const OPTIONS: { value: Theme; label: string; hint: string }[] = [
  {
    value: "system",
    label: "System",
    hint: "Follow your device's light/dark setting",
  },
  { value: "light", label: "Light", hint: "Always use light colours" },
  { value: "dark", label: "Dark", hint: "Always use dark colours" },
];

export function ThemeSelect() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="inline-flex overflow-hidden rounded-md border border-line"
    >
      {OPTIONS.map(({ value, label, hint }) => (
        <button
          key={value}
          type="button"
          title={hint}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={`px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-accent ${theme === value ? "bg-surface-inverse text-fg-inverse" : "text-fg-muted hover:bg-surface-hover"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
