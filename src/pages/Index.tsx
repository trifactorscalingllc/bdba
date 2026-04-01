import { useState, useEffect } from 'react';

import { motion, useScroll, useSpring } from 'framer-motion';
import { Instagram, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Authority from '@/components/Authority';
import Proof from '@/components/Proof';
import Results from '@/components/Results';
import ApplicationForm from '@/components/ApplicationForm';
import InlineForm from '@/components/InlineForm';
import AdminDashboard from '@/components/AdminDashboard';
import MergedOutline from '@/components/MergedOutline';
import LiquidBackground from '@/components/LiquidBackground';

export default function Index() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-brand-black selection:bg-brand-gold selection:text-black relative">
      <LiquidBackground />
      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-gold z-[60] origin-left"
        style={{ scaleX }}
      />

      <Navbar onApply={() => setIsFormOpen(true)} />
      
      <main className="relative z-10">
        <Hero onApply={() => setIsFormOpen(true)} />
        
        <Authority />
        
        <Proof />
        
        <Results />

        <section className="py-16 md:py-32 px-2 md:px-4 text-center relative z-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full md:w-[50%] mx-auto p-4 md:p-16 relative will-change-transform"
          >
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black uppercase italic leading-none mb-12 relative z-10 flex flex-col items-center gap-4">
              <span className="text-white text-xl sm:text-2xl md:text-3xl"><span className="text-blue-400/80">Apply</span> for</span>
              <MergedOutline strokeWidth="4px">1-on-1 coaching</MergedOutline>
            </h2>
            <InlineForm />
          </motion.div>
        </section>

        {showAdmin && <AdminDashboard />}
      </main>

      <footer className="py-24 px-4 border-t border-white/5 text-center relative z-10 bg-black/40 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-12 will-change-transform"
        >
          <a 
            href="https://getsquire.com/booking/book/dacks-shop-schnecksville/barber/dack-1/services"
            target="_blank"
            rel="noopener noreferrer"
            className="technical-label px-6 py-3 glass-card rounded-full hover:bg-white/10 transition-all border border-white/20 hover:border-white/40 inline-block"
          >
            BOOK AN APPOINTMENT
          </a>

          <div className="flex items-center gap-4">
            <a 
              href="https://www.instagram.com/cutbydack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 glass-card rounded-full border-brand-gold text-white flex items-center justify-center hover:bg-brand-gold hover:text-black active:bg-white group transition-all"
            >
              <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="https://www.tiktok.com/@cutbydack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 glass-card rounded-full border-brand-gold text-white flex items-center justify-center hover:bg-brand-gold hover:text-black active:bg-white group transition-all"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5 group-hover:scale-110 transition-transform"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@uncutdack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 glass-card rounded-full border-brand-gold text-white flex items-center justify-center hover:bg-brand-gold hover:text-black active:bg-white group transition-all"
            >
              <Youtube size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>

          <div className="space-y-2">
            <div className="technical-label opacity-100">
              © 2026 CUTBYDACK
            </div>
            <a 
              href="https://trifactorscaling.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="technical-label text-[8px] opacity-40 hover:opacity-100 transition-opacity block"
            >
              TFS LLC
            </a>
          </div>
        </motion.div>
      </footer>

      <ApplicationForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
