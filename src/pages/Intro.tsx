import { useNavigate } from 'react-router-dom';
import LiquidBackground from '@/components/LiquidBackground';
import logoTransparent from '@/assets/pb-logo.png';

const HERO_IMAGE = 'https://i.ibb.co/KpKT5xyw/image-2026-03-30-223225063.png';

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4 relative selection:bg-brand-red selection:text-white">
      <LiquidBackground />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <img
          src={logoTransparent}
          alt="Profitable Barbers"
          className="h-16 sm:h-20 md:h-24 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        />
        <div className="w-[90vw] max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden glass-card shadow-2xl">
          <img
            src={HERO_IMAGE}
            alt="Profitable Barbers Academy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <button
          onClick={() => navigate('/apply')}
          className="px-12 h-14 sm:h-16 bg-brand-red text-white font-black uppercase italic tracking-tighter text-lg sm:text-xl rounded-full hover:bg-red-500 active:scale-95 transition-all btn-sheen red-pulse shadow-[0_0_30px_rgba(220,38,38,0.4)]"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4 relative selection:bg-brand-red selection:text-white">
      <LiquidBackground />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <img
          src={logoTransparent}
          alt="Profitable Barbers"
          className="h-16 sm:h-20 md:h-24 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        />
        <div className="w-[90vw] max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden glass-card shadow-2xl">
          <img
            src={HERO_IMAGE}
            alt="Profitable Barbers Academy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}
