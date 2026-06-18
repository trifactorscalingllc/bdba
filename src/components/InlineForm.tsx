import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function InlineForm() {
  const navigate = useNavigate();

  const formUrl = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmMedium = urlParams.get('utm_medium');
    const utmContent = urlParams.get('utm_content');
    const tfParams = new URLSearchParams();
    if (utmSource) tfParams.set('utm_source', utmSource);
    if (utmCampaign) tfParams.set('utm_campaign', utmCampaign);
    if (utmMedium) tfParams.set('utm_medium', utmMedium);
    if (utmContent) tfParams.set('utm_content', utmContent);
    const qs = tfParams.toString();
    return `https://form.typeform.com/to/EytKMkv4${qs ? '?' + qs : ''}`;
  }, []);

  // Mirrors the listener in StandaloneForm so the homepage Hero funnel
  // behaves identically to /apply. Typeform's "Redirect on completion"
  // setting only redirects the IFRAME — to navigate the parent window we
  // listen for the `form-submit` postMessage and route ourselves.
  //
  // The payload includes `responseId`, forwarded as ?response_id=... so the
  // /thank-you-apply gate still works. A sessionStorage flag is set as a
  // belt-and-suspenders fallback.
  //
  // From there, /thank-you-apply already handles the next hop: when Calendly
  // fires `calendly.event_scheduled`, it auto-redirects to /case-studies.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const origin = new URL(event.origin).hostname;
        if (!origin.endsWith('typeform.com')) return;
      } catch {
        return;
      }
      const data = event.data as { type?: string; responseId?: string };
      if (data?.type === 'form-submit') {
        sessionStorage.setItem('dack_applied', 'true');
        const responseId = data.responseId ?? '';
        const qs = responseId
          ? `?response_id=${encodeURIComponent(responseId)}`
          : '';
        navigate(`/thank-you-apply${qs}`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full mx-auto bg-black/40 overflow-hidden relative z-10 rounded-2xl"
    >
      <div className="p-0">
        <iframe
          title="Profitable Barbers Application"
          src={formUrl}
          className="w-full border-0 rounded-2xl"
          style={{ height: '600px' }}
          allow="fullscreen"
        />
      </div>
    </motion.div>
  );
}
