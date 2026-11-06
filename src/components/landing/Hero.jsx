import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Decorative gradient orbs */}
      {!prefersReducedMotion && (
        <>
          <div
            className="absolute top-1/4 -left-32 w-[420px] h-[420px] rounded-full bg-pink-300/20 blur-3xl -z-10 animate-float"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-1/4 -right-24 w-[360px] h-[360px] rounded-full bg-violet-300/15 blur-3xl -z-10 animate-float"
            style={{ animationDelay: '2s' }}
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-300/15 blur-3xl -z-10 animate-float"
            style={{ animationDelay: '4s' }}
            aria-hidden="true"
          />
        </>
      )}

      <motion.div
        className="text-center px-4 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
          variants={itemVariants}
        >
          Transform 2D Images into
          <br />
          <span className="gradient-text">Interactive 3D Models</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-secondary)' }}
          variants={itemVariants}
        >
          Powered by AI depth estimation. Everything runs in your browser
          &mdash; your images never leave your device.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={itemVariants}
        >
          <Link
            to="/convert"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base rounded-xl font-medium"
          >
            Start Converting
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <a
            href="#how-it-works"
            className="btn-ghost inline-flex items-center gap-1 px-6 py-3.5 text-base rounded-xl font-medium"
          >
            See how it works
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
