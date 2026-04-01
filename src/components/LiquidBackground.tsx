import { motion, useScroll, useTransform } from 'framer-motion';

export default function LiquidBackground() {
  const { scrollY } = useScroll();
  
  // Each blob moves at a different parallax speed
  const y1 = useTransform(scrollY, [0, 3000], [0, -600]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -400]);
  const y3 = useTransform(scrollY, [0, 3000], [0, -500]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-brand-black/60 backdrop-blur-[80px] z-10" />
      
      <motion.div
        style={{ y: y1 }}
        animate={{
          x: [0, 100, -50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-gold/30 blur-[120px] mix-blend-screen"
      />

      <motion.div
        style={{ y: y2 }}
        animate={{
          x: [0, -150, 100, 0],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-gold/20 blur-[150px] mix-blend-screen"
      />
      
      <motion.div
        style={{ y: y3 }}
        animate={{
          x: [0, 50, -100, 0],
          scale: [1, 1.5, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-white/10 blur-[100px] mix-blend-screen"
      />
    </div>
  );
}
