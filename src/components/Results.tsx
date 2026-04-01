import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MergedOutline from './MergedOutline';
import yariBefore from '@/assets/results/yari-before.png';
import yariAfter from '@/assets/results/yari-after.png';

const transformations = [
  {
    name: "Yari",
    headline: "25x Profile Views in 30 Days",
    statBefore: "7.8K views",
    statAfter: "203.4K views",
    label: "8K → 203K",
    before: yariBefore,
    after: yariAfter,
  },
];

export default function Results() {
  return (
    <section id="real-results" className="py-12 md:py-24 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 will-change-transform"
        >
          <h2 className="text-sm font-black text-brand-gold tracking-[0.3em] uppercase mb-4">The Results</h2>
          <h3 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic leading-none flex flex-col items-center gap-2">
            <MergedOutline strokeWidth="3px" strokeColor="white">Real Analytics</MergedOutline>
          </h3>
        </motion.div>

        {transformations.map((item, index) => (
          <div key={item.name} className="mb-20 last:mb-0">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center text-lg sm:text-xl md:text-2xl font-black uppercase italic text-brand-gold tracking-wide mb-10"
            >
              {item.headline}
            </motion.p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
              {/* Before */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative group w-full md:w-auto"
              >
                <div className="text-center mb-3">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Before</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-w-[280px] h-[600px] mx-auto">
                  <img
                    src={item.before}
                    alt={`${item.name} before`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-center mt-3">
                  <span className="text-sm font-bold text-white/50">{item.statBefore}</span>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center py-4 md:py-0"
              >
                <ArrowRight className="w-10 h-10 md:w-14 md:h-14 text-brand-gold rotate-90 md:rotate-0 drop-shadow-[0_0_8px_rgba(198,165,109,0.5)]" />
              </motion.div>

              {/* After */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="relative group w-full md:w-auto"
              >
                <div className="text-center mb-3">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-gold">After</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-brand-gold/30 shadow-[0_0_40px_rgba(198,165,109,0.15)] max-w-[280px] h-[600px] mx-auto">
                  <img
                    src={item.after}
                    alt={`${item.name} after`}
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="text-center mt-3">
                  <span className="text-sm font-bold text-brand-gold">{item.statAfter}</span>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
