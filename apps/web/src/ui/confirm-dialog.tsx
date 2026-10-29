import { Button } from "./button";
import { Dialog } from "./dialog";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p>{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={destructive ? "danger" : "primary"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button variant="quiet" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Dialog>
  );
}
