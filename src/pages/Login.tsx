// ─── /login — coach (Dack) login, password-only ────────────────────────────
// Mirrors the student-only /login/:slug experience. Dack bookmarks /login and
// only ever types a password — the email identifier dack@bdba.local is baked
// in client-side and never shown.
//
// (Note: the email isn't a secret. Even if a visitor inspected the source and
// saw `dack@bdba.local`, they'd still need the password. The placeholder
// domain is just Supabase Auth's "identifier" slot — it's not a real Gmail
// inbox.)
//
// On successful sign-in: → /dashboard (or returnTo if redirected here from a
// coach-only route). Students who land on /login by accident get bounced to
// their own /dashboard/student/<slug> as soon as their profile loads.

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/lib/auth";
import PbLogo from "@/components/PbLogo";

// Baked-in identifier for the coach account.
const COACH_EMAIL = "dackbarberacc@gmail.com";

export default function Login() {
  const { user, profile, role, slug, isLoading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const returnTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  // Coach goes to /dashboard (or returnTo). If a student happened to land on
  // /login, send them to their own page instead.
  const destinationFor = (r: typeof role, s: typeof slug): string => {
    if (r === "coach") return returnTo ?? "/dashboard";
    if (r === "student" && s) return `/dashboard/student/${s}`;
    return "/dashboard";
  };

  // If already signed in AND profile loaded, bounce. Gate on `profile` not
  // `user` so we know role/slug before routing.
  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate(destinationFor(role, slug), { replace: true });
    }
  }, [authLoading, user, profile, role, slug, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(COACH_EMAIL, password);
    if (result.error) {
      setSubmitting(false);
      setError("Wrong password. Try again.");
      return;
    }
    // Leave submitting=true; the useEffect above navigates once the profile
    // row loads. Same pattern as StudentLogin.
  };

  return (
    <>
      <Helmet>
        <title>Sign in · PB Assistant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <AppNavbar variant="login" />

      <main className="min-h-screen flex items-center justify-center px-4 pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md glass-card rounded-3xl px-10 py-12 text-center vsl-glow"
        >
          <PbLogo
            alt=""
            className="h-20 w-auto mx-auto mb-6 drop-shadow-[0_0_25px_rgba(220,38,38,0.35)]"
          />
          <h1 className="text-3xl font-black italic uppercase tracking-tight leading-tight mb-2">
            Welcome back, Dack
          </h1>
          <p className="text-sm text-white/60 mb-8">
            Enter your password to open the coaching dashboard
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 focus:outline-none transition"
              />
            </div>

            {error && (
              <div className="font-mono text-[11px] text-brand-red bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-red hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black italic uppercase tracking-wide text-xs px-6 py-4 rounded-full red-pulse btn-sheen transition-all active:scale-95"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            Trouble signing in? Contact the TFS Team.
          </div>
        </motion.div>
      </main>
    </>
  );
}
