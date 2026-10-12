import Link from "next/link";

export function FormActions(props: {
  cancelHref: string;
  deleteButton?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { cancelHref, deleteButton, children } = props;
  return (
    <div className="flex flex-wrap-reverse items-center gap-3">
      {deleteButton}
      <div className="ml-auto flex gap-3">
        <Link
          href={cancelHref}
          className="py-2 px-6 rounded font-semibold text-fg-muted bg-surface-muted hover:bg-surface-hover"
        >
          Cancel
        </Link>
        {children}
      </div>
    </div>
  );
}
