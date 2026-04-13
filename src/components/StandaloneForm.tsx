import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Loader2, CheckCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 5;

export default function StandaloneForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQualified] = useState(false);

  const [hasTime, setHasTime] = useState<string | null>(null);
  const [revenueGoal, setRevenueGoal] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cutsRange, setCutsRange] = useState<string | null>(null);
  const [situationText, setSituationText] = useState('');
  const [capitalAvailable, setCapitalAvailable] = useState<string | null>(null);

  const canProceed = () => {
    switch (step) {
      case 1: return !!hasTime;
      case 2: return !!revenueGoal;
      case 3: return !!firstName && !!phoneNumber && !!email;
      case 4: return !!cutsRange && situationText.trim().length > 10;
      case 5: return !!capitalAvailable;
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

  const checkQualified = (): boolean => {
    // Qualified: question1 = A (Yes), question5 capital = B, C, D, or E ($500+)
    const hasTimeQualified = hasTime === 'Yes';
    const capitalQualified = capitalAvailable !== '$0 - $500';
    return hasTimeQualified && capitalQualified;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const qualified = checkQualified();

      const { error } = await supabase.from('barber_leads').insert({
        first_name: firstName,
        phone_number: phoneNumber,
        email,
        has_time: hasTime,
        revenue_goal: revenueGoal,
        cuts_range: cutsRange,
        situation_text: situationText,
        capital_available: capitalAvailable,
        qualified,
      } as any);

      if (error) throw error;

      // Also fire the SMS notification
      await supabase.functions.invoke('send-sms', {
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

      setIsSubmitted(true);
      toast.success('Thank you for submitting your interest! Our team will reach out shortly.');
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted && !isQualified) {
    return (
      <div className="w-full mx-auto glass-card bg-black/40 backdrop-blur-xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="p-6 sm:p-10 md:p-16 flex flex-col items-center justify-center text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mb-4 sm:mb-6" />
          </motion.div>
          <h3 className="text-xl sm:text-2xl md:text-4xl font-black uppercase italic leading-none text-white tracking-tighter mb-3">
            Thanks for <span className="text-green-400">Applying!</span>
          </h3>
          <p className="text-white/60 text-xs sm:text-sm md:text-base max-w-md leading-relaxed">
            You aren't quite a fit for the 1-on-1 coaching yet, but we've got you. Check your SMS for an invite to our private Billionaire Barbers waiting room.
          </p>
        </div>
      </div>
    );
  }

  const OptionButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-3.5 sm:p-4 glass-card border transition-all flex justify-between items-center group rounded-xl sm:rounded-2xl",
        selected ? "border-brand-red bg-brand-red/10" : "border-white/10 hover:border-brand-red bg-white/5"
      )}
    >
      <span className="font-bold text-xs sm:text-sm uppercase tracking-tight">{label}</span>
      <CheckCircle2
        size={16}
        className={cn("text-brand-red transition-opacity flex-shrink-0 ml-2", selected ? "opacity-100" : "opacity-0 group-hover:opacity-50")}
      />
    </button>
  );

  return (
    <div className="w-full mx-auto glass-card bg-black/40 backdrop-blur-xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
      <div className="p-5 sm:p-8 md:p-12 lg:p-16">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="technical-label text-brand-red text-[9px] sm:text-[10px]">Step {step} of {TOTAL_STEPS}</span>
            <div className="flex gap-1 sm:gap-1.5">
              {[...Array(TOTAL_STEPS)].map((_, i) => (
                <div key={i} className={cn("h-0.5 w-3 sm:w-5 transition-all duration-500 rounded-full", i + 1 <= step ? "bg-brand-red" : "bg-white/10")} />
              ))}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase italic leading-none text-white tracking-tighter">
            Lock In <span className="text-brand-red">Your</span> Spot
          </h3>
        </div>

        {/* Steps */}
        <div className="min-h-[260px] sm:min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6 text-left">
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                  Do you have at least 1-2 hours per day outside of the barbershop to actually implement these scaling systems?<span className="text-brand-red">*</span>
                </p>
                <div className="grid gap-2.5 sm:gap-3">
                  <OptionButton label="Yes" selected={hasTime === 'Yes'} onClick={() => setHasTime('Yes')} />
                  <OptionButton label="No" selected={hasTime === 'No'} onClick={() => setHasTime('No')} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6 text-left">
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                  What is your long-term revenue goal for your barbering business?<span className="text-brand-red">*</span>
                </p>
                <div className="grid gap-2.5 sm:gap-3">
                  {['$5k - $10k/month', '$10k - $20k/month', '$20k - $30k/month', '$30k+/month'].map((opt) => (
                    <OptionButton key={opt} label={opt} selected={revenueGoal === opt} onClick={() => setRevenueGoal(opt)} />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6 text-left">
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                  Before you submit your application, where should my team contact you?<span className="text-brand-red">*</span>
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <label className="block">
                    <span className="technical-label block mb-1.5 sm:mb-2 text-[9px] sm:text-[10px]">First Name<span className="text-brand-red">*</span></span>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:border-brand-red outline-none transition-all text-white font-mono text-xs sm:text-sm" placeholder="John" />
                  </label>
                  <label className="block">
                    <span className="technical-label block mb-1.5 sm:mb-2 text-[9px] sm:text-[10px]">Phone Number<span className="text-brand-red">*</span></span>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:border-brand-red outline-none transition-all text-white font-mono text-xs sm:text-sm" placeholder="+1 (555) 123-4567" />
                  </label>
                  <label className="block">
                    <span className="technical-label block mb-1.5 sm:mb-2 text-[9px] sm:text-[10px]">Email<span className="text-brand-red">*</span></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:border-brand-red outline-none transition-all text-white font-mono text-xs sm:text-sm" placeholder="you@email.com" />
                  </label>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-5 text-left">
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                  We only select a handful of serious guys to mentor closely. How many cuts have you done in the last 6 months?<span className="text-brand-red">*</span>
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {['0-50', '50-100', '100-150', '150+'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCutsRange(opt)}
                      className={cn(
                        "p-2.5 sm:p-3 glass-card border rounded-xl sm:rounded-2xl text-center font-bold text-[10px] sm:text-xs uppercase tracking-tight transition-all",
                        cutsRange === opt ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-white/10 hover:border-brand-red bg-white/5"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-white/60 text-[10px] sm:text-xs mb-2">What makes you a solid fit to run these systems?<span className="text-brand-red">*</span></p>
                  <textarea
                    value={situationText}
                    onChange={(e) => setSituationText(e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:border-brand-red outline-none transition-all text-white font-mono text-xs sm:text-sm resize-none"
                    placeholder="Tell us about your current situation and what makes you a solid fit... (Do not give a 1-word response)"
                  />
                  <p className="text-white/30 text-[9px] sm:text-xs mt-1">Shift ⇧ + Enter ↵ to make a line break</p>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6 text-left">
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                  Truly envision your shop and lifestyle 6 months from now when you finally scale past just grinding behind the chair. How much capital do you have available right now to invest into scaling your business?<span className="text-brand-red">*</span>
                </p>
                <div className="grid gap-2.5 sm:gap-3">
                  {['$0 - $500', '$500 - $1,000', '$1,000 - $2,000', '$3,000+'].map((opt) => (
                    <OptionButton key={opt} label={opt} selected={capitalAvailable === opt} onClick={() => setCapitalAvailable(opt)} />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6 text-left">
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                  Can you make sure to choose a time slot that you can 100% commit to showing up for so we don't waste each other's time?<span className="text-brand-red">*</span>
                </p>
                <div className="p-6 sm:p-8 glass-card border-brand-red/20 bg-brand-red/5 rounded-xl sm:rounded-2xl text-center">
                  <div className="technical-label text-brand-red mb-3 opacity-100 text-[9px] sm:text-[10px]">Coming Soon</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-black uppercase italic mb-2">Calendar Booking</h4>
                  <p className="text-[10px] sm:text-xs md:text-sm text-white/60">A calendar integration will be linked here for scheduling your call.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-2.5 sm:gap-3 mt-6 sm:mt-8 md:mt-10">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 sm:px-6 py-3 sm:py-4 glass-card border border-white/10 rounded-full text-white font-bold uppercase italic text-xs sm:text-sm hover:border-white/30 transition-all flex items-center gap-1.5"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isSubmitting || !canProceed()}
            className="flex-1 bg-brand-red text-white font-black uppercase italic py-3 sm:py-4 md:py-5 text-xs sm:text-sm md:text-base rounded-full flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-red-500 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] btn-sheen disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                Complete Application
                <ChevronRight size={16} />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
