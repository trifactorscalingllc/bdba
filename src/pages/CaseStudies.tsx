import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Instagram, CalendarCheck, PhoneCall, Video, Volume2 } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import PbLogo from '@/components/PbLogo';
import MergedOutline from '@/components/MergedOutline';

/**
 * /case-studies — PUBLIC
 *
 * Student win showcase + pre-call prep. Anyone can browse.
 *
 * Page structure (top → bottom):
 *   1. Header (logo + "Your Call Is Booked" badge + welcome title)
 *   2. STEP 1 — Thank-you / next-steps video (single placeholder)
 *   3. STEP 2 — Please Read (3 info cards: confirm call, Zoom, quiet place)
 *   4. STEP 3 — FAQ video grid (6 common objections, all placeholders)
 *   5. "While You Wait, Watch The Wins" — student case study grid (existing)
 *   6. Closing CTA + back-to-home link
 *
 * --- VIDEO PLACEHOLDERS ---
 * THANK_YOU_VIDEO_URL, FAQS[].videoEmbedUrl, and CASE_STUDIES[].videoEmbedUrl
 * all start empty. Swap each one in as Dack records the videos.
 */

// Top "Step 1" welcome / next-steps video. Leave empty for the placeholder state.
const THANK_YOU_VIDEO_URL = ''; // TODO: YouTube embed URL or direct .mp4

type CaseStudy = {
  name: string;
  handle: string;
  instagram: string;
  tagline: string;          // TODO: replace with real before/after framing
  thumbnail: string;        // TODO: replace with real thumbnail
  videoEmbedUrl: string;    // TODO: replace with real YouTube embed URL
};

type FAQ = {
  num: number;
  question: string;
  thumbnail: string;        // TODO: replace with real thumbnail
  videoEmbedUrl: string;    // TODO: replace with real YouTube embed URL
};

const CASE_STUDIES: CaseStudy[] = [
  {
    name: 'Yari',
    handle: '@yaricutz',
    instagram: 'https://www.instagram.com/yaricutz',
    tagline: 'From Solo Cuts To Sold-Out Calendar', // TODO: replace
    thumbnail: 'https://placehold.co/640x800/0a0a0a/dc2626?text=YARI+%E2%80%94+VIDEO+SOON', // TODO: replace
    videoEmbedUrl: '', // TODO: e.g. https://www.youtube.com/embed/VIDEOID
  },
  {
    name: 'Jay',
    handle: '@jayvin',
    instagram: 'https://www.instagram.com/jayvin',
    tagline: 'From Stuck Local To System-Driven Pricing', // TODO: replace
    thumbnail: 'https://placehold.co/640x800/0a0a0a/dc2626?text=JAY+%E2%80%94+VIDEO+SOON', // TODO: replace
    videoEmbedUrl: '', // TODO
  },
  {
    name: 'Keenan',
    handle: '@cutbykeenan',
    instagram: 'https://www.instagram.com/cutbykeenan',
    tagline: 'From Word-Of-Mouth To Full Waitlist', // TODO: replace
    thumbnail: 'https://placehold.co/640x800/0a0a0a/dc2626?text=KEENAN+%E2%80%94+VIDEO+SOON', // TODO: replace
    videoEmbedUrl: '', // TODO
  },
  {
    name: 'George',
    handle: '@georgecuts',  // TODO: confirm real handle
    instagram: 'https://www.instagram.com/georgecuts',
    tagline: 'From Random Walk-Ins To High-Paying Clientele', // TODO: replace
    thumbnail: 'https://placehold.co/640x800/0a0a0a/dc2626?text=GEORGE+%E2%80%94+VIDEO+SOON', // TODO: replace
    videoEmbedUrl: '', // TODO
  },
];

