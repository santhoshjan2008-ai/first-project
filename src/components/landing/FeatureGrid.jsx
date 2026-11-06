import { Shield, SlidersHorizontal, Download, Smartphone, BookOpen, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Shield,
    title: '100% Private',
    description: 'Images never leave your device. All processing happens in the browser.',
    color: 'bg-emerald-500/15 text-emerald-500',
  },
  {
    icon: SlidersHorizontal,
    title: 'Real-time Controls',
    description: 'Adjust depth, smoothing, and resolution with instant visual feedback.',
    color: 'bg-violet-500/15 text-violet-500',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Download as GLB for Blender, OBJ for other tools, or PNG snapshots.',
    color: 'bg-cyan-500/15 text-cyan-500',
  },
  {
    icon: Smartphone,
    title: 'Touch Friendly',
    description: 'Full gesture support — rotate, zoom, and pan on any device.',
    color: 'bg-amber-500/15 text-amber-500',
  },
  {
    icon: BookOpen,
    title: 'Local Library',
    description: 'Save models to your browser and revisit them anytime.',
    color: 'bg-pink-500/15 text-pink-500',
  },
  {
    icon: Moon,
    title: 'Dark & Light',
    description: 'Beautiful themes that respect your system preference.',
    color: 'bg-blue-500/15 text-blue-500',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FeatureGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          className="font-heading text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          Features
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="glass-card p-5"
                variants={cardVariants}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${feature.color}`}
                >
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
