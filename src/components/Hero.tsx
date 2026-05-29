import { motion } from 'framer-motion';
import MergedOutline from './MergedOutline';
import InlineForm from './InlineForm';

interface HeroProps {
  onApply: () => void;
}

export default function Hero({ onApply }: HeroProps) {
  return (
    <section className="relative pt-32 md:pt-52 pb-10 md:pb-20 px-4">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.15] mb-16 md:mb-20 uppercase italic px-4 sm:px-8 will-change-transform"
        >
          <div className="flex justify-center items-center gap-x-[0.3em] mb-3 whitespace-nowrap">
            <span className="text-white">THE</span>
            <MergedOutline strokeWidth="3px" strokeColor="#3B82F6" fillColor="#3B82F6">REAL REASON</MergedOutline>
            <span className="text-white">WHY</span>
          </div>
          <div className="block mb-3 whitespace-nowrap">
            <span className="text-brand-red text-red-shimmer">90%</span>
            <span className="text-white"> OF BARBERS</span>
          </div>
          <div className="text-white block mb-3 whitespace-nowrap">STAY</div>
          <div className="block whitespace-nowrap">
            <MergedOutline strokeWidth="3px" strokeColor="#3B82F6" fillColor="#3B82F6">FINANCIALLY STUCK</MergedOutline>
          </div>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, filter: "blur(20px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative w-full max-w-3xl mx-auto overflow-hidden bg-black will-change-transform vsl-glow rounded-3xl"
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
          <p className="text-brand-silver/70 font-medium tracking-wide uppercase text-sm sm:text-base">
            <span className="text-white">Helping</span>{' '}
            <span className="text-blue-400/90 italic font-black">barbers</span>{' '}
            <span className="text-white">turn their</span>{' '}
            <span className="text-brand-silver">clippers</span>{' '}
            <span className="text-white">into</span>{' '}
            <span className="text-brand-red text-red-shimmer font-black italic">capital</span>.
          </p>
        </motion.div>

        <section id="apply-form" className="pt-12 md:pt-20 px-2 md:px-4 text-center relative z-10 overflow-hidden scroll-mt-32 md:scroll-mt-36">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full sm:w-[85%] md:w-[75%] lg:w-[65%] mx-auto p-4 md:p-8 relative will-change-transform"
          >
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black uppercase italic leading-none mb-12 relative z-10 flex flex-col items-center gap-4">
              <span className="text-white text-xl sm:text-2xl md:text-3xl"><span className="text-blue-400/80">Apply</span> for</span>
              <MergedOutline strokeWidth="4px" strokeColor="#DC2626">1-on-1 coaching</MergedOutline>
            </h2>
            <InlineForm />
          </motion.div>
        </section>
      </div>
    </section>
  );
}
