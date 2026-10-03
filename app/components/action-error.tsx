export function ActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="bg-danger-tint border border-danger-border text-danger-fg px-4 py-3 rounded-md text-sm"
    >
      {message}
    </p>
  );
}
