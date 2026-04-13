import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import StandaloneForm from '@/components/StandaloneForm';
import LiquidBackground from '@/components/LiquidBackground';
import logoTransparent from '@/assets/pb-logo.png';

export default function Apply() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative selection:bg-brand-red selection:text-white">
      <LiquidBackground />

      <div className="w-full max-w-xl relative z-10">
        <div className="flex justify-center mb-8">
          <img
            src={logoTransparent}
            alt="Profitable Barbers"
            className="h-16 sm:h-20 md:h-24 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          />
        </div>
        <StandaloneForm />
      </div>
    </div>
  );
}
