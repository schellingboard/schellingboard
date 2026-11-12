import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ExclamationTriangleIcon } from "./icons";
import { Trans } from "@lingui/react/macro";

export type Notice = {
  tone: "failure" | "info";
  message: string;
  action?: { label: string; run: () => void };
  /** For routine news; a failure should stay until dismissed. */
  autoDismissMs?: number;
};

type Shown = Notice & { id: number };
type Notify = (notice: Notice) => void;

const NoticeContext = createContext<Notify>(() => {});

/** Raises a notice that outlives the caller, whether or not it is still mounted. */
export const useNotify = () => useContext(NoticeContext);

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown[]>([]);
  const dismiss = useCallback(
    (id: number) => setShown((current) => current.filter((n) => n.id !== id)),
    []
  );
  const notify = useCallback<Notify>((notice) => {
    setShown((current) => [...current, { ...notice, id: nextId++ }]);
  }, []);

  return (
    <NoticeContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {shown.map((notice) => (
          <Toast key={notice.id} notice={notice} dismiss={dismiss} />
        ))}
      </div>
    </NoticeContext.Provider>
  );
}

function Toast({
  notice,
  dismiss,
}: {
  notice: Shown;
  dismiss: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const held = hovered || focused;
  const { id, autoDismissMs } = notice;
  useEffect(() => {
    if (!autoDismissMs || held) return;
    const timer = setTimeout(() => dismiss(id), autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, held, id, dismiss]);

  return (
    <div
      role={notice.tone === "failure" ? "alert" : "status"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      className={`pointer-events-auto flex w-full max-w-md flex-wrap items-center gap-2 rounded-md border p-3 text-sm shadow-lg ${
        notice.tone === "failure"
          ? "border-danger bg-surface-raised text-danger-fg"
          : "border-line bg-surface-raised text-fg"
      }`}
    >
      {notice.tone === "failure" && (
        <ExclamationTriangleIcon className="h-5 w-5 shrink-0 self-start" />
      )}
      <p className="flex-1">{notice.message}</p>
      {notice.action && (
        <button
          type="button"
          className="font-medium underline"
          onClick={() => {
            notice.action?.run();
            dismiss(id);
          }}
        >
          {notice.action.label}
        </button>
      )}
      <button type="button" className="underline" onClick={() => dismiss(id)}>
        <Trans>Dismiss</Trans>
      </button>
    </div>
  );
}

let nextId = 0;
