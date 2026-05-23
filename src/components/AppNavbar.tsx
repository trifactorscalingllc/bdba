// ─── App-mode navbar — used on /login and /dashboard ────────────────────────
// Visually matches the marketing Navbar (same glass-pill, same logo treatment)
// but contents differ: no Story/Results/Apply, no marketing CTAs.
//
// Variants:
//   "login"     → just logo + "← Marketing site" link (unauthenticated)
//   "dashboard" → logo + role pill (COACH · NAME) + Sign out button

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import logoTransparent from "@/assets/pb-logo.png";

interface Props {
  variant: "login" | "dashboard";
}

export default function AppNavbar({ variant }: Props) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 px-4 py-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-full bg-black/40 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 md:gap-4">
          <a href="/" className="block">
            <img
              src={logoTransparent}
              alt="PB Logo"
              className="h-10 md:h-14 object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            />
          </a>
          <span className="font-black uppercase tracking-tighter text-sm sm:text-base md:text-xl italic leading-none hidden sm:flex items-center gap-1 pr-6 whitespace-nowrap">
            <span className="text-red-shimmer inline-block pr-2">Profitable Barbers</span>
          </span>
        </div>

        {variant === "login" && (
          <a href="/" className="technical-label hover:text-white transition-all">
            ← Marketing site
          </a>
        )}

        {variant === "dashboard" && (
          <div className="flex items-center gap-4 md:gap-5">
            <span className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red bg-red-600/10 border border-red-600/30 rounded-full px-3 py-1.5">
              {profile?.role === "coach" ? "COACH" : "STUDENT"}
              {profile?.display_name ? ` · ${profile.display_name}` : ""}
            </span>
            <button
              onClick={handleSignOut}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white border border-white/10 hover:border-brand-red rounded-full px-4 py-2 transition-all"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
