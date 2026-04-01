import { motion } from 'framer-motion';
import { Scissors, Menu } from 'lucide-react';
import MergedOutline from './MergedOutline';
import logoTransparent from '@/assets/logo-transparent.png';

interface NavbarProps {
  onApply: () => void;
}

export default function Navbar({ onApply }: NavbarProps) {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 px-4 py-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-full bg-black/40 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 border-white/10 shadow-2xl relative">
        <div className="flex items-center gap-2 md:gap-4 z-10">
          <a href="/" className="block">
            <img 
              src="https://i.ibb.co/N25g2k75/logo-transparent.png" 
              alt="logo transparent" 
              className="h-10 md:h-14 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              referrerPolicy="no-referrer"
            />
          </a>
          <span className="font-black uppercase tracking-tighter text-sm sm:text-base md:text-xl italic leading-none hidden sm:flex items-center gap-1">
            <span className="text-brand-gold">$</span>Billion Barber <span className="text-brand-gold">Academy</span>
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex items-center gap-6 z-10"
        >
          <div className="flex items-center gap-12 mr-8">
            <motion.a 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              href="#story" 
              className="technical-label hover:text-white transition-all"
            >
              Story
            </motion.a>
            <motion.a 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              href="#results" 
              className="technical-label hover:text-white transition-all"
            >
              Results
            </motion.a>
          </div>
          <button 
            onClick={onApply}
            className="bg-brand-gold text-black px-10 py-4 glass-card rounded-full text-xs font-black uppercase italic hover:opacity-90 active:bg-white active:scale-95 transition-all btn-sheen border-barber-subtle"
          >
            Apply
          </button>
        </motion.div>

        <div className="md:hidden z-10">
          <button 
            onClick={onApply}
            className="bg-brand-gold text-black px-6 py-2 glass-card rounded-full text-[10px] font-black uppercase italic hover:opacity-90 active:bg-white active:scale-95 transition-all btn-sheen border-barber-subtle"
          >
            Apply
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
