import StandaloneForm from '@/components/StandaloneForm';
import LiquidBackground from '@/components/LiquidBackground';

const HERO_IMAGE = 'https://i.ibb.co/KpKT5xyw/image-2026-03-30-223225063.png';

export default function Intro() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative selection:bg-brand-red selection:text-white">
      <LiquidBackground />

      <div className="w-full max-w-xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden glass-card shadow-2xl">
            <img
              src={HERO_IMAGE}
              alt="Profitable Barbers Academy"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <StandaloneForm />
      </div>
    </div>
  );
}
