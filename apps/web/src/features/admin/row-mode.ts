import { useState } from "react";

type RowMode = "view" | "edit" | "duplicate" | "session" | "delete";

export function useRowMode() {
  const [mode, setMode] = useState<RowMode>("view");
  return {
    mode,
    close: () => setMode("view"),
    edit: () => setMode("edit"),
    duplicate: () => setMode("duplicate"),
    session: () => setMode("session"),
    remove: () => setMode("delete"),
  };
}
