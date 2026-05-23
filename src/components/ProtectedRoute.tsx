// ─── Protected route wrapper ────────────────────────────────────────────────
// Redirects unauthenticated users to /login. Optional role gating: pass
// `requireRole="coach"` to block students from /dashboard's coach view, etc.
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

  if (requireRole && role !== requireRole) {
    // Wrong role — bounce student trying to access coach-only, or vice versa
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSlug && role !== "coach" && slug !== requireSlug) {
    // Student trying to access another student's slug — coach passes through
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
