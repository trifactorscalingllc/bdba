// ─── /login/:slug — student-only login (password-only experience) ──────────
// Each student gets a personal URL like /login/yari. They bookmark it and
// only ever type their password — no email field, no name-picking.
//
// The slug in the URL identifies who they are. Behind the scenes we build a
// placeholder email <slug>@bdba.local and call signInWithPassword. Students
// never see or type the placeholder address.
//
// Coach still uses /login (email + password) — coach is just one account
// and a real email is fine.
//
// Note: knowing a student's slug (which is public — it's in their dashboard
// URL) does NOT let an attacker sign in. The password is still required.
// The slug-from-URL is just a UX shortcut to skip typing an email.

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/lib/auth";
import PbLogo from "@/components/PbLogo";

// Known student slugs. If the :slug URL param isn't one of these we render
// "Account not found" — prevents typo URLs from confusing students into
// thinking the system is broken.
const KNOWN_SLUGS = new Set([
  "yari",
  "jay",
  "cutbykeenan",
  "george",
  "abdoul",
  "eb",
]);

// Display name overrides for slugs that don't title-case cleanly.
const DISPLAY_NAMES: Record<string, string> = {
  yari: "Yari",
  jay: "Jay",
  cutbykeenan: "Keenan",
  george: "George",
  abdoul: "Abdoul",
  eb: "EB",
};

export default function StudentLogin() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user, profile, role, slug: profileSlug, isLoading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isKnownSlug = KNOWN_SLUGS.has(slug);
  const displayName = DISPLAY_NAMES[slug] ?? slug;

  // If already signed in, bounce to the destination matching the profile.
  // Coach → /dashboard, student → /dashboard/student/<their-slug>. We don't
  // honor the URL slug here — a coach who lands on /login/yari should still
  // go to the coach dashboard.
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (role === "coach") {
        navigate("/dashboard", { replace: true });
      } else if (role === "student" && profileSlug) {
        navigate(`/dashboard/student/${profileSlug}`, { replace: true });
      }
    }
  }, [authLoading, user, profile, role, profileSlug, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKnownSlug) return;
    setError(null);
    setSubmitting(true);
    const email = `${slug}@bdba.local`;
    const result = await signIn(email, password);
    if (result.error) {
      setSubmitting(false);
      setError("Wrong password. Try again or contact the TFS Team.");
      return;
    }
    // Leave submitting=true; the useEffect above navigates once the profile
    // row finishes loading.
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

          {!isKnownSlug ? (
            <>
              <h1 className="text-3xl font-black italic uppercase tracking-tight leading-tight mb-2">
                Account not found
              </h1>
              <p className="text-sm text-white/60 mb-8">
                The link you used doesn't match any student. Double-check the
                URL or text Brad.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black italic uppercase tracking-tight leading-tight mb-2">
                Welcome, {displayName}
              </h1>
              <p className="text-sm text-white/60 mb-8">
                Enter your password to open your dashboard
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
                Forgot your password? Text Brad.
              </div>
            </>
          )}
        </motion.div>
      </main>
    </>
  );
}
