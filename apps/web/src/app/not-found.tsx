export function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 sm:px-0">
      <p className="text-fg-muted">Page not found.</p>
      <a href="/" className="text-sm text-fg-subtle hover:text-fg-muted">
        ← Back to the events
      </a>
    </div>
  );
}
