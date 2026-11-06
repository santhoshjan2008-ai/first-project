import { Upload, Brain, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Upload,
    number: '1',
    title: 'Upload',
    description:
      'Upload your image — any photo, artwork, or graphic in JPG, PNG, or WebP format.',
  },
  {
    icon: Brain,
    number: '2',
    title: 'AI Depth',
    description:
      'Our AI estimates depth using Depth Anything, running entirely in your browser with no server needed.',
  },
  {
    icon: Box,
    number: '3',
    title: 'Explore 3D',
    description:
      'Interact with your 3D relief model. Adjust settings, export as GLB or OBJ, and save to your library.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          className="font-heading text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                className="glass-card p-6 text-center relative"
                variants={cardVariants}
              >
                {/* Step number badge */}
                <span className="badge absolute top-4 right-4 text-xs font-bold">
                  {step.number}
                </span>

                {/* Icon in gradient circle */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-white" aria-hidden="true" />
                </div>

                <h3 className="font-heading text-lg font-semibold mb-2">
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
