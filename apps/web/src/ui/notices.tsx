import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Notice = {
  tone: "failure" | "info";
  message: string;
  action?: { label: string; run: () => void };
};

type Shown = Notice & { id: number };
type Notify = (notice: Notice) => void;

const NoticeContext = createContext<Notify>(() => {});

/** Raises a notice that stays until dismissed, whether or not the caller is still mounted. */
export const useNotify = () => useContext(NoticeContext);

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown[]>([]);
  const notify = useCallback<Notify>((notice) => {
    setShown((current) => [...current, { ...notice, id: nextId++ }]);
  }, []);
  const dismiss = (id: number) =>
    setShown((current) => current.filter((n) => n.id !== id));

  return (
    <NoticeContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {shown.map((notice) => (
          <div
            key={notice.id}
            role={notice.tone === "failure" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-md flex-wrap items-center gap-2 rounded-md border p-3 text-sm shadow-lg ${
              notice.tone === "failure"
                ? "border-danger bg-surface-raised text-danger-fg"
                : "border-line bg-surface-raised text-fg"
            }`}
          >
            <p className="flex-1">{notice.message}</p>
            {notice.action && (
              <button
                type="button"
                className="font-medium underline"
                onClick={() => {
                  notice.action?.run();
                  dismiss(notice.id);
                }}
              >
                {notice.action.label}
              </button>
            )}
            <button
              type="button"
              className="underline"
              onClick={() => dismiss(notice.id)}
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </NoticeContext.Provider>
  );
}

let nextId = 0;
