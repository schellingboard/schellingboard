import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DirectoryCard } from "../features/people/directory-model";

type Walk = {
  /** The order the directory behind the panel shows; null with no directory behind. */
  rows: DirectoryCard[] | null;
  setRows: (rows: DirectoryCard[] | null) => void;
};

const WalkContext = createContext<Walk>({ rows: null, setRows: () => {} });

export function ProfileWalkProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<DirectoryCard[] | null>(null);
  const value = useMemo(() => ({ rows, setRows }), [rows]);
  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
}

export const useProfileWalk = () => useContext(WalkContext);
