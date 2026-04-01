import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InlineForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      window.location.href = "https://whop.com/high-ticket-barbers";
    }
  };

  return (
    <div className="w-full mx-auto glass-card bg-black/40 backdrop-blur-xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
      <div className="p-8 md:p-16">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <span className="technical-label text-brand-gold">Step {step} of {totalSteps}</span>
            <div className="flex gap-2">
              {[...Array(totalSteps)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-0.5 w-6 transition-all duration-500",
                    i + 1 <= step ? "bg-brand-gold" : "bg-white/10"
                  )} 
                />
              ))}
            </div>
          </div>
          <h3 className="text-2xl md:text-4xl font-black uppercase italic leading-none text-white tracking-tighter">
            Lock In <span className="text-red-400/80">Your</span> Spot
          </h3>
        </div>

        <div className="min-h-[280px]">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 text-left"
            >
              <p className="text-white/60">Tell us about your current situation.</p>
              <div className="space-y-4">
                <label className="block">
                  <span className="technical-label block mb-2">Full Name</span>
                  <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm" placeholder="John Doe" />
                </label>
                <label className="block">
                  <span className="technical-label block mb-2">Instagram Handle</span>
                  <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm" placeholder="@yourhandle" />
                </label>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 text-left"
            >
              <p className="text-white/60">What's your biggest bottleneck?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Low Prices', 'No Consistent Leads', 'Trading Time for Money', 'Lack of Systems'].map((option) => (
                  <button 
                    key={option} 
                    className="w-full text-left p-6 glass-card bg-black/40 hover:border-brand-gold group h-full flex flex-col justify-between"
                  >
                    <div className="technical-label mb-4 opacity-100">Bottleneck</div>
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg leading-tight uppercase italic">{option}</span>
                      <CheckCircle2 size={18} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 text-left"
            >
              <p className="text-white/60">Final step before the redirect.</p>
              <div className="p-8 glass-card border-brand-gold/20 bg-brand-gold/5">
                <div className="technical-label text-brand-gold mb-4 opacity-100">System Ready</div>
                <h4 className="text-2xl font-black uppercase italic mb-2">Ready to scale?</h4>
                <p className="text-sm text-white/60">By clicking below, you'll be redirected to the Whop ecosystem where the real work begins.</p>
              </div>
            </motion.div>
          )}
        </div>

        <button 
          onClick={handleNext}
          className="w-full mt-8 md:mt-12 bg-brand-gold text-black font-black uppercase italic py-4 md:py-6 text-sm md:text-base rounded-full flex items-center justify-center gap-2 hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] btn-sheen"
        >
          {step === totalSteps ? 'Complete Application' : 'Next Step'}
          <ChevronRight size={20} className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}
