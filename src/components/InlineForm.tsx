import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Loader2, CheckCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 6;

export default function InlineForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1
  const [hasTime, setHasTime] = useState<string | null>(null);
  // Step 2
  const [revenueGoal, setRevenueGoal] = useState<string | null>(null);
  // Step 3
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  // Step 4
  const [cutsRange, setCutsRange] = useState<string | null>(null);
  const [situationText, setSituationText] = useState('');
  // Step 5
  const [capitalAvailable, setCapitalAvailable] = useState<string | null>(null);
  // Step 6 = calendar placeholder

  const canProceed = () => {
    switch (step) {
      case 1: return !!hasTime;
      case 2: return !!revenueGoal;
      case 3: return !!firstName && !!phoneNumber && !!email;
      case 4: return !!cutsRange && situationText.trim().length > 10;
      case 5: return !!capitalAvailable;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Please complete all fields before continuing.');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          fullName: firstName,
          instagramHandle: `Revenue: ${revenueGoal} | Capital: ${capitalAvailable}`,
          phoneNumber,
          email,
          hasTime,
          revenueGoal,
          cutsRange,
          situationText,
          capitalAvailable,
        },
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full mx-auto glass-card bg-black/40 backdrop-blur-xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="p-8 md:p-16 flex flex-col items-center justify-center text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <CheckCircle className="w-16 h-16 text-green-400 mb-6" />
          </motion.div>
          <h3 className="text-2xl md:text-4xl font-black uppercase italic leading-none text-white tracking-tighter mb-4">
            Application <span className="text-green-400">Submitted!</span>
          </h3>
          <p className="text-white/60 text-sm md:text-base">We'll be in touch soon. Stay tuned.</p>
        </div>
      </div>
    );
  }

  const OptionButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 glass-card border transition-all flex justify-between items-center group rounded-2xl",
        selected ? "border-brand-gold bg-brand-gold/10" : "border-white/10 hover:border-brand-gold bg-white/5"
      )}
    >
      <span className="font-bold text-sm uppercase tracking-tight">{label}</span>
      <CheckCircle2
        size={18}
        className={cn("text-brand-gold transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover:opacity-50")}
      />
    </button>
  );

  return (
    <div className="w-full mx-auto glass-card bg-black/40 backdrop-blur-xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
      <div className="p-8 md:p-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <span className="technical-label text-brand-gold">Step {step} of {TOTAL_STEPS}</span>
            <div className="flex gap-1.5">
              {[...Array(TOTAL_STEPS)].map((_, i) => (
                <div key={i} className={cn("h-0.5 w-5 transition-all duration-500 rounded-full", i + 1 <= step ? "bg-brand-gold" : "bg-white/10")} />
              ))}
            </div>
          </div>
          <h3 className="text-2xl md:text-4xl font-black uppercase italic leading-none text-white tracking-tighter">
            Lock In <span className="text-red-400/80">Your</span> Spot
          </h3>
        </div>

        {/* Steps */}
        <div className="min-h-[320px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                <p className="text-white/80 text-sm md:text-base font-medium">Do you have at least 1-2 hours per day outside of the barbershop to actually implement these scaling systems?<span className="text-red-400">*</span></p>
                <div className="grid gap-3">
                  <OptionButton label="Yes" selected={hasTime === 'Yes'} onClick={() => setHasTime('Yes')} />
                  <OptionButton label="No" selected={hasTime === 'No'} onClick={() => setHasTime('No')} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                <p className="text-white/80 text-sm md:text-base font-medium">What is your long-term revenue goal for your barbering business?<span className="text-red-400">*</span></p>
                <div className="grid gap-3">
                  {['$5k - $10k/month', '$10k - $20k/month', '$20k - $30k/month', '$30k+/month'].map((opt) => (
                    <OptionButton key={opt} label={opt} selected={revenueGoal === opt} onClick={() => setRevenueGoal(opt)} />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                <p className="text-white/80 text-sm md:text-base font-medium">Before you submit your application, where should my team contact you?<span className="text-red-400">*</span></p>
                <div className="space-y-4">
                  <label className="block">
                    <span className="technical-label block mb-2">First Name<span className="text-red-400">*</span></span>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm" placeholder="John" />
                  </label>
                  <label className="block">
                    <span className="technical-label block mb-2">Phone Number<span className="text-red-400">*</span></span>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm" placeholder="+1 (555) 123-4567" />
                  </label>
                  <label className="block">
                    <span className="technical-label block mb-2">Email<span className="text-red-400">*</span></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm" placeholder="you@email.com" />
                  </label>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                <p className="text-white/80 text-sm md:text-base font-medium">
                  We receive countless applications from barbers every week, but just like a shop owner picking his top-tier talent, we only select a handful of serious guys to mentor closely. Tell me about your current situation (how many cuts have you done in the last 6 months) and what makes you a solid fit to run these systems?<span className="text-red-400">*</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['0-50', '50-100', '100-150', '150+'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCutsRange(opt)}
                      className={cn(
                        "p-4 glass-card border rounded-2xl text-center font-bold text-sm uppercase tracking-tight transition-all",
                        cutsRange === opt ? "border-brand-gold bg-brand-gold/10" : "border-white/10 hover:border-brand-gold bg-white/5"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <textarea
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm resize-none"
                  placeholder="Don't give a 1-word response. Tell us about your situation and what makes you a solid fit..."
                />
                <p className="text-white/30 text-xs">Shift ⇧ + Enter ↵ to make a line break</p>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                <p className="text-white/80 text-sm md:text-base font-medium">
                  Truly envision your shop and lifestyle 6 months from now when you finally scale past just grinding behind the chair. To make this a reality, my 1-on-1 time and access to my systems aren't free. How much capital do you have available right now to invest into scaling your business?<span className="text-red-400">*</span>
                </p>
                <div className="grid gap-3">
                  {['$0 - $500', '$500 - $1,000', '$1,000 - $2,000', '$3,000+'].map((opt) => (
                    <OptionButton key={opt} label={opt} selected={capitalAvailable === opt} onClick={() => setCapitalAvailable(opt)} />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                <p className="text-white/80 text-sm md:text-base font-medium">
                  Can you make sure to choose a time slot that you can 100% commit to showing up for so we don't waste each other's time?<span className="text-red-400">*</span>
                </p>
                <div className="p-8 glass-card border-brand-gold/20 bg-brand-gold/5 rounded-2xl text-center">
                  <div className="technical-label text-brand-gold mb-4 opacity-100">Coming Soon</div>
                  <h4 className="text-xl font-black uppercase italic mb-2">Calendar Booking</h4>
                  <p className="text-sm text-white/60">A calendar integration will be linked here for scheduling your call.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 md:mt-12">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-4 md:py-6 glass-card border border-white/10 rounded-full text-white font-bold uppercase italic text-sm hover:border-white/30 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isSubmitting || !canProceed()}
            className="flex-1 bg-brand-gold text-black font-black uppercase italic py-4 md:py-6 text-sm md:text-base rounded-full flex items-center justify-center gap-2 hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] btn-sheen disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Submitting...
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                Complete Application
                <ChevronRight size={20} />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
