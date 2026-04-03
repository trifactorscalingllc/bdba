import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function InlineForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async () => {
    if (!fullName || !instagramHandle || !phoneNumber) {
      toast.error('Please fill in all fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { fullName, instagramHandle, phoneNumber },
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
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

  return (
    <div className="w-full mx-auto glass-card bg-black/40 backdrop-blur-xl overflow-hidden relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
      <div className="p-8 md:p-16">
        <div className="mb-12">
          <h3 className="text-2xl md:text-4xl font-black uppercase italic leading-none text-white tracking-tighter">
            Lock In <span className="text-red-400/80">Your</span> Spot
          </h3>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 text-left"
        >
          <p className="text-white/60">Tell us about your current situation.</p>
          <div className="space-y-4">
            <label className="block">
              <span className="technical-label block mb-2">Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm"
                placeholder="John Doe"
              />
            </label>
            <label className="block">
              <span className="technical-label block mb-2">Instagram Handle</span>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm"
                placeholder="@yourhandle"
              />
            </label>
            <label className="block">
              <span className="technical-label block mb-2">Phone Number</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-brand-gold outline-none transition-all text-white font-mono text-sm"
                placeholder="+1 (555) 123-4567"
              />
            </label>
          </div>
        </motion.div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mt-8 md:mt-12 bg-brand-gold text-black font-black uppercase italic py-4 md:py-6 text-sm md:text-base rounded-full flex items-center justify-center gap-2 hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] btn-sheen disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Complete Application
              <ChevronRight size={20} className="w-4 h-4 md:w-5 md:h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