const FAQS: FAQ[] = [
  {
    num: 1,
    question: 'How Long Will It Take To See Results?',
    thumbnail: 'https://placehold.co/960x540/0a0a0a/3b82f6?text=FAQ+%231+%E2%80%94+VIDEO+SOON', // TODO
    videoEmbedUrl: '', // TODO
  },
  {
    num: 2,
    question: 'How Much Capital Do I Need To Get Started?',
    thumbnail: 'https://placehold.co/960x540/0a0a0a/3b82f6?text=FAQ+%232+%E2%80%94+VIDEO+SOON', // TODO
    videoEmbedUrl: '', // TODO
  },
  {
    num: 3,
    question: 'Do I Need A Big Following Already?',
    thumbnail: 'https://placehold.co/960x540/0a0a0a/3b82f6?text=FAQ+%233+%E2%80%94+VIDEO+SOON', // TODO
    videoEmbedUrl: '', // TODO
  },
  {
    num: 4,
    question: 'Do I Need My Own Shop Or Storefront?',
    thumbnail: 'https://placehold.co/960x540/0a0a0a/3b82f6?text=FAQ+%234+%E2%80%94+VIDEO+SOON', // TODO
    videoEmbedUrl: '', // TODO
  },
  {
    num: 5,
    question: 'How Much Time Per Week Do I Need To Commit?',
    thumbnail: 'https://placehold.co/960x540/0a0a0a/3b82f6?text=FAQ+%235+%E2%80%94+VIDEO+SOON', // TODO
    videoEmbedUrl: '', // TODO
  },
  {
    num: 6,
    question: "What If It Doesn't Work For Me?",
    thumbnail: 'https://placehold.co/960x540/0a0a0a/3b82f6?text=FAQ+%236+%E2%80%94+VIDEO+SOON', // TODO
    videoEmbedUrl: '', // TODO
  },
];

// What modal is currently open (case study, FAQ, or thank-you video).
type ActiveVideo =
  | { kind: 'case'; data: CaseStudy }
  | { kind: 'faq'; data: FAQ }
  | { kind: 'welcome' };

