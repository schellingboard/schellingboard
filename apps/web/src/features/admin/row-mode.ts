import { useState } from "react";

type RowMode = "view" | "edit" | "delete";

export function useRowMode() {
  const [mode, setMode] = useState<RowMode>("view");
  return {
    mode,
    close: () => setMode("view"),
    edit: () => setMode("edit"),
    remove: () => setMode("delete"),
  };
}
