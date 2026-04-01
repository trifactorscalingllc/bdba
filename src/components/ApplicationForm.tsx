import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationForm({ isOpen, onClose }: ApplicationFormProps) {
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-[95%] md:w-[50%] glass-card bg-black/80 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="p-12 md:p-16">
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
                <h3 className="text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter">
                  Lock In <span className="text-red-400/80">Your</span> Spot
                </h3>
              </div>

              <div className="min-h-[300px]">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <p className="text-white/60 text-sm">Tell us about your current situation.</p>
                    <div className="space-y-6">
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
                    className="space-y-8"
                  >
                    <p className="text-white/60 text-sm">What's your biggest bottleneck?</p>
                    <div className="grid gap-3">
                      {['Low Prices', 'No Consistent Leads', 'Trading Time for Money', 'Lack of Systems'].map((option) => (
                        <button key={option} className="w-full text-left p-6 glass-card border-white/10 hover:border-brand-gold bg-white/5 transition-all flex justify-between items-center group">
                          <span className="font-bold text-sm uppercase tracking-tight">{option}</span>
                          <CheckCircle2 size={18} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <p className="text-white/60 text-sm">Final step before the redirect.</p>
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
                className="w-full mt-8 md:mt-12 bg-brand-gold text-black font-black uppercase italic py-4 md:py-6 text-sm md:text-base glass-card rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:bg-white active:scale-[0.98] transition-all shadow-2xl btn-sheen"
              >
                {step === totalSteps ? 'Complete Application' : 'Next Step'}
                <ChevronRight size={20} className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
