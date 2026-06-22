import { motion } from 'framer-motion';

/** Animated cyber-grid background with floating gradient orbs. */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Cyber grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:48px_48px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Floating gradient orbs */}
      <motion.div
        className="absolute top-[-10%] left-[10%] h-72 w-72 rounded-full bg-cyber-indigo/30 blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[8%] h-80 w-80 rounded-full bg-cyber-purple/25 blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[40%] right-[35%] h-64 w-64 rounded-full bg-cyber-cyan/15 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
