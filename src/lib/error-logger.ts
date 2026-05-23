// ─── Error logger ──────────────────────────────────────────────────────────
// Writes uncaught errors to public.app_errors so Brad can review remotely
// via Lovable chat ("show me last 20 app_errors entries"). All inserts go
// through the anon RLS policy so we can capture pre-auth errors too.
//
// Three entry points:
//   1. logError(err, ctx)              — direct call from try/catch sites
//   2. installGlobalHandlers()         — window.onerror + onunhandledrejection
//   3. <ErrorBoundary>                 — React render errors (see component)
//
// Best-effort by design: errors during error logging are console.warn'd, not
// re-thrown. We never want the logger to cause its own crash loop.

import { supabase } from "@/integrations/supabase/client";

export interface ErrorLogContext {
  route?: string;
  context?: Record<string, unknown>;
  severity?: "error" | "warning" | "info";
}

export async function logError(err: unknown, ctx: ErrorLogContext = {}): Promise<void> {
  try {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error && err.stack ? err.stack : undefined;
    // Fetch user lazily — don't block on it (avoid hangs if auth is the broken thing)
    const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const user = userData?.user ?? null;

    await supabase.from("app_errors").insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      route: ctx.route ?? (typeof window !== "undefined" ? window.location.pathname : null),
      message: message.slice(0, 1000),
      stack: stack ? stack.slice(0, 5000) : null,
      context: ctx.context ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      severity: ctx.severity ?? "error",
    });
  } catch (logErr) {
    // Logger failure — fall back to console. Never throw.
    // eslint-disable-next-line no-console
    console.warn("[error-logger] Failed to record error:", logErr, "Original error:", err);
  }
}

/** Wire window.onerror + onunhandledrejection so non-React errors get captured. */
export function installGlobalHandlers(): void {
  if (typeof window === "undefined") return;
  window.addEventListener("error", (event) => {
    logError(event.error ?? event.message ?? "Unknown window error", {
      context: {
        filename: event.filename,
        line: event.lineno,
        col: event.colno,
        type: "window.onerror",
      },
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    logError(event.reason ?? "Unhandled promise rejection", {
      context: { type: "unhandledrejection" },
    });
  });
}
