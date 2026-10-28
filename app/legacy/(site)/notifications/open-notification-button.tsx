import type { ReactNode } from "react";

/** Submits openNotificationAction, which marks the row read and redirects to what happened. */
export function OpenNotificationButton({ children }: { children: ReactNode }) {
  return (
    <button type="submit" className="w-full cursor-pointer text-left">
      {children}
    </button>
  );
}
