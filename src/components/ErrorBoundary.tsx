// ─── React error boundary ──────────────────────────────────────────────────
// Wraps /dashboard and /login so render-time errors don't blank the screen.
// Errors get sent to public.app_errors via logError, then a branded fallback
// UI shows so the user knows something went wrong.

import { Component, ErrorInfo, ReactNode } from "react";
import { logError } from "@/lib/error-logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  scope?: string;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(error, {
      context: {
        type: "react_error_boundary",
        scope: this.props.scope ?? "unknown",
        componentStack: info.componentStack ?? null,
      },
    });
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-brand-black">
        <div className="max-w-md glass-card rounded-3xl px-10 py-12 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red mb-3">
            Something broke
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight mb-4">
            We logged this
          </h2>
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            The error has been sent to the TFS Team — we'll look into it. Try
            refreshing, and if it keeps happening, reach out to the TFS Team
            directly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-red hover:bg-red-500 text-white font-black italic uppercase tracking-wide text-xs px-6 py-3 rounded-full red-pulse btn-sheen transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
}
