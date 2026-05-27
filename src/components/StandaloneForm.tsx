import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function StandaloneForm() {
  const navigate = useNavigate();

  const formUrl = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'xxxxx';
    const utmCampaign = urlParams.get('utm_campaign') || 'xxxxx';
    return `https://form.typeform.com/to/EytKMkv4?utm_source=${encodeURIComponent(utmSource)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;
  }, []);

  // Typeform's "Redirect on completion" setting redirects the IFRAME, not the
  // parent window — which means users would never see it. To actually navigate
  // the visitor after submit, we listen for Typeform's `form-submit` postMessage
  // from the iframe and route the parent ourselves.
  //
  // The event payload includes `responseId`, which we forward as ?response_id=...
  // so /thank-you-apply's existing gate still works. As a belt-and-suspenders
  // fallback we also set the sessionStorage flag the page accepts, so the
  // user gets through even if Typeform ever stops including responseId.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only trust messages from typeform.com origins (form.typeform.com etc).
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
      animate={{ opacity: 1, y: 0 }}
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
