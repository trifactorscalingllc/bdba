import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import MergedOutline from './MergedOutline';

export default function Authority() {
  return (
    <section id="story" className="py-12 md:py-24 px-4 relative z-10 content-visibility-auto">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 md:mb-16 will-change-transform"
        >
          <h2 className="text-sm font-black text-brand-gold tracking-[0.3em] uppercase mb-4">The Authority</h2>
          <h3 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase leading-none flex flex-col items-center gap-2">
            <span>From <span className="italic text-red-400/90">Broke</span> <span className="italic text-blue-400/80">Basement Barber</span></span>
            <span>To <MergedOutline strokeWidth="3px"><span className="italic">Financial Freedom.</span></MergedOutline></span>
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="order-1 will-change-transform"
          >
            <div className="space-y-6 text-white/70 text-base md:text-lg leading-relaxed">
              <p>
                I started exactly where a lot of you are—grinding <span className="text-red-400/80">12-hour days</span> right out of my mom's basement with just a pair of clippers and a phone. I had the skills, but I needed the right <span className="text-brand-gold font-bold">system.</span>
              </p>
              <p>
                By combining high-level barbering with a strategic digital presence, I started clearing $10k+ a month before I even left that basement. I bought my dream car at 18, and eventually traded that limited environment for a penthouse in Miami.
              </p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden md:block mt-10 p-6 border-l-4 border-brand-gold bg-brand-gold/5 rounded-r-2xl italic font-bold text-lg md:text-xl will-change-transform"
            >
              "Barbers don't need a big following to convert—they need the right system."
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-2 mt-8 md:mt-0 will-change-transform"
          >
            <div className="aspect-[4/5] glass-card bg-black/40 overflow-hidden border-brand-gold/30 shadow-2xl relative">
              <img 
                src="https://i.ibb.co/23FxGKfd/image-2026-03-30-003054012.png" 
                alt="The Hustle" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="md:hidden absolute -bottom-6 left-4 right-4 p-4 border-l-4 border-brand-gold bg-black/90 backdrop-blur-md glass-card italic font-bold text-sm z-20 shadow-2xl will-change-transform"
            >
              "Barbers don't need a big following to convert—they need the right system."
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center will-change-transform"
        >
          <p className="text-lg sm:text-xl md:text-2xl font-black uppercase italic text-brand-gold tracking-wide">
            "Teaching the exact blueprint to financial freedom at 20 years old"
          </p>
          <a
            href="#apply"
            className="mt-6 inline-block px-10 py-4 bg-brand-gold text-black font-black uppercase tracking-widest text-sm md:text-base rounded-full shadow-[0_0_20px_rgba(198,165,109,0.4)] hover:shadow-[0_0_30px_rgba(198,165,109,0.6)] hover:scale-105 transition-all duration-300 animate-[glow_4s_ease-in-out_infinite]"
          >
            Apply Now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
