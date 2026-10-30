import { Component, type ErrorInfo, type ReactNode } from "react";
import { hardReload } from "./hard-navigate";

export class ErrorBoundary extends Component<
  { children: ReactNode; resetKey?: string },
  { failed: boolean }
> {
  state = { failed: false };

  componentDidUpdate(previous: { resetKey?: string }) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed)
      this.setState({ failed: false });
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-md space-y-3 p-6 text-center">
        <h2 className="text-lg font-semibold text-fg">Something went wrong</h2>
        <p className="text-sm text-fg-muted">
          This screen stopped working. Your data is safe.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-on-brand"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={hardReload}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-muted"
          >
            Reload
          </button>
          <a
            href="/"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-link hover:underline"
          >
            Go to the events
          </a>
        </div>
      </div>
    );
  }
}
