import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star, TrendingUp, Users, CheckCircle2, Instagram } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import MergedOutline from './MergedOutline';
import yariImg from '@/assets/yari.png';
import georgeImg from '@/assets/george.png';
import review1 from '@/assets/reviews/review1.png';
import review2 from '@/assets/reviews/review2.png';
import review3 from '@/assets/reviews/review3.png';
import review4 from '@/assets/reviews/review4.png';
import review5 from '@/assets/reviews/review5.png';
import review6 from '@/assets/reviews/review6.png';
import review7 from '@/assets/reviews/review7.png';
import review8 from '@/assets/reviews/review8.png';
import review9 from '@/assets/reviews/review9.png';
import review10 from '@/assets/reviews/review10.png';
import review11 from '@/assets/reviews/review11.png';
import review12 from '@/assets/reviews/review12.png';
import review13 from '@/assets/reviews/review13.png';

import review15 from '@/assets/reviews/review15.png';
import review16 from '@/assets/reviews/review16.png';
import review17 from '@/assets/reviews/review17.png';
import review18 from '@/assets/reviews/review18.png';
import review19 from '@/assets/reviews/review19.png';
import review20 from '@/assets/reviews/review20.png';
import review21 from '@/assets/reviews/review21.png';
import review22 from '@/assets/reviews/review22.png';
import review23 from '@/assets/reviews/review23.png';
import review24 from '@/assets/reviews/review24.png';
import review25 from '@/assets/reviews/review25.png';
import review26 from '@/assets/reviews/review26.png';
import review27 from '@/assets/reviews/review27.png';
import review28 from '@/assets/reviews/review28.png';

import review30 from '@/assets/reviews/review30.png';
import review31 from '@/assets/reviews/review31.png';

const caseStudies = [
  {
    name: "Yari",
    metric: "Generated 12k Rev",
    shortMetric: "12k Rev",
    timeframe: "in 1 month",
    shortTimeframe: "1 Month",
    rating: "5.0",
    projects: "1000+",
    instagram: "https://www.instagram.com/yaricutz/",
    image: yariImg
  },
  {
    name: "George",
    metric: "10x client booking",
    shortMetric: "10x Growth",
    timeframe: "and retention",
    shortTimeframe: "Retention",
    rating: "5.0",
    projects: "750+",
    instagram: "https://www.instagram.com/cutsbyygeorge/",
    image: georgeImg
  }
];

const studentReviews = [
  review1, review2, review3, review4, review5,
  review6, review7, review8, review9, review10,
  review11, review12, review13, review14, review15,
  review16, review17, review18, review19, review20,
  review21, review22, review23, review24, review25,
  review26, review27, review28, review29, review30,
  review31, review32, review33
];

export default function Proof() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section id="results" className="py-12 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 will-change-transform"
        >
          <h2 className="text-sm font-black text-brand-gold tracking-[0.3em] uppercase mb-4">The Proof</h2>
          <h3 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic leading-none flex flex-col items-center gap-2">
            <MergedOutline strokeWidth="3px" strokeColor="white">Meet My Students</MergedOutline>
          </h3>
        </motion.div>

        <div className="flex justify-center flex-wrap gap-4 md:gap-8 max-w-4xl mx-auto mb-16">
          {caseStudies.map((study, index) => (
            <motion.a
              key={study.name}
              href={study.instagram}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="flex items-center gap-3 md:gap-4 p-2 pr-6 md:p-3 md:pr-8 glass-card rounded-full hover:bg-white/10 transition-all group border border-white/10 shadow-lg"
            >
              <img 
                src={study.image} 
                alt={study.name} 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-brand-gold group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-base md:text-xl font-black uppercase italic leading-none">{study.name}</span>
                  <CheckCircle2 size={12} className="text-blue-500" />
                </div>
                <span className="text-[10px] md:text-xs text-brand-gold flex items-center gap-1 mt-1 font-medium">
                  <Instagram size={12} /> @{study.instagram.split('/').filter(Boolean).pop()}
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 mt-16 will-change-transform"
        >
          <h3 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic leading-none flex flex-col items-center gap-2">
            <span className="text-white text-sm sm:text-base md:text-lg font-bold tracking-widest">AND</span>
            <MergedOutline strokeWidth="3px" strokeColor="white">What They Have to Say</MergedOutline>
          </h3>
        </motion.div>

        <div className="max-w-5xl mx-auto columns-2 md:columns-3 gap-3 space-y-3">
          {studentReviews.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              className="overflow-hidden rounded-xl break-inside-avoid cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={src} 
                alt={`Student review ${index + 1}`} 
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          ))}
        </div>

        <ImageLightbox
          images={studentReviews}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 flex justify-center items-center gap-4 sm:gap-8 md:gap-16 opacity-50 overflow-x-auto no-scrollbar py-4 will-change-transform"
        >
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <Users size={24} className="md:w-8 md:h-8" />
            <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest whitespace-nowrap">500+ Barbers Scaled</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <Star size={24} className="md:w-8 md:h-8" />
            <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Proven Growth Systems</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <TrendingUp size={24} className="md:w-8 md:h-8" />
            <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest whitespace-nowrap">6-Figure Blueprint</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
