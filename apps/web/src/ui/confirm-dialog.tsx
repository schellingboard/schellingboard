import { Button } from "./button";
import { Dialog } from "./dialog";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p>{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="quiet" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Dialog>
  );
}
