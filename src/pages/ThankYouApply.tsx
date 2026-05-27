import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import LiquidBackground from '@/components/LiquidBackground';
import PbLogo from '@/components/PbLogo';
import MergedOutline from '@/components/MergedOutline';

/**
 * /thank-you-apply
 *
 * Landing page after Typeform submission. Embeds a Calendly inline widget so the
 * applicant can immediately book a closing call with Dack.
 *
 * --- TYPEFORM SETUP (TODO — do this on the Typeform side) ---
 * In your Typeform (EytKMkv4), go to Settings → Endings → toggle "Redirect on
 * completion" and set the URL to (include the response_id param exactly):
 *     https://profitablebarbers.com/thank-you-apply?response_id={{response_id}}
 *
 * The response_id param is what gates this page — visitors who didn't come
 * from a real Typeform submission won't have it and will be bounced to /.
 * Once they land with a valid response_id, a sessionStorage flag is set so
 * refreshes and back navigation continue to work within the session.
 *
 * --- CALENDLY SETUP (TODO — replace placeholder URL) ---
 * Replace CALENDLY_URL below with the real scheduling URL once Dack creates
 * the event type. The page will auto-detect a successful booking via the
 * "calendly.event_scheduled" postMessage event, set a sessionStorage token,
 * and forward the applicant to /case-studies.
 */

const CALENDLY_URL = 'https://calendly.com/dackbarberacc/30min';

export default function ThankYouApply() {
  const navigate = useNavigate();

  // Listen for Calendly's "event_scheduled" postMessage. When it fires, set the
  // sessionStorage token that gates /case-studies and forward the user there.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://calendly.com') return;
      const data = event.data as { event?: string };
      if (data?.event === 'calendly.event_scheduled') {
        sessionStorage.setItem('dack_booked_call', 'true');
        navigate('/case-studies');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  // Load Calendly's inline widget script
  useEffect(() => {
    const existing = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
    if (existing) return;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-start p-4 pt-12 md:pt-20 relative selection:bg-brand-red selection:text-white">
      <Helmet>
        <title>Application Received | Profitable Barbers</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Your application has been received. Book your closing call with Dack." />
      </Helmet>

      <LiquidBackground />

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-3xl">
        <PbLogo
          alt="Profitable Barbers"
          className="h-14 sm:h-16 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center will-change-transform"
        >
          <p className="text-brand-red text-red-shimmer text-xs sm:text-sm font-black tracking-[0.3em] uppercase mb-4">
            Application Received
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-[1.15] uppercase italic px-4">
            <div className="text-white block mb-2 whitespace-nowrap">Thank You For</div>
            <div className="flex justify-center items-center whitespace-nowrap">
              <MergedOutline strokeWidth="3px" strokeColor="#3B82F6">Applying</MergedOutline>
            </div>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl px-4 will-change-transform"
        >
          <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed font-medium">
            Your next step is to lock in a <span className="text-brand-red text-red-shimmer font-black uppercase italic">1-on-1 call</span> with Dack so he can walk through your goals and see if you're a fit for the program.
          </p>
          <p className="text-sm sm:text-base text-brand-silver/70 mt-3 uppercase tracking-widest font-black">
            Pick a time below ↓
          </p>
        </motion.div>

        {/* Calendly inline embed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 will-change-transform relative"
        >
          {/* PLACEHOLDER until real Calendly URL is in place. The inline-widget div is
              wired up to the real Calendly widget script — when CALENDLY_URL points to
              a real account, the embed will render automatically. */}
          <div
            className="calendly-inline-widget"
            data-url={CALENDLY_URL}
            style={{ minWidth: '320px', height: '700px' }}
          />

          {/* Dev fallback: visible while the placeholder URL is in use, so you can
              test the booking → case-studies flow without a real Calendly event.
              This whole block auto-disappears once the URL no longer contains "PLACEHOLDER". */}
          {CALENDLY_URL.includes('PLACEHOLDER') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center gap-4 rounded-2xl">
              <p className="text-brand-red text-red-shimmer font-black uppercase tracking-widest text-xs sm:text-sm">
                Calendly placeholder
              </p>
              <p className="text-white/70 text-sm max-w-md leading-relaxed">
                Replace <code className="text-brand-red bg-black/60 px-2 py-1 rounded">CALENDLY_URL</code> in <code className="text-brand-red bg-black/60 px-2 py-1 rounded">src/pages/ThankYouApply.tsx</code> with the real scheduling URL.
              </p>
              <button
                onClick={() => {
                  sessionStorage.setItem('dack_booked_call', 'true');
                  navigate('/case-studies');
                }}
                className="mt-4 px-8 py-3 bg-brand-red text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-105 transition-all btn-sheen red-pulse"
              >
                Simulate Booking → Case Studies
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-xs sm:text-sm text-brand-silver/50 uppercase tracking-widest font-black mt-4 mb-8"
        >
          <p>Need help? Reply to your confirmation email.</p>
          <Link to="/" className="inline-block mt-3 text-brand-silver/70 hover:text-white transition-colors underline underline-offset-4">
            Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
