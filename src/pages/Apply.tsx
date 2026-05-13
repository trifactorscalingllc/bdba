import { Helmet } from 'react-helmet-async';
import StandaloneForm from '@/components/StandaloneForm';
import LiquidBackground from '@/components/LiquidBackground';
import logoTransparent from '@/assets/pb-logo.png';

export default function Apply() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative selection:bg-brand-red selection:text-white">
      <Helmet>
        <title>Apply for 1-on-1 Barber Coaching | Profitable Barbers</title>
        <meta name="description" content="Apply for 1-on-1 mentorship with Profitable Barbers. Qualify for the program and get a custom plan to scale your barbershop." />
        <link rel="canonical" href="https://profitablebarbers.com/apply" />
        <meta property="og:title" content="Apply for 1-on-1 Barber Coaching | Profitable Barbers" />
        <meta property="og:description" content="Qualify for premium 1-on-1 mentorship and scale your barbershop to 6 figures." />
        <meta property="og:url" content="https://profitablebarbers.com/apply" />
      </Helmet>

      <LiquidBackground />

      <div className="w-full max-w-xl relative z-10">
        <h1 className="sr-only">Apply for 1-on-1 Barber Coaching</h1>
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
