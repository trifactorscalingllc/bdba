// ─── Protected route wrapper ────────────────────────────────────────────────
// Redirects unauthenticated users to /login. Optional role gating: pass
// `requireRole="coach"` to block students from /dashboard's coach view, or
// `requireSlug={urlSlug}` to scope per-student routes so a student can only
// open their own /dashboard/student/<slug>.
//
// Bounce target: when a STUDENT lands somewhere they shouldn't (coach-only
// route or another student's slug), they're sent to /dashboard/student/<own
// slug> — NOT /dashboard, because /dashboard is coach-only and would re-
// bounce, creating an infinite navigation loop.
//
// Loading state shows a small spinner instead of redirecting, so we don't
// flash the login page during the initial session-check round trip.

import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, Role } from "@/lib/auth";

interface Props {
  children: ReactNode;
  requireRole?: Role;
  requireSlug?: string;
}

export default function ProtectedRoute({ children, requireRole, requireSlug }: Props) {
  const { user, role, slug, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Loading…
        </div>
      </div>
    );
  }

  if (!user) {
    // Pass along the attempted URL so login can redirect back after auth
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Compute the "home" route for the current user — coach goes to the main
  // dashboard, student goes to their own page. Used as the bounce target for
  // role/slug mismatches.
  const homeRoute = role === "coach" ? "/dashboard" : slug ? `/dashboard/student/${slug}` : "/login";

  if (requireRole && role !== requireRole) {
    return <Navigate to={homeRoute} replace />;
  }

  if (requireSlug && role !== "coach" && slug !== requireSlug) {
    // Student trying to access another student's slug — coach passes through
    return <Navigate to={homeRoute} replace />;
  }

  return <>{children}</>;
}
