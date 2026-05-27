import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function InlineForm() {
  const formUrl = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'xxxxx';
    const utmCampaign = urlParams.get('utm_campaign') || 'xxxxx';
    return `https://form.typeform.com/to/EytKMkv4?utm_source=${encodeURIComponent(utmSource)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;
  }, []);

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
