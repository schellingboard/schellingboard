import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  quiet: "text-fg-muted hover:bg-surface-muted",
} as const;

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <button
      type={type}
      className={`rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
