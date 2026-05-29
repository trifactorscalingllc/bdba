import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Instagram, CalendarCheck } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import PbLogo from '@/components/PbLogo';
import MergedOutline from '@/components/MergedOutline';

/**
 * /case-studies — PUBLIC
 *
 * Student win showcase. Anyone can browse.
 *
 * --- VIDEO PLACEHOLDERS ---
 * Each card below has a TODO marker for: thumbnail image, video URL (YouTube
 * iframe or direct .mp4), and tagline copy. Swap them as Dack records each
 * student's case study video.
 */

type CaseStudy = {
  name: string;
  handle: string;
  instagram: string;
  tagline: string;          // TODO: replace with real before/after framing
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

export default function CaseStudies() {
  const navigate = useNavigate();
  const [activeStudy, setActiveStudy] = useState<CaseStudy | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Token gate: bounce home if they didn't come through the booking flow.
  // Uses an authorized-state flag so the page renders nothing until the
  // check finishes — prevents unauthorized visitors from briefly seeing
  // the content before the redirect kicks in.
  useEffect(() => {
    const hasToken = sessionStorage.getItem('dack_booked_call') === 'true';
    if (hasToken) {
      setAuthorized(true);
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  if (!authorized) return null;

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
          {/* Header */}
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

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-[1.15] uppercase italic px-4">
              <div className="text-white block mb-2 whitespace-nowrap">While You Wait,</div>
              <div className="flex justify-center items-center whitespace-nowrap">
                <MergedOutline strokeWidth="3px" strokeColor="#3B82F6">Watch The Wins</MergedOutline>
              </div>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-2xl">
              These are the barbers who started exactly where you are. Watch how they used the system to scale.
            </p>
          </motion.div>

          {/* Video case study grid */}
          <div className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {CASE_STUDIES.map((study, index) => (
              <motion.button
                key={study.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setActiveStudy(study)}
                className="group relative aspect-[4/5] glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:border-brand-red/40 hover:scale-[1.02] transition-all duration-300 will-change-transform text-left"
              >
                {/* Thumbnail */}
                <img
                  src={study.thumbnail}
                  alt={`${study.name} case study`}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Dark overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-red/90 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* Card text */}
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

          {/* Closing reminder */}
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

      {/* Video modal */}
      <AnimatePresence>
        {activeStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveStudy(null)}
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
                onClick={() => setActiveStudy(null)}
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-brand-red text-white flex items-center justify-center transition-colors"
                aria-label="Close video"
              >
                <X size={20} />
              </button>

              {activeStudy.videoEmbedUrl ? (
                <iframe
                  title={`${activeStudy.name} case study`}
                  src={activeStudy.videoEmbedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center gap-4 p-8 bg-gradient-to-br from-black/60 to-brand-red/10">
                  <p className="text-brand-red text-red-shimmer font-black uppercase tracking-widest text-xs sm:text-sm">
                    Video coming soon
                  </p>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                    {activeStudy.name}'s story
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
                    Dack is currently recording {activeStudy.name}'s full case study. Check back soon — or follow{' '}
                    <a
                      href={activeStudy.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-red hover:underline"
                    >
                      {activeStudy.handle}
                    </a>{' '}
                    in the meantime.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
