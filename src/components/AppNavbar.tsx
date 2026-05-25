// ─── App-mode navbar — used on /dashboard ──────────────────────────────────
// Visually matches the marketing Navbar (same glass-pill, same logo treatment)
// but contents differ: no Story/Results/Apply, no marketing CTAs.
//
// D-061 (2026-05-23): auth pulled out; no role pill / no Sign Out button.
// Just logo + "← Marketing site" link to bounce back to the funnel.
//
// Variants are kept (typed `"login" | "dashboard"`) so re-enabling auth is a
// pure additive change — the dashboard variant just renders the same way as
// the login variant for now.

import { motion } from "framer-motion";
import PbLogo from "@/components/PbLogo";

interface Props {
  variant: "login" | "dashboard";
}

export default function AppNavbar({ variant: _variant }: Props) {
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
            <PbLogo
              alt="PB Logo"
              className="h-10 md:h-14 object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            />
          </a>
          <span className="font-black uppercase tracking-tighter text-sm sm:text-base md:text-xl italic leading-none hidden sm:flex items-center gap-1 pr-6 whitespace-nowrap">
            <span className="text-red-shimmer inline-block pr-2">Profitable Barbers</span>
          </span>
        </div>

        <a
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all"
        >
          ← Marketing site
        </a>
      </div>
    </motion.nav>
  );
}
