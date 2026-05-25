// ─── /login page — PB Assistant dashboard login ──────────────────────────────
// Direct-URL only. Not linked from the marketing site. Brad texts the URL
// to Dack; he bookmarks /dashboard which auto-redirects here if logged out.
//
// On successful sign-in:
//   • coach → /dashboard
//   • student → /dashboard (component picks the right view based on role)
//   • returnTo location (if redirected here from a protected route) → there

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/lib/auth";
import PbLogo from "@/components/PbLogo";

export default function Login() {
  const { user, isLoading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const returnTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  // If user is already signed in, bounce them to the dashboard immediately
  useEffect(() => {
    if (!authLoading && user) {
      navigate(returnTo, { replace: true });
    }
  }, [authLoading, user, navigate, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate(returnTo, { replace: true });
    }
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
            Welcome back
          </h1>
          <p className="text-sm text-white/60 mb-8">
            Sign in to your coaching dashboard
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dack@profitablebarbers.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
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
