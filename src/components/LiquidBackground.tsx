import { motion, useScroll, useTransform } from 'framer-motion';

export default function LiquidBackground() {
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 5000], [0, -1200]);
  const y2 = useTransform(scrollY, [0, 5000], [0, -800]);
  const y3 = useTransform(scrollY, [0, 5000], [0, -1000]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-brand-black/70 backdrop-blur-[100px] z-10" />
      
      <motion.div
        style={{ y: y1 }}
        animate={{
          x: [0, 60, -30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-brand-gold/15 blur-[150px]"
      />

      <motion.div
        style={{ y: y2 }}
        animate={{
          x: [0, -80, 60, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/10 blur-[180px]"
      />
      
      <motion.div
        style={{ y: y3 }}
        animate={{
          x: [0, 30, -50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] left-[40%] w-[20vw] h-[20vw] rounded-full bg-white/4 blur-[120px]"
      />
    </div>
  );
}
