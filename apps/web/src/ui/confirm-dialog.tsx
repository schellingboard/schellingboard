import { Button } from "./button";
import { Dialog } from "./dialog";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Yes",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p>{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="quiet" onClick={onCancel}>
          No
        </Button>
      </div>
    </Dialog>
  );
}

export function AlertDialog({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p role="alert">{message}</p>
      <div className="mt-4">
        <Button onClick={onClose}>OK</Button>
      </div>
    </Dialog>
  );
}
