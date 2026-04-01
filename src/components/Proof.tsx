import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, CheckCircle2, Instagram } from 'lucide-react';
import MergedOutline from './MergedOutline';
import yariImg from '@/assets/yari.png';
import georgeImg from '@/assets/george.png';

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
    image: "https://i.ibb.co/1Gfj8Mfv/340337075-766262201731245-6783814181699090570-n.jpg"
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
    image: "https://i.ibb.co/Q76NtnvJ/487857539-1058398809642327-353604875646274729-n.jpg"
  }
];

const studentReviews = [
  "https://i.ibb.co/TMHKDDZ9/image33.png",
  "https://i.ibb.co/CpFSMSHT/image32.png",
  "https://i.ibb.co/m52pj5FD/image30.png",
  "https://i.ibb.co/WNhXtvzR/image31.png",
  "https://i.ibb.co/twgW01Ms/image29.png",
  "https://i.ibb.co/WvYSJmg9/image28.png",
  "https://i.ibb.co/wZL5r7Y2/image27.png",
  "https://i.ibb.co/HfGrLvZd/image26.png",
  "https://i.ibb.co/mrF4VyMn/image25.png",
  "https://i.ibb.co/WpnxMJ5K/image24.png",
  "https://i.ibb.co/20yrhSzv/image23.png",
  "https://i.ibb.co/q8wqMPn/image22.png",
  "https://i.ibb.co/MyK3dtPJ/image21.png",
  "https://i.ibb.co/0jJ95J76/image20.png",
  "https://i.ibb.co/m5LD5ZdW/image19.png",
  "https://i.ibb.co/XfdBQj1w/image18.png",
  "https://i.ibb.co/211XY3MJ/image17.png",
  "https://i.ibb.co/xqcpCjjk/image16.png",
  "https://i.ibb.co/fVF2YRvm/image15.png",
  "https://i.ibb.co/sJdNTHSY/image14.png",
  "https://i.ibb.co/Q3hTsJG4/image13.png",
  "https://i.ibb.co/R4vwnMqW/image12.png",
  "https://i.ibb.co/r2FXkV2c/image11.png",
  "https://i.ibb.co/MkRCQSjF/image10.png",
  "https://i.ibb.co/rGt320rx/image9.png",
  "https://i.ibb.co/394T6KV0/image8.png",
  "https://i.ibb.co/35Skg1zc/image7.png",
  "https://i.ibb.co/DHkZNyV5/image6.png",
  "https://i.ibb.co/zWwjgTBT/image5.png",
  "https://i.ibb.co/nM3nsjfT/image4.png",
  "https://i.ibb.co/mrM0D6Nj/image3.png",
  "https://i.ibb.co/v6vWC4nd/image2.png",
  "https://i.ibb.co/39fmPhBJ/image.png"
];

export default function Proof() {
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
            <span className="text-white text-xl sm:text-2xl md:text-3xl">WHAT MY STUDENTS</span>
            <MergedOutline strokeWidth="3px" strokeColor="white">HAVE TO SAY</MergedOutline>
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

        <div className="mt-16 grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {studentReviews.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              className="overflow-hidden rounded-xl min-h-[100px] flex items-center justify-center"
            >
              <img 
                src={src} 
                alt={`Student review ${index + 1}`} 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>

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