export default function CaseStudies() {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);

  // Small helper that renders a styled "STEP X:" heading
  // (blue-400 italic black "STEP X:" + white headline that follows).
  const StepHeading = ({ step, children }: { step: number; children: React.ReactNode }) => (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-center text-xl sm:text-2xl md:text-4xl font-black uppercase italic leading-tight mb-8 md:mb-12 will-change-transform"
    >
      <span className="text-brand-red text-red-shimmer">STEP {step}:</span>{' '}
      <span className="text-white">{children}</span>
    </motion.h2>
  );

  return (
    <div className="min-h-screen bg-brand-black relative selection:bg-brand-red selection:text-white">
      <Helmet>
        <title>Welcome To The Vault | Profitable Barbers</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Student case studies — for booked applicants only." />
      </Helmet>

      <LiquidBackground />

      <main className="relative z-10 pt-12 md:pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* ---------- Header ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-8 text-center will-change-transform"
          >
            <PbLogo
              alt="Profitable Barbers"
              className="h-14 sm:h-16 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            />

            <div className="flex items-center gap-2 px-5 py-2 glass-card rounded-full border border-brand-red/30">
              <CalendarCheck size={16} className="text-brand-red" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-brand-red text-red-shimmer">
                Your Call Is Booked
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.15] uppercase italic px-4">
              <div className="text-white block mb-2 whitespace-nowrap">Welcome To</div>
              <div className="flex justify-center items-center whitespace-nowrap">
                <span className="text-brand-red text-red-shimmer px-[0.05em]">The Vault</span>
              </div>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-2xl">
              3 quick steps before your call with Dack. Don't skip them — they make the call 10× more useful.
            </p>
          </motion.div>

          {/* ---------- STEP 1: Welcome / next-steps video ---------- */}
          <section className="mt-20 md:mt-28">
            <StepHeading step={1}>Watch This Video For Next Steps</StepHeading>

            <motion.div
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(20px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-3xl mx-auto overflow-hidden bg-black vsl-glow rounded-2xl border border-white/10 shadow-2xl will-change-transform"
              style={{ aspectRatio: '16/9' }}
            >
              {THANK_YOU_VIDEO_URL ? (
                <iframe
                  title="Next steps video"
                  src={THANK_YOU_VIDEO_URL}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveVideo({ kind: 'welcome' })}
                  className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-black to-brand-red/10"
                  aria-label="Play next steps video"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15),_transparent_60%)]" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-red/90 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.6)] group-hover:scale-110 transition-transform mb-6">
                    <Play size={32} className="text-white ml-1" fill="white" />
                  </div>
                  <p className="text-brand-red text-red-shimmer text-xs sm:text-sm font-black uppercase tracking-widest mb-2">
                    Video coming soon
                  </p>
                  <p className="text-white/80 text-sm sm:text-base max-w-sm text-center px-6 leading-relaxed">
                    Dack is recording your welcome video. In the meantime, keep going — Steps 2 &amp; 3 below.
                  </p>
                </button>
              )}
            </motion.div>
          </section>

          {/* ---------- STEP 2: Please Read ---------- */}
          <section className="mt-20 md:mt-28">
            <StepHeading step={2}>Read The Statements Below</StepHeading>

            {/* Card 1 — full width: confirmation contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl border border-blue-400/30 p-6 md:p-8 mb-6 will-change-transform"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-blue-400/10 border border-blue-400/40 flex items-center justify-center">
                  <PhoneCall size={20} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase italic text-white tracking-tight leading-tight mb-3">
                    Dack or his team may text/call to confirm your appointment
                  </h3>
                  <p className="text-sm sm:text-base text-white/75 leading-relaxed font-medium">
                    Please answer our calls &amp; messages so we can have the most tactical conversation possible regarding your situation. If we can't reach you, we may have to release your slot.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cards 2 & 3 — side by side: Zoom + Quiet place */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card rounded-2xl border border-blue-400/30 p-6 md:p-8 will-change-transform"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-blue-400/10 border border-blue-400/40 flex items-center justify-center">
                    <Video size={20} className="text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg sm:text-xl font-black uppercase italic text-white tracking-tight leading-tight mb-3">
                      Your Call Will Be On Zoom
                    </h3>
                    <p className="text-sm sm:text-base text-white/75 leading-relaxed font-medium">
                      The Zoom link will be sent to the email &amp; phone number you applied with. Please make sure the Zoom app is downloaded on whatever device you'll be joining from.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card rounded-2xl border border-brand-red/40 p-6 md:p-8 will-change-transform"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/40 flex items-center justify-center">
                    <Volume2 size={20} className="text-brand-red" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg sm:text-xl font-black uppercase italic text-white tracking-tight leading-tight mb-3">
                      Be Somewhere Quiet — Not The Shop
                    </h3>
                    <p className="text-sm sm:text-base text-white/75 leading-relaxed font-medium">
                      <span className="text-brand-red text-red-shimmer font-black">Do NOT take the call inside the barbershop</span>, while you're cutting a client, or anywhere noisy. If we can't hear you clearly, Dack will reschedule.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ---------- STEP 3: FAQ ---------- */}
          <section className="mt-20 md:mt-28">
            <StepHeading step={3}>Go Through Our FAQ Below</StepHeading>

            <div className="grid grid-cols-1 gap-6">
              {FAQS.map((faq, index) => (
                <motion.button
                  key={faq.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveVideo({ kind: 'faq', data: faq })}
                  className="group glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-blue-400/40 transition-all duration-300 text-left will-change-transform"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Question text */}
                    <div className="p-6 md:p-10 flex flex-col justify-center">
                      <p className="text-brand-red text-red-shimmer text-xs sm:text-sm font-black uppercase tracking-[0.25em] mb-3">
                        FAQ #{faq.num}
                      </p>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase italic text-white tracking-tight leading-tight">
                        {faq.question}
                      </h3>
                    </div>

                    {/* Video thumbnail */}
                    <div className="relative aspect-video md:aspect-auto md:min-h-[200px] bg-black overflow-hidden">
                      <img
                        src={faq.thumbnail}
                        alt={`FAQ ${faq.num} video`}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand-red/90 flex items-center justify-center shadow-[0_0_24px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform">
                          <Play size={22} className="text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ---------- Case studies (existing "While You Wait, Watch The Wins") ---------- */}
          <section className="mt-24 md:mt-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center will-change-transform"
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.15] uppercase italic px-4">
                <div className="text-white block mb-2 whitespace-nowrap">While You Wait,</div>
                <div className="flex justify-center items-center whitespace-nowrap">
                  <span className="text-brand-red text-red-shimmer px-[0.05em]">Watch The Wins</span>
                </div>
              </h2>
              <p className="mt-6 text-base sm:text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-2xl mx-auto">
                These are the barbers who started exactly where you are. Watch how they used the system to scale.
              </p>
            </motion.div>

            <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {CASE_STUDIES.map((study, index) => (
                <motion.button
                  key={study.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveVideo({ kind: 'case', data: study })}
                  className="group relative aspect-[4/5] glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:border-brand-red/40 hover:scale-[1.02] transition-all duration-300 will-change-transform text-left"
                >
                  <img
                    src={study.thumbnail}
                    alt={`${study.name} case study`}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-red/90 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform">
                      <Play size={28} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-left">
                    <p className="text-brand-red text-red-shimmer text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-2">
                      Student Win
                    </p>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none mb-2">
                      {study.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-silver/80 flex items-center gap-1 mb-3 font-medium">
                      <Instagram size={12} /> {study.handle}
                    </p>
                    <p className="text-sm sm:text-base font-black uppercase italic text-white/90 leading-tight">
                      {study.tagline}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ---------- Closing reminder ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 md:mt-28 text-center max-w-2xl mx-auto will-change-transform"
          >
            <p className="text-lg sm:text-xl md:text-2xl font-black uppercase italic text-white tracking-wide leading-tight">
              Get Ready For Your Call With{' '}
              <span className="text-brand-red text-red-shimmer">Dack.</span>
            </p>
            <p className="mt-4 text-sm sm:text-base text-brand-silver/70 font-medium">
              Check your email for the calendar invite. Bring your goals — Dack brings the system.
            </p>
            <Link
              to="/"
              className="inline-block mt-8 text-xs sm:text-sm text-brand-silver/50 hover:text-white uppercase tracking-widest font-black transition-colors underline underline-offset-4"
            >
              Back to home
            </Link>
          </motion.div>
        </div>
      </main>

      {/* ---------- Video modal (case study + FAQ + welcome) ---------- */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl aspect-video glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-brand-red text-white flex items-center justify-center transition-colors"
                aria-label="Close video"
              >
                <X size={20} />
              </button>

              {activeVideo.kind === 'case' && activeVideo.data.videoEmbedUrl ? (
                <iframe
                  title={`${activeVideo.data.name} case study`}
                  src={activeVideo.data.videoEmbedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : activeVideo.kind === 'faq' && activeVideo.data.videoEmbedUrl ? (
                <iframe
                  title={`FAQ ${activeVideo.data.num}`}
                  src={activeVideo.data.videoEmbedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center gap-4 p-8 bg-gradient-to-br from-black/60 to-brand-red/10">
                  <p className="text-brand-red text-red-shimmer font-black uppercase tracking-widest text-xs sm:text-sm">
                    Video coming soon
                  </p>
                  {activeVideo.kind === 'case' ? (
                    <>
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                        {activeVideo.data.name}'s story
                      </h3>
                      <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
                        Dack is currently recording {activeVideo.data.name}'s full case study. Check back soon — or follow{' '}
                        <a
                          href={activeVideo.data.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-red hover:underline"
                        >
                          {activeVideo.data.handle}
                        </a>{' '}
                        in the meantime.
                      </p>
                    </>
                  ) : activeVideo.kind === 'faq' ? (
                    <>
                      <p className="text-brand-red text-red-shimmer font-black uppercase tracking-widest text-xs sm:text-sm">
                        FAQ #{activeVideo.data.num}
                      </p>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white max-w-2xl">
                        {activeVideo.data.question}
                      </h3>
                      <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
                        Dack is recording this answer. Bring the question to your call if you need it sooner.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                        Welcome Video
                      </h3>
                      <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
                        Dack is recording your next-steps video. Keep going — Steps 2 &amp; 3 below have everything you need before the call.
                      </p>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
