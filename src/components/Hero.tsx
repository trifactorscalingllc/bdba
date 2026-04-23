import { motion } from 'framer-motion';
import MergedOutline from './MergedOutline';

interface HeroProps {
  onApply: () => void;
}

export default function Hero({ onApply }: HeroProps) {
  return (
    <section className="relative pt-32 md:pt-52 pb-10 md:pb-20 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-20 uppercase italic px-4 sm:px-8 will-change-transform"
        >
          <div className="text-white block mb-2 whitespace-nowrap">REVEALING THE</div>
          <div className="flex justify-center items-center gap-x-[0.3em] mb-2 whitespace-nowrap">
            <MergedOutline strokeWidth="3px" strokeColor="#3B82F6">EXACT BLUEPRINT</MergedOutline>
            <span className="text-white">TO A</span>
          </div>
          <div className="flex justify-center items-center gap-x-[0.3em] whitespace-nowrap">
            <span className="text-brand-red">6-FIGURE</span>
            <span className="text-white pr-1">BUSINESS&nbsp;</span>
          </div>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, filter: "blur(20px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative w-full max-w-3xl mx-auto glass-card overflow-hidden bg-black shadow-2xl will-change-transform"
          style={{ aspectRatio: '16/9' }}
        >
          <video
            className="absolute inset-0 w-full h-full"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="auto"
            src="/vsl.mp4"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="mt-8 flex flex-col items-center gap-8 will-change-transform"
        >
          <p className="text-brand-silver/60 font-medium tracking-wide uppercase text-sm">
            Giving information for <span className="text-blue-400/80">free</span> because the game is meant to be <span className="text-brand-red">shared</span>.
          </p>
          
          <button 
            onClick={onApply}
            className="px-12 h-16 bg-brand-red text-white font-black uppercase italic tracking-tighter text-xl rounded-full border-none hover:bg-red-500 active:scale-95 transition-all btn-sheen red-pulse"
          >
            Apply Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}
